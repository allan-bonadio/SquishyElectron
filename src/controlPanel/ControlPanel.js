/*
** Control Panel -- all the widgets below the displayed canvas
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.scss';
import CPToolbar from './CPToolbar';
import SetWaveTab from './SetWaveTab';
import SetPotentialTab from './SetPotentialTab';
import SetResolutionTab from './SetResolutionTab';
import SetIterationTab from './SetIterationTab';
import qeSpace from '../engine/qeSpace';
// import {qeStartPromise} from '../engine/qEngine';
// import qe from '../engine/qe';

import storeSettings from '../utils/storeSettings';

// this keeps many settings that don't immediately affect running iteration.
// So 'Set Wave' button actually sets the wave, but meanwhile the setting sliders
// need to be remembered; this does it.


// see storeSettings for where they are now
// const defaultWaveParams = {
// 	waveBreed: 'chord',
// 	waveFrequency: 16,
// 	pulseWidth: 1/16,
// 	pulseOffset: 30,
// };
//
// const defaultPotentialParams = {
// 	potentialBreed: 'flat',
// 	valleyPower: 1,
// 	valleyScale: 1,
// 	valleyOffset: 50,
// };


export class ControlPanel extends React.Component {
	static propTypes = {
		iterateAnimate: PropTypes.func.isRequired,
		startStop: PropTypes.func.isRequired,
		singleIteration: PropTypes.func.isRequired,
		resetCounters: PropTypes.func.isRequired,

		// these are the actual functions that change the SquishView on the screen
		// when user chooses 'set wave'
		setWave: PropTypes.func.isRequired,
		setPotential: PropTypes.func.isRequired,

		isTimeAdvancing: PropTypes.bool.isRequired,  // ie is it running?

		iterateFrequency: PropTypes.number.isRequired,  // frames per second
		setIterateFrequency: PropTypes.func.isRequired,

		// early on, there's no space.  Must have SquishPanel mounted first.
		space: PropTypes.instanceOf(qeSpace),
		N: PropTypes.number.isRequired,

		// waveParams: PropTypes.shape({
		// 	waveBreed: PropTypes.string.isRequired,
		// 	waveFrequency: PropTypes.number.isRequired,
		// 	pulseWidth: PropTypes.number.isRequired,
		// 	pulseOffset: PropTypes.number.isRequired,
		// }).isRequired,
		//
		// potentialParams: PropTypes.shape({
		// 	potentialBreed: PropTypes.string.isRequired,
		// 	valleyPower: PropTypes.number.isRequired,
		// 	valleyScale: PropTypes.number.isRequired,
		// 	valleyOffset: PropTypes.number.isRequired,
		// }),

		openResolutionDialog: PropTypes.func.isRequired,

		iStats: PropTypes.shape({
			startIteration: PropTypes.number.isRequired,
			endDraw: PropTypes.number.isRequired,
		}),
		refreshStats: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);

// 		const controls0 = storeSettings.retrieveSettings('controls0');

// 		const rat = storeSettings.retrieveRatify;
// 		const wp = controls0.waveParams || {};
// 		const pp = controls0.potentialParams || {};

		// most of the state is kept here.  But, also, in the store settings
		this.state = {
			// state for the wave resets - these are control-panel only.
			// waveParams - Only goes into effect if we call setWave()

			waveBreed: storeSettings.waveParams.waveBreed,
			waveFrequency: storeSettings.waveParams.waveFrequency,
			pulseWidth: storeSettings.waveParams.pulseWidth,
			pulseOffset: storeSettings.waveParams.pulseOffset,

			// state for potential resets - control panel only, setPotential()
			potentialBreed: storeSettings.potentialParams.potentialBreed,
			valleyPower: storeSettings.potentialParams.valleyPower,
			valleyScale: storeSettings.potentialParams.valleyScale,
			valleyOffset: storeSettings.potentialParams.valleyOffset,

			showingTab: storeSettings.miscParams.showingTab,
		}
	}

	/* *********************************** params */

	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setIterateFrequency(freq) {
		this.props.setIterateFrequency(freq);
	}
	setIterateFrequency = this.setIterateFrequency.bind(this);


	/* ********************************************** wave & pot */

	// used to set any familiarParam value, pass eg {pulseWidth: 40}
	setCPState(obj) {
		this.setState(obj);
	}
	setCPState = this.setCPState.bind(this);

	// this one is an event handler in the wave tab for the SetWave button
	// but squishpanel hands us a more refined function.
	setWaveHandler(ev) {
		const {waveBreed, waveFrequency, pulseWidth, pulseOffset} = this.state;
		this.props.setWave({waveBreed, waveFrequency, pulseWidth, pulseOffset});
	}
	setWaveHandler = this.setWaveHandler.bind(this);

	setFlatPotentialHandler(ev) {
		const {valleyPower, valleyScale, valleyOffset} = this.state;
		this.props.setPotential({potentialBreed: 'flat', valleyPower, valleyScale, valleyOffset});
	}
	setFlatPotentialHandler = this.setFlatPotentialHandler.bind(this);

	setValleyPotentialHandler(ev) {
		const {valleyPower, valleyScale, valleyOffset} = this.state;
		this.props.setPotential({potentialBreed: 'valley', valleyPower, valleyScale, valleyOffset});
	}
	setValleyPotentialHandler = this.setValleyPotentialHandler.bind(this);




	/* ********************************************** render  pieces */

	// whichever tab is showing right now
	createShowingTab() {
		const p = this.props;
		const s = this.state;

		switch (s.showingTab) {
		case 'wave':
			// setWave we're passed in takes an object with args.  We pass down a
			// function with no args that'll call theother one
			return <SetWaveTab
				setWaveHandler={this.setWaveHandler}
				waveParams={{waveBreed: s.waveBreed, waveFrequency: s.waveFrequency,
					pulseWidth: s.pulseWidth, pulseOffset: s.pulseOffset,}}

				setCPState={this.setCPState}
				origSpace={p.space}
			/>;

		case 'potential':
			return <SetPotentialTab
				setFlatPotentialHandler={this.setFlatPotentialHandler}
				setValleyPotentialHandler={this.setValleyPotentialHandler}
				potentialParams={{
					potentialBreed: s.potentialBreed,
					valleyPower: +s.valleyPower,
					valleyScale: +s.valleyScale,
					valleyOffset: +s.valleyOffset,
				}}

				setCPState={this.setCPState}
				origSpace={p.space}
			/>;

		case 'resolution':
			return <SetResolutionTab openResolutionDialog={p.openResolutionDialog} />;

		case 'iteration':
			return <SetIterationTab
				dt={p.dt}
				setDt={p.setDt}
				stepsPerIteration={p.stepsPerIteration}
				setStepsPerIteration={p.setStepsPerIteration}
				lowPassFilter={p.lowPassFilter}
				setLowPassFilter={p.setLowPassFilter}

				N={p.N}
				iStats={p.iStats}
			/>;

		default:
			return `Do not understand showingTab='${s.showingTab}'`;
		}
	}

	/* ********************************************** render */

	render() {
		const p = this.props;
		const s = this.state;

		// before the mount event on SquishPanel
		if (!p.space) return '';

		let showingTabHtml = this.createShowingTab();

		return <div className='ControlPanel'>
			<CPToolbar
				isTimeAdvancing={p.isTimeAdvancing}
				startStop={p.startStop}
				singleIteration={p.singleIteration}
				resetCounters={p.resetCounters}

				iterateFrequency={p.iterateFrequency}
				setIterateFrequency={this.setIterateFrequency}

				N={this.props.N}
			/>
			<div className='cpSecondRow'>
				<ul className='TabBar' >
					<li className={s.showingTab == 'wave' ? 'selected' : ''} key='wave'
						onClick={ev => this.setState({showingTab: 'wave'})}>Wave</li>
					<li  className={s.showingTab == 'potential' ? 'selected' : ''} key='potential'
						onClick={ev => this.setState({showingTab: 'potential'})}>Potential</li>
					<li  className={s.showingTab == 'resolution' ? 'selected' : ''} key='resolution'
						onClick={ev => this.setState({showingTab: 'resolution'})}>Space</li>
					<li  className={s.showingTab == 'iteration' ? 'selected' : ''} key='iteration'
						onClick={ev => this.setState({showingTab: 'iteration'})}>Iteration</li>
				</ul>
				<div className='tabFrame'>
					{showingTabHtml}
				</div>
			</div>
		</div>;
	}
}

export default ControlPanel;
