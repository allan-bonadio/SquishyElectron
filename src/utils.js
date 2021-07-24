/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

/* ********************************** toSiPieces() */

const prefixes = [
	// e-24 thru e-3
	'y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm',

	'',

	// e3, kilo, to e24,
	'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y',
];
const prefixMid = prefixes.indexOf('');

// return a string for this real number, with greek/roman suffixes for the exponent
function toSiPieces(f) {
	const thousands = Math.log10(f) / 3;
	const iThous = Math.floor(thousands);
	let prefix = prefixes[iThous + prefixMid];
	if (prefix === undefined)
		prefix = `e${iThous > 0 ? '+' : ''}${iThous * 3}`;
	const mantissa = f / (1000 ** iThous);
	return {mantissa, prefix, iThous};
}

// return a string for this real number, with greek/roman suffixes for the exponent
export function toSiPrefix(f, nDigits) {
	const pieces = toSiPieces(f);

	return pieces.mantissa.toPrecision(nDigits) + pieces.prefix;
}

// testing
//for (let ff = 1e-30;  ff < 1e30; ff *= 12345) {
//	console.log(`${ff.toPrecision(5)} = ${toSiUnits(ff, 6)}`);
//}

/* ********************************** thousands() */

// take number (str or num) passed in, and depict it with spaces as thousands  separators
export function thousands(num) {
	return num.toString()
		.replace(/(\d)(\d\d\d)$/, '$1 $2')  // if it's  an integer at end of string
		.replace(/(\d)(\d\d\d)\./, '$1 $2.')  // if it's a decimal
		.replace(/(\d)(\d\d\d)(\d\d\d) /, '$1 $2 $3 ')  // if it's got a LOT of digits
		.replace(/(\d)(\d\d\d) /, '$1 $2 ')  // another three digits
}

// testing
if (false) {
	for (let b = 1; b < 1e20; b *= 10) {
		console.log(thousands(b));
		console.log(thousands(b + .1));
	}
}
