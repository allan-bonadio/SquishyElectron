/*
** Log Slider -- just like an input slider, but on a logarithmic scale
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import React from 'react';
//import {scaleLinear} from 'd3-scale';
//import {path as d3path} from 'd3-path';

import {thousands, stepsPerDecadeFactors, indexToPower, powerToIndex} from './utils';



// save this for hwen i put ticks on the log slider
// give me an array of JUST the even powers of 10 between the min and max, inclusive
// The indices.  wait, this doesn't work... trana get where the tic marks are
// function createGoodPowersOf10(spd, iMin, iMax) {
// 	let po10 = [];
//		// no this is wrong it'll make factors of 10 starting at the min; should start at a power of 10
// 	for (let p = iMin; p <= iMax; p += spd) {
// 		po10.push(<option key={p}>{p}</option>);
// //		po10.push(<option>{p + 3}</option>);
// //		po10.push(<option>{p + 7}</option>);
// 	}
// 	return po10;
// }

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
