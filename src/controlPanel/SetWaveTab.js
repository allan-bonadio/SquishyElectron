/*
** SetWave tab -- render the Wave tab on the control panel
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

import qCx from '../wave/qCx';
import MiniGraph from './MiniGraph';

function setPT() {
	// variables from on high, and the funcs needed to change them
	SetWaveTab.propTypes = {
		setWave: PropTypes.func.isRequired,

		circularFrequency: PropTypes.number.isRequired,
		setCircularFrequency: PropTypes.func.isRequired,

		pulseWidth: PropTypes.number.isRequired,
		setPulseWidth: PropTypes.func.isRequired,

		pulseOffset: PropTypes.number.isRequired,
		setPulseOffset: PropTypes.func.isRequired,

		breed: PropTypes.string,
		setBreed: PropTypes.func.isRequired,

		resetTime: PropTypes.func,
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

	//function setWave(ev) {
	//	p.setWave(p.breed, p.circularFrequency);
	//	p.resetTime();
	//
	//}

	//debugger;
	return <div className='SetWaveTab'>

		<div className='waveTabCol'>
			<h3>Choose New Wave</h3>

			<div  >
				<span>frequency</span>
				<input type='number' placeholder='frequency' className='numberInput frequency'
						value={p.circularFrequency} min='0' max='100' step={'standing' == p.breed ? .5 : 1}
						onChange={ev => p.setCircularFrequency(ev.currentTarget.value)} />
				<input type='range'
					value={p.circularFrequency} min='0' max='100'
					onChange={ev => p.setCircularFrequency(ev.currentTarget.value)} />
			</div>

			<div  >
				<span>pulse width</span>
				<input type='number' placeholder='pulse width' className='numberInput pulseWidth'
						value={p.pulseWidth} min='0' max='10' step={.01}
						onChange={ev => p.setPulseWidth(ev.currentTarget.value)} />
				<input type='range'
					value={p.pulseWidth} min='0' max='1.0' step='.01'
					onChange={ev => p.setPulseWidth(ev.currentTarget.value)} />
			</div>

			<div  >
				<span>pulse offset</span>
				<input type='number' placeholder='pulse offset' className='numberInput pulseOffset'
						value={p.pulseOffset} min='0' max='1' step={.01}
						onChange={ev => p.setPulseOffset(ev.currentTarget.value)} />
				<input type='range'
					value={p.pulseOffset} min='0' max='1.0' step='.01'
					onChange={ev => p.setPulseOffset(ev.currentTarget.value)} />
			</div>
		</div>

		<div className='waveTabCol middle'>
			<label>
				circular
				<input type='radio' checked={'circular' == p.breed}
					onChange={ev => p.setBreed('circular')}/>
			</label>

			<label>
				standing
				<input type='radio'  checked={'standing' == p.breed}
					onChange={ev => p.setBreed('standing')}/>
			</label>

			<label>
				pulse
				<input type='radio'  checked={'pulse' == p.breed}
					onChange={ev => p.setBreed('pulse')}/>
			</label>
		</div>

		<div className='waveTabCol'>
			&nbsp;
			<div className='waveMiniGraph'>
				<MiniGraph xMin={0} xMax={2 * Math.PI} yFunction={x => waveWaveFunc(x)}
					width={200} height={100} complex={true} />
			</div>
			<button type='button' className='setWaveButton round'
				onClick={ev => p.setWave()}>
					Set Wave
			</button>

		</div>
	</div>;


}
setPT();

export default SetWaveTab;

