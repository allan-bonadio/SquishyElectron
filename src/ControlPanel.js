import React from 'react';
import PropTypes from 'prop-types';

import './ControlPanel.css';
import CPToolbar from './CPToolbar';
import {setWave, setVoltage, isItAnimating} from './wave/theWave';
//import {theJWave, setWave, setVoltage, iterateAnimate, isItAnimating} from './wave/theWave';

export class ControlPanel extends React.Component {
	static propTypes = {
		//innerActiveWidth: PropTypes.number,
		openResolutionDialog: PropTypes.func.isRequired,
		//iterateAnimate: PropTypes.func.isRequired,
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,
		isTimeAdvancing: PropTypes.bool,
	};

	constructor(props) {
		super(props);

		this.state = {
			//isRunning: false,
			rate: 8,
			harmonicFrequency: 1, constantFrequency: 1,
		};
	}

	/* *********************************** start and stop buttons */

	// toggle the isRunning boolean, that exists in two places
//	setRunning(ev, isRunning) {
//		isRunning = !!isRunning;
//
////		if (this.state.isRunning)
////			iterate(theJWave);
////		if (isRunning)
////			theDraw.draw();
//		this.props.iterateAnimate(isRunning && this.state.rate);
//
//		if (ev && ev.currentTarget) ev.currentTarget.blur();
//
//		// it is a state of this panel, to color the buttons
//		//this.setState({isRunning});
//
//		// but also a state of the animation
//		//theJWave.isRunning = isRunning;
//	}
//
//	// set rate, which is 1, 2, 4, 8, ...
//	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
//	toggleRunning(ev) {
//		//this.setState({isRunning: false});
//
//		this.props.iterateAnimate(!isItAnimating(), this.state.rate);
//
//		if (ev && ev.currentTarget) ev.currentTarget.blur();
//
//	}
//
//	oneStep(ev) {
//		//this.setState({isRunning: false});
//
//		this.props.iterateAnimate(false, 'one');
//
//		if (ev && ev.currentTarget) ev.currentTarget.blur();
//	}

	// set rate, which is 1, 2, 4, 8, ...
	// can't combine this with 'isRunning' cuz want to remember rate even when stopped
	setRate(rate) {

		this.props.iterateAnimate(isItAnimating(), rate);
		this.setState({rate});  // rate is stored in two places, na na na
//		if (this.state.isRunning)
//			this.props.iterateAnimate(rate);
	}

	renderGoStopButtons() {
		let isRunning = this.props.isTimeAdvancing;
		const repRates = [];
		for (let rate = 1, i = 0; rate < 64; rate *= 2, i++)
			repRates.push(<option key={rate} value={rate}>{rate} per sec</option>);

		return <div className='goStopButtons subPanel'>
			<button type='button' className={'goButton ' + (isRunning && 'on')}
				onClick={ev => this.startIterating()}>
					▶
			</button>
			<button type='button' className={'stopButton ' + (!isRunning && 'on')}
				onClick={ev => this.stopIterating()}>
					◼
			</button>

			frame rate:
			<select className='rateSelector' value={this.state.rate}
					onChange={ev => this.setRate(ev.currentTarget.value)}>
				{repRates}
			</select>
		</div>;
	}

	/* ********************************************** resetWave */

	renderResetWaveButtons() {
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

	renderSetVoltageButtons() {
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
				startIterating={this.props.startIterating}
				stopIterating={this.props.stopIterating}
				singleStep={this.props.singleStep}
				isTimeAdvancing={this.props.isTimeAdvancing}
			/>
			<div className='cpSecondRow'>
				{this.renderGoStopButtons()}
				{this.renderResetWaveButtons()}
				{this.renderSetVoltageButtons()}

				<button type='button' className='setResolutionButton'
					onClick={ev => this.props.openResolutionDialog()}>
						Change Resolution
						<div style={{fontSize: '.7em'}}>
							(will reset current wave)</div>
				</button>
			</div>
		</div>;
	}
}

export default ControlPanel;
