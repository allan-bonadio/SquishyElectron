import React from 'react';
import PropTypes from 'prop-types';
import {isItAnimating} from './wave/theWave';
//import ControlPanel from './ControlPanel';
//import './ControlPanel.css';

//import {iterateAnimate} from './wave/theWave';

function setPT() {
	CPToolbar.propTypes = {
		toggleRunning: PropTypes.func.isRequired,
		oneStep: PropTypes.func.isRequired,
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
//		let newRunning = !isItAnimating;
//
////		if (this.state.isRunning)
////			iterate(theJWave);
////		if (isRunning)
////			theDraw.draw();
//		iterateAnimate(isRunning && props.rate);
//
//		ev.currentTarget.blur();
//
//		// it is a state of this panel, to color the buttons
//		props.setRunning(isRunning);

		// but also a state of the animation
		//theJWave.isRunning = isRunning;
//	}
//
//
//	render() {
	const isRunningClass = isItAnimating() ? 'isRunning' : 'notRunning';

	return <div className='CPToolbar'>
		<button type='button' className={`startStopToggleButton toolbarButton on ${isRunningClass}`}
			onClick={ev => props.toggleRunning(ev)}>
			{ isItAnimating()
				? ' ▶️ ️'
				: ' ⏸ ' }
				</button>
		<button type='button' className={`stepButton toolbarButton on `}
			onClick={ev => props.oneStep(ev)}>
			⏯
		</button>
		<button type='button' className={'stopButtonXXX '}
			style={{display: 'none'}}
			onClick={ev =>props.toggleRunning(ev, false)}>
			don\'t click ⏸   ▶️   ⏸   ⏯   ⏹   ⏺    ⏭    ⏮    ⏩  ⏪           
		</button>


	</div>;
}

setPT();

export default CPToolbar;
