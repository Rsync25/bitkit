import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSlashtags } from '../components/SlashtagsProvider';
import Store from '../store/types';
import { BasicProfile } from '../store/types/slashtags';

export type Slashtag = ReturnType<ISDK['slashtag']>;

/**
 * Helper hook to return Slashtag's profile
 * and detect when it has a new version to fetch.
 */
export const useSlashtagProfile = (opts?: { url: string }): BasicProfile => {
	const [profile, setProfile] = useState<BasicProfile>({});

	const { sdk } = useSlashtags();

	const slashtag = sdk?.slashtag(opts);
	const url = slashtag?.url.toString();

	const version = useSelector(
		(store: Store) => store.slashtags.profiles?.[url || '']?.seen,
	);

	useEffect((): (() => void) => {
		// set a clean up flag
		let shouldSetProfile = true;

		const _slashtag = sdk?.slashtag({ url });

		_slashtag?.getProfile().then((p) => {
			shouldSetProfile &&
				setProfile({
					...(p || {}),
					id: _slashtag.url.toString(),
				});
		});

		return () => {
			shouldSetProfile = false;
		};
	}, [sdk, url, version]);

	return profile;
};
