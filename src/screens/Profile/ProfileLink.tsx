import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import BottomSheetNavigationHeader from '../../components/BottomSheetNavigationHeader';
import Button from '../../components/Button';
import LabeledInput from '../../components/LabeledInput';
import SafeAreaInset from '../../components/SafeAreaInset';
import { useBottomSheetBackPress } from '../../hooks/bottomSheet';
import { Keyboard } from '../../hooks/keyboard';
import { ProfileLinkScreenProps } from '../../navigation/types';
import { addLink } from '../../store/actions/slashtags';
import { closeBottomSheet, updateProfileLink } from '../../store/actions/ui';
import { profileLinkSelector } from '../../store/reselect/ui';
import { Text02B, Text02S } from '../../styles/text';
import { suggestions } from './ProfileLinkSuggestions';

const ProfileLink = ({
	navigation,
}: ProfileLinkScreenProps<'ProfileLink'>): ReactElement => {
	const { t } = useTranslation('slashtags');
	const form = useSelector(profileLinkSelector);

	useBottomSheetBackPress('profileAddDataForm');

	const onSave = async (): Promise<void> => {
		addLink(form);
		updateProfileLink({ title: '', url: '' });
		await Keyboard.dismiss();
		closeBottomSheet('profileAddDataForm');
	};

	const isValid = form.title && form.url;
	const selectedSuggestion = suggestions.find((s) => s.title === form.title);
	const placeholder = selectedSuggestion?.prefix ?? 'https://';

	return (
		<View style={styles.content}>
			<BottomSheetNavigationHeader
				title={t('profile_add_link')}
				displayBackButton={false}
			/>
			<LabeledInput
				style={styles.titleInput}
				bottomSheet={true}
				label={t('profile_link_label')}
				placeholder={t('profile_link_label_placeholder')}
				value={form.title}
				maxLength={25}
				testID="LinkLabelInput"
				onChange={(value: string): void => {
					updateProfileLink({ ...form, title: value });
				}}>
				<TouchableOpacity
					testID="ProfileLinkSuggestions"
					onPress={(): void => {
						navigation.navigate('ProfileLinkSuggestions');
					}}>
					<Text02B color="brand">{t('profile_link_suggestions')}</Text02B>
				</TouchableOpacity>
			</LabeledInput>
			<LabeledInput
				bottomSheet={true}
				label={t('profile_link_value')}
				placeholder={placeholder}
				value={form.url}
				multiline={true}
				returnKeyType="default"
				maxLength={2048}
				testID="LinkValueInput"
				onChange={(value: string): void => {
					updateProfileLink({ ...form, url: value });
				}}
			/>
			<Text02S style={styles.note} color="gray1">
				{t('profile_link_public')}
			</Text02S>

			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					text={t('save')}
					size="large"
					disabled={!isValid}
					testID="SaveLink"
					onPress={onSave}
				/>
			</View>
			<SafeAreaInset type="bottom" minPadding={16} />
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	titleInput: {
		marginBottom: 16,
	},
	note: {
		marginTop: 'auto',
	},
	buttonContainer: {
		marginTop: 'auto',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
	},
});

export default ProfileLink;
