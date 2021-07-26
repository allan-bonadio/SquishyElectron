/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.css';
import CPToolbar from './CPToolbar';
import SetWaveTab from './SetWaveTab';
import SetPotentialTab from './SetPotentialTab';
import SetResolutionTab from './SetResolutionTab';

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

		isTimeAdvancing: PropTypes.bool.isRequired,
		//elapsedTime: PropTypes.number.isRequired,
		//iterateSerial: PropTypes.number.isRequired,

		iterateFrequency: PropTypes.number.isRequired,
		setIterateFrequency: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);

		// most of the state is really kept in the SquishPanel
		this.state = {

			// state for the wave resets - these are control-panel only.  Only goes into effect if we call setWave()
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
		};
	}

	/* *********************************** start and stop buttons */


	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setFrequency(freq) {
		this.props.setIterateFrequency(freq);
	}

//				{this.renderGoStopButtons()}
//	renderGoStopButtons() {
//		const p = this.props;
//		let isRunning = p.isTimeAdvancing;
//
//		// it was easier to just type this in by hand than to come up with some nifty algorithm
//		const repRates = <>
//			<option key='60' value='60'>60 per sec</option>
//			<option key='30' value='30'>30 per sec</option>
//			<option key='20' value='20'>20 per sec</option>
//			<option key='10' value='10'>10 per sec</option>
//			<option key='7' value='7'>7 per sec</option>
//			<option key='5' value='5'>5 per sec</option>
//			<option key='4' value='4'>4 per sec</option>
//			<option key='3' value='3'>3 per sec</option>
//			<option key='2' value='2'>2 per sec</option>
//			<option key='1' value='1'>1 per sec</option>
//			<option key='.5' value='0.500'>every 2 sec</option>
//			<option key='.2' value='0.200'>every 5 sec</option>
//			<option key='.1' value='0.100'>every 10 sec</option>
//			<option key='.05' value='0.050'>every 20 sec</option>
//			<option key='.01667' value='0.017'>every minute</option>
//		</>;
//
//		// nail this down so roundoff error doesn't spoil everything.
//		// It's always of the form n or 1/n where n is an integer
//		let iterateFrequency = this.props.iterateFrequency;
//		if (iterateFrequency >= 1)
//			iterateFrequency = Math.round(iterateFrequency);
//		else
//			iterateFrequency = (1 / Math.round(1 / iterateFrequency)).toFixed(3);
//
//		return <div className='goStopButtons subPanel'>
//			<button type='button' className={'goButton ' + (isRunning && 'on')}
//				onClick={ev => p.startIterating()}>
//					▶
//			</button>
//			<button type='button' className={'stopButton ' + (!isRunning && 'on')}
//				onClick={ev => p.stopIterating()}>
//					◼
//			</button>
//
//			frame rate:
//			<select className='rateSelector' value={iterateFrequency}
//					onChange={ev => this.setFrequency(ev.currentTarget.value)}>
//				{repRates}
//			</select>
//		</div>;
//	}


	/* ********************************************** wave & pot */
	setCircularFrequency(circularFrequency) {
		this.setState({circularFrequency});
	}

	setPulseWidth(pulseWidth) {
		this.setState({pulseWidth});
	}

	setCPState(obj) {
		this.setState(obj);
	}

	/* ********************************************** render */

	render() {
		const p = this.props;
		const s = this.state;

		let showingTab = '';
		if (s.showingTab == 'wave') {
			showingTab = <SetWaveTab
				setWave={p.setWave}  breed={s.waveBreed}
				circularFrequency={+s.circularFrequency}
				setCircularFrequency={freq => this.setCircularFrequency(freq)}
				standingFrequency={+s.standingFrequency}
				setStandingFrequency={freq => this.setStandingFrequency(freq)} />;
		}
		else if (s.showingTab == 'potential') {
			showingTab = <SetPotentialTab setPotential={p.setPotential}
					setCPState={obj => this.setState(obj)} breed={s.potentialBreed}
					valleyPower={s.valleyPower} valleyScale={s.valleyScale} valleyOffset={s.valleyOffset} />
		}
		else if (s.showingTab == 'resolution') {
			showingTab = <SetResolutionTab openResolutionDialog={p.openResolutionDialog} />
		}

		return <div className='ControlPanel'>
			<CPToolbar
				startIterating={p.startIterating}
				stopIterating={p.stopIterating}
				singleStep={p.singleStep}
				isTimeAdvancing={p.isTimeAdvancing}
				iterateFrequency={p.iterateFrequency}
				setFrequency={freq => this.setFrequency(freq)}
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
					{showingTab}
				</div>
			</div>
		</div>;
	}
}

export default ControlPanel;
