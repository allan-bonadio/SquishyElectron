/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import qe from '../engine/qe';
import {qeBasicSpace} from '../engine/qeSpace';


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

// // put spaces between triples of digits.  ALWAYS positive reals.
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
	stepsPerDecade (spd) tells how many ix s make up a decade (x10 or x16)
	EG if spd = 1, so ix = -3, -2, -1, 0, 1, 2, 3 becomes power=.001, .01, .1, 1, 10, 100, 1000
	EG if spd = 3, so ix = -3, -2, -1, 0, 1, 2, 3 becomes power=.1, .2, .5, 1, 2, 5, 10
	EG if spd = 16, so ix = -3, -2, -1, 0, 1, 2, 3 becomes power=.125, .25, .5, 1, 2, 4, 8
	*/
// index this by stepsPerDecade to get the right stepFactors list
export const stepsPerDecadeStepFactors = {
	1: [1],
	2: [1, 3],
	3: [1, 2, 5],
	// 4: [1, 2, 3, 6],
	// 5: [1, 1.5, 2.5, 4, 6],
	6: [1, 1.5, 2, 3, 5, 8],
	// 8: [1, 1.3, 2.4, 3.2, 4.2, 5.6, 7.5]
	10: [1, 1.25, 1.5,     2, 2.50, 3,     4, 5, 6,     8],

	// 16 = base 2 only, all the way up.  Special case in the code.  a "decade" is really x16 with 4 gradations
	16: [1, 2, 4, 8],
};
//const Base2 = 16;

// convert eg 20, 21, 25, 30 into 100, 125, 300, 1000, the corresponding power
// special case: pass spd=16 to get a power-of-2 setting
// willRoundPowers = boolean, true if all values should be integers   stepFactors = element of stepsPerDecadeStepFactors
// ix = actual index to convert to a power
export function indexToPower(willRoundPowers, stepFactors, spd, ix) {
	//console.info(`indexToPower(willRoundPowers=${willRoundPowers}    stepFactors=[${stepFactors[0]},${stepFactors[1]},${stepFactors[2]}]    spd=${spd}    ix=${ix} )   `)
	let whichDecade, decadePower, factor;
	if (spd != 16) {
		whichDecade = Math.floor(ix/spd);
		decadePower = 10 ** whichDecade;
		factor = stepFactors[ix - whichDecade * spd];
	}
	else {
		// remember, there's still decades, but of 16x each, and 4 settings in each one
		whichDecade = Math.floor(ix/4);
		decadePower =  16 ** whichDecade;
		factor = stepFactors[ix - whichDecade * 4];
	}
	let power = factor * decadePower;
	if (willRoundPowers) power = Math.round(power) ;
	//console.info(`indexToPower - spd=${spd}  ix=${ix}  => power=${power}    factor=${factor}  whichDecade=${whichDecade } `)
	return power
}

// convert eg 100, 125, 300, 1000 into 20, 21, 25, 30
export function powerToIndex(spd, power) {
	//console.info(`powerToIndex(power=${power}   spd=${spd}  ) `)
	let logOf;
	if (spd != 16) {
		logOf = Math.log10(power) * spd;
	}
	else {
		logOf = Math.log2(power);
	}

	//console.info(`powerToIndex - spd=${spd}  power=${power}    logOf=${logOf}  6=${6}   `)

	// now it's reasonable at this point to say why are we rounding vs flooring?  Well, try spd=3 and power=200;
	// log*spd => 6.903 which falls down to 6 when it should be 7.
	//return Math.floor(logOf);
	return Math.round(logOf);
}

// keep this!!
//😇 function testPowers() {
//😇 	for (let spdStr in stepsPerDecadeStepFactors) {
//😇 		const spd = +spdStr;
//😇 		let stepFactors = stepsPerDecadeStepFactors[spd];
//😇 		console.info(`spd: ${spd}  stepFactors:`, stepFactors.map(f => f.toFixed(2)).join(', ') );
//😇
//😇 		for (let offset = -6; offset < 6; offset += spd) {
//😇 			let totalOffset = spd*offset;
//😇 			stepFactors.forEach((factor, ixNear) => {
//😇 				let ix = ixNear + totalOffset;
//😇 				let power = indexToPower(false, stepFactors, spd, ix);
//😇 				let ixBack = powerToIndex(spd, power);
//😇 				console.info(`   ${ix} ➡︎ ${power} ➡ ${ixBack}`);
//😇 				if (ix != ixBack)
//😇 					console.error(`  ix:${ix} ≠ ixBack:${ixBack}`);
//😇 			})
//😇 		}
//😇
//😇 	}
//😇 }
//😇testPowers();


/* **************************************************************** potentials */

// raw numbers ~ 1 are way too big and throw it all into chaos
const VALLEY_FACTOR = .001;

// these are simple arrays.  No wrapper object needed (not yet)  Just make a typed array from what C++ created
export function getWrappedPotential(space) {
	return new Float64Array(window.Module.HEAPF64.buffer, qe.qSpace_getPotentialBuffer(), space.nPoints);
}

export function fixPotentialBoundaries(space, potential) {
	const {end, continuum} = space.startEnd;

	switch (continuum) {
	case qeBasicSpace.contDISCRETE:
		break;

	case qeBasicSpace.contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		potential[0] = potential[1] = potential[end] = potential[end+1] = 0; // ?? gonna have to think thru contWELL
		break;

	case qeBasicSpace.contENDLESS:
		// the points on the end get set to the opposite side
		potential[0] = potential[end-1];
		potential[end] = potential[1];
		break;

	default: throw `bad continuum '${continuum}' in  fixPotentialBoundaries()`;
	}
}

export function setFamiliarPotential(space, potentialArray, potentialParams) {
	const {start, end, N} = space.startEnd;
	let {potentialBreed, valleyPower, valleyScale, valleyOffset} = potentialParams;
	let pot;
	for (let ix = start; ix < end; ix++) {
		switch (potentialBreed) {
		case 'flat':
			pot = 0;
			break;

		case 'valley':
			pot = Math.pow(Math.abs(ix - valleyOffset * N / 100), +valleyPower) * +valleyScale * VALLEY_FACTOR;
			if (! isFinite(pot)) {
				console.warn(`potential ${pot} screwed up at x=${ix}`, JSON.stringify(potentialParams));
				console.warn(`   ix - valleyOffset * N / 100=${ix - valleyOffset * N / 100}`);
				console.warn(`   Math.pow(ix - valleyOffset * N / 100, +valleyPower)=${Math.pow(ix - valleyOffset * N / 100, +valleyPower)}`);
				console.warn(`  Math.pow(ix - valleyOffset * N / 100, +valleyPower) * +valleyScale=${Math.pow(ix - valleyOffset * N / 100, +valleyPower) * +valleyScale}`);
			}
			break;

		default:
			throw `bad potentialBreed: ${potentialBreed}`;
		}
		potentialArray[ix] = pot;
	}

	// fix boundaries
	fixPotentialBoundaries(space, potentialArray);
}

export function dumpPotential(space, potentialArray, nPerRow = 1, skipAllButEvery = 1) {
	const {start, end, N} = space.startEnd;
	if (! skipAllButEvery)
		skipAllButEvery = Math.ceil(N / 40);
	if (! nPerRow)
		nPerRow =  Math.ceil(N / 10);

	let txt = '';
	for (let ix = start; ix < end; ix++) {
		txt += potentialArray[ix].toFixed(6).padStart(10);
		if (ix % skipAllButEvery == 0)
			txt += '\n';
	}
	console.log(`${txt}\n`);
}


