import React from 'react';
import PropTypes from 'prop-types';

import {qeSpace} from './wave/qEngine';
import SquishPanel, {listOfViewClasses} from './SquishPanel';


// these numbers represent approx 10**(n/10), but
// rounded off to convenient increments, so eg 60=>1M, 50=>100k,
// 30=1000, 27=500, 23=>200, 20=>100, 13=>20, 10=>10 /*!!!*/, 7=>5
// note 11=>12.5=>13 so start at 12 => 16, although it'll round up and always be an integer
const MIN_SLIDER_RES = process.env.NODE_ENV == 'development' ? 0 : 12;
const MAX_SLIDER_RES = 60;

// list of settings that are more better - not that simple!
function createGoodPowersOf10() {
	let po10 = [];
	for (let p = MIN_SLIDER_RES; p <= MAX_SLIDER_RES; p += 10) {
		po10.push(<option>{p}</option>);
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

function thousands(n) {
	return String(n).replace(/(\d\d\d)$/, ' $1').replace(/(\d\d\d) /, ' $1 ')
}

export default class ResolutionDialog extends React.Component {
	static propTypes = {
		stateParams: PropTypes.shape({
			N: PropTypes.number.isRequired,
			continuum: PropTypes.number.isRequired,
			viewClassName: PropTypes.string.isRequired,
		}),
		closeResolutionDialog: PropTypes.func,
	};

	// this is the state in the dialog; doesn't become real until OK().
	// Therefore, initial values set from props.
	state = {
		N: powerToIndex(this.props.stateParams.N),
		continuum: this.props.stateParams.continuum,
		viewClassName: this.props.stateParams.viewClassName,
	};

	static me = this;

	close(ev) {
		this.props.closeResolutionDialog();
	}

	OK(ev) {
		const s = this.state;
		this.props.setNew1DResolution(
			indexToPower(s.powerOf10), s.continuum, s.viewClassName);
		this.props.closeResolutionDialog();
	}

	handleChangePowersOf10(ev) {
		this.setState({powerOf10: ev.target.valueAsNumber});
	}

	renderViewRadios() {
		const s = this.state;
		const onChange = ev => this.setState({continuum: ev.target.value});

//		const radioz = SquishPanel
//			.getListOfViews()
		const radioz = listOfViewClasses
			.map((vu, ix) => (
				<label key={ix} serial={ix} >
					<input type='radio' key={ix} name='viewClassName'
						value={vu.viewClassName}
						checked={s.continuum == qeSpace.contCIRCULAR}
						onChange={onChange}/>
					{vu.viewName} - {vu.viewClassName}</label>
			));

		return radioz;

		return <>
		<label><input type='radio' name='viewClassName'  value='flatViewDef' key='flat'
				checked={s.continuum == qeSpace.contCIRCULAR}
				onChange={onChange}/>
			Regular</label>
		<label><input type='radio' name='viewClassName'  value='abstractViewDef' key='abstract'
				checked={s.continuum == qeSpace.contWELL}
				onChange={onChange}/>
			Testing Dummy abstract</label>
		<label><input type='radio' name='viewClassName'  value='manualViewDef' key='manual'
				checked={s.continuum == qeSpace.contWELL}
				onChange={onChange}/>
			Testing Dummy manual</label>
		<label><input type='radio' name='viewClassName'  value='viewVariableViewDef' key='viewVariable'
				checked={s.continuum == qeSpace.contWELL}
				onChange={onChange}/>
			Testing Dummy</label>
		</>
	}

	render() {
		const s = this.state;
		const onChange = ev => this.setState({continuum: ev.target.value});

		return <aside className='backdrop'>
			<datalist id='GoodPowersOf10' >{GoodPowersOf10}</datalist>
			<div className='dialogSpacer' />
			<article className='dialog ResolutionDialog'>

				<h3>Reconfigure the Universe</h3>

				<p>
					The actual universe is essentially infinite.
					Nobody's computer has that much ram or power.
					Squishy Electron's universe runs on a finite web page.
					The universe where all this happens is very simplified.
					You can recreate it here, if you want, with different settings.
				</p>

				<section className='dialogSection'>
					Number of datapoints: {thousands(indexToPower(this.state.powerOf10))}
					<div style={{break: 'both', fontSize: '10px'}}>
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
				</section>

				<section className='dialogSection'>
					what kind of universe:
					<label><input type='radio' name='continuum'  value={qeSpace.contCIRCULAR}
							checked={s.continuum == qeSpace.contCIRCULAR}
							onChange={onChange}/>
						Endless, repeating left-right</label>
					<label><input type='radio' name='continuum'  value={qeSpace.contWELL}
							checked={s.continuum == qeSpace.contWELL}
							onChange={onChange}/>
						Well with Walls</label>
					<label><input type='radio' name='continuum'  value={qeSpace.contDISCRETE}
							checked={s.continuum == qeSpace.contDISCRETE}
							onChange={onChange}/>
						Discreet Quanta (not recommended)</label>
				</section>

				<section className='dialogSection'>
					view:
					{this.renderViewRadios()}
				</section>

				<table className='dialogSection'><tbody>
					<tr><td>new resolution:</td>
						<td>{thousands(indexToPower(this.state.powerOf10))}</td></tr>
					<tr><td>old resolution:</td>
						<td>{thousands(this.props.stateParams.N)}</td></tr>
					<tr><td>new continuum:</td>
						<td>{qeSpace.contCodeToText(this.state.continuum)}</td></tr>
					<tr><td>old continuum:</td>
						<td>{qeSpace.contCodeToText(this.props.stateParams.continuum)}</td></tr>
					<tr><td>&nbsp;</td>
						<td></td></tr>

					<tr><td>
						<button type='button' className='cancelButton'
							onClick={ev => this.close(ev)}>
								Cancel
						</button>
					</td><td>
						<button type='button' className='setResolutionOKButton'
							onClick={ev => this.OK()}>
								Recreate Universe
						</button>
					</td></tr>
				</tbody></table>

			</article>
			<div className='dialogSpacer' />
		</aside>;
	}
}




//: {
//:</td><td>{
