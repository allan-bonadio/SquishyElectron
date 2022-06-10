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
	};
}

function SetIterationTab(props) {
	//const p = props;

	return (<div className='SetIterationTab'>
		<h3>Iteration Variables</h3>

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
				console.info(`handleChange jj   ix=${ix}  power=${power}`);
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
			sliderMin={100}
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
			label='Low Pass Filter'
			minLabel='0.001'
			maxLabel='.999'

			current={props.lowPassFilter}
			sliderMin={1/1024}
			sliderMax={.5}
			stepsPerDecade={16}

			handleChange={(power, ix) => {
				console.info(`handleChange Low Pass Filter::  ix=${ix}  `, power);
				props.setLowPassFilter(power);
			}}
		/>


	</div>);
}
setPT();

export default SetIterationTab;
