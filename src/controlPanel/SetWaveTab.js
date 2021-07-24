/*
** SetWave tab -- render the Wave tab on the control panel
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

import qCx from '../wave/qCx';
import MiniGraph from './MiniGraph';

function setPT() {
	SetWaveTab.propTypes = {
		setWave: PropTypes.func.isRequired,
		setCircularFrequency: PropTypes.func.isRequired,
		standingFrequency: PropTypes.number.isRequired,
		circularFrequency: PropTypes.number.isRequired,
		breed: PropTypes.string,
	};
}

// a component that just renders the Wave tab
function SetWaveTab(props) {
	const p = props;

	// called for each x value to make graph
	function waveWaveFunc(x) {
		switch (p.breed) {
		case 'circular':
			return qCx(Math.cos(x * p.circularFrequency), Math.cos(x * p.circularFrequency));

		case 'standing':
			return qCx(Math.cos(.5 * x * p.circularFrequency), 0);

		case 'pulse':
			break;

		default:
			return 0;  // i dunno...
		}

		// p.standingFrequency
		 return // something like (cos, sin)  // +p.valleyScale / 100 * (Math.abs(x - (+p.valleyOffset / 50 - 1))) ** +p.valleyPower
	}

	return <div className='SetWaveTab'>
		<h3>Reset Wave Function</h3>

		<div className='SetCircularWaveBand' className={'circular' == p.breed ? 'selected' : ''}>
			<button type='button' className='circularWaveButton round'
				onClick={ev => p.setWave('circular', p.circularFrequency)} >
					Set to Circular Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency' className='numberInput'
				value={p.circularFrequency} min='0' max='10'
				onChange={ev => p.setCircularFrequency(ev.currentTarget.value)} />
			<input type='range' className='circularSlider'
				value={p.circularFrequency} min='0' max='10'
				onChange={ev => p.setCircularFrequency(ev.currentTarget.value)} />
		</div>

		<div className='SetStandingWaveBand' className={'standing' == p.breed ? 'selected' : ''}>
			<button type='button' className='standingWaveButton round'
				onClick={ev => p.setWave('standing', p.standingFrequency)}>
					Set to Standing Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency' className='numberInput'
				value={p.standingFrequency} min='0' max='10'
				onChange={ev => p.setStandingFrequency(ev.currentTarget.value)} />
			<input type='range' className='standingSlider'
				value={p.standingFrequency} min='0' max='10'
				onChange={ev => p.setStandingFrequency(ev.currentTarget.value)} />
		</div>

		<div className='SetPulseWaveBand' className={'pulse' == p.breed ? 'selected' : ''}>
			<button type='button' className='pulseWaveButton round'
				onClick={ev => p.setWave('pulse')} >
					Set to Wave Packet
			</button>
		</div>
		<button type='button' className='setWaveButton round'
			onClick={ev => p.setWave('p.breed', p.standingFrequency)}>
				Set Wave
		</button>
		&nbsp;
		<div className='waveMiniGraph'>
			<MiniGraph xMin={0} xMax={2 * Math.PI} yFunction={x => waveWaveFunc(x)}
			width={200} height={100} />
		</div>
	</div>;


}
setPT();

export default SetWaveTab;

