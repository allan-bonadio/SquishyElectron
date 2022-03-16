/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import LogSlider from '../widgets/LogSlider';
import qe from '../wave/qe';

function setPT() {
	CPToolbar.propTypes = {
		startStop: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,
		isTimeAdvancing: PropTypes.bool.isRequired,
		resetCounters: PropTypes.func.isRequired,

		iterateFrequency: PropTypes.number.isRequired,
		setIterateFrequency: PropTypes.func.isRequired,

		dt: PropTypes.number.isRequired,
		setDt: PropTypes.func.isRequired,
		stepsPerIteration: PropTypes.number.isRequired,
		setStepsPerIteration: PropTypes.func.isRequired,
		lowPassDilution: PropTypes.number.isRequired,
		setLowPassDilution: PropTypes.func.isRequired,
	};
}

function clickOnFFR()
{
	qe.qSpace_askForFFT()
}


function CPToolbar(props) {
	const {iterateFrequency, setIterateFrequency,
		isTimeAdvancing} = props;

	const repRates = <>
		<option key='60' value='60'>60 per sec</option>
		<option key='30' value='30'>30 per sec</option>
		<option key='20' value='20'>20 per sec</option>
		<option key='10' value='10'>10 per sec</option>
		<option key='8' value='8'>8 per sec</option>
		<option key='6' value='6'>6 per sec</option>
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
	const apparentFrequency = (iterateFrequency >= 1)
		? Math.round(iterateFrequency)
		: (1 / Math.round(1 / iterateFrequency)).toFixed(3);

	return <div className='CPToolbar'>
		<div className='frameRateBox'>
			frame rate:<br />
			<select className='rateSelector' value={apparentFrequency}
					onChange={ev => setIterateFrequency(ev.currentTarget.value)}>
				{repRates}
			</select>
		</div>


		<button className={`startStopToggle toolbarButton toolbarGradient`}
			onClick={props.startStop}>
			{ isTimeAdvancing
				? <span><big>&nbsp;</big>▐▐ <big>&nbsp;</big></span>
				: <big>►</big> }
		</button>



		<button className={`stepButton toolbarButton toolbarGradient `}
			onClick={props.singleStep}>
			<big>►</big> ▌
		</button>


		<LogSlider
			unique='dtSlider'
			className='dtSlider'
			label='dt'
			minLabel='.0001'
			maxLabel='1.0'

			current={props.dt}
			sliderMin={.0001}
			sliderMax={1}
			stepsPerDecade={6}

			handleChange={(power, ix) => {
				console.info(`handleChange jj   ix=${ix}  power=${power}`);
				props.setDt(power);
			}}
		/>
		<LogSlider
			unique='stepsPerIterationSlider'
			className='stepsPerIterationSlider dtSlider'
			label='steps Per Iteration'
			minLabel='faster'
			maxLabel='smoother'

			current={props.stepsPerIteration}
			sliderMin={100}
			sliderMax={10000}
			stepsPerDecade={3}

			handleChange={(power, ix) => {
				console.info(`handleChange stepsPerIteration::  ix=${ix}  power=${power}`);
				props.setStepsPerIteration(power);
			}}
		/>
		<LogSlider
			unique='lowPassDilutionSlider'
			className='lowPassDilutionSlider dtSlider'
			label='Low Pass Dilution'
			minLabel='0.001'
			maxLabel='.999'

			current={props.lowPassDilution}
			sliderMin={0.001}
			sliderMax={.999}
			stepsPerDecade={6}

			handleChange={(power, ix) => {
				console.info(`handleChange Low Pass Dilution::  ix=${ix}  `, power);
				props.setLowPassDilution(power);
			}}
		/>
		<button onClick={clickOnFFR}>
			FFT
		</button>



		<button onClick={props.resetCounters}>Reset Counters</button>

	</div>;
}

setPT();

export default CPToolbar;


//
// 		<div className='algorithmBox'>
// 			algorithm:
// 			<select className='algorithmSelector' value={algorithm}
// 					onChange={ev => setAlgorithm(ev.currentTarget.value)}>
// 				<option value={algRK2}>RK2</option>
// 				<option value={algRK4}>RK4</option>
// 				<option value={algVISSCHER}>Visscher</option>
// 			</select>
// 		</div>
