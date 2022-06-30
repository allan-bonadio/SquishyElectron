/*
** resolution dialog -- what you get from the resolution tab in CP
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import {qeBasicSpace} from '../engine/qeSpace';
//import SquishPanel from '../SquishPanel';
import CommonDialog from '../widgets/CommonDialog';
import {powerToIndex} from '../widgets/utils';
import LogSlider from '../widgets/LogSlider';
import listOfViewClasses from '../view/SquishView';


// had this been a real webiste, I would not have to copy/paste these here
//export const listOfViewClasses = {
//	abstractViewDef, manualViewDef, viewVariableViewDef,
//	flatViewDef,
//};

// these numbers represent approx 10**(n/10), but
// rounded off to convenient increments, so eg 60=>1M, 50=>100k,
// 30=1000, 27=500, 23=>200, 20=>100, 13=>20, 10=>10 /*!!!*/, 7=>5
// note 11=>12.5=>13 so start at 12 => 16, although it'll round up and always be an integer
// const MIN_SLIDER_RES = process.env.NODE_ENV == 'development' ? 0 : 12;
// const MAX_SLIDER_RES = 30;

const MIN_2SLIDER_RES = process.env.NODE_ENV == 'development' ? 4 : 16;
const MAX_2SLIDER_RES = 1024;

// list of settings that are more better - not that simple!
// function createGoodPowersOf10() {
// 	let po10 = [];
// 	for (let p = MIN_SLIDER_RES; p <= MAX_SLIDER_RES; p += 10) {
// 		po10.push(<option key={p}>{p}</option>);
// //		po10.push(<option>{p + 3}</option>);
// //		po10.push(<option>{p + 7}</option>);
// 	}
// 	return po10;
// }
//
// const GoodPowersOf10 = createGoodPowersOf10();
//
// // convert eg 20, 21, 25, 30 into 100, 125, 300, 1000
// // indices under 12 will result in rounded results,
// // 1 2 2 2 3 3 4 5 6 8 10 13 15...
// // so not recommended for human consumption
// function indexToPower(ix) {
// 	let po10 = 10 ** Math.floor(ix/10);
// 	let factor = [
// 		1.0, 1.25, 1.5,
// 		2.0, 2.50, 3.0,
// 		4.0, 5.00, 6.0,
// 		8.0][ix % 10];
// 	return Math.ceil(factor * po10);
// }
//
// // convert eg 100, 125, 300, 1000 into 20, 21, 25, 30
// function powerToIndex(p) {
// 	return Math.round(Math.log10(p) * 10);
// }

export default class ResolutionDialog extends React.Component {
	static propTypes = {
		N: PropTypes.number.isRequired,
		continuum: PropTypes.number.isRequired,
		mainViewClassName: PropTypes.string.isRequired,
	};

	// this is the state in the dialog; doesn't become real until OK().
	// Therefore, initial values set from props.
	state = {
		N: this.props.N,  // same as power
		index: powerToIndex(16, this.props.N),
		continuum: this.props.continuum,
		mainViewClassName: this.props.mainViewClassName,
		origN: this.props.N,
	};


// 	handleChangePowersOf10(ev) {
// 		const target = ev.target;
// 		const index = target.value;
// 		this.setState({power, index, });
// 	}
// 	handleChangePowersOf10 = this.handleChangePowersOf10.bind(this);

	/* ******************************************************************* open/close */

	static initialParams;
	static me = this;

	// open the Resolution dialog specifically
	static openResDialog(initialParams, okCallback, cancelCallback) {
		// there is no more than 1 resolution dialog open at a time so I can store this stuff here
		ResolutionDialog.initialParams = initialParams;
		ResolutionDialog.okCallback = okCallback;
		ResolutionDialog.cancelCallback = cancelCallback;

		// open the general dialog with resolutionDialog as the main component
		CommonDialog.openDialog(
			<ResolutionDialog
				N={initialParams.N}
				continuum={initialParams.continuum}
				mainViewClassName={initialParams.mainViewClassName}
			/>
		);
	}

	// called when user clicks OK, before dialog is hidden in App
	OK(ev) {
		ResolutionDialog.okCallback(this.state);
		CommonDialog.startClosingDialog();
	}
	OK = this.OK.bind(this);

