/*
** resolution dialog -- what you get from the resolution tab in CP
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import {qeBasicSpace} from '../engine/qeSpace';
//import SquishPanel from '../SquishPanel';
import CommonDialog from '../widgets/CommonDialog';
import {powerToIndex} from '../utils/powers';
import LogSlider from '../widgets/LogSlider';
import listOfViewClasses from '../view/SquishView';


const MIN_2SLIDER_RES = process.env.NODE_ENV == 'development' ? 4 : 16;
const MAX_2SLIDER_RES = 1024;

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

	renderNSlider() {
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
			<label  key='contENDLESS'><input type='radio' name='continuum'  value={qeBasicSpace.contENDLESS}
					checked={s.continuum == qeBasicSpace.contENDLESS}
					onChange={onChange}
					style={{fontWeight:
						(this.props.continuum == qeBasicSpace.contENDLESS)
						? 'bold'
						: 'normal'}}/>
				Endless, repeating left-right</label>
			<label  key='contWELL'><input type='radio' name='continuum'  value={qeBasicSpace.contWELL}
					checked={s.continuum == qeBasicSpace.contWELL}
					onChange={onChange}
					style={{fontWeight:
						(this.props.continuum == qeBasicSpace.contWELL)
						? 'bold'
						: 'normal'}}/>
				Well with Walls</label>
			<label  key='contDISCRETE'><input type='radio' name='continuum'  value={qeBasicSpace.contDISCRETE}
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
			//console.log(`doin this vuClass:`, vuClass.displayName);
			//console.dir(vuClass);
			//console.log(`   typeof:`, typeof vuClassName, typeof vuClass);
			//console.log(`   names:`, vuClass.displayName, vuClass.displayName, vuClass.displayName);
			radioz.push(<label key={vuClass.displayName}>
				<input type='radio' key={vuClass.displayName} name='mainViewClassName'
					value={vuClass.displayName}
					checked={vuClass.displayName == this.state.mainViewClassName}
					onChange={onChange}/>
				{vuClass.displayName}</label>);
		}

		return radioz;

	}

// 				<datalist id='GoodPowersOf10' >{GoodPowersOf10}</datalist>

	render() {
		//const s = this.state;

		return (
			<article className='dialog ResolutionDialog' style={{fontSize: '80%'}}>

				<h3>Reconfigure the Space</h3>

				<section className='dialogSection' key='NSlider'>
					{this.renderNSlider()}
				</section>

				<section className='dialogSection'  key='continuumRadios'
					style={{float: 'left', width: '45%', paddingRight: '2em'}} >
					{this.renderContinuum()}
				</section>

				<section className='dialogSection' key='viewRadios'
					style={{float: 'left', width: '45%'}}>
					{this.renderViewRadios()}
				</section>

				<section className='dialogSection' key='setButton'
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

