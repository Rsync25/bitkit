import { chunkUint8Array } from './helpers';
import { err, ok, Result } from '@synonymdev/result';

/**
 * Convert readable string to bytes
 * @param str
 * @returns {Uint8Array}
 */
export const stringToBytes = (str: string): Uint8Array => {
	return Uint8Array.from(str, (x) => x.charCodeAt(0));
};

/**
 * Converts bytes to readable string
 * @param {Uint8Array} bytes
 * @returns {Result<string>}
 */
export const bytesToString = (bytes: Uint8Array): Result<string> => {
	let str = '';
	const chunks = chunkUint8Array(bytes);
	if (chunks.isErr()) {
		return err(chunks.error.message);
	}
	for (let chunk of chunks.value) {
		const arr: number[] = [];
		chunk.forEach((n) => arr.push(n));
		str += String.fromCharCode.apply(String, arr);
	}
	return ok(str);
};

/**
 * Converts bytes to hex string
 * @param bytes
 * @returns {string}
 */
export const bytesToHexString = (bytes: Uint8Array): string => {
	return bytes.reduce(
		(str, byte) => str + byte.toString(16).padStart(2, '0'),
		'',
	);
};

/**
 * Converts hex string to bytes
 * @param hexString
 * @returns {Uint8Array}
 */
export const hexStringToBytes = (hexString: string): Uint8Array => {
	return new Uint8Array(
		hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
	);
};

/**
 * Converts bytes to a long
 * @param bytes
 * @returns {number}
 */
export const bytesToLong = (bytes: Uint8Array): number => {
	let value = 0;
	for (let i = bytes.length - 1; i >= 0; i--) {
		value = value * 256 + bytes[i];
	}

	return value;
};
