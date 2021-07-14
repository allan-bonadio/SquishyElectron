import React from 'react';
import PropTypes from 'prop-types';

function setPT() {
	CPToolbar.propTypes = {
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,

		isTimeAdvancing: PropTypes.bool.isRequired,
		timeClock: PropTypes.number.isRequired,
		iterateSerial: PropTypes.number.isRequired,
	};
}

function CPToolbar(props) {
//	const isRunningClass = isItAnimating() ? 'isRunning' : 'notRunning';

	return <div className='CPToolbar'>
		<div className='toolbarGradient toolbarSpacer'>&nbsp;</div>

		<button type='button' className={`startStopToggle toolbarButton toolbarGradient`}
			onClick={ev => {
				if (props.isTimeAdvancing)
					props.stopIterating();
				else
					props.startIterating();
			}}>
			{ props.isTimeAdvancing
				? '▐▐ '
				: <big>►</big> }
				</button>

		<div className='toolbarGradient toolbarSpacer'>&nbsp;</div>

		<button type='button' className={`stepButton toolbarButton toolbarGradient `}
			onClick={ev => props.singleStep()}>
			<big>►</big> ▌
		</button>

		<div className='toolbarGradient toolbarSpacer'>&nbsp;</div>

		<span >frame {props.iterateSerial}  at time {props.timeClock.toFixed(2)}</span>
	</div>;
}

setPT();

export default CPToolbar;
