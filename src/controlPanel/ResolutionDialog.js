/*
** resolution dialog -- what you get from the resolution tab in CP
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import {qeBasicSpace} from '../wave/qeSpace';
import SquishPanel from '../SquishPanel';
import CommonDialog from '../widgets/CommonDialog';
import {thousands} from '../widgets/utils';


// had this been a real webiste, I would not have to copy/paste these here
//export const listOfViewClasses = {
//	abstractViewDef, manualViewDef, viewVariableViewDef,
//	flatViewDef,
//};

// these numbers represent approx 10**(n/10), but
// rounded off to convenient increments, so eg 60=>1M, 50=>100k,
// 30=1000, 27=500, 23=>200, 20=>100, 13=>20, 10=>10 /*!!!*/, 7=>5
// note 11=>12.5=>13 so start at 12 => 16, although it'll round up and always be an integer
const MIN_SLIDER_RES = process.env.NODE_ENV == 'development' ? 0 : 12;
const MAX_SLIDER_RES = 30;

// list of settings that are more better - not that simple!
function createGoodPowersOf10() {
	let po10 = [];
	for (let p = MIN_SLIDER_RES; p <= MAX_SLIDER_RES; p += 10) {
		po10.push(<option key={p}>{p}</option>);
//		po10.push(<option>{p + 3}</option>);
//		po10.push(<option>{p + 7}</option>);
	}
	return po10;
}

const GoodPowersOf10 = createGoodPowersOf10();

// convert eg 20, 21, 25, 30 into 100, 125, 300, 1000
// indices under 12 will result in rounded results,
// 1 2 2 2 3 3 4 5 6 8 10 13 15...
// so not recommended for human consumption
function indexToPower(ix) {
	let po10 = 10 ** Math.floor(ix/10);
	let factor = [
		1.0, 1.25, 1.5,
		2.0, 2.50, 3.0,
		4.0, 5.00, 6.0,
		8.0][ix % 10];
	return Math.ceil(factor * po10);
}

// convert eg 100, 125, 300, 1000 into 20, 21, 25, 30
function powerToIndex(p) {
	return Math.round(Math.log10(p) * 10);
}

export default class ResolutionDialog extends React.Component {
	static propTypes = {
		N: PropTypes.number.isRequired,
		continuum: PropTypes.number.isRequired,
		viewClassName: PropTypes.string.isRequired,
	};

	// this is the state in the dialog; doesn't become real until OK().
	// Therefore, initial values set from props.
	state = {
		N: this.props.N,
		powerOf10: powerToIndex(this.props.N),
		continuum: this.props.continuum,
		viewClassName: this.props.viewClassName,
	};

	handleChangePowersOf10(ev) {
		this.setState({
			powerOf10: ev.target.valueAsNumber,
			N: indexToPower(ev.target.valueAsNumber),
		});
	}

	/* ******************************************************************* open/close */

	static initialParams;
	static me = this;

	// open the Resolution dialog specifically
	static openResolutionDialog(initialParams, okCallback, cancelCallback) {
		ResolutionDialog.initialParams = initialParams;
		ResolutionDialog.okCallback = okCallback;
		ResolutionDialog.cancelCallback = cancelCallback;

		// open the general dialog with resolutionDialog as the main component
		CommonDialog.openDialog(
			<ResolutionDialog
				N={initialParams.N}
				continuum={initialParams.continuum}
				viewClassName={initialParams.viewClassName}
			/>
		);
	}

	// called when user clicks OK, before dialog is hidden in App
	OK(ev) {
		//const s = //this.state;
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
			datapoints: <big>{thousands(indexToPower(this.state.powerOf10))}</big>
			&nbsp; <small>(was {thousands(this.props.N)})</small>
			<div style={{break: 'both', fontSize: 'smaller'}}>
				<div style={{float: 'left'}}>faster</div>
				<div style={{float: 'right'}}>more accurate</div>
			</div>

			<input className='powerOf10Control' type="range"
				min={MIN_SLIDER_RES} max={MAX_SLIDER_RES}
				value={s.powerOf10}
				list='GoodPowersOf10'
				style={{width: '100%'}}
				onInput={ev => this.handleChangePowersOf10(ev)}
			/>
		</>;
	}

	renderContinuum() {
		const s = this.state;
		const onChange = ev => this.setState({continuum: ev.target.value});
		return <>
			what kind of universe:
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
		const s = this.state;
		const onChange = ev => this.setState({viewClassName: ev.target.value});
		if (true) {
			// the one that theoreticallyt should work
			const viewz = SquishPanel.getListOfViews()
			const radioz = [];
			for (let vuName in viewz) {
				const vu = viewz[vuName];
				//console.log(`doin this vu:`, vu.viewClassName);
				//console.dir(vu);
				//console.log(`   typeof:`, typeof vuName, typeof vu);
				//console.log(`   names:`, vu.viewClassName, vu.viewClassName, vu.name);
				radioz.push(<label key={vu.viewClassName}>
					<input type='radio' key={vu.viewClassName} name='viewClassName'
						value={vu.viewClassName}
						checked={vu.viewClassName == this.state.viewClassName}
						onChange={onChange}/>
					{vu.viewClassName}</label>);
			}

			return radioz;
			}
		else {
			return (<>
				view:
				<label><input type='radio' name='viewClassName'  value='flatViewDef' key='flatViewDef'
						checked={s.viewClassName == 'flatViewDef'}
						onChange={onChange}/>
					flatViewDef</label>
				<label><input type='radio' name='viewClassName'  value='flatDrawingViewDef' key='flatDrawingViewDef'
						checked={s.viewClassName == 'flatDrawingViewDef'}
						onChange={onChange}/>
					viewVariableViewDef</label>
				<label><input type='radio' name='viewClassName'  value='abstractViewDef' key='abstractViewDef'
						checked={s.viewClassName == 'abstractViewDef'}
						onChange={onChange}/>
					abstractViewDef</label>
				<label><input type='radio' name='viewClassName'  value='manualViewDef' key='manualViewDef'
						checked={s.viewClassName == 'manualViewDef'}
						onChange={onChange}/>
					manualViewDef</label>
				<label><input type='radio' name='viewClassName'  value='viewVariableViewDef' key='viewVariable'
						checked={s.viewClassName == 'viewVariableViewDef'}
						onChange={onChange}/>
					viewVariableViewDef</label>
			</>);
		}

	}

	render() {
		//const s = this.state;

		return (
			<article className='dialog ResolutionDialog' style={{fontSize: '80%'}}>
				<datalist id='GoodPowersOf10' >{GoodPowersOf10}</datalist>

				<h3>Reconfigure the Universe</h3>

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
					<button className='cancelButton'
						onClick={ev => this.cancel(ev)}>
							Cancel
					</button>
					<button className='setResolutionOKButton'
						onClick={ev => this.OK(ev)}>
							Recreate Universe
					</button>
				</section>

			</article>
		);
	}
}

