import { EAddressType } from './wallet';
import type { Profile } from '@synonymdev/slashtags-profile';

export type BasicProfile = Profile;

/** Contact Record saved in the "contacts" SlashDrive */
export type IContactRecord = { url: string; name: string } & BasicProfile;

export type SlashPayConfig = {
	type: EAddressType | 'lightningInvoice';
	value: string;
}[];

export type Link = {
	// tell TS we don't want an id field in the remote Link
	id?: never;
	title: string;
	url: string;
};

export type LocalLink = {
	id: string;
	title: string;
	url: string;
};

export interface IRemote {
	profile?: BasicProfile;
	payConfig?: SlashPayConfig;
}

export type TOnboardingProfileStep =
	| 'Intro'
	| 'InitialEdit'
	| 'OfflinePayments'
	| 'Done';

export interface ISlashtags {
	onboardedContacts: boolean;
	onboardingProfileStep: TOnboardingProfileStep;
	links: LocalLink[];
	seeder?: {
		lastSent?: number;
	};
	// cache seen profiles!
	profiles?: {
		[url: string]: {
			fork: number;
			version: number;
			profile: BasicProfile;
		};
	};
}
