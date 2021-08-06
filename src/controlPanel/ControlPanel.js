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
		//elapsedTime: PropTypes.number.isRequired,
		//iterateSerial: PropTypes.number.isRequired,

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
		};
	}

	/* *********************************** start and stop buttons */


	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setIterateFrequency(freq) {
		this.props.setIterateFrequency(freq);
	}


	/* ********************************************** wave & pot */

	setPulseOffset(pulseOffset) {
		this.setState({pulseOffset});
	}

	setCPState(obj) {
		this.setState(obj);
	}

	setAlgorithm(newAlg) {
		this.setState({algorithm: newAlg});
		qe.qSpace_setAlgorithm(newAlg);
	}

	/* ********************************************** render */

	render() {
		const p = this.props;
		const s = this.state;

		let showingTab = '';
		if (s.showingTab == 'wave') {
			showingTab = <SetWaveTab
				setWave={p.setWave}

				circularFrequency={+s.circularFrequency}
				setCircularFrequency={freq => this.setState({circularFrequency: freq})}
				pulseWidth={+s.pulseWidth}
				setPulseWidth={wid =>this.setState({pulseWidth: wid})}
				pulseOffset={+s.pulseOffset}
				setPulseOffset={off => this.setState({pulseOffset: off})}
				breed={s.waveBreed}
				setBreed={br => this.setState({waveBreed: br})}
			/>;
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
				isTimeAdvancing={p.isTimeAdvancing}
				startIterating={p.startIterating}
				stopIterating={p.stopIterating}
				singleStep={p.singleStep}
				iterateFrequency={p.iterateFrequency}
				setIterateFrequency={freq => this.setIterateFrequency(freq)}
				algorithm={p.algorithm}
				setAlgorithm={alg => this.setAlgorithm(alg)}
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
