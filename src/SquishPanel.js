/*
** squish panel -- like a self-contained quantum system, including space,
** 				waves, and drawings and interactivity.
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

// SquishPanel has a 1:1 relationship with the c++ qSpace.
// the ResolutionDialog changes the initialParams and recreates the qSpace.

import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './controlPanel/ControlPanel';

// eslint-disable-next-line no-unused-vars
import {qeBasicSpace, qeSpace} from './engine/qeSpace';
// import qeWave from './engine/qeWave';
import {qeStartPromise} from './engine/qEngine';
import qe from './engine/qe';

import SquishView from './view/SquishView';
import ResolutionDialog from './controlPanel/ResolutionDialog';

// why doesn't this work?!?!!?
//import {storeSettings} from './utils/storeSettings';
import storeSettings from './utils/storeSettings';

import {setFamiliarPotential} from './widgets/utils';

// runtime debugging flags - you can change in the debugger or here
let areBenchmarking = false;
let dumpingTheViewBuffer = false;
//debugger;
if (typeof storeSettings == 'undefined') debugger;

const DEFAULT_VIEW_CLASS_NAME = 'flatDrawingViewDef';

// const DEFAULT_RESOLUTION = 64;
// const DEFAULT_CONTINUUM = qeBasicSpace.contENDLESS;


export class SquishPanel extends React.Component {
	static propTypes = {
		//token: PropTypes.number,
		id: PropTypes.string.isRequired,
		width: PropTypes.number,
	};

	// static getListOfViews() {
	// 	return listOfViewClasses;
	// }

	/* ************************************************ construction & reconstruction */
	static created = 0;

	constructor(props) {

		super(props);

		// why is this called so many times!?!?!?!?!
		SquishPanel.created += 1;
		// console.info(`*** SquishPanel.created:`, SquishPanel.created);////
		// console.info((new Error()).stack);
		// debugger;

// 		const space0 = storeSettings.retrieveSettings('space0');
// 		const rat = storeSettings.retrieveRatify;

		this.state = {
			// THE N and continuum for THE space we're currently doing
			// kept between sessions in localStore
			N: storeSettings.spaceParams.N,

			continuum: storeSettings.spaceParams.continuum,

			mainViewClassName: DEFAULT_VIEW_CLASS_NAME,

			// the qeSpace
			space: null,  // set in setNew1DResolution()

			// see the view dir, this is for the viewDef instance
			effectiveView: null,

			// this is controlled by the user (start/stop/step buttons)
			// does not really influence the rendering of the canvas... (other than running)
			isTimeAdvancing: storeSettings.iterationParams.isTimeAdvancing,

			// this is the actual 'frequency' in actual milliseconds, convert between like 1000/n
			// eg the menu on the CPToolbar says 10/sec, so this becomes 100
			iteratePeriod: storeSettings.iterationParams.iteratePeriod,

			// defaults for sliders for dt & spi
			dt: storeSettings.iterationParams.dt,
			stepsPerIteration: storeSettings.iterationParams.stepsPerIteration,
			lowPassFilter: storeSettings.iterationParams.lowPassFilter,

			// advance forward with each iter
			runningCycleElapsedTime: 0,
			runningCycleIterateSerial: 0,

			//canvasSize: {width: 800, height: 400}
		};

		// will be resolved when the space has been created; result will be qeSpace
		this.createdSpacePromise = new Promise((succeed, fail) => {
			this.createdSpace = succeed;
			console.info(`qeStartPromise created:`, succeed, fail);
		});

		// ticks and benchmarks
		const now = performance.now();
		this.initStats(now);
		this.timeForNextTic = now + 10;  // default so we can get rolling
		this.lastAniIteration = now;

		// stick ?allowRunningOneCycle at teh endnof URL to show runningONeCycle panel
		// eslint-disable-next-line
		this.allowRunningOneCycle = /allowRunningOneCycle/.test(location.search);

		console.log(`SquishPanel constructor done`);
	}

	/* ******************************************************* space & wave creation */
	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			// done in qEngine qeDefineAccess();

			const s = this.state;

			// space will end up ini the state but meanwhile we need it now
			const space = this.setNew1DResolution(s.N, s.continuum, s.mainViewClassName);

			// vital properties of the space
			qe.Avatar_setDt(this.state.dt);
			qe.Avatar_setStepsPerIteration(this.state.stepsPerIteration);
			//qe.Avatar_askForFFT();

			// this should be the only place animateHeartbeat() should be called
			// except for inside the function itself
			this.animateHeartbeat(performance.now());

			this.createdSpace(space);

			console.info(`SquishPanel.compDidMount promise done`);

		}).catch(ex => {
			console.error(`error in SquishPanel.didMount.then():`, ex.stack || ex.message || ex);
			debugger;
		});

	}


	setEffectiveView(view) {
		this.effectiveView = view;
		this.setState({effectiveView: view})
	}
	setEffectiveView = this.setEffectiveView.bind(this);

	// init or re-init the space and the panel
	setNew1DResolution(N, continuum) {
		qe.space = new qeSpace([{N, continuum, label: 'x'}]);
		this.setState({space: qe.space});
		return qe.space;
	}

	// puts up the resolution dialog, starting with the values from this.state
	openResolutionDialog() {
		const s = this.state;

		// freeze the iteration while this is going on ... but not if relaxing
		const timeWasAdvancing = s.isTimeAdvancing;
		this.setState({isTimeAdvancing: false});

		// pass our state upward to load into the dialog
		ResolutionDialog.openResDialog(
			// this is the initialParams
			{N: s.N, continuum: s.continuum, mainViewClassName: s.mainViewClassName},

			// OK callback
			finalParams => {
				let prevLowPassFilter = s.lowPassFilter;
				let prevN = s.N;

				qe.deleteTheSpace();

				this.setNew1DResolution(
					finalParams.N, finalParams.continuum, finalParams.mainViewClassName);
				this.setState({isTimeAdvancing: timeWasAdvancing, });

				storeSettings.spaceParams.N = finalParams.N;
				storeSettings.spaceParams.continuum = finalParams.continuum;
				//localStorage.space0 = JSON.stringify({N: finalParams.N, continuum: finalParams.continuum});
				// should also work storeSettings.setSetting('space0.N, finalParams.N);
				// and storeSettings.setSetting('space0.continuum, finalParams.continuum);

				// move the LPF proportionately
				let newLPF = Math.max(prevLowPassFilter * finalParams.N / prevN, 1);
				this.setLowPassFilter(newLPF);
			},

			// cancel callback
			() => {
				this.setState({isTimeAdvancing: timeWasAdvancing});
			}
		);
	}

	/* ******************************************************* stats */

	// the upper left and right numbers
	showTimeNIteration() {
		// need them instantaneously - react is too slow
		document.querySelector('.voNorthWest').innerHTML = qe.Avatar_getElapsedTime().toFixed(2);
		document.querySelector('.voNorthEast').innerHTML = qe.Avatar_getIterateSerial();
	}

	// constructor only calls this (?)
	initStats(now) {
		this.iStats = {
			startIteration: now,
			endCalc: now,
			endReloadViewBuffer: now,
			endReloadInputs: now,
			endDraw: now,
			prevStart: now,
		}
	}

	// update the stats, as displayed in the Integration tab
	refreshStats() {
		const p = this.props;

		// given a stat name, value and precision, display it using oldschool DOM
		function show(cName, ms, nDigits = 2) {
			const el = document.querySelector(`#${p.id}.SquishPanel .ControlPanel .SetIterationTab .${cName}`);
			if (el) {
				// hard to see if it's jumping around a lot
				if (!el.iStatAvg)
					el.iStatAvg = ms;
				else
					el.iStatAvg = (ms + 31 * el.iStatAvg) / 32;
				el.innerHTML = el.iStatAvg.toFixed(nDigits);  // only if it's showing
			}
		}

		const st = this.iStats;
		show('iterationCalcTime', st.endCalc - st.startIteration);
		show('reloadViewBuffers', st.endReloadViewBuffer - st.endCalc);
		show('reloadGlInputs', st.endReloadInputs - st.endReloadViewBuffer);
		show('drawTime', st.endDraw - st.endReloadInputs);
		show('totalForIteration', st.endDraw - st.startIteration);
		const period = st.startIteration - st.prevStart;
		show('iterationPeriod', period);
		show('iterationsPerSec', Math.round(1000 / period), 0)
	}

	/* ******************************************************* iteration & animation */

	// do one integration iteration
	crunchOneIteration() {
		// (actually many visscher steps)
		qe.Avatar_oneIteration();

		if (dumpingTheViewBuffer)
			this.dumpViewBuffer('crunchOneIteration()');
	}

	// Integrate the ODEs by one 'iteration', or not.  and then display.
	// called every so often in animateHeartbeat() so it's called as often as the menu setting says
	// so if needsRepaint false or absent, it'll only repaint if an iteration has been done.
	iterateOneIteration(isTimeAdvancing, needsRepaint) {
		//console.log(`time since last tic: ${now - startIteration}ms`)
// 		this.endCalc = this.startReloadViewBuffer = this.endReloadViewBuffer =
// 			this.endIteration = 0;
		this.iStats.startIteration = performance.now();  // absolute beginning of integrate iteration
		// could be slow.
		if (isTimeAdvancing) {
			this.crunchOneIteration();
			needsRepaint = true;
		}
		this.iStats.endCalc = performance.now();

		// if we need to repaint... if we're iterating, if the view says we have to,
		// or if this is a one shot step
		this.iStats.endReloadViewBuffer = this.iStats.endReloadInputs = this.iStats.endDraw = performance.now();
		if (needsRepaint) {
			// this is kinda cheating, but the effectiveView in the state takes some time to
			// get set; but we need it immediately.  So we also set it as a variable on this.
			const curView = this.effectiveView || this.state.effectiveView;

			curView.reloadAllVariables();

			// copy from latest wave to view buffer (c++)
			qe.qViewBuffer_getViewBuffer();
			this.iStats.endReloadViewBuffer = performance.now();

			// draw
			curView.setInputsOnDrawings();
			this.iStats.endReloadInputs = performance.now();

			curView.drawAllDrawings();
			// populate the frame number and elapsed pseudo-time
			this.showTimeNIteration();
			this.iStats.endDraw = performance.now();

		}

		// print out per-iteration benchmarks
		if (areBenchmarking) {
			console.log(`times:\n`+
				`iteration calc time:     ${(this.iStats.endCalc - this.iStats.startIteration).toFixed(2)}ms\n`+
				`reloadViewBuffers:     ${(this.iStats.endReloadViewBuffer - this.iStats.endCalc).toFixed(2)}ms\n`+
				`reload GL variables:     ${(this.iStats.endReloadInputs - this.iStats.endReloadViewBuffer).toFixed(2)}ms\n`+
				`draw:   ${(this.iStats.endDraw - this.iStats.endReloadInputs).toFixed(2)}ms\n`+
				`total for iteration:  ${(this.iStats.endDraw - this.iStats.startIteration).toFixed(2)}ms\n` +
				`period since last:  ${(this.iStats.startIteration - this.iStats.prevStart).toFixed(2)}ms\n`);
		}
		this.refreshStats();
		this.iStats.prevStart = this.iStats.startIteration;

		this.continueRunningOneCycle();
	}


	// This gets called once each animation period according to requestAnimationFrame(), usually 60/sec
	// and maintaining that as long as the website is running.  Even if there's no apparent motion.
	// it will advance one heartbeat in animation time, which every so often calls iterateOneIteration()
	animateHeartbeat(now) {
		const s = this.state;

		// no matter how often animateHeartbeat() is called, it'll only iterate once in the iteratePeriod
		if (now >= this.timeForNextTic) {
			// no point in calling it continuously if it's not doing anything
			if (s.isTimeAdvancing)
				this.iterateOneIteration(true, true);
			//this.iterateOneIteration(s.isTimeAdvancing, false);

			// remember (now) is the one passed in, before iterateOneIteration(),
			// so periods are exactly timed (unless it's so slow that we get behind)
			this.timeForNextTic = now + s.iteratePeriod;
		}

		// this is in milliseconds
		const timeSince = now - this.lastAniIteration;
//		if (timeSince < 8) {
//			console.info(` skipping an ani frame cuz we got too much: ${timeSince} ms`)
//			return;  // we might have more than one cycle in here... this should fix it
//		}

		if (isNaN(timeSince)) debugger;
		//console.info(` maintaining the ReqAniFra cycle: ${timeSince.toFixed(1)} ms`)
		this.lastAniIteration = now;

		requestAnimationFrame(this.animateHeartbeat);
	}
	animateHeartbeat = this.animateHeartbeat.bind(this);  // so we can pass it as a callback

	/* ******************************************************* runningOneCycle */

	// use for benchmarking with a circular wave.  Will start iteration, and stop after
	// the leftmost state is at its peak.  Then display stats.

	// button handler
	startRunningOneCycle() {
		if (!this.allowRunningOneCycle) return;
		this.runningOneCycle = true;
		this.runningCycleStartingTime = qe.Avatar_getElapsedTime();
		this.runningCycleStartingSerial = qe.Avatar_getIterateSerial();
		this.startIterating();
	}
	startRunningOneCycle = this.startRunningOneCycle.bind(this);

	// manage runningOneCycle - called each iteration
	continueRunningOneCycle() {
		if (!this.allowRunningOneCycle) return
		//debugger;
		if (this.runningOneCycle) {
			// get the real compoment of the first (#1) value of the wave
			const real0 = this.state.space.wave[2];

			if (real0 < this.prevReal0) {
				// we're going down - first half of the cycle
				if (this.goingUp) {
					// if we were going up, we've gone just 1 dt past the peak.  Good time to stop.
					this.runningOneCycle = false;

					this.stopIterating();

					this.setState({
						runningCycleElapsedTime: qe.Avatar_getElapsedTime() - this.runningCycleStartingTime,
						runningCycleIterateSerial: qe.Avatar_getIterateSerial() - this.runningCycleStartingSerial,
					});

					this.goingDown = false;
					this.goingUp = false;
				}
				else {
					this.goingDown = true;
					this.goingUp = false;
				}
			}
			else {
				// we're going up - second half.  Watch out for the switchover
				this.goingDown = false;
				this.goingUp = true;
			}

			this.prevReal0 = real0;
		}
	}

	renderRunningOneCycle() {
		if (!this.allowRunningOneCycle) return '';
		const s = this.state;

		// you can turn this on in the debugger anytime
		return <div className='runningOneCycle' style={{display: 'block'}}>
			<span>total iterations: {s.runningCycleIterateSerial.toFixed(0)} &nbsp;
				elapsed vtime: {s.runningCycleElapsedTime.toFixed(3)} &nbsp;</span>
			<button onClick={this.startRunningOneCycle}>start running 1 cycle</button>
		</div>
	}

	/* ******************************************************* control panel settings */

	// set the frequency of iteration frames.  Does not control whether iterating or not.
	setIterateFrequency(newFreq) {
		this.setState({iteratePeriod: 1000. / +newFreq});
	}

	startIterating() {
		if (this.state.isTimeAdvancing)
			return;

		//this.onceMore = false;
		this.setState({isTimeAdvancing: true});
	}

	stopIterating() {
		if (!this.state.isTimeAdvancing)
			return;

		//this.onceMore = false;
		this.setState({isTimeAdvancing: false});
	}

	startStop() {
		if (this.state.isTimeAdvancing)
			this.stopIterating();
		else
			this.startIterating();
	}
	startStop = this.startStop.bind(this);

	singleIteration() {
		this.iterateOneIteration(true);
	}
	singleIteration = this.singleIteration.bind(this);

	resetCounters(ev) {
		qe.Avatar_resetCounters();
		this.showTimeNIteration();
	}
	resetCounters = this.resetCounters.bind(this);

	/* ******************************************************* user settings */

	setDt = dt => {
		this.setState({dt});
		qe.Avatar_setDt(dt);
		if (typeof storeSettings != 'undefined')  // goddamned bug in importing works in constructor
			storeSettings.iterationSettings.dt = dt;
	}
	//setDt = this.setDt.bind(this);

	setStepsPerIteration = stepsPerIteration => {
		console.info(`js setStepsPerIteration(${stepsPerIteration})`)
		this.setState({stepsPerIteration});
		qe.Avatar_setStepsPerIteration(stepsPerIteration);
		if (typeof storeSettings != 'undefined')  // goddamned bug in importing works in constructor
			storeSettings.iterationSettings.stepsPerIteration = stepsPerIteration;
	}
	//setStepsPerIteration = this.setStepsPerIteration.bind(this);

	// sets the LPF in both SPanel state AND in the C++ area
	setLowPassFilter = lowPassFilter => {
		console.info(`js setLowPassFilter(${lowPassFilter})`)
		this.setState({lowPassFilter});
		qe.Avatar_setLowPassFilter(lowPassFilter);
		if (typeof storeSettings != 'undefined')  //  goddamned bug in importing works in constructor
			storeSettings.iterationSettings.lowPassFilter = lowPassFilter;
	}
	//setLowPassFilter = this.setLowPassFilter.bind(this);

	// completely wipe out the ???? wavefunction and replace it with one of our canned waveforms.
	// (but do not change N or anything in the state)  Called upon setWave in wave tab
	setWave = waveParams => {
// 		const wave = qe.Avatar_getWaveBuffer();
		const qewave = this.state.space.qewave;
		qewave.setFamiliarWave(waveParams);  // wait - qeSpace does this too
		this.iterateOneIteration(true, true);  // ?? take  this out
		//this.iterateOneIteration(false, true);
		//qe.qViewBuffer_getViewBuffer();
		//qe.createQEWaveFromCBuf();
	}
	//setWave = this.setWave.bind(this);

	// completely wipe out the quantum potential and replace it with one of our canned waveforms.
	// (but do not change N or anything in the state)  Called upon set potential in potential tab
	setPotential = potentialParams => {
		setFamiliarPotential(this.state.space, this.state.space.potentialBuffer, potentialParams);
		this.iterateOneIteration(true, true);  // ???  take this out
		if (dumpingTheViewBuffer)
			qe.qViewBuffer_getViewBuffer();

// 		switch (breed) {
// 		case 'zero':
// 			qe.qSpace_setZeroPotential()
// 			break;
//
// 		case 'valley':
// 			qe.qSpace_setValleyPotential(+arg1, +arg2, +arg3);
// 			break;
//
// 		default:
// 			throw `setPotential: no voltage breed '${breed}'`
// 		}
	}
	//setPotential = this.setPotential.bind(this);

	// dump the view buffer, from the JS side.  Why not use the C++ version?
	dumpViewBuffer(title = '') {
		const s = this.state;
		let nRows = s.space.nPoints * 2;
		let vb = s.space.vBuffer;
		const _ = (f) => f.toFixed(3).padStart(6);
		console.log(`dump of view buffer '${title}' for ${s.space.nPoints} points in ${nRows} rows`);
		for (let i = 0; i < nRows; i++)
			console.log(_(vb[i*4]), _(vb[i*4+1]), _(vb[i*4+2]), _(vb[i*4+3]));
	}


	/* ******************************************************* rendering */

	render() {
		const p = this.props;
		const s = this.state;

			// potentialParams={defaultPotentialParams}
			// waveParams={defaultWaveParams}

		return (
			<div id={this.props.id} className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView
					viewClassName={s.mainViewClassName}
					viewName='main view'
					setEffectiveView={this.setEffectiveView}
					createdSpacePromise={this.createdSpacePromise}
					width={p.width}
				/>
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog()}
					space={s.space}
					N={this.state.N}

					iterateAnimate={(shouldAnimate, freq) => this.iterateAnimate(shouldAnimate, freq)}
					isTimeAdvancing={s.isTimeAdvancing}
					startStop={this.startStop}
					singleIteration={this.singleIteration}
					resetCounters={this.resetCounters}

					setWave={this.setWave}

					setPotential={this.setPotential}

					iterateFrequency={1000 / s.iteratePeriod}
					setIterateFrequency={freq => this.setIterateFrequency(freq)}

					dt={s.dt}
					setDt={this.setDt}
					stepsPerIteration={s.stepsPerIteration}
					setStepsPerIteration={this.setStepsPerIteration}
					lowPassFilter={s.lowPassFilter}
					setLowPassFilter={this.setLowPassFilter}

					iStats={this.iStats}
					refreshStats={this.refreshStats}
				/>
				{this.renderRunningOneCycle()}
			</div>
		);
	}
}

export default SquishPanel;

