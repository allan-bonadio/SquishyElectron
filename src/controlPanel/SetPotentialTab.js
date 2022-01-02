/*
** Set Potential tab -- user can set the potential to something interesting
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import {scaleLinear} from 'd3-scale';
import {path as d3path} from 'd3-path';

import {setFamiliarPotential} from '../widgets/utils';
import MiniGraph from './MiniGraph';
//import qeSpace from '../wave/qeSpace';
import TextNSlider from '../widgets/TextNSlider';

// set prop types
function setPT() {
	SetPotentialTab.propTypes = {
		setFlatPotentialHandler: PropTypes.func.isRequired,
		setValleyPotentialHandler: PropTypes.func.isRequired,

		potentialParams: PropTypes.shape({
			potentialBreed: PropTypes.oneOf(['flat', 'valley',]),
			valleyPower: PropTypes.number.isRequired,
			valleyScale: PropTypes.number.isRequired,
			valleyOffset: PropTypes.number.isRequired,
		}).isRequired,
	};
}

// the tab that user sets potential with
class SetPotentialTab extends React.Component {
	miniWidth = 200;
	miniHeight = 100;
	xScale = scaleLinear().range([0, this.miniWidth]);
	yScale = scaleLinear().range([0, this.miniHeight]);

	// rendering for the elements of the minitab
	// Returns a <g element enclosing the juicy stuff
	// NOT the main display space, but the minigraph space
	recipe(miniSpace, potentialParams) {
		//const p = this.props;
		const {start, end, N, nPoints} = miniSpace.startEnd;

		// keep these buffers around for reuse - a bit faster
		if (! this.potentialArray || this.potentialArray.length != nPoints)
			this.potentialArray = new Float64Array(nPoints);
		let potentialArray = this.potentialArray;

		// generate the values
		setFamiliarPotential(miniSpace, potentialArray, potentialParams);

		// calc domain
		let maxY = 1, minY = -1;  // in case all the other values are zero, which is the default
		for (let ix = start; ix < end; ix++) {
			minY = Math.min(minY, potentialArray[ix]);
			maxY = Math.max(maxY, potentialArray[ix]);
		}

		this.xScale.domain([1, N]);
		this.yScale.domain([maxY, minY]);

		// generate the points for the <path
		let pathObj = d3path();
		console.info(`point 1 = (${this.xScale(start)}, ${ this.yScale(potentialArray[start])})`)
		pathObj.moveTo(this.xScale(start),  this.yScale(potentialArray[start]).toFixed(2));
		for (let ix = start+1; ix < end; ix++) {
			pathObj.lineTo(this.xScale(ix), this.yScale(potentialArray[ix]).toFixed(2));
		}
		const d = pathObj.toString();
		console.info(`d = ${d}`)

		return <g className='linePaths' >
			<path d={d} stroke='#fff' fill='none'  key='only' strokeWidth={3} />
		</g>;
	}
	recipe = this.recipe.bind(this);


	setValleyPower(valleyPower) {
		this.props.setCPState({potentialBreed: 'valley', valleyPower});
	}
	setValleyPower = this.setValleyPower.bind(this);

	setValleyScale(valleyScale) {
		this.props.setCPState({potentialBreed: 'valley', valleyScale});

	}
	setValleyScale = this.setValleyScale.bind(this);

	setValleyOffset(valleyOffset) {
		this.props.setCPState({potentialBreed: 'valley', valleyOffset});

	}
	setValleyOffset = this.setValleyOffset.bind(this);


	// rendering for the Tab
	render() {
		const p = this.props;
		const pp = p.potentialParams;

		const sliders = 	<>
				<TextNSlider className='powerSlider'  label='Power'
					value={+pp.valleyPower}
					min={-3} max={10} step={.1}
					style={{width: '8em'}}
					handleChange={this.setValleyPower}
				/>

				<br/>
				<TextNSlider className='scaleSlider'  label='Scale'
					value={+pp.valleyScale}
					min={-10} max={10} step={.1}
					style={{width: '8em'}}
					handleChange={this.setValleyScale}
				/>

				<br/>
				<TextNSlider className='offsetSlider'  label='Offset %'
					value={+pp.valleyOffset}
					min={0} max={100} step={1}
					style={{width: '8em'}}
					handleChange={this.setValleyOffset}
				/>
				<br/>
			</>;

		// remember that setPotentialHandler is an event handler that gets the params from ControlPanel state
		return <div className='setPotentialTab'>
			<div className='potentialTitlePanel'>
				<h3>Set Potential</h3>
				<button className='zeroVoltageButton round'
					onClick={p.setFlatPotentialHandler}>
						Set to Flat Potential
				</button>

			</div>
			<div className='divider' ></div>

			<div className='potentialValleyPanel'>
				{sliders}

				<button className='valleyVoltageButton round'
					onClick={p.setValleyPotentialHandler} >
						Set to Valley Potential
				</button>
			</div>
			<div className='potentialMiniGraph'>
				<MiniGraph recipe={this.recipe} width={this.miniWidth} height={this.miniHeight}
					className='SetPotentialGraph'
					familiarParams={pp} origSpace={p.origSpace} />
			</div>
			<div style={{clear: 'left'}}></div>


		</div>;
		}
}
setPT();

export default SetPotentialTab;
