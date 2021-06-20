import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.css';
import CPToolbar from './CPToolbar';
import {theJWave, setWave, setVoltage, iterateAnimate} from './wave/theWave';

export class ControlPanel extends React.Component {
	static propTypes = {
		innerActiveWidth: PropTypes.number,
		barWidth: PropTypes.number,
	};

	constructor(props) {
		super(props);

		this.state = {
			isRunning: false,
			rate: 8,
			harmonicFrequency: 1, constantFrequency: 1,
		};
	}

	/* *********************************** start and stop buttons */

	// toggle the isRunning boolean, that exists in two places
	setRunning(ev, isRunning) {
		isRunning = !!isRunning;

//		if (this.state.isRunning)
//			iterate(theJWave);
//		if (isRunning)
//			theDraw.draw();
		iterateAnimate(true, isRunning && this.state.rate);

		ev.currentTarget.blur();

		// it is a state of this panel, to color the buttons
		this.setState({isRunning});

		// but also a state of the animation
		//theJWave.isRunning = isRunning;
	}

	// set rate, which is 1, 2, 4, 8, ...
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	toggleRunning() {
		this.setRunning(!this.state.running);
	}

	// set rate, which is 1, 2, 4, 8, ...
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setRate(rate) {
		iterateAnimate(true, 0);
		this.setState({rate})
		if (this.state.isRunning)
			iterateAnimate(true, rate);
	}

	goStopButtons() {
		const isRunning = this.state.isRunning;

		const repRates = [];
		for (let rate = 1, i = 0; rate < 64; rate *= 2, i++)
			repRates.push(<option key={rate} value={rate}>{rate} per sec</option>);

		return <div className='goStopButtons subPanel'>
			<button type='button' className={'goButton ' + (isRunning && 'on')}
				onClick={ev => this.setRunning(ev, true)}>
					▶
			</button>
			<button type='button' className={'stopButton ' + (!isRunning && 'on')}
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

		</div>;
	}

	/* ********************************************** resetWave */

	resetWaveButtons() {
		return <div className='resetWaveButtons subPanel'>
			<h3>Reset Wave Function</h3>
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
			<CPToolbar
				toggleRunning={ev => this.toggleRunning()}
				oneStep={ev => this.oneStep()}
				isRunning={this.state.isRunning}
			/>
			{this.goStopButtons()}
			{this.resetWaveButtons()}
			{this.setVoltageButtons()}

			<button type='button' className='setResolutionButton'
				onClick={ev => this.props.openResolutionDialog()}>
					Change Resolution
					<div style={{fontSize: '.7em'}}>
						(will reset current wave)</div>
			</button>
		</div>;
	}
}

export default ControlPanel;
