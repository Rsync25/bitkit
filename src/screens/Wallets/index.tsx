import React, { memo, ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
	View,
	Subtitle,
	BitcoinCircleIcon,
	RefreshControl,
} from '../../styles/components';
import Header from './Header';
import DetectSwipe from '../../components/DetectSwipe';
import BalanceHeader from '../../components/BalanceHeader';
import TodoCarousel from '../../components/TodoCarousel';
import SafeAreaView from '../../components/SafeAreaView';
import AssetCard from '../../components/AssetCard';
import ActivityListShort from '../../screens/Activity/ActivityListShort';
import EmptyWallet from '../../screens/Activity/EmptyWallet';
import { useBalance, useNoTransactions } from '../../hooks/wallet';
import { updateSettings } from '../../store/actions/settings';
import Store from '../../store/types';
import { refreshWallet } from '../../utils/wallet';

const Wallets = ({ navigation }): ReactElement => {
	const [refreshing, setRefreshing] = useState(false);
	const hideBalance = useSelector((state: Store) => state.settings.hideBalance);
	const swipeBalanceToHide = useSelector(
		(state: Store) => state.settings.swipeBalanceToHide,
	);

	const empty = useNoTransactions();
	const { satoshis } = useBalance({ onchain: true, lightning: true });

	const onSwipeLeft = (): void => {
		//Swiping left, navigate to the scanner/camera.
		navigation.navigate('Scanner');
	};

	const onSwipeRight = (): void => {
		if (swipeBalanceToHide) {
			updateSettings({ hideBalance: !hideBalance });
		}
	};

	LayoutAnimation.easeInEaseOut();

	const onRefresh = async (): Promise<void> => {
		setRefreshing(true);
		//Refresh wallet and then update activity list
		await Promise.all([refreshWallet({})]);
		setRefreshing(false);
	};

	return (
		<SafeAreaView>
			<Header />
			<ScrollView
				contentContainerStyle={!empty && styles.scrollview}
				disableScrollViewPanResponder={true}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
				<DetectSwipe onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}>
					<View>
						<BalanceHeader />
					</View>
				</DetectSwipe>
				{empty ? (
					<EmptyWallet />
				) : (
					<>
						<TodoCarousel />
						<DetectSwipe onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}>
							<View style={styles.content}>
								<Subtitle style={styles.assetsTitle}>Assets</Subtitle>
								<AssetCard
									name={'Bitcoin'}
									ticker={'BTC'}
									satoshis={satoshis}
									icon={<BitcoinCircleIcon />}
									onPress={(): void =>
										navigation.navigate('WalletsDetail', {
											assetType: 'bitcoin',
										})
									}
								/>
							</View>
						</DetectSwipe>
						<View style={styles.content}>
							<ActivityListShort />
						</View>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: 16,
	},
	scrollview: {
		paddingBottom: 400,
	},
	assetsTitle: {
		marginBottom: 8,
		marginTop: 32,
	},
});

export default memo(Wallets);
