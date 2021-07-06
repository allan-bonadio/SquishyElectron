
const prefixes = [
	// e-24 thru e-3
	'y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm',
	'',

	// e3, kilo, to e24,
	'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y',
];
const prefixMid = 8;

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
function toSiPrefix(f, nDigits) {
	const pieces = toSiPieces(f);

	return pieces.mantissa.toPrecision(nDigits) + pieces.prefix;
}

// testing
//for (let ff = 1e-30;  ff < 1e30; ff *= 12345) {
//	console.log(`${ff.toPrecision(5)} = ${toSiUnits(ff, 6)}`);
//}

