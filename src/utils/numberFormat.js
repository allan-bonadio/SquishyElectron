/*
** numberFormat -- SI unit and thousands seperators
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

/* ********************************** toSiPieces() */
// SI suffixes, as in milli, micro, nano, pico, .... kilo, mega, giga, ...

const suffixes = [
	// e-24 thru e-3
	'y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm',

	'',

	// e3, kilo, to e24,
	'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y',
];
const suffixMid = suffixes.indexOf('');

// return a string for this real number, with greek/roman suffixes for the exponent
export function toSiPieces(f) {
	const thousands = Math.log10(f) / 3;
	const iThous = Math.floor(thousands);
	let suffix = suffixes[iThous + suffixMid];
	if (suffix === undefined)
		suffix = `e${iThous > 0 ? '+' : ''}${iThous * 3}`;
	const mantissa = f / (1000 ** iThous);
	return {mantissa, suffix, iThous};
}

// return a string for this real number, with greek/roman suffixes instead of exponent
export function toSiSuffix(f, nDigits) {
	const pieces = toSiPieces(f);

	return pieces.mantissa.toPrecision(nDigits) + pieces.suffix;
}

// testing
//for (let ff = 1e-30;  ff < 1e30; ff *= 12345) {
//	console.log(`${ff.toPrecision(5)} = ${toSiUnits(ff, 6)}`);
//}

/* ********************************** thousands() */
// I didn't realize when I wrote this that the Intl functions can do this too
const doesLocaleStuff = !!(window.Intl && Intl.NumberFormat);

export function thousands(n) {

	if (doesLocaleStuff) {
		return Number(n).toLocaleString();
		// num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
	}
	return thousandsBackup(n);
}

// put spaces between triples of digits.  ALWAYS positive reals.
// not sure why I did this cuz it's built in to intl but in case you have an
// ancient browser ... but if you do, you can't run webassembly or GL...
export function thousandsBackup(n) {
	n = Math.round(n * 1e6) / 1e6;
	let nInt = Math.floor(n);
	let nFrac = (n) % 1;
	//let nFrac = (n + 1e-13) % 1;
	if (n < 1e-12) {
		console.warn(` hey!  ${n} is too small for thousands!!`);
	}

	let nuPart = 'z';
	let fracPart = '';
	if (nFrac > 0) {
		fracPart = String(nFrac).replace(/\.(\d\d\d)$/, '.$1 ');  // first space
		while (nuPart != fracPart) {
			nuPart = fracPart;
			fracPart = nuPart.replace(/ (\d\d\d)/, ' $1 ');  // each additional space
			//console.info(`thousands: fracPart='${fracPart} '  nuPart='${nuPart}'`)
		}
		fracPart = fracPart.substr(1);  // get rid of leading 0
	}

	let intPart =String(nInt).replace(/(\d\d\d)$/, ' $1')
	nuPart = 'w';
	while (nuPart != intPart) {
		nuPart = intPart;
		intPart = nuPart.replace(/(\d\d\d) /, ' $1 ').trim();  // each additional space
		//console.info(`thousands: intPart='${intPart}'   nuPart='${nuPart}'`)
	}

	console.log( '    done: '+ intPart + fracPart);
	return intPart + fracPart;
}

//😇 function testThousands() {
//😇 	let n;
//😇 	for (n = 1e-6; n < 1e6; n *= 10) {
//😇 		for (let f = 1; f < 10; f *= 1.4)
//😇 			console.info(`  testThousands, progressive fractions: ${n*f} =>`, thousands(n * f));
//😇 		console.log();
//😇 	}
//😇 }
//😇testThousands();



