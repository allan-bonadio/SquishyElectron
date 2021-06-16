import React from 'react';
import {qeSpace} from './wave/qEngine';

const minResolution = 5;
const maxResolution = 100000;

export default class ResolutionDialog extends React.Component {
	// this is the state in the dialog; doesn't become real until OK()
	state = {
		N: this.props.N,
		continuum: this.props.continuum,
	};

	static me = this;

	close(ev) {
		this.props.closeResolutionDialog();
	}

	OK(ev) {
		const s = this.state;
		this.props.setNew1DResolution(s.N, s.continuum);
		this.props.closeResolutionDialog();
	}

	// try to make the arrows on the input increment in reasonable amounts
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
		const s = this.state;
		this.calcStepSize();

		return <aside className='backdrop' style={{display: 'flex'}}>
			<div className='dialogSpacer' />
			<article className='dialog'>

				<h3>Universe</h3>

				<label>
					Number of datapoints ({minResolution} - {maxResolution}) <br />
					<input type='number' placeholder='points' size='15' value={s.N}
						min={minResolution} max={maxResolution}
						step={this.calcStepSize()}
						onChange={ev => this.setState({N: ev.currentTarget.value})} />
				</label>
				<label>continuum:
					<select value={s.continuum}
						onChange={ev => this.setState({continuum: ev.currentTarget.value})} >
						<option  value={qeSpace.contCIRCULAR}>contCIRCULAR</option>
						<option  value={qeSpace.contWELL}>contWELL</option>
						<option  value={qeSpace.contDISCRETE}>contDISCRETE</option>
					</select >
				</label>

				new resolution: {this.state.N}<br />
				old resolution: {this.props.N}<br />
				old continuum: {this.props.continuum}<br />
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
