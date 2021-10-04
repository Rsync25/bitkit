import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';

interface ICard {
	style?: {};
	children?: ReactElement;
	color?: string;
}
const Card = ({
	style = {},
	children = <View />,
	color = 'surface',
}: ICard): ReactElement => (
	<View color={color} style={[styles.container, style]}>
		{children}
	</View>
);

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignSelf: 'center',
		borderRadius: 15,
		marginVertical: 10,
		paddingVertical: 10,
		paddingHorizontal: 20,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.9,
		elevation: 6,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 0 },
	},
});

export default Card;
