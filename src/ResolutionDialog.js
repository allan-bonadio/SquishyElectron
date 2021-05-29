import React from 'react';
import {recreateWave} from './wave/theWave';

const minResolution = 5;
const maxResolution = 10000;

export default class ResolutionDialog extends React.Component {
	state = {
		resolution: 5,
	};

	static me = this;

	close(ev) {
		this.props.closeResolutionDialog();
	}

	OK(ev) {
		const s = this.state;
		recreateWave(+s.resolution);
		this.close();
	}

	calcStepSize() {
		let resolution = this.state.resolution;
		let digits = Math.floor(Math.log10(resolution));  // 0 ... 3
		let digits10 = Math.max(10 ** (digits - 1), 1);  // 1, 10, 100
		let mantissa = resolution / digits10 / 10;  // 1.000 ... 9.999
		if (mantissa >= 5)
			mantissa = 5;
		else if (mantissa >= 2)
			mantissa = 2;
		else
			mantissa = 1;
		this.stepSize = mantissa * digits10;
		let r = this.state.resolution / this.stepSize;
		r = (this.value >= this.oldValue)
			? Math.ceil(r)
			: Math.floor(r);
		this.oldValue = this.value;
		this.value = r * this.stepSize;
	}

	render() {
		const p = this.props;
		this.calcStepSize();

		return <aside className='backdrop' style={{display: p.visible ? 'flex' : 'none'}}>
			<div className='dialogSpacer' />
			<article className='dialog'>

				<h3>Universe</h3>

				<label>
					Number of datapoints (5 - 1000) <br />
					<input type='number' placeholder='points' size='15' value={this.value}
						min={minResolution} max={maxResolution} step={this.calcStepSize()}
						onChange={ev => this.setState({resolution: ev.currentTarget.value})} />
				</label>
				new resolution: {this.value}<br />
				old value: {this.oldValue}<br />
				stepSize: {this.stepSize}<br />

				<button type='button' className='cancelButton'
					onClick={ev => this.close(ev)}>
						Cancel
				</button>

				<button type='button' className='setResolutionOKButton'
					onClick={ev => this.OK()}>
						Recreate Universe
				</button>


			</article>
			<div className='dialogSpacer' />
		</aside>;
	}
}
