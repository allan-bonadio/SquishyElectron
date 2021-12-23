/*
** Log Slider -- just like an input slider, but on a logarithmic scale
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import React from 'react';
//import {scaleLinear} from 'd3-scale';
//import {path as d3path} from 'd3-path';

/* ***************************************************************** powers
	index (ix) is an integer that the input[type=range] operates with
	power is a real that the user sees and the software outside of LogSlider deals with.
	stepsPerDecade (spd) tells how many ix s make up a decade (x10)
	EG if spd = 3, so ix = -3, -2, -1, 0, 1, 2, 3 becomes power=.1, .2, .5, 1, 2, 5, 10
	*/
// index this by stepsPerDecade to get the right factors list
const stepsPerDecadeFactors = {
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
function indexToPower(integer, factors, spd, ix) {
	//console.info(`indexToPower(integer=${integer}    factors=[${factors[0]},${factors[1]},${factors[2]}]    spd=${spd}    ix=${ix} )   `)
	let ix10 = Math.floor(ix/spd);
	let po10 = 10 ** ix10;
	let factor = factors[ix - ix10 * spd];

	return integer ? Math.ceil(factor * po10) : factor * po10;
}

// convert eg 100, 125, 300, 1000 into 20, 21, 25, 30
function powerToIndex(spd, power) {
	//console.info(`powerToIndex(power=${power}   spd=${spd}  ) `)
	return Math.round(Math.log10(power) * spd);
}

function testPowers() {
	for (let spdStr in stepsPerDecadeFactors) {
		const spd = +spdStr;
		let factors = stepsPerDecadeFactors[spd];
		console.info(`spd: ${spd}  factors:`, factors.map(f => f.toFixed(2)).join(', ') );

		for (let offset = -6; offset < 6; offset += spd) {
			let totalOffset = spd*offset;
			factors.forEach((factor, ixNear) => {
				let ix = ixNear + totalOffset;
				let power = indexToPower(false, factors, spd, ix);
				let ixBack = powerToIndex(spd, power);
				console.info(`   ${ix} ➡︎ ${power} ➡ ${ixBack}`);
				if (ix != ixBack)
					console.error(`  ix:${ix} ≠ ixBack:${ixBack}`);
			})
		}

	}
}
testPowers();

// give me an array of JUST the even powers of 10 between the min and max, inclusive
// The indices.  wait, this doesn't work... trana get where the tic marks are
function createGoodPowersOf10(spd, iMin, iMax) {
	let po10 = [];
	for (let p = iMin; p <= iMax; p += spd) {
		po10.push(<option key={p}>{p}</option>);
//		po10.push(<option>{p + 3}</option>);
//		po10.push(<option>{p + 7}</option>);
	}
	return po10;
}


// put spaces between triples of digits.  ALWAYS positive reals.
function thousands(n) {
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

function testThousands() {
	let n, digz;
	const digitz = 1.111111111**2;
	for (n = 1e-6; n < 1e6; n *= 10) {
		for (let f = 1; f < 10; f *= 1.4)
			console.info(`  testThousands, progressive fractions: ${n*f} =>`, thousands(n * f));
		console.log();
	}
}
testThousands();

/* ****************************************************************** component */
function setPT() {
	LogSlider.propTypes = {
		className: PropTypes.string,
		label: PropTypes.string.isRequired,
		minLabel: PropTypes.string,
		maxLabel: PropTypes.string,

		// these are powers, not indices
		current: PropTypes.number.isRequired,
		original: PropTypes.number,
		sliderMin: PropTypes.number.isRequired,
		sliderMax: PropTypes.number.isRequired,

		stepsPerDecade: PropTypes.number.isRequired,
		integer: PropTypes.bool,

		handleChange: PropTypes.func,
	};

	LogSlider.defaultProps = {
		className: '',
		label: 'how much',
		minLabel: 'low',
		maxLabel: 'high',

		integer: false,

		handleChange: (ix, power) => {},
	};
}

function LogSlider(props) {
	const p = props;
	const factors = stepsPerDecadeFactors[p.stepsPerDecade];
	const spd = p.stepsPerDecade;
	const cur = p.current;
	//const cur = indexToPower(p.integer, factors, p.stepsPerDecade, p.current);

	function handleSlide(ev) {
		console.info(`handleChange::  ev=`, ev);
		const ix = ev.currentTarget.value;
		const power = indexToPower(p.integer, factors, spd, ix);
		console.info(`handleChange::  ix=${ix}  power=${power}`);
		p.handleChange(power, ix);
	}

	const wasOriginal = p.original ? <small>&nbsp; (was {thousands(p.original)})</small> : '';

	return <div className={`${p.className} LogSlider`}>
		<aside>
			<div className='left'>{p.minLabel}</div>
			<div className='middle'>
				{p.label}: <big>{thousands(cur)}</big>
				{wasOriginal}
			</div>
			<div className='right'>{p.maxLabel}</div>

		</aside>

		<input type="range"
			min={powerToIndex(spd, p.sliderMin)} max={powerToIndex(spd, p.sliderMax)}
			value={powerToIndex(spd, p.current)}
			list='nerfgod'
			onInput={handleSlide}
		/>
	</div>;
}

setPT();

export default LogSlider;



// 		<input className='LogSlider' type="range"
// 			min={p.sliderMin} max={p.sliderMax}
// 			value={p.current}
// 			list='nerfgod'
// 			style={{width: '100%'}}
// 			onInput={ev => p.handleChange(ev)}
// 		/>
