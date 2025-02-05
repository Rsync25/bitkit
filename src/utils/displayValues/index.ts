import { default as bitcoinUnits } from 'bitcoin-units';

import { getSettingsStore, getWalletStore } from '../../store/helpers';
import { EBitcoinUnit } from '../../store/types/wallet';
import { IExchangeRates, mostUsedExchangeTickers } from '../exchange-rate';
import {
	defaultFiatDisplayValues,
	defaultBitcoinDisplayValues,
	IBitcoinDisplayValues,
	IDisplayValues,
	IFiatDisplayValues,
} from './types';

export const getBitcoinDisplayValues = ({
	satoshis,
	bitcoinUnit,
}: {
	satoshis: number;
	bitcoinUnit?: EBitcoinUnit;
}): IBitcoinDisplayValues => {
	try {
		if (!bitcoinUnit) {
			bitcoinUnit = getSettingsStore().bitcoinUnit;
		}

		let bitcoinSymbol = '₿';
		let bitcoinTicker = bitcoinUnit;

		let bitcoinFormatted: string = bitcoinUnits(satoshis, 'satoshi')
			.to(bitcoinUnit)
			.value()
			.toString();

		const [bitcoinWhole, bitcoinDecimal] = bitcoinFormatted.split('.');

		if (bitcoinUnit === EBitcoinUnit.satoshi) {
			bitcoinSymbol = '⚡';
			bitcoinTicker = EBitcoinUnit.satoshi;

			// format sats to group thousands
			// 4000000 -> 4 000 000
			let res = '';
			bitcoinFormatted
				.split('')
				.reverse()
				.forEach((c, index) => {
					if (index > 0 && index % 3 === 0) {
						res = ' ' + res;
					}
					res = c + res;
				});
			bitcoinFormatted = res;
		}

		return {
			bitcoinFormatted,
			bitcoinWhole,
			bitcoinDecimal,
			bitcoinSymbol,
			bitcoinTicker,
			satoshis,
		};
	} catch (e) {
		console.error(e);
		return defaultBitcoinDisplayValues;
	}
};

export const getFiatDisplayValues = ({
	satoshis,
	exchangeRate,
	exchangeRates,
	bitcoinUnit,
	currency,
	currencySymbol,
	locale = 'en-US',
}: {
	satoshis: number;
	exchangeRate?: number;
	exchangeRates?: IExchangeRates;
	bitcoinUnit?: EBitcoinUnit;
	currency?: string;
	currencySymbol?: string;
	locale?: string;
}): IFiatDisplayValues => {
	if (!exchangeRates) {
		exchangeRates = getWalletStore().exchangeRates;
	}
	if (!currency) {
		currency = getSettingsStore().selectedCurrency;
	}
	if (!bitcoinUnit) {
		bitcoinUnit = getSettingsStore().bitcoinUnit;
	}

	try {
		// If exchange rates haven't loaded yet or failed to load
		// fallback to dollar and show placeholder if amount is not 0
		if (Object.entries(exchangeRates).length === 0) {
			const fallbackTicker =
				mostUsedExchangeTickers[currency] ?? mostUsedExchangeTickers.USD;

			const bitcoinDisplayValues = getBitcoinDisplayValues({
				satoshis: satoshis,
				bitcoinUnit: bitcoinUnit,
			});

			return {
				...bitcoinDisplayValues,
				fiatFormatted: '—',
				fiatWhole: satoshis === 0 ? '0' : '—',
				fiatDecimal: satoshis === 0 ? '00' : '',
				fiatDecimalSymbol: satoshis === 0 ? '.' : '',
				fiatSymbol: fallbackTicker.currencySymbol,
				fiatTicker: fallbackTicker.quote,
				fiatValue: 0,
			};
		}

		if (!exchangeRate) {
			exchangeRate = getWalletStore().exchangeRates[currency].rate;
		}

		// this throws if exchangeRate is 0
		bitcoinUnits.setFiat(currency, exchangeRate);
		let fiatValue: number = bitcoinUnits(satoshis, 'satoshi')
			.to(currency)
			.value();

		return getFiatDisplayValuesForFiat({
			value: fiatValue,
			currency,
			currencySymbol,
			locale,
		});
	} catch (e) {
		console.error(e);

		const fallbackTicker =
			mostUsedExchangeTickers[currency] ?? mostUsedExchangeTickers.USD;

		return {
			fiatFormatted: '—',
			fiatWhole: satoshis === 0 ? '0' : '—',
			fiatDecimal: satoshis === 0 ? '00' : '',
			fiatDecimalSymbol: satoshis === 0 ? '.' : '',
			fiatSymbol: fallbackTicker.currencySymbol,
			fiatTicker: fallbackTicker.quote,
			fiatValue: 0,
		};
	}
};

/**
 * Formats a fiat amount into a displayValue format without conversion
 */
export const getFiatDisplayValuesForFiat = ({
	value,
	currency,
	currencySymbol,
	locale = 'en-US',
}: {
	value: number;
	currency?: string;
	currencySymbol?: string;
	locale?: string;
}): IFiatDisplayValues => {
	if (!currency) {
		currency = getSettingsStore().selectedCurrency;
	}

	let { fiatFormatted, fiatWhole, fiatDecimal, fiatDecimalSymbol, fiatSymbol } =
		defaultFiatDisplayValues;

	let currencyFormat = currency;
	if (currency === 'EUT') {
		currencyFormat = 'EUR';
	}
	if (currency === 'USDT') {
		currencyFormat = 'USD';
	}

	fiatFormatted = '';

	const fiatFormattedIntl = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyFormat,
	});

	fiatFormattedIntl.formatToParts(value).forEach((part) => {
		if (part.type === 'currency') {
			fiatSymbol = currencySymbol ?? part.value;
		} else if (part.type === 'integer' || part.type === 'group') {
			fiatWhole = `${fiatWhole}${part.value}`;
		} else if (part.type === 'fraction') {
			fiatDecimal = part.value;
		} else if (part.type === 'decimal') {
			fiatDecimal = part.value;
		}

		if (part.type !== 'currency') {
			fiatFormatted = `${fiatFormatted}${part.value}`;
		}
	});

	fiatFormatted = fiatFormatted.trim();

	return {
		fiatFormatted,
		fiatWhole,
		fiatDecimal,
		fiatDecimalSymbol,
		fiatSymbol,
		fiatTicker: currency,
		fiatValue: value,
	};
};

export const getDisplayValues = ({
	satoshis,
	exchangeRate,
	currency,
	currencySymbol,
	bitcoinUnit,
	locale = 'en-US',
}: {
	satoshis: number;
	exchangeRate?: number;
	currency?: string;
	currencySymbol?: string;
	bitcoinUnit?: EBitcoinUnit;
	locale?: string;
}): IDisplayValues => {
	const bitcoinDisplayValues = getBitcoinDisplayValues({
		satoshis: satoshis,
		bitcoinUnit: bitcoinUnit,
	});

	const fiatDisplayValues = getFiatDisplayValues({
		satoshis,
		bitcoinUnit,
		exchangeRate,
		currency,
		currencySymbol,
		locale,
	});

	return {
		...bitcoinDisplayValues,
		...fiatDisplayValues,
	};
};
