/*
** Mini Graph -- small rectangular graph showing user what kind of wave or potential they're asking for
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {path as d3path} from 'd3-path';

//import cxToRgb from '../view/cxToRgb';
import cxToRgb from '../view/cxToRgb';
import qCx from '../wave/qCx';
import qeSpace from '../wave/qeSpace';
import qeWave from '../wave/qeWave';

//const π = Math.PI;
//const radsPerDeg = π / 180;

const miniDebug = true;
const miniDebugDump = false;

function setPT() {
	MiniGraph.propTypes = {
		className: PropTypes.string.isRequired,

		// function that accepts x, and returns y, a real or qCx if isWave
		//yFunction: PropTypes.func,

		// pass true for a wave, area plot drawn from top ('isWave').  Or false for just a white line on black ('linear')
		// this should become some sort of enum when I add the 3rd kind (wave, pot, ...)
		isWave: PropTypes.bool.isRequired,

		// domain and range.
		// no; always zero  xMin: PropTypes.number,
// 		xMax: PropTypes.number,
// 		yMin: PropTypes.number,
// 		yMax: PropTypes.number,

		// outer size of graph, in pixels
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,

		// variables decided by sliders
		familiarParams: PropTypes.shape({
			frequency: PropTypes.number,
			waveBreed: PropTypes.oneOf(['circular', 'standing', 'pulse',]),
		}).isRequired,

		space: PropTypes.instanceOf(qeSpace).isRequired,
	};
	MiniGraph.defaultProps = {};
}

// use this in the potential tab.  Returns a <path element
const potentialRecipe = {
	name: 'potentialRecipe',

	//  sets value for this pt. in values array.  returns magn.
	calcPoint(values, xPx, y) {
		values[xPx] = {x: xPx, y};
		return y;
	},

	genValues() {

	},

	// generate React nodes of svg objects, return them, like render
	// 0/max are sides of the graph; min/,maxY are autoranged based on data
	render(values, xMax, minY, maxY, height) {
		//absolute potential doesn't matter - just relative changes.  hence autorange.
		const yScale = scaleLinear(
			[minY - .2, maxY + .2],  // domain fits the data, plus a small margin at the edges
			[height, 0]);  // upside down to the screen space in the svg

		// generate points.  Really, we want to generate per-pixel or per-two-pixel
		let pathObj = d3path();
		let yyy = values[0];
		if (miniDebug) console.log('val 0: ', yyy);
		yyy = yyy.y;
		if (miniDebug) console.log(' . y: ', yyy);
		yyy = yScale(yyy);
		if (miniDebug) console.log('yscale: ', yyy);
		yyy = (yyy).toFixed(2);
		if (miniDebug) console.log('toFixed: ', yyy);
		pathObj.moveTo(0, (yScale(values[0].y)).toFixed(2));
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


// // use this in the Set Wave tab.  sets waveRecipe.maxY and waveRecipe.elements as return values
// function waveRecipe(space, familiarParams) {
// 	// keep these buffers around for reuse - a bit faster
// 	const {start, end, N} = space.startEnd;
// 	if (! this.qewave || waveRecipe.qeWave.wave.length != N*2) {
// 		waveRecipe.qewave = new qeWave(space);
// 		waveRecipe.elements = new Array(N);
// 	}
//
// 	// generate the values, find yMin and yMax, and generate the <path elements
// 	waveRecipe.qewave.setFamiliarWave(familiarParams);
// 	const wave = waveRecipe.qewave.wave;
// 	let maxY = 0;
//
// 	for (let ix = start; ix < end; ix++) {
// 		let ix2 = ix * 2;
//
// 		let val = qCx(wave[ix2], wave[ix2+1]);
// 		let color = val.color();
// 		let magn = val.magn();
// 		maxY = Math.max(maxY, magn);
//
// 		if (miniDebugDump) console.log(
// 			`miniGraph values.map==> magn = '${magn}'   color = ${color}`);
// 		waveRecipe.elements[ix] = <path  d={`M${ix},0V${magn}`}
// 			stroke={color} fill='none' key={val.x}/>
// 	})
// 	return {maxY, paths};

// 	}
//
// 	// generate React nodes of svg objects, return them, like render
// 	render(xMax, minY, maxY, height) {
// 		const yScale = scaleLinear(
// 			[0, maxY + .2],  // domain fits the data, plus a small margin at the edges
// 			[0, height]);  // upside down to the screen space in the svg
//
// //		colorScale = scaleLinear([0, 1, 2, 3, 4, 5, 6],
// //					['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);
//
// 		// lots of short vertical lines of various lengths and colors but always 1px wide hanging down from the top
// 		// You can't combine this all into one path, cuz each segment has a different color
// 		return values.map( val => {
// 			console.info(`MiniGraph render ${arguments[2]} val=`, val, yScale)
// 			// each val is {x, re, im, magn} and each turns to a <path> node so it looks like a squishview.
//
// 			//let angle = Math.atan2(val.im, val.re);
// 			//let color = complexColorScale(angle);  // stroke color
// 			let color = cxToRgb(val);
//
// 			let magn = yScale(val.magn).toFixed(2)
// 			if (miniDebugDump) console.log(`miniGraph values.map==> magn = '${magn}'   color =`, color);
// 			return <path  d={`M${val.x},0V${magn}`} stroke={color} fill='none'
// 				key={val.x}/>
// 		})
// 	}
//}


// the component.  We need a class component cuz we weant to save stuff on this
// doesn't really need any state.
export class MiniGraph extends React.Component {
	constructor(props) {
		super(props);
		const p = props;

		// construct a copy of the space, but with no more resolution than the minigraph
		const proxyDims = [{...p.space.dimensions[0]}];
		proxyDims.N = Math.min(proxyDims.N, p.width);
		this.space = new qeSpace(proxyDims);

		// these never change for the life of the component
		this.viewBox = `0 0 ${+p.width} ${+p.height}`;
	}


	// use this in the Set Wave tab.  sets waveRecipe.maxY and waveRecipe.elements as return values
	waveRecipe(familiarParams) {
		//const p = this.props;
		const {start, end, N} = this.space.startEnd;

		// keep these buffers around for reuse - a bit faster
		if (! this.qewave || this.elements.length != N) {
			this.qewave = new qeWave(this.space);
			this.elements = new Array(N);
		}

		// generate the values
		this.qewave.setFamiliarWave(familiarParams);
		const wave = this.qewave.wave;

		// find yMin and yMax, and generate the <path elements
		let maxY = 0;
		for (let ix = start; ix < end; ix++) {
			let ix2 = ix * 2;

			let val = qCx(wave[ix2], wave[ix2+1]);
			let color = cxToRgb(val);
			let magn = val.re ** 2 + val.im ** 2;
			maxY = Math.max(maxY, magn);

			if (miniDebugDump) console.log(
				`miniGraph magn = '${magn}'   color = ${color}`);

			this.elements[ix] = <path  d={`M${ix},0V${magn}`}
				stroke={color} fill='none' key={val.x}/>
		}
		this.maxY = maxY;
	}

	potentialRecipe(familiarParams) {
	}
//
// 	// calculate all and find extents
// 	let maxi = -Infinity, mini = Infinity;
// 	let values = new Array(p.width);
// 	for (let xPx = 0; xPx <= +p.width; xPx++) {
// 		let x = xScale.invert(xPx);
// 		let y = p.yFunction(x);
//
// 		let magn = recipe.calcPoint(values, xPx, y);

//		let magn = y;
//		if (isisWave) {
//			values[xPx] = {x: xPx, ...y};
//			magn = y.re * y.re + y.im * y.im;
//		}
//		else {
//			values[xPx] = {x: xPx, y};
//		}
// 		if (magn < mini) mini = magn;
// 		if (magn > maxi) maxi = magn;
// 	}
// 	if (p.yMin !== undefined) mini = +p.yMin;
// 	if (p.yMax !== undefined) maxi = +p.yMax;

	// in case you're all still infinity,
// 	if (! isFinite(mini)) mini = -1;
// 	if (! isFinite(maxi)) maxi = 1;
	// figure out the scaling -
//	const yScale = scaleLinear(
//		[mini - .2, maxi + .2],  // domain fits the data, plus a small margin at the edges
//		[p.height, 0]);  // upside down to the screen space in the svg
//
//
//
//	let colorScale = '#fff';  // if scalar
//	if (isisWave) {
//		colorScale = scaleLinear([0, 1, 2, 3, 4, 5, 6],
//					['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);
//	}
//

	render() {
		const p = this.props;
		const {N} = this.space.startEnd;

		if (p.isWave)
			this.waveRecipe(p.familiarParams);
		else
			this.potentialRecipe(p.familiarParams);

		// um... do something with maxY...

		return <svg className={`MiniGraph ${p.className}`}
							viewBox={this.viewBox}
							width={p.width} height={p.height}
							preserveAspectRatio='none' >

			<g className='line-paths' transform={`scale(${p.width / (N-1)}, ${p.height / this.maxY})`}>
				{this.elements}
			</g>

		</svg>;

	}
}

setPT();

export default MiniGraph;
