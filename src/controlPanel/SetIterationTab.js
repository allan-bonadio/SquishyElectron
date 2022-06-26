/*
** SetIterationTab -- tab for adjusting dt, stepsPerIteration, etc
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';
import LogSlider from '../widgets/LogSlider';

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

	//Unlike other tabs, all these are instant-update.

	return (<div className='SetIterationTab'>
		<div className='sliders'>
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
				stepsPerDecade={3}

				handleChange={(power, ix) => {
					console.info(`handleChange stepsPerIteration::  ix=${ix}  power=${power}`);
					props.setStepsPerIteration(power);
				}}
			/>
			<LogSlider
				unique='lowPassFilterSlider'
				className='lowPassFilterSlider cpSlider'
				label='Frequencies to Suppress'
				minLabel='1'
				maxLabel={p.N/4}

				current={props.lowPassFilter}
				sliderMin={1}
				sliderMax={p.N/4}
				stepsPerDecade={16}

				handleChange={(power, ix) => {
					console.info(`handleChange Low Pass Filter::  ix=${ix}  `, power);
					props.setLowPassFilter(power);
				}}
			/>

		</div>
		<div className='iStats'>
			<h3 style={{textAlign: 'right'}}>Iteration Statistics</h3>
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
