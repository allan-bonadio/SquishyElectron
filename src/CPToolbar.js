import React from 'react';
import PropTypes from 'prop-types';
//import ControlPanel from './ControlPanel';
//import './ControlPanel.css';

import {iterateAnimate} from './wave/theWave';

function setPT() {
	CPToolbar.propTypes = {
		toggleRunning: PropTypes.func.isRequired,
		oneStep: PropTypes.func.isRequired,
		isRunning: PropTypes.bool.isRequired,
	}
};

function CPToolbar(props) {
//	constructor(props) {
//		super(props);
//
//		this.state = {
//			isRunning: false,
//			rate: 8,
//			harmonicFrequency: 1, constantFrequency: 1,
//		};
//	}


	// toggle the isRunning boolean, that exists in two places
//	function toggleRunning(ev) {
//		let newRunning = !props.isRunning;
//
////		if (this.state.isRunning)
////			iterate(theJWave);
////		if (isRunning)
////			theDraw.draw();
//		iterateAnimate(true, isRunning && props.rate);
//
//		ev.currentTarget.blur();
//
//		// it is a state of this panel, to color the buttons
//		this.props.setRunning(isRunning);

		// but also a state of the animation
		//theJWave.isRunning = isRunning;
//	}
//
//
//	render() {
	const isRunning = props.isRunning;

	return <div className='CPToolbar'>
		<button type='button' className={'startStopToggleButton on '+
			(isRunning ? 'isRunning' : 'notRunning')}
			onClick={ev => props.toggleRunning(ev)}>
			▶️ </button>
		<button type='button' className={'stepButton ' + (isRunning && 'on')}
			onClick={ev => this.props.oneStep(ev)}>
			⏯
		</button>
		<button type='button' className={'stopButton ' + (!isRunning && 'on')}
			onClick={ev =>props.toggleRunning(ev, false)}>
			don\'t click ⏸   ▶️   ⏸   ⏯   ⏹   ⏺    ⏭    ⏮    ⏩  ⏪           
		</button>


	</div>;
}

setPT();

export default CPToolbar;
