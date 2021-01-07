import configureFonts from './fonts';
import colors from './colors';

const defaultThemeValues = {
	colors: {
		...colors,
		accent: '#0000007F',
		success: '#A2BC91',
		error: '#D87682',
		transparent: 'transparent',
	},
	fonts: configureFonts(),
};

const light = {
	...defaultThemeValues,
	id: 'light',
	colors: {
		...defaultThemeValues.colors,
		text: '#121212',
		primary: '#121212',
		background: '#FFFFFF',
		surface: '#E8E8E8',
		onBackground: '#121212',
		onSurface: '#D6D6D6',
		logText: '#121212',
		refreshControl: '#121212',
	},
};

const dark = {
	...defaultThemeValues,
	id: 'dark',
	colors: {
		...defaultThemeValues.colors,
		text: '#FFFFFF',
		primary: '#FFFFFF',
		background: '#121212',
		surface: '#333333',
		onBackground: '#FFFFFF',
		onSurface: '#5C5C5C',
		logText: '#16ff00',
		refreshControl: '#FFFFFF',
	},
};

export default { light, dark };
