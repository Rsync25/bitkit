import React, { ReactElement, memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import {
	activateKeepAwake,
	deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';

import { Display, Text01S } from '../../styles/text';
import SafeAreaInset from '../../components/SafeAreaInset';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';
import HourglassSpinner from '../../components/HourglassSpinner';
import ProgressSteps from '../../components/ProgressSteps';
import { lightningSettingUpStepSelector } from '../../store/reselect/user';
import type { LightningScreenProps } from '../../navigation/types';

const TIMEOUT_DELAY = 2 * 60 * 1000; // 2 minutes

const SettingUp = ({
	navigation,
}: LightningScreenProps<'SettingUp'>): ReactElement => {
	const { t } = useTranslation('lightning');
	const lightningSettingUpStep = useSelector(lightningSettingUpStepSelector);

	const steps = [
		{ title: t('setting_up_step1') },
		{ title: t('setting_up_step2') },
		{ title: t('setting_up_step3') },
		{ title: t('setting_up_step4') },
	];

	useFocusEffect(
		useCallback(() => {
			activateKeepAwake();

			let timeout = setTimeout(() => {
				navigation.navigate('Timeout');
			}, TIMEOUT_DELAY);

			if (lightningSettingUpStep === 3) {
				clearTimeout(timeout);
				timeout = setTimeout(() => navigation.navigate('Success'), 1000);
			}

			return () => {
				clearTimeout(timeout);
				deactivateKeepAwake();
			};
		}, [lightningSettingUpStep, navigation]),
	);

	return (
		<GlowingBackground topLeft="purple">
			<SafeAreaInset type="top" />
			<NavigationHeader
				title={t('add_instant_payments')}
				displayBackButton={false}
				onClosePress={(): void => navigation.navigate('Wallet')}
			/>
			<View style={styles.content} testID="LightningSettingUp">
				<Display color="purple">{t('setting_up_header')}</Display>
				<Text01S style={styles.text} color="gray1">
					{t('setting_up_text')}
				</Text01S>

				<HourglassSpinner glowColor="purple" />

				<ProgressSteps
					style={styles.progress}
					steps={steps}
					activeStepIndex={lightningSettingUpStep}
				/>
			</View>
			<SafeAreaInset type="bottom" minPadding={16} />
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		marginTop: 8,
		paddingHorizontal: 16,
	},
	text: {
		marginTop: 4,
		marginBottom: 16,
	},
	progress: {
		marginTop: 'auto',
		paddingVertical: 20,
	},
});

export default memo(SettingUp);
