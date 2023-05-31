/* eslint-disable @typescript-eslint/explicit-function-return-type */
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import falso from '@ngneat/falso';
import fetch from 'node-fetch';
import SDK, { SlashURL } from '@synonymdev/slashtags-sdk';
import RAM from 'random-access-memory';
import b4a from 'b4a';

const cacheLocation = path.join(
	import.meta.url.replace('file:/', ''),
	'..',
	'cache.json',
);

const sdk = new SDK({ storage: RAM });

let cached = loadCache();

let closed = false;

/** @type {[url: string]: string} */
const contacts = {};

while (!closed) {
	try {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'What do you like to do?',
				choices: [
					'Resolve profile',
					'Create contact',
					'Create bulk contacts',
					...(Object.keys(contacts).length > 0 ? ['Update contact'] : []),
					'close',
				],
			},
		]);

		switch (action) {
			case 'Resolve profile':
				await resolveProfile();
				break;
			case 'Create contact':
				await createContact();
				break;
			case 'Update contact':
				await updateContact();
				break;
			case 'Create bulk contacts':
				await createBulkContacts();
				break;
			case 'close':
				console.log('Closing...');
				await sdk.close();
				closed = true;
				break;
			default:
				await resolveProfile();
				break;
		}
	} catch (error) {
		console.log('Got error:', error.message);
	}
}

async function resolveProfile() {
	const { url } = await inquirer.prompt([
		{
			type: 'input',
			name: 'url',
			message: "Enter slashtag's url",
			default: cached.lastUsedURL,
		},
	]);

	if (!url || url.length === 0) {
		throw new Error('Expected a Slashtag url');
	}
	cache({ lastUsedURL: url });

	const slashtag = sdk.slashtag()
	await slashtag.ready()

	const profile = await slashtag.profile.readRemote(url)
	const slashpay = await slashtag.coreData.readRemote(url + '/public/slashpay.json').then(decodeJSON)

	const drive = slashtag.coreData._getRemoteDrive(SlashURL.parse(url), 'public')

	console.dir(
		{
			url: url,
			version: drive.files.version,
			profile: formatProfile(profile),
			slashpay,
		},
		{ depth: null },
	);
}

/**
 * Creates a contact and returns its url
 *
 * Contacts created in this test will NOT be persisted on disk nor sent to seeder.
 *
 * @param {boolean} log
 */
async function createContact(log = true) {
	const name = Math.random().toString(16).slice(2);
	const slashtag = sdk.slashtag(name);
	const contact = await generateContact(slashtag.url);
	await saveContact(slashtag, contact);
	contacts[contact.url] = name;

	log && console.dir(formatContact(contact), { depth: null });
	return contact.url;
}

async function createBulkContacts() {
	const { count } = await inquirer.prompt([
		{
			type: 'input',
			name: 'count',
			message: 'How many contacts to create?',
			default: 10,
		},
	]);

	const urls = await Promise.all(
		new Array(Number(count)).fill(0).map(() => createContact(false)),
	);

	console.log('Created', count, 'contacts');
	console.log(urls);
}

async function updateContact() {
	const { selected } = await inquirer.prompt([
		{
			type: 'list',
			name: 'selected',
			message: 'Choose selected contact to update:',
			choices: Object.keys(contacts),
		},
	]);

	const nameUsedForCreatingSlashtag = contacts[selected];
	const slashtag = sdk.slashtag(nameUsedForCreatingSlashtag);
	const newContact = await generateContact(selected);
	await saveContact(slashtag, newContact, true);
	console.dir(formatContact(newContact), { depth: null });
}

/**
 *
 * @param {object} toCache
 */
function cache(toCache) {
	cached = { ...cached, ...toCache };
	fs.writeFile(cacheLocation, JSON.stringify(cached), noop);
}

function loadCache() {
	try {
		const str = fs.readFileSync(cacheLocation);
		return JSON.parse(str.toString());
	} catch (error) {
		return {};
	}
}

function noop() { }

function formatProfile(profile) {
	return (
		profile && {
			...profile,
			...(profile.image ? { image: profile.image.slice(0, 40) + '...' } : {}),
		}
	);
}

function formatContact(contact) {
	return {
		...contact,
		profile: formatProfile(contact.profile),
	};
}

async function saveContact(slashtag, contact, isUpdate = false) {
	if (isUpdate) {
		await slashtag.profile.update(contact.profile)
		await slashtag.coreData.update('/public/slashpay.json', contact.slashpay)
		return
	}

	await slashtag.profile.create(contact.profile)
	await slashtag.coreData.create('/public/slashpay.json', contact.slashpay)
}

async function generateContact(url) {
	const name = falso.randFullName();
	const imageURL = falso.randAvatar();
	const response = await fetch(imageURL);
	const body = await response.arrayBuffer();

	return {
		url,
		profile: {
			name,
			image:
				'data:' +
				response.headers['content-type'] +
				';base64,' +
				Buffer.from(body).toString('base64'),
			bio: falso.randPhrase().slice(0, 160),
			links: [
				{
					title: 'Twitter',
					url: 'https://www.twitter.com/' + falso.randWord(),
				},
				{
					title: 'Website',
					url: falso.randUrl(),
				},
				{
					title: 'Phone',
					url: falso.randPhoneNumber(),
				},
			],
		},
		slashpay: [{ type: 'p2wpkh', value: falso.randBitcoinAddress() }],
	};
}

/**
 * Decode JSON from Uint8Array files from Hyperdrives
 */
export function decodeJSON(buf) {
	if (!buf || buf.byteLength === 0) {
		return;
	}
	try {
		return JSON.parse(b4a.toString(buf));
	} catch (error) { }
}

/**
 * Encode JSON as Uint8Array for hyperdrive json files
 */
export function encodeJSON(json) {
	return b4a.from(JSON.stringify(json));
}
