import SDK from '@synonymdev/slashtags-sdk';
import b4a from 'b4a';
import RAM from 'random-access-memory';

function encodeJSON(json): Uint8Array {
	return b4a.from(JSON.stringify(json));
}

const sdk = new SDK({ storage: RAM });
const SLASHTAGS_SEEDER_BASE_URL = process.env.SLASHTAGS_SEEDER_BASE_URL;

export const createAndPush = async (contact): Promise<string> => {
	const { slashpay, ...profile } = contact;
	const name = Math.random().toString(16).slice(2);
	const slashtag = sdk.slashtag(name);
	const drive = slashtag.drivestore.get();
	await drive.put('/profile.json', encodeJSON(profile));
	await drive.put('/slashpay.json', encodeJSON(slashpay));

	{
		const key = b4a.toString(drive.key, 'hex');
		await fetch(`${SLASHTAGS_SEEDER_BASE_URL}/seeding/hypercore`, {
			method: 'POST',
			body: JSON.stringify({ publicKey: key }),
			headers: { 'Content-Type': 'application/json' },
		});
	}
	{
		const key = b4a.toString(drive.blobs.core.key, 'hex');
		await fetch(`${SLASHTAGS_SEEDER_BASE_URL}/seeding/hypercore`, {
			method: 'POST',
			body: JSON.stringify({ publicKey: key }),
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return slashtag.url;
};

export const createAndPublishTestProfiles = async (): Promise<{
	profiles: {};
	sdk: SDK;
}> => {
	const profiles = {
		John: {
			name: 'John Carvalho',
			bio: 'Slashtags fixes this.',
			links: [{ title: 'Website', url: 'https://synonym.to' }],
			slashpay: {},
			url: '',
		},
		Corey: {
			name: 'Corey',
			bio: 'Software Developer at synonym.to',
			slashpay: {},
			url: '',
		},
	};

	for (const profile of Object.values(profiles)) {
		const url = await createAndPush(profile);
		profile.url = url;
	}

	return { profiles, sdk };
};

test.skip('Workaround', () => {});
