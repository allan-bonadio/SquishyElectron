import PropTypes from 'prop-types';

function setPT() {
	SetPotentialTab.propTypes = {
		setPotential: PropTypes.func.isRequired,

		valleyPower: PropTypes.number.isRequired,
		valleyScale: PropTypes.number.isRequired,
		valleyOffset: PropTypes.number.isRequired,
	};
}

function SetPotentialTab(props) {
	const p = props;

	return <div className='setPotentialTab'>
		<h3><big>⚡️</big> Reset Voltage Profile <br /> (potential energy function)</h3>
		<button type='button' className='zeroVoltageButton round'
			onClick={ev => p.setPotential('zero')}>
				Zero potential (default)
		</button>

		<br/>
		<button type='button' className='valleyVoltageButton round'
			onClick={ev => p.setPotential('valley', p.valleyPower, p.valleyScale, p.valleyOffset)} >
				Valley Potential
		</button>

		<br/>
		Power:
		<input className='powerSlider' type="range"
			min={-3} max={10}
			value={p.valleyPower}
			style={{width: '8em'}}
			onInput={ev => this.setState({valleyPower: ev.currentTarget.value}) }
		/>
		{p.valleyPower}

		<br/>
		Scale:
		<input className='scaleSlider' type="range"
			min={-3} max={3}
			value={p.valleyScale}
			style={{width: '8em'}}
			onInput={ev => this.setState({valleyScale: ev.currentTarget.value}) }
		/>
		{p.valleyScale}

		<br/>
		Offset:
		<input className='offsetSlider' type="range"
			min={0} max={100}
			value={p.valleyOffset}
			style={{width: '8em'}}
			onInput={ev => this.setState({valleyOffset: ev.currentTarget.value}) }
		/>
		{p.valleyOffset}
	</div>;
}
setPT();

export default SetPotentialTab;
