/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

function setPT() {
	CPToolbar.propTypes = {
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,
		setIterateFrequency: PropTypes.func.isRequired,

		isTimeAdvancing: PropTypes.bool.isRequired,
		iterateFrequency: PropTypes.number.isRequired,
	};
}

function CPToolbar(props) {

	const repRates = <>
		<option key='60' value='60'>60 per sec</option>
		<option key='30' value='30'>30 per sec</option>
		<option key='20' value='20'>20 per sec</option>
		<option key='10' value='10'>10 per sec</option>
		<option key='7' value='7'>7 per sec</option>
		<option key='5' value='5'>5 per sec</option>
		<option key='4' value='4'>4 per sec</option>
		<option key='3' value='3'>3 per sec</option>
		<option key='2' value='2'>2 per sec</option>
		<option key='1' value='1'>1 per sec</option>
		<option key='.5' value='0.500'>every 2 sec</option>
		<option key='.2' value='0.200'>every 5 sec</option>
		<option key='.1' value='0.100'>every 10 sec</option>
		<option key='.05' value='0.050'>every 20 sec</option>
		<option key='.01667' value='0.017'>every minute</option>
	</>;

	// nail this down so roundoff error doesn't spoil everything.
	// It's always of the form n or 1/n where n is an integer
	let iterateFrequency = props.iterateFrequency;
	if (iterateFrequency >= 1)
		iterateFrequency = Math.round(iterateFrequency);
	else
		iterateFrequency = (1 / Math.round(1 / iterateFrequency)).toFixed(3);


	return <div className='CPToolbar'>
		<div className='frameRateBox'>
			frame rate:<br />
			<select className='rateSelector' value={props.iterateFrequency}
					onChange={ev => props.setIterateFrequency(ev.currentTarget.value)}>
				{repRates}
			</select>
		</div>


		<button type='button' className={`startStopToggle toolbarButton toolbarGradient`}
			onClick={ev => {
				if (props.isTimeAdvancing)
					props.stopIterating();
				else
					props.startIterating();
			}}>
			{ props.isTimeAdvancing
				? <span><big>&nbsp;</big>▐▐ <big>&nbsp;</big></span>
				: <big>►</big> }
		</button>



		<button type='button' className={`stepButton toolbarButton toolbarGradient `}
			onClick={ev => props.singleStep()}>
			<big>►</big> ▌
		</button>


	</div>;
}

setPT();

export default CPToolbar;
