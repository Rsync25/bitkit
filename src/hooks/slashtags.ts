import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Slashtag, SlashURL } from '@synonymdev/slashtags-sdk';
import type { Profile } from '@synonymdev/slashtags-profile';

import { useSlashtags, useSlashtagsSDK } from '../components/SlashtagsProvider';
import { BasicProfile } from '../store/types/slashtags';
import { getSelectedSlashtag } from '../utils/slashtags';
import Store from '../store/types';
import { cacheProfile } from '../store/actions/slashtags';

/**
 * Returns the currently selected Slashtag
 */
export const useSelectedSlashtag = (): Slashtag => {
	const sdk = useSlashtagsSDK();
	const slashtag = getSelectedSlashtag(sdk);

	return slashtag;
};

/**
 * Watches the public profile of a local or remote slashtag by its url.
 * Overrides name property if it is saved as a contact record!
 *
 * @param {boolean} [opts.resolve = false]
 * Resolve profile updates from remote peers (or seeder).
 * Defaults to false.
 * To force resolving profiles set `opts.resolve = true`.
 */
export const useProfile = (
	url: string,
	opts?: {
		resolve?: boolean;
	},
): { resolving: boolean; profile: BasicProfile } => {
	const slashtag = useSelectedSlashtag();
	const contactRecord = useSlashtags().contacts[url];
	const [resolving, setResolving] = useState(true);
	const profile = useSelector((state: Store) => {
		return state.slashtags.profiles?.[url]?.profile;
	});

	const withContactRecord = useMemo(() => {
		return contactRecord?.name
			? { ...profile, name: contactRecord.name }
			: profile;
	}, [profile, contactRecord]);

	const shouldResolve = Boolean(
		opts?.resolve ||
			// If We are restoring wallet, try to resolve anyways
			!profile,
	);

	useEffect(() => {
		// Skip resolving profile from peers to avoid blocking UI
		if (!shouldResolve) {
			return;
		}

		let unmounted = false;

		const isRemote = SlashURL.parse(url).id !== SlashURL.parse(slashtag.url).id;

		if (isRemote) {
			slashtag.profile.readRemote(url).then(onProfile).catch(onError);
		} else {
			slashtag.profile.read().then(onProfile).catch(onError);
		}

		const unsubscribe = slashtag.profile.subscribe(url, onProfile);

		function onProfile(p: Profile | null): void {
			if (p) {
				cacheProfile(url, p);
			}
			if (!unmounted && resolving) {
				setResolving(false);
			}
		}

		return function cleanup(): void {
			unmounted = true;
			unsubscribe();
		};
	}, [url, slashtag, shouldResolve, resolving]);

	return {
		resolving,
		profile: withContactRecord || {},
	};
};

function onError(error: Error): void {
	console.debug('Error opening drive in useProfile', error.message);
}
