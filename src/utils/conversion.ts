import { default as bitcoinUnits } from 'bitcoin-units';
import { EBalanceUnit, EBitcoinUnit } from '../store/types/wallet';
import { getSettingsStore } from '../store/helpers';
import { getExchangeRate } from './exchange-rate';
import { IFiatDisplayValues } from './displayValues/types';
import { getFiatDisplayValues } from './displayValues';

export const btcToSats = (balance: number): number => {
	try {
		return Number(
			bitcoinUnits(balance, 'BTC').to('satoshi').value().toFixed(0),
		);
	} catch (e) {
		return 0;
	}
};

export const satsToBtc = (balance: number): number => {
	return bitcoinUnits(balance, 'sats').to('BTC').value();
};

/**
 * Converts an amount of currency in a specific unit to satoshis
 */
export const convertToSats = (
	value: number | string,
	unit: EBalanceUnit,
): number => {
	let amount = Number(value);

	if (unit === EBalanceUnit.BTC) {
		return btcToSats(amount);
	}

	if (unit === EBalanceUnit.fiat) {
		return fiatToBitcoinUnit({
			fiatValue: amount,
			bitcoinUnit: EBitcoinUnit.satoshi,
		});
	}

	return amount;
};

export const fiatToBitcoinUnit = ({
	fiatValue,
	exchangeRate,
	currency,
	bitcoinUnit,
}: {
	fiatValue: string | number;
	exchangeRate?: number;
	currency?: string;
	bitcoinUnit?: EBitcoinUnit;
}): number => {
	if (!currency) {
		currency = getSettingsStore().selectedCurrency;
	}
	if (!exchangeRate) {
		exchangeRate = getExchangeRate(currency);
	}
	if (!bitcoinUnit) {
		bitcoinUnit = getSettingsStore().bitcoinUnit;
	}

	try {
		// this throws if exchangeRate is 0
		bitcoinUnits.setFiat(currency, exchangeRate);
		const value = bitcoinUnits(Number(fiatValue), currency)
			.to(bitcoinUnit)
			.value()
			.toFixed(bitcoinUnit === EBitcoinUnit.satoshi ? 0 : 8); // satoshi cannot be a fractional number

		return Number(value);
	} catch (e) {
		return 0;
	}
};

/**
 * Converts from one fiat to another
 */
export const convertCurrency = ({
	amount,
	from,
	to,
}: {
	amount: number;
	from: string;
	to: string;
}): IFiatDisplayValues => {
	const sats = fiatToBitcoinUnit({
		fiatValue: amount,
		bitcoinUnit: EBitcoinUnit.satoshi,
		currency: from,
	});
	return getFiatDisplayValues({
		satoshis: sats,
		bitcoinUnit: EBitcoinUnit.satoshi,
		currency: to,
	});
};
