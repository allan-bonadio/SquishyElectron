/*
** SetWave tab -- render the Wave tab on the control panel
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

import MiniGraph from './MiniGraph';
import qeSpace from '../wave/qeSpace';
import TextNSlider from '../widgets/TextNSlider';

function setPT() {
	// variables from on high, and the funcs needed to change them
	SetWaveTab.propTypes = {
		// sets it in C++
		setWaveHandler: PropTypes.func.isRequired,

		waveParams: PropTypes.shape({
			frequency: PropTypes.number,
			waveBreed: PropTypes.oneOf(['circular', 'standing', 'pulse',]),
			// plus others, ignore for this check
		}).isRequired,

		// sets it only in the ControlPanel state for subsequent SetWave click
		setCPState: PropTypes.func,

		space: PropTypes.instanceOf(qeSpace),

		// 	waveParams: PropTypes.shape();
		// 	frequency: PropTypes.number.isRequired,
		// 	setCircularFrequency: PropTypes.func.isRequired,
		//
		// 	pulseWidth: PropTypes.number.isRequired,
		// 	setPulseWidth: PropTypes.func.isRequired,
		//
		// 	pulseOffset: PropTypes.number.isRequired,
		// 	setPulseOffset: PropTypes.func.isRequired,
		//
		// 	waveBreed: PropTypes.string,
		// 	setBreed: PropTypes.func.isRequired,

		resetTime: PropTypes.func,
	};
}

// a component that just renders the Wave tab
function SetWaveTab(props) {
	const p = props;

	// called for each x value to make graph
	// obsolete, use qeWave s instead
// 	function waveWaveFunc(x) {
// 		switch (p.waveBreed) {
// 		case 'circular':
// 			return qCx(Math.cos(x * p.frequency), Math.sin(x * p.frequency));
//
// 		case 'standing':
// 			return qCx(Math.cos(.5 * x * p.frequency), 0);
//
// 		case 'pulse':
// 			return 1;
//
// 		default:
// 			return 0;  // i dunno...
// 		}
//
// 		// p.standingFrequency
// // 		 return // something like (cos, sin)  // +p.valleyScale / 100 * (Math.abs(x - (+p.valleyOffset / 50 - 1))) ** +p.valleyPower
// 	}



// <div  >
// 	<span>frequency</span>
// 	<input type='number' placeholder='frequency' className='numberInput frequency'
// 			value={p.frequency} min='0' max='100' step={'standing' == p.waveBreed ? .5 : 1}
// 			onChange={ev => p.setCPState} />
// 	<input type='range'
// 		value={p.waveParams.frequency} min='0' max='20'
// 		onChange={ev => p.setCPState({frequency: ev.currentTarget.value})} />
// </div>


		// <div  >
// 			<span>pulse width, %</span>
// 			<input type='number' placeholder='pulse width' className='numberInput pulseWidth'
// 					value={p.pulseWidth} min='0' max='10' step={.01}
// 					onChange={ev => p.setPulseWidth(ev.currentTarget.value)} />
// 			<input type='range'
// 				value={p.pulseWidth} min='0' max='1.0' step='.01'
// 				onChange={ev => p.setCPState({stdDev: ev.currentTarget.value})} />
// 		</div>
//
// 		<div  >
// 			<span>pulse offset</span>
// 			<input type='number' placeholder='pulse offset' className='numberInput pulseOffset'
// 					value={p.pulseOffset} min='0' max='1' step={.01}
// 					onChange={ev => p.setPulseOffset(ev.currentTarget.value)} />
// 			<input type='range'
// 				value={p.pulseOffset} min='0' max='1.0' step='.01'
// 				onChange={ev => p.setCPState({pulseOffset: ev.currentTarget.value})} />
// 		</div>


	const sliders = <>


		<TextNSlider className='frequency' label='frequency'
			current={+p.waveParams.waveFrequency}
			min={-10} max={10} step={'circular' != p.waveParams.waveBreed ? .5 : 1}
			handleChange={waveFrequency => p.setCPState({waveFrequency})}
		/>

		<TextNSlider className='pulseWidth' label='pulse width, %'
			style={{display: 'pulse' == p.waveParams.waveBreed ? 'block' :  'none'}}
			current={+p.waveParams.stdDev}
			min={1} max={10} step={.1}
			handleChange={stdDev => p.setCPState({stdDev})}
		/>

		<TextNSlider className='offset' label='offset, %'
			style={{display: 'pulse' == p.waveParams.waveBreed ? 'block' :  'none'}}
			current={+p.waveParams.pulseOffset}
			min={0} max={100} step={2}
			handleChange={pulseOffset => p.setCPState({pulseOffset})}
		/>

	</>;


	const radios = <div className='waveTabCol middle'>
		<label>
			circular
			<input type='radio' checked={'circular' == p.waveParams.waveBreed}
				onChange={ev => p.setCPState({waveBreed: 'circular'})} />
		</label>

		<label>
			standing
			<input type='radio'  checked={'standing' == p.waveParams.waveBreed}
				onChange={ev => p.setCPState({waveBreed: 'standing'})} />
		</label>

		<label>
			pulse
			<input type='radio'  checked={'pulse' == p.waveParams.waveBreed}
				onChange={ev => p.setCPState({waveBreed: 'pulse'})} />
		</label>
	</div>;


	//debugger;
	return <div className='SetWaveTab'>

		<div className='waveTabCol'>
			<h3>Choose New Wave</h3>
			{sliders}
		</div>

		{radios}

		<div className='waveTabCol'>
			&nbsp;
			<div className='waveMiniGraph'>
				<MiniGraph width={200} height={100} isWave={true} className='SetWaveTab'
						familiarParams={p.waveParams} space={p.space}/>
			</div>
			<button type='button' className='setWaveButton round'
				onClick={p.setWaveHandler}>
					Set Wave
			</button>

		</div>
	</div>;
}
setPT();

export default SetWaveTab;

