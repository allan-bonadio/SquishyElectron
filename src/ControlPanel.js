import React from 'react';
import './ControlPanel.css';
import {theJWave, setWave, setVoltage, iterateAnimate} from './wave/theWave';

export class ControlPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			running: false,
			rate: 8,
			harmonicFrequency: 1, constantFrequency: 1,
		};
	}

	/* *********************************** start and stop buttons */

	// toggle the running boolean, that exists in two places
	setRunning(ev, running) {
		running = !!running;

//		if (this.state.running)
//			iterate(theJWave);
//		if (running)
//			theDraw.draw();
		iterateAnimate(this.props.useQuantumEngine, running && this.state.rate);

		ev.currentTarget.blur();

		// it is a state of this panel, to color the buttons
		this.setState({running});

		// but also a state of the animation
		//theJWave.running = running;
	}

	// set rate, which is 1, 2, 4, 8, ...
	// can't combine this with 'running' cuz want to remember rate even when stopped
	setRate(rate) {
		iterateAnimate(this.props.useQuantumEngine, 0);
		this.setState({rate})
		if (this.state.running)
			iterateAnimate(this.props.useQuantumEngine, rate);
	}

	goStopButtons() {
		const running = this.state.running;

		const repRates = [];
		for (let rate = 1, i = 0; rate < 64; rate *= 2, i++)
			repRates.push(<option key={rate} value={rate}>{rate} per sec</option>);

		return <div className='goStopButtons subPanel'>
			<button type='button' className={'goButton ' + (running && 'on')}
				onClick={ev => this.setRunning(ev, true)}>
					▶
			</button>
			<button type='button' className={'stopButton ' + (!running && 'on')}
				onClick={ev => this.setRunning(ev, false)}>
					◼
			</button>

			frame rate:
			<select className='rateSelector' value={this.state.rate}
					onChange={ev => this.setRate(ev.currentTarget.value)}>
				{repRates}
			</select>

			<button type='button' className={'filterAndNorm'}
				onClick={ev => theJWave.lowPassFilter()}>
					filter & norm
			</button>

			<input type="range" min='0' max='100' step='20' value='50' />
		</div>;
	}

	/* ********************************************** resetWave */

	resetWaveButtons() {
		return <div className='resetWaveButtons subPanel'>
			<h3><big>🌊 🌊 🌊 </big> Reset Wave Function</h3>
			<button type='button' className='harmonicWaveButton'
				onClick={ev => setWave('standing', this.state.harmonicFrequency)}>
					Harmonic Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency'
				value={this.state.harmonicFrequency} min='1' max='100'
				onChange={ev => this.setState({harmonicFrequency: ev.currentTarget.value})} />

			<br/>
			<button type='button' className='constantWaveButton'
				onClick={ev => setWave('circular', this.state.constantFrequency)} >
					Constant Wave
			</button>
			&nbsp;
			<input type='number' placeholder='frequency'
				value={this.state.constantFrequency} min='1' max='100'
				onChange={ev => this.setState({constantFrequency: ev.currentTarget.value})} />

			<br/>
			<button type='button' className='diracDeltaButton'
				onClick={ev => setWave('pulse')} >
					Dirac Delta
			</button>
		</div>;
	}

	/* ********************************************** set voltage */

	setVoltageButtons() {
		return <div className='setVoltageButtons subPanel'>
			<h3><big>⚡️</big> Reset Voltage Profile <br /> (potential energy function)</h3>
			<button type='button' className='zeroVoltageButton'
				onClick={ev => setVoltage('zero', 0)}>
					Zero potential (default)
			</button>

			<br/>
			<button type='button' className='wellVoltageButton'
				onClick={ev => setVoltage('wave', 0)} >
					Potential Well
			</button>
		</div>;
	}

	/* ********************************************** render */

	render() {
		return <div className='ControlPanel'>
			{this.goStopButtons()}
			{this.resetWaveButtons()}
			{this.setVoltageButtons()}

			<button type='button' className='setResolutionButton'
				onClick={ev => this.props.openResolutionDialog()}>
					<big>|||||||</big> Change Resolution <br />
					(will reset current wave)
			</button>
		</div>;
	}
}

export default ControlPanel;
