import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.css';
import CPToolbar from './CPToolbar';
//import {setWave, setVoltage} from './wave/theWave';

export class ControlPanel extends React.Component {
	static propTypes = {
		//innerActiveWidth: PropTypes.number,
		openResolutionDialog: PropTypes.func.isRequired,

		iterateAnimate: PropTypes.func.isRequired,
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,

		setWave: PropTypes.func.isRequired,
		setVoltage: PropTypes.func.isRequired,

		isTimeAdvancing: PropTypes.bool.isRequired,
		timeClock: PropTypes.number.isRequired,
		iterateSerial: PropTypes.number.isRequired,

		iterateFrequency: PropTypes.number.isRequired,
		setIterateFrequency: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);

		// most of the state is really kept in the SquishPanel
		this.state = {

			// state for the wave resets
			harmonicFrequency: 1,
			constantFrequency: 1,

			valleyPower: 1,
			valleyScale: 1,
			valleyOffset: 50,
		};
	}

	/* *********************************** start and stop buttons */


	// set rate, which is 1, 2, 4, 8, ... some float number of times per second you want frames.
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setFrequency(freq) {

		this.props.setIterateFrequency(freq);

		//this.props.iterateAnimate(this.props.isTimeAdvancing, freq);
	}

	renderGoStopButtons() {
		const p = this.props;
		let isRunning = p.isTimeAdvancing;

		// it was easier to just type this in by hand than to come up with some nifty algorithm
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
		let iterateFrequency = this.props.iterateFrequency;
		if (iterateFrequency >= 1)
			iterateFrequency = Math.round(iterateFrequency);
		else
			iterateFrequency = (1 / Math.round(1 / iterateFrequency)).toFixed(3);

		return <div className='goStopButtons subPanel'>
			<button type='button' className={'goButton ' + (isRunning && 'on')}
				onClick={ev => p.startIterating()}>
					▶
			</button>
			<button type='button' className={'stopButton ' + (!isRunning && 'on')}
				onClick={ev => p.stopIterating()}>
					◼
			</button>

			frame rate:
			<select className='rateSelector' value={iterateFrequency}
					onChange={ev => this.setFrequency(ev.currentTarget.value)}>
				{repRates}
			</select>
		</div>;
	}

	/* ********************************************** resetWave */

	renderResetWaveButtons() {
		const p = this.props;

		return <div className='resetWaveButtons subPanel'>
			<h3>Reset Wave Function</h3>
			<button type='button' className='harmonicWaveButton round'
				onClick={ev => p.setWave('standing', this.state.harmonicFrequency)}>
					Standing Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency'
				value={this.state.harmonicFrequency} min='1' max='100'
				onChange={ev => this.setState({harmonicFrequency: ev.currentTarget.value})} />

			<br/>
			<button type='button' className='constantWaveButton round'
				onClick={ev => p.setWave('circular', this.state.constantFrequency)} >
					Circular Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency'
				value={this.state.constantFrequency} min='1' max='100'
				onChange={ev => this.setState({constantFrequency: ev.currentTarget.value})} />

			<br/>
			<button type='button' className='diracDeltaButton round'
				onClick={ev => p.setWave('pulse')} >
					Wave Packet
			</button>
		</div>;
	}

	/* ********************************************** set voltage */

	renderSetVoltageButtons() {
		const p = this.props;
		const s = this.state;

		return <div className='setVoltageButtons subPanel'>
			<h3><big>⚡️</big> Reset Voltage Profile <br /> (potential energy function)</h3>
			<button type='button' className='zeroVoltageButton round'
				onClick={ev => p.setVoltage('zero')}>
					Zero potential (default)
			</button>

			<br/>
			<button type='button' className='valleyVoltageButton round'
				onClick={ev => p.setVoltage('valley', s.valleyPower, s.valleyScale, s.valleyOffset)} >
					Valley Potential
			</button>

			<br/>
			Power:
			<input className='powerSlider' type="range"
				min={-3} max={10}
				value={s.valleyPower}
				style={{width: '8em'}}
				onInput={ev => this.setState({valleyPower: ev.currentTarget.value}) }
			/>
			{s.valleyPower}

			<br/>
			Scale:
			<input className='scaleSlider' type="range"
				min={-3} max={3}
				value={s.valleyScale}
				style={{width: '8em'}}
				onInput={ev => this.setState({valleyScale: ev.currentTarget.value}) }
			/>
			{s.valleyScale}

			<br/>
			Offset:
			<input className='offsetSlider' type="range"
				min={0} max={100}
				value={s.valleyOffset}
				style={{width: '8em'}}
				onInput={ev => this.setState({valleyOffset: ev.currentTarget.value}) }
			/>
			{s.valleyOffset}
		</div>;
	}

	/* ********************************************** render */

	render() {
		const p = this.props;
		return <div className='ControlPanel'>
			<CPToolbar
				startIterating={p.startIterating}
				stopIterating={p.stopIterating}
				singleStep={p.singleStep}
				isTimeAdvancing={p.isTimeAdvancing}
				timeClock={p.timeClock}
				iterateSerial={p.iterateSerial}
			/>
			<div className='cpSecondRow'>
				{this.renderGoStopButtons()}
				{this.renderResetWaveButtons()}
				{this.renderSetVoltageButtons()}

				<button type='button' className='setResolutionButton  round'
					onClick={ev => p.openResolutionDialog()}>
						Change Resolution
						<div style={{fontSize: '.7em'}}>
							(will reset current wave)</div>
				</button>
			</div>
		</div>;
	}
}

export default ControlPanel;
