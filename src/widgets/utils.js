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
export function toSiPieces(f) {
	const thousands = Math.log10(f) / 3;
	const iThous = Math.floor(thousands);
	let prefix = prefixes[iThous + prefixMid];
	if (prefix === undefined)
		prefix = `e${iThous > 0 ? '+' : ''}${iThous * 3}`;
	const mantissa = f / (1000 ** iThous);
	return {mantissa, prefix, iThous};
}

// return a string for this real number, with greek/roman suffixes instead of exponent
export function toSiPrefix(f, nDigits) {
	const pieces = toSiPieces(f);

	return pieces.mantissa.toPrecision(nDigits) + pieces.prefix;
}

// testing
//for (let ff = 1e-30;  ff < 1e30; ff *= 12345) {
//	console.log(`${ff.toPrecision(5)} = ${toSiUnits(ff, 6)}`);
//}

/* ********************************** thousands() */

// put spaces between triples of digits.  ALWAYS positive reals.
export function thousands(n) {
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

// function testThousands() {
// 	let n;
// 	for (n = 1e-6; n < 1e6; n *= 10) {
// 		for (let f = 1; f < 10; f *= 1.4)
// 			console.info(`  testThousands, progressive fractions: ${n*f} =>`, thousands(n * f));
// 		console.log();
// 	}
// }
//testThousands();



// older version
// take number (str or num) passed in, and depict it with spaces as thousands  separators
// export function thousands(num) {
// 	return num.toString()
// 		.replace(/(\d)(\d\d\d)$/, '$1 $2')  // if it's  an integer at end of string
// 		.replace(/(\d)(\d\d\d)\./, '$1 $2.')  // if it's a decimal
// 		.replace(/(\d)(\d\d\d)(\d\d\d) /, '$1 $2 $3 ')  // if it's got a LOT of digits
// 		.replace(/(\d)(\d\d\d) /, '$1 $2 ')  // another three digits
// }
//
// // testing
// if (false) {
// 	for (let b = 1; b < 1e20; b *= 10) {
// 		console.log(thousands(b));
// 		console.log(thousands(b + .1));
// 	}
// }


/* ***************************************************************** powers
	index (ix) is an integer that the input[type=range] operates with
	power is a real that the user sees and the software outside of LogSlider deals with.
	stepsPerDecade (spd) tells how many ix s make up a decade (x10)
	EG if spd = 3, so ix = -3, -2, -1, 0, 1, 2, 3 becomes power=.1, .2, .5, 1, 2, 5, 10
	*/
// index this by stepsPerDecade to get the right factors list
export const stepsPerDecadeFactors = {
	1: [1],
	2: [1, 3],
	3: [1, 2, 5],
	// 4: [1, 2, 3, 6],
	// 5: [1, 1.5, 2.5, 4, 6],
	6: [1, 1.5, 2, 3, 5, 7],
	// 8: [1, 1.3, 2.4, 3.2, 4.2, 5.6, 7.5]
	10: [1, 1.25, 1.5,     2, 2.50, 3,     4, 5, 6,     8],
};

// convert eg 20, 21, 25, 30 into 100, 125, 300, 1000, the corresponding power
export function indexToPower(integer, factors, spd, ix) {
	//console.info(`indexToPower(integer=${integer}    factors=[${factors[0]},${factors[1]},${factors[2]}]    spd=${spd}    ix=${ix} )   `)
	let ix10 = Math.floor(ix/spd);
	let po10 = 10 ** ix10;
	let factor = factors[ix - ix10 * spd];

	return integer ? Math.ceil(factor * po10) : factor * po10;
}

// convert eg 100, 125, 300, 1000 into 20, 21, 25, 30
export function powerToIndex(spd, power) {
	//console.info(`powerToIndex(power=${power}   spd=${spd}  ) `)
	return Math.round(Math.log10(power) * spd);
}

// function testPowers() {
// 	for (let spdStr in stepsPerDecadeFactors) {
// 		const spd = +spdStr;
// 		let factors = stepsPerDecadeFactors[spd];
// 		console.info(`spd: ${spd}  factors:`, factors.map(f => f.toFixed(2)).join(', ') );
//
// 		for (let offset = -6; offset < 6; offset += spd) {
// 			let totalOffset = spd*offset;
// 			factors.forEach((factor, ixNear) => {
// 				let ix = ixNear + totalOffset;
// 				let power = indexToPower(false, factors, spd, ix);
// 				let ixBack = powerToIndex(spd, power);
// 				console.info(`   ${ix} ➡︎ ${power} ➡ ${ixBack}`);
// 				if (ix != ixBack)
// 					console.error(`  ix:${ix} ≠ ixBack:${ixBack}`);
// 			})
// 		}
//
// 	}
// }
//testPowers();
