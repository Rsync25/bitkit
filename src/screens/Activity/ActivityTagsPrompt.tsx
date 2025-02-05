import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { BottomSheetTextInput } from '../../styles/components';
import { Subtitle, Text13UP } from '../../styles/text';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import SafeAreaInset from '../../components/SafeAreaInset';
import Tag from '../../components/Tag';
import Button from '../../components/Button';
import { closeBottomSheet } from '../../store/actions/ui';
import { viewControllerSelector } from '../../store/reselect/ui';
import { addMetaTxTag, addTag } from '../../store/actions/metadata';
import { lastUsedTagsSelector } from '../../store/reselect/metadata';
import { showErrorNotification } from '../../utils/notifications';
import { useAppSelector } from '../../hooks/redux';
import { Keyboard } from '../../hooks/keyboard';
import {
	useBottomSheetBackPress,
	useSnapPoints,
} from '../../hooks/bottomSheet';

const ActivityTagsPrompt = (): ReactElement => {
	const { t } = useTranslation('wallet');
	const snapPoints = useSnapPoints('small');
	const [text, setText] = useState('');
	const lastUsedTags = useSelector(lastUsedTagsSelector);
	const { isOpen, id } = useAppSelector((state) => {
		return viewControllerSelector(state, 'activityTagsPrompt');
	});

	useBottomSheetBackPress('activityTagsPrompt');

	const handleClose = async (): Promise<void> => {
		setText('');
		await Keyboard.dismiss();
		closeBottomSheet('activityTagsPrompt');
	};

	const handleTagChoose = async (tag: string): Promise<void> => {
		const res = addMetaTxTag(id!, tag);
		if (res.isErr()) {
			showErrorNotification({
				title: t('tags_add_error_header'),
				message: res.error.message,
			});
			return;
		}
		addTag(tag);
		setText('');
		await Keyboard.dismiss();
		closeBottomSheet('activityTagsPrompt');
	};

	const handleSubmit = async (): Promise<void> => {
		if (text.length === 0) {
			return;
		}
		const res = addMetaTxTag(id!, text);
		if (res.isErr()) {
			showErrorNotification({
				title: t('tags_add_error_header'),
				message: res.error.message,
			});
			return;
		}
		addTag(text);
		setText('');
		await Keyboard.dismiss();
		closeBottomSheet('activityTagsPrompt');
	};

	return (
		<BottomSheetWrapper
			view="activityTagsPrompt"
			snapPoints={snapPoints}
			backdrop={true}
			onClose={handleClose}>
			<View style={styles.root}>
				<Subtitle style={styles.title}>{t('tags_add')}</Subtitle>

				{isOpen && (
					<>
						{lastUsedTags.length !== 0 && (
							<>
								<Text13UP style={styles.label} color="gray1">
									{t('tags_previously')}
								</Text13UP>
								<View style={styles.tagsContainer}>
									{lastUsedTags.map((tag) => (
										<Tag
											key={tag}
											value={tag}
											style={styles.tag}
											onPress={(): void => {
												handleTagChoose(tag);
											}}
										/>
									))}
								</View>
							</>
						)}

						<Text13UP style={styles.label} color="gray1">
							{t('tags_new')}
						</Text13UP>
						<BottomSheetTextInput
							placeholder={t('tags_new_enter')}
							backgroundColor="white08"
							minHeight={52}
							blurOnSubmit={true}
							value={text}
							onChangeText={setText}
							onBlur={handleSubmit}
							autoFocus={true}
							maxLength={15}
							returnKeyType="done"
							testID="TagInput"
						/>

						<View style={styles.buttonContainer}>
							<Button
								text={t('tags_add_button')}
								size="large"
								disabled={text.length === 0}
								testID="ReceiveTagsSubmit"
								onPress={handleSubmit}
							/>
						</View>
					</>
				)}

				<SafeAreaInset type="bottom" minPadding={16} />
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		paddingHorizontal: 16,
	},
	title: {
		marginBottom: 25,
		textAlign: 'center',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 32,
	},
	tag: {
		marginRight: 8,
		marginBottom: 8,
	},
	label: {
		marginBottom: 16,
	},
	buttonContainer: {
		marginTop: 'auto',
	},
});

export default memo(ActivityTagsPrompt);
