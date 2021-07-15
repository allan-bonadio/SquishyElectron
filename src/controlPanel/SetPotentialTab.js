import PropTypes from 'prop-types';

import MiniGraph from './MiniGraph';

function setPT() {
	SetPotentialTab.propTypes = {
		setPotential: PropTypes.func.isRequired,

		valleyPower: PropTypes.number.isRequired,
		valleyScale: PropTypes.number.isRequired,
		valleyOffset: PropTypes.number.isRequired,
	};
}


function ValleyPanel(props) {
	const p = props;

	function valleyFunc(x) {
		 return p.valleyScale * (Math.abs(x - (p.valleyOffset / 50 - 1))) ** p.valleyPower
	}

	return <>
		<div className='potentialValleyPanel'>
			Power:
			<input className='powerSlider' type="range"
				min={-3} max={10} step={.1}
				value={p.valleyPower}
				style={{width: '8em'}}
				onInput={ev => p.setCPState({valleyPower: ev.currentTarget.value}) }
			/>
			{p.valleyPower}

			<br/>
			Scale:
			<input className='scaleSlider' type="range"
				min={-1} max={1} step={.01}
				value={p.valleyScale}
				style={{width: '8em'}}
				onInput={ev => p.setCPState({valleyScale: ev.currentTarget.value}) }
			/>
			{p.valleyScale}

			<br/>
			Offset:
			<input className='offsetSlider' type="range"
				min={0} max={100}
				value={p.valleyOffset}
				style={{width: '8em'}}
				onInput={ev => p.setCPState({valleyOffset: ev.currentTarget.value}) }
			/>
			{p.valleyOffset}%
			<br/>


			<button type='button' className='valleyVoltageButton round'
				onClick={ev => p.setPotential('valley', p.valleyPower, p.valleyScale, p.valleyOffset)} >
					Set Valley Potential
			</button>

		</div>
		<div className='valleyMiniGraph'>
			<MiniGraph xMin={-2} xMax={2} yFunction={x => valleyFunc(x)} />
		</div>
	</>;
}

function SetPotentialTab(props) {
	const p = props;

	return <div className='setPotentialTab'>
		<div className='potentialTitlePanel'>
			<h3>Set Potential</h3>
			<button type='button' className='zeroVoltageButton round'
				onClick={ev => p.setPotential('zero')}>
					Set Zero (flat) Potential
			</button>

		</div>
		<div className='divider' ></div>
		<ValleyPanel {...props} />
	</div>;
}
setPT();

export default SetPotentialTab;
