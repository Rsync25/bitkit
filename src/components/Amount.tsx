import React, { ReactElement } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { Display } from '../styles/text';
import { EBalanceUnit } from '../store/types/wallet';
import MoneySymbol from './MoneySymbol';

const Amount = ({
	value,
	unit = EBalanceUnit.satoshi,
	style,
}: {
	value: number;
	unit?: EBalanceUnit;
	style?: StyleProp<ViewStyle>;
}): ReactElement => (
	<View style={[styles.row, style]}>
		<MoneySymbol style={styles.symbol} unit={unit} />
		<Display color={value ? 'text' : 'gray1'} lineHeight="57px">
			{value}
		</Display>
	</View>
);

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	symbol: {
		marginRight: 4,
	},
});

export default Amount;
