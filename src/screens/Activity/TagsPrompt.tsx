import React, { memo, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Subtitle, Text02S, Text13UP } from '../../styles/text';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import SafeAreaInset from '../../components/SafeAreaInset';
import { closeBottomSheet } from '../../store/actions/ui';
import {
	useBottomSheetBackPress,
	useSnapPoints,
} from '../../hooks/bottomSheet';
import Tag from '../../components/Tag';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const TagsPrompt = ({
	onAddTag,
	tags,
}: {
	onAddTag: (tag: string) => void;
	tags: Array<string>;
}): ReactElement => {
	const { t } = useTranslation('wallet');
	const snapPoints = useSnapPoints('medium');
	const suggestions = useSelector((store: Store) => {
		return store.metadata.lastUsedTags.filter((tg) => !tags.includes(tg));
	});

	useBottomSheetBackPress('tagsPrompt');

	const handleClose = (): void => {
		closeBottomSheet('tagsPrompt');
	};

	return (
		<BottomSheetWrapper
			view="tagsPrompt"
			snapPoints={snapPoints}
			backdrop={true}
			onClose={handleClose}>
			<View style={styles.root}>
				<Subtitle style={styles.title}>{t('tags_filter_title')}</Subtitle>

				<Text13UP color="gray1">{t('tags_filter')}</Text13UP>

				<View style={styles.suggestionsRow}>
					{suggestions.map((tag) => (
						<Tag
							key={tag}
							style={styles.tag}
							value={tag}
							onPress={(): void => onAddTag(tag)}
						/>
					))}
					{suggestions.length === 0 && (
						<Text02S style={styles.noTags}>{t('tags_no')}</Text02S>
					)}
				</View>

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
	suggestionsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 16,
		marginBottom: -8,
	},
	tag: {
		marginRight: 8,
		marginBottom: 8,
	},
	noTags: {
		marginTop: 16,
	},
});

export default memo(TagsPrompt);
