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
// eslint-disable-next-line no-unused-vars

import qe from '../wave/qe';

//import {setWave, setPotential} from './wave/theWave';

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
	};

	constructor(props) {
		super(props);

		// most of the state is really kept in the SquishPanel
		this.state = {
			// state for the wave resets - these are control-panel only.
			// Only goes into effect if we call setWave()
			waveBreed: 'circular',
			circularFrequency: 1,
			pulseWidth: .05,
			pulseOffset: .05,

			// state for potential resets - control panel only, setPotential()
			potentialBreed: 'flat',
			valleyPower: 1,
			valleyScale: 1,
			valleyOffset: 50,

			showingTab: 'wave',

			// slider for dt
			dt: .001,
			stepsPerIteration: 100,
		};

		this.setIterateFrequency = this.setIterateFrequency.bind(this);
		this.setDt = this.setDt.bind(this);
		this.setStepsPerIteration = this.setStepsPerIteration.bind(this);
	}

	/* *********************************** params */

	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setIterateFrequency(freq) {
		this.props.setIterateFrequency(freq);
	}


	setDt(dt) {
		this.setState({dt});
		qe.qSpace_setDt(dt);
	}

	setStepsPerIteration(stepsPerIteration) {
		this.setState({stepsPerIteration});
		qe.qSpace_setStepsPerIteration(stepsPerIteration);
	}

	/* ********************************************** wave & pot */

	setPulseOffset(pulseOffset) {
		this.setState({pulseOffset});
	}

	setCPState(obj) {
		this.setState(obj);
	}

	/* ********************************************** render  pieces */

	createShowingTab() {
		const p = this.props;
		const s = this.state;

		switch (s.showingTab) {
		case 'wave':
			// setWave we're passed in takes an object with args.  We pass down a
			// function with no args that'll call theother one
			return <SetWaveTab
				setWave={() => p.setWave(s)}
				circularFrequency={+s.circularFrequency}
				setCircularFrequency={freq => this.setState({circularFrequency: freq})}
				pulseWidth={+s.pulseWidth}
				setPulseWidth={wid =>this.setState({pulseWidth: wid})}
				pulseOffset={+s.pulseOffset}
				setPulseOffset={off => this.setState({pulseOffset: off})}
				waveBreed={s.waveBreed}
				setBreed={br => this.setState({waveBreed: br})}
			/>;

		case 'potential':
			return <SetPotentialTab setPotential={p.setPotential}
				setCPState={obj => this.setState(obj)}
				waveBreed={s.potentialBreed}
				valleyPower={s.valleyPower}
				valleyScale={s.valleyScale}
				valleyOffset={s.valleyOffset}
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

		let showingTabHtml = this.createShowingTab();

		return <div className='ControlPanel'>
			<CPToolbar
				isTimeAdvancing={p.isTimeAdvancing}
				startIterating={p.startIterating}
				stopIterating={p.stopIterating}
				singleStep={p.singleStep}

				iterateFrequency={p.iterateFrequency}
				setIterateFrequency={this.setIterateFrequency}

				dt={s.dt}
				setDt={this.setDt}
				stepsPerIteration={s.stepsPerIteration}
				setStepsPerIteration={this.setStepsPerIteration}
			/>
			<div className='cpSecondRow'>
				<ul className='TabBar' >
					<li className={s.showingTab == 'wave' ? 'selected' : ''}
						onClick={ev => this.setState({showingTab: 'wave'})}>Wave</li>
					<li  className={s.showingTab == 'potential' ? 'selected' : ''}
						onClick={ev => this.setState({showingTab: 'potential'})}>Potential</li>
					<li  className={s.showingTab == 'resolution' ? 'selected' : ''}
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
