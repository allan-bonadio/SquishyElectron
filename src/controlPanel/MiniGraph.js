/*
** Mini Graph -- small rectangular graph showing user what kind of wave or potential they're asking for
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {path as d3path} from 'd3-path';

const π = Math.PI;
const radsPerDeg = π / 180;

function setPT() {
	MiniGraph.propTypes = {
		className: PropTypes.string,

		// function that accepts x, and returns y, a real or qCx if complex
		yFunction: PropTypes.func,

		// pass true for a wave, area plot drawn from top ('complex').  Or false for just a white line on black ('linear')
		// this should become some sort of enum when I add the 3rd kind (wave, pot, ...)
		complex: PropTypes.bool,

		// domain and range.  If you leave out the y range (either or both), it'll autorange.
		xMin: PropTypes.number,
		xMax: PropTypes.number,
		yMin: PropTypes.number,
		yMax: PropTypes.number,

		// size of graph, in pixels
		width: PropTypes.number,
		height: PropTypes.number,
	};
	MiniGraph.defaultProps = {
		className: '',

		yFunction: (x) => Math.sin(x * radsPerDeg),
		complex: false,

		xMin: 0,
		xMax: 360,
		yMin: undefined,  // means auto-range, both independently.
		yMax: undefined,  // for complex, y = magn
		width: 100,
		height: 50,
	};
}

const potentialRecipe = {
	name: 'potentialRecipe',

	//  sets value for this pt. in values array.  returns magn.
	calcPoint(values, xPx, y) {
		values[xPx] = {x: xPx, y};
		return y;
	},

	// generate React nodes of svg objects, return them, like render
	// xmin/max are sides of the graph; min/,maxY are autoranged based on data
	render(values, xMin, xMax, minY, maxY, height) {
		//absolute potential doesn't matter - just relative changes.  hence autorange.
		const yScale = scaleLinear(
			[minY - .2, maxY + .2],  // domain fits the data, plus a small margin at the edges
			[height, 0]);  // upside down to the screen space in the svg

		// generate points.  Really, we want to generate per-pixel or per-two-pixel
		let pathObj = d3path();
		let yyy = values[0];
		console.log('val 0: ', yyy);
		yyy = yyy.y;
		console.log(' . y: ', yyy);
		yyy = yScale(yyy);
		console.log('yscale: ', yyy);
		yyy = (yyy).toFixed(2);
		console.log('toFixed: ', yyy);
		pathObj.moveTo(xMin, (yScale(values[0].y)).toFixed(2));
		values.forEach((val, xPx) => {
			pathObj.lineTo(xPx, (yScale(val.y)).toFixed(2));
		});
		//	for (let xPx = 0; xPx <= p.width; xPx++) {
		//		let x = xScale.invert(xPx);
		//		let y = p.yFunction(x);
		//		y: Math.round(yScale(y) * 100) / 100
		//	}
		const d = pathObj.toString();
		return <path d={d} stroke='#fff' fill='none' />;
	}
}

// is this gonna work?
const complexColorScale = scaleLinear([-π, π],
					['#0ff', '#00f', '#f0f', '#f00', '#ff0', '#0f0', '#0ff']);
// cyan to cyan cuz atan2() gives you -π to +π

const waveRecipe = {
	name: 'waveRecipe',

	//  sets value for this pt. in values array.  returns magn.
	calcPoint(values, xPx, y) {
		const magn = y.real * y.real + y.im * y.im;
		values[xPx] = {x: xPx, ...y, magn};
		return magn;
	},

	// generate React nodes of svg objects, return them, like render
	render(values, xMin, xMax, minY, maxY, height) {
		const yScale = scaleLinear(
			[0, maxY + .2],  // domain fits the data, plus a small margin at the edges
			[0, height]);  // upside down to the screen space in the svg

//		colorScale = scaleLinear([0, 1, 2, 3, 4, 5, 6],
//					['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);

		// lots of short vertical lines of various lengths and colors but always 1px wide hanging down from the top
		return values.map( val => {
			// each val is {x, real, im, magn} and each turns to a <path> node so it looks like a squishview.

			let angle = Math.atan2(val.im, val.real);
			let color = complexColorScale(angle);  // stroke color
			let magn = yScale(val.magn).toFixed(2)
			console.log(`values.map==> angle = '${angle}'  color = '${color}'  magn = '${magn}' `);
			return <path  d={`M${val.x},0V${magn}`} stroke={color} fill='none'
				key={val.x}/>
		})
	}
}

function MiniGraph(props) {
	const p = props;
	let viewBox = `0 0 ${+p.width} ${+p.height}`;

	let recipe = p.complex ? waveRecipe : potentialRecipe;

	// calculate all and find extents
	const xScale = scaleLinear([+p.xMin, +p.xMax], [0, p.width]);
	let maxi = -Infinity, mini = Infinity;
	let values = new Array(p.width);
	for (let xPx = 0; xPx <= +p.width; xPx++) {
		let x = xScale.invert(xPx);
		let y = p.yFunction(x);

		let magn = recipe.calcPoint(values, xPx, y);

//		let magn = y;
//		if (isComplex) {
//			values[xPx] = {x: xPx, ...y};
//			magn = y.real * y.real + y.im * y.im;
//		}
//		else {
//			values[xPx] = {x: xPx, y};
//		}


		if (magn < mini) mini = magn;
		if (magn > maxi) maxi = magn;
	}
	if (p.yMin !== undefined) mini = +p.yMin;
	if (p.yMax !== undefined) maxi = +p.yMax;

	// in case you're all still infinity,
	if (! isFinite(mini)) mini = -1;
	if (! isFinite(maxi)) maxi = 1;
	// figure out the scaling -
//	const yScale = scaleLinear(
//		[mini - .2, maxi + .2],  // domain fits the data, plus a small margin at the edges
//		[p.height, 0]);  // upside down to the screen space in the svg
//
//
//
//	let colorScale = '#fff';  // if scalar
//	if (isComplex) {
//		colorScale = scaleLinear([0, 1, 2, 3, 4, 5, 6],
//					['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);
//	}
//











	return <svg className={`MiniGraph ${p.className}`}
						viewBox={viewBox}
						width={p.width} height={p.height}
						preserveAspectRatio='none' >

		<g className='line-paths'>
			{recipe.render(values, p.xMin, p.xMax, mini, maxi, p.height)}
		</g>

	</svg>;
}

setPT();

export default MiniGraph;
