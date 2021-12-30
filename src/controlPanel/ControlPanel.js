/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.scss';
import CPToolbar from './CPToolbar';
import SetWaveTab from './SetWaveTab';
import SetPotentialTab from './SetPotentialTab';
import SetResolutionTab from './SetResolutionTab';
import qeSpace from '../wave/qeSpace';
import {qeStartPromise} from '../wave/qEngine';
import qe from '../wave/qe';

export class ControlPanel extends React.Component {
	static propTypes = {
		//innerActiveWidth: PropTypes.number,
		openResolutionDialog: PropTypes.func.isRequired,

		iterateAnimate: PropTypes.func.isRequired,
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,

		// these are the actual functions that change the SquishView on the screen
		setWave: PropTypes.func.isRequired,
		setPotential: PropTypes.func.isRequired,

		isTimeAdvancing: PropTypes.bool.isRequired,  // ie is it running?

		iterateFrequency: PropTypes.number.isRequired,  // frames per second
		setIterateFrequency: PropTypes.func.isRequired,

		// early on, there's no space.  Must have SquishPanel mounted first.
		space: PropTypes.instanceOf(qeSpace),
		waveParams: PropTypes.shape({
			waveBreed: PropTypes.string.isRequired,
			waveFrequency: PropTypes.number.isRequired,
			stdDev: PropTypes.number.isRequired,
			pulseOffset: PropTypes.number.isRequired,
		}).isRequired,
	};

	constructor(props) {
		super(props);
		const wp = props.waveParams;

		// most of the state is really kept in the SquishPanel
		this.state = {
			// state for the wave resets - these are control-panel only.
			// waveParams - Only goes into effect if we call setWave()
			waveBreed: wp.waveBreed,
			waveFrequency: wp.waveFrequency,
			stdDev: wp.stdDev,
			pulseOffset: wp.pulseOffset,

			// state for potential resets - control panel only, setPotential()
			potentialBreed: 'flat',
			valleyPower: 1,
			valleyScale: 1,
			valleyOffset: 50,

			showingTab: 'wave',
		};
	}

	/* *********************************** params */

	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setIterateFrequency(freq) {
		this.props.setIterateFrequency(freq);
	}
	setIterateFrequency = this.setIterateFrequency.bind(this);


	/* ********************************************** wave & pot */

// 	setPulseOffset(pulseOffset) {
// 		this.setState({pulseOffset});
// 	}

	// used to set any familiarParam value, pass eg {stdDev: 40}
	setCPState(obj) {
		this.setState(obj);
	}
	setCPState = this.setCPState.bind(this);

	// this one is an event handler in the wave tab for the SetWave button
	// but squishpanel hands us a more refined function.
	setWaveHandler(ev) {
		const {waveBreed, waveFrequency, stdDev, pulseOffset} = this.state;
		this.props.setWave({waveBreed, waveFrequency, stdDev, pulseOffset});
	}
	setWaveHandler = this.setWaveHandler.bind(this);

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
					stdDev: s.stdDev, pulseOffset: s.pulseOffset,}}

				setCPState={this.setCPState}
				space={p.space}
			/>;

		case 'potential':
			return <SetPotentialTab setPotential={p.setPotential}
				setCPState={this.setCPState}
				waveBreed={s.potentialBreed}
				valleyPower={s.valleyPower}
				valleyScale={s.valleyScale}
				valleyOffset={s.valleyOffset}
				space={s.space}
			/>;



		case 'resolution':
			return <SetResolutionTab openResolutionDialog={p.openResolutionDialog} />;

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
				startIterating={p.startIterating}
				stopIterating={p.stopIterating}
				singleStep={p.singleStep}

				iterateFrequency={p.iterateFrequency}
				setIterateFrequency={this.setIterateFrequency}

				dt={p.dt}
				setDt={p.setDt}
				stepsPerIteration={p.stepsPerIteration}
				setStepsPerIteration={p.setStepsPerIteration}
			/>
			<div className='cpSecondRow'>
				<ul className='TabBar' >
					<li className={s.showingTab == 'wave' ? 'selected' : ''} key='wave'
						onClick={ev => this.setState({showingTab: 'wave'})}>Wave</li>
					<li  className={s.showingTab == 'potential' ? 'selected' : ''} key='potential'
						onClick={ev => this.setState({showingTab: 'potential'})}>Potential</li>
					<li  className={s.showingTab == 'resolution' ? 'selected' : ''} key='resolution'
						onClick={ev => this.setState({showingTab: 'resolution'})}>Universe</li>
				</ul>
				<div className='tabFrame'>
					{showingTabHtml}
				</div>
			</div>
		</div>;
	}
}

export default ControlPanel;
