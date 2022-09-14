import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View as ThemedView, Text01S } from '../../../styles/components';
import Button from '../../../components/Button';
import Glow from '../../../components/Glow';
import { verifyBackup } from '../../../store/actions/user';
import { removeTodo } from '../../../store/actions/todos';
import { todoPresets } from '../../../utils/todos';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import { BackupScreenProps } from '../../../navigation/types';

const Result = ({ navigation }: BackupScreenProps<'Result'>): ReactElement => {
	const insets = useSafeAreaInsets();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 16,
		}),
		[insets.bottom],
	);

	const handleButtonPress = (): void => {
		verifyBackup();
		removeTodo(todoPresets.backupSeedPhrase.type);
		navigation.navigate('Metadata');
	};

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<BottomSheetNavigationHeader title="Successful" />

			<Text01S color="gray1" style={styles.text}>
				Make sure you store your recovery phrase in a secure place, as this is
				the only way to recover your money (!)
			</Text01S>

			<View style={styles.imageContainer}>
				<Glow style={styles.glow} size={500} color="green" />
				<Image
					source={require('../../../assets/illustrations/check.png')}
					style={styles.image}
				/>
			</View>

			<View style={nextButtonContainer}>
				<Button size="lg" text="OK" onPress={handleButtonPress} />
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	text: {
		paddingHorizontal: 32,
	},
	imageContainer: {
		flex: 1,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: 200,
		height: 200,
	},
	glow: {
		position: 'absolute',
	},
	nextButtonContainer: {
		marginTop: 'auto',
		paddingHorizontal: 32,
		width: '100%',
	},
});

export default memo(Result);
