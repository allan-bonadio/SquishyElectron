/*
** SetWave tab -- render the Wave tab on the control panel
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import {scaleLinear} from 'd3-scale';


import MiniGraph from './MiniGraph';
import qeSpace from '../wave/qeSpace';
import qeWave from '../wave/qeWave';
import qCx from '../wave/qCx';
import cxToRgb from '../view/cxToRgb';
import TextNSlider from '../widgets/TextNSlider';

let debugWaveTab = false;

function setPT() {
	// variables from on high, and the funcs needed to change them
	SetWaveTab.propTypes = {
		origSpace: PropTypes.instanceOf(qeSpace),

		// actually sets the one in use by the algorithm
		setWaveHandler: PropTypes.func.isRequired,

		waveParams: PropTypes.shape({
			frequency: PropTypes.number,
			waveBreed: PropTypes.oneOf(['circular', 'standing', 'pulse',]),
			// plus others, ignore for this check
		}).isRequired,

		// sets it only in the ControlPanel state for subsequent SetWave click
		setCPState: PropTypes.func,

	};
}

// a component that renders the Wave tab
class SetWaveTab extends React.Component {
	miniWidth = 200;
	miniHeight = 100;
	yScale = scaleLinear().range([0, this.miniHeight]);


	// use this in the minigraph.  sets waveRecipe.maxY and waveRecipe.elements as return values
	// Returns a <g element enclosing the juicy stuff
	recipe(miniSpace, waveParams) {
		//const p = this.props;
		const {start, end, N, nPoints} = miniSpace.startEnd2;

		// keep these buffers around for reuse - a bit faster
		if (! this.qewave || this.elements.length != nPoints) {
			this.qewave = new qeWave(miniSpace);
			this.elements = new Array(N);
			this.magns = new Float64Array(nPoints/2);
		}

		// generate the values
		this.qewave.setFamiliarWave(waveParams);
		const wave = this.qewave.wave;

		// find yMin and yMax
		let magn;
		let maxY = 4 / N;
		for (let ix = start; ix < end; ix += 2) {
			magn = this.magns[ix/2] = wave[ix] ** 2 + wave[ix+1] ** 2;
			maxY = Math.max(maxY, magn);

			if (debugWaveTab) console.log(
				`miniGraph magn${ix} = '${magn}' `);
		}

		// a bit tighter so we can fit in all the bar widths
		const barWidth = this.miniWidth / N;
		const halfWidth = barWidth / 2;
		const xScale = scaleLinear()
			.range([halfWidth, this.miniWidth - halfWidth])
			.domain([start/2, end/2-1]);
		this.yScale.domain([0, maxY]);  // upside down!

		//  generate the <path elements
		let start1 = start / 2;
		for (let ix = start; ix < end; ix += 2) {
			let ix1 = ix/2;
			let x = xScale(ix1);
			let color = cxToRgb(qCx(wave[ix], wave[ix+1]));
			magn = this.magns[ix1];
			magn = this.yScale(magn);

			if (debugWaveTab) console.log(
				`miniGraph point [${x}] = ${magn}   color = ${color}`);

			this.elements[ix1 - start1] = <path  d={`M${x},0V${magn}`}
				stroke={color} strokeWidth={barWidth} fill='none' key={ix}/>
		}

		return <g className='linePaths' >
				{this.elements}
			</g>;
	}
	recipe = this.recipe.bind(this);

	render() {
		const p = this.props;

		const sliders = <>
			<TextNSlider className='frequency' label='frequency'
				value={+p.waveParams.waveFrequency}
				min={-10} max={10} step={'circular' != p.waveParams.waveBreed ? .5 : 1}
				handleChange={waveFrequency => p.setCPState({waveFrequency})}
			/>

			<TextNSlider className='pulseWidth' label='pulse width, %'
				style={{display: 'pulse' == p.waveParams.waveBreed ? 'block' :  'none'}}
				value={+p.waveParams.stdDev}
				min={1} max={10} step={.1}
				handleChange={stdDev => p.setCPState({stdDev})}
			/>

			<TextNSlider className='offset' label='offset, %'
				style={{display: 'pulse' == p.waveParams.waveBreed ? 'block' :  'none'}}
				value={+p.waveParams.pulseOffset}
				min={0} max={100} step={2}
				handleChange={pulseOffset => p.setCPState({pulseOffset})}
			/>

		</>;


		const radios = <div className='waveTabCol middle'>
			<label>
				circular
				<input type='radio' checked={'circular' == p.waveParams.waveBreed}
					onChange={ev => p.setCPState({waveBreed: 'circular'})} />
			</label>

			<label>
				standing
				<input type='radio'  checked={'standing' == p.waveParams.waveBreed}
					onChange={ev => p.setCPState({waveBreed: 'standing'})} />
			</label>

			<label>
				pulse
				<input type='radio'  checked={'pulse' == p.waveParams.waveBreed}
					onChange={ev => p.setCPState({waveBreed: 'pulse'})} />
			</label>
		</div>;


		//debugger;
		return <div className='SetWaveTab'>

			<div className='waveTabCol'>
				<h3>Choose New Wave</h3>
				{sliders}
			</div>

			{radios}

			<div className='waveTabCol'>
				&nbsp;
				<div className='waveMiniGraph'>
					<MiniGraph recipe={this.recipe} width={this.miniWidth} height={this.miniHeight}
						className='SetWaveGraph'
						familiarParams={p.waveParams} origSpace={p.origSpace}/>
				</div>
				<button className='setWaveButton round'
					onClick={p.setWaveHandler}>
						Set Wave
				</button>

			</div>
		</div>;
	}

}
setPT();

export default SetWaveTab;

