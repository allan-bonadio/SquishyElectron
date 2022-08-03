/*
** SetIterationTab -- tab for adjusting dt, stepsPerIteration, etc
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import LogSlider from '../widgets/LogSlider';
import TextNSlider from '../widgets/TextNSlider';

// set prop types
function setPT() {
	SetIterationTab.propTypes = {
		dt: PropTypes.number.isRequired,
		setDt: PropTypes.func.isRequired,
		stepsPerIteration: PropTypes.number.isRequired,
		setStepsPerIteration: PropTypes.func.isRequired,
		lowPassFilter: PropTypes.number.isRequired,
		setLowPassFilter: PropTypes.func.isRequired,

		// needed for filter
		N: PropTypes.number.isRequired,
	};
}

function SetIterationTab(props) {
	const p = props;
	if (!props)
		debugger;

	// lowPassFilter, the number setting.  On the JS side, it's a percentage of N/2:
	// and can range from 200/N (nyquist only) to 75
	// so when N=16, user can set lowPass to 12.5 ... 75 percents = 1 to 6 freqs
	// when N=64, ranges from 3.1% to 75%

	// step between valid settings, and also the minimum setting, where you just
	// filter off Nyquist.  Think of this like 100 * ( 1 / (N/2))
	const aStep = 200 / p.N;

	// should be 0 if N <= 150, 1 if N = 256...512, 2 above that
	const nDigits = Math.max(0, 1 -Math.ceil(Math.log10(aStep)));

	// display percent numbers rounded off only to the minimum n digits
	// THese are stored in the storeSettings this way, but they're converted  &
	// rounded to int before sending to c++
	let lpfValues = [];
	for (let perc = aStep; perc <= 75; perc += aStep) {
		let display = perc.toFixed(nDigits)
		lpfValues.push(<option key={display} value={display}>{display}</option>);
	}

	//Unlike other tabs, all these are instant-update.

	return (<div className='SetIterationTab'>
		<div className='sliderBlock'>
			<h3>Iteration Controls</h3>

			<LogSlider
				unique='dtSlider'
				className='dtSlider cpSlider'
				label='dt'
				minLabel='.00001'
				maxLabel='1.0'

				current={props.dt}
				sliderMin={.0001}
				sliderMax={1}
				stepsPerDecade={6}

				handleChange={(power, ix) => {
					console.info(`handleChange dt   ix=${ix}  power=${power}`);
					props.setDt(power);
				}}
			/>
			<LogSlider
				unique='stepsPerIterationSlider'
				className='stepsPerIterationSlider cpSlider'
				label='steps Per Iteration'
				minLabel='faster'
				maxLabel='smoother'

				current={props.stepsPerIteration}
				sliderMin={50}
				sliderMax={10000}
				stepsPerDecade={6}

				handleChange={(power, ix) => {
					console.info(`handleChange stepsPerIteration::  ix=${ix}  power=${power}`);
					props.setStepsPerIteration(power);
				}}
			/>

			<TextNSlider className='lowPassFilterSlider '
				label='Percent of High Frequencies to Filter Out'
				value={props.lowPassFilter.toFixed(nDigits)}
				min={aStep} max={75}
				style={{width: '80%'}}
				handleChange={newValue => {
						console.info(`handleChange Low Pass Filter:: ${newValue}  `);
						props.setLowPassFilter(+newValue);
					}}
				list='lowPassFilterValues'
			/>

			<datalist id='lowPassFilterValues'>
				{lpfValues}
			</datalist>

		</div>
		<div className='iStats'>
			<h3 style={{textAlign: 'left'}}>Iteration Statistics</h3>
			<table><tbody>
				<tr><td>iteration calc time:     </td><td><span  className='iterationCalcTime'>-</span> ms</td></tr>
				<tr><td>reload view buffers:     </td><td><span  className='reloadViewBuffers'>-</span> ms</td></tr>
				<tr><td>reload GL variables:     </td><td><span  className='reloadGlInputs'>-</span> ms</td></tr>
				<tr><td>draw:                      </td><td><span  className='drawTime'>-</span> ms</td></tr>
				<tr><td>total for iteration:  </td><td><span  className='totalForIteration'>-</span> ms</td></tr>
				<tr><td>iteration period:  </td><td><span  className='iterationPeriod'>-</span> ms</td></tr>
				<tr><td>iterations per sec:  </td><td><span  className='iterationsPerSec'>-</span>/sec</td></tr>
			</tbody></table>
		</div>
	</div>);
}
setPT();

export default SetIterationTab;