	// called when user clicks Cancel, before dialog is hidden in App
	cancel(ev) {
		ResolutionDialog.cancelCallback();
		CommonDialog.startClosingDialog();
	}
	cancel = this.cancel.bind(this);


	/* ******************************************************************* rendering */

	renderSlider() {
		const s = this.state;
		return <>
			<LogSlider
				unique='resolutionSlider'
				className='resolutionSlider'
				label='Datapoints'
				minLabel='faster'
				maxLabel='more accurate'

				current={s.N}
				original={this.origN}
				sliderMin={MIN_2SLIDER_RES}
				sliderMax={MAX_2SLIDER_RES}

				stepsPerDecade={16}
				willRoundPowers={true}

				handleChange={this.handleResChange}
			/>
		</>;
	}

	handleResChange(N, ix) {
		this.setState({
			ix: +ix,
			N: +N,
		});
		console.info(`handleResChange(N=${N}, ix=$ix) `)
	}
	handleResChange = this.handleResChange.bind(this);

	renderContinuum() {
		const s = this.state;
		const onChange = ev => this.setState({continuum: +ev.target.value});
		return <>
			what kind of space:
			<label><input type='radio' name='continuum'  value={qeBasicSpace.contENDLESS}
					checked={s.continuum == qeBasicSpace.contENDLESS}
					onChange={onChange}
					style={{fontWeight:
						(this.props.continuum == qeBasicSpace.contENDLESS)
						? 'bold'
						: 'normal'}}/>
				Endless, repeating left-right</label>
			<label><input type='radio' name='continuum'  value={qeBasicSpace.contWELL}
					checked={s.continuum == qeBasicSpace.contWELL}
					onChange={onChange}
					style={{fontWeight:
						(this.props.continuum == qeBasicSpace.contWELL)
						? 'bold'
						: 'normal'}}/>
				Well with Walls</label>
			<label><input type='radio' name='continuum'  value={qeBasicSpace.contDISCRETE}
					checked={s.continuum == qeBasicSpace.contDISCRETE}
					onChange={onChange}
					style={{fontWeight:
						(this.props.continuum == qeBasicSpace.contDISCRETE)
						? 'bold'
						: 'normal'}}/>
				Discreet Quanta (not recommended)</label>
		</>;
	}

	renderViewRadios() {
		const onChange = ev => this.setState({mainViewClassName: ev.target.value});

		// the one that theoreticallyt should work
		const radioz = [];
		for (let vuClassName in listOfViewClasses) {
			const vuClass = listOfViewClasses[vuClassName];
			//console.log(`doin this vuClass:`, vuClass.name);
			//console.dir(vuClass);
			//console.log(`   typeof:`, typeof vuClassName, typeof vuClass);
			//console.log(`   names:`, vuClass.name, vuClass.name, vuClass.name);
			radioz.push(<label key={vuClass.name}>
				<input type='radio' key={vuClass.name} name='mainViewClassName'
					value={vuClass.name}
					checked={vuClass.name == this.state.mainViewClassName}
					onChange={onChange}/>
				{vuClass.name}</label>);
		}

		return radioz;

	}

// 				<datalist id='GoodPowersOf10' >{GoodPowersOf10}</datalist>

	render() {
		//const s = this.state;

		return (
			<article className='dialog ResolutionDialog' style={{fontSize: '80%'}}>

				<h3>Reconfigure the Space</h3>

				<section className='dialogSection'>
					{this.renderSlider()}
				</section>

				<section className='dialogSection'
					style={{float: 'left', width: '45%', paddingRight: '2em'}} >
					{this.renderContinuum()}
				</section>

				<section className='dialogSection'
					style={{float: 'left', width: '45%'}}>
					{this.renderViewRadios()}
				</section>

				<section className='dialogSection'
					style={{padding: '1em', margin: '1em', textAlign: 'right'}}>
					<button className='cancelButton' onClick={this.cancel}>
							Cancel
					</button>
					<button className='setResolutionOKButton'
						onClick={this.OK}>
							Recreate Space
					</button>
				</section>

			</article>
		);
	}
}

