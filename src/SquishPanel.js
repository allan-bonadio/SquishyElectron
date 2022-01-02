/*
** squish panel -- like a self-contained quantum system, including space,
** 				waves, and drawings and interactivity.
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './controlPanel/ControlPanel';

// eslint-disable-next-line no-unused-vars
import {qeBasicSpace, qeSpace} from './wave/qeSpace';
// import qeWave from './wave/qeWave';
import {qeStartPromise} from './wave/qEngine';
import qe from './wave/qe';

import SquishView from './view/SquishView';
import ResolutionDialog from './controlPanel/ResolutionDialog';

// must make sure somebody imports all of them
import abstractViewDef from './view/abstractViewDef';
import manualViewDef from './view/manualViewDef';
import viewVariableViewDef from './view/viewVariableViewDef';
import flatViewDef from './view/flatViewDef';
import flatDrawingViewDef from './view/flatDrawingViewDef';
import drawingViewDef from './view/drawingViewDef';

import {setFamiliarPotential} from './widgets/utils';

// runtime debugging flags - you can change in the debugger or here
let areBenchmarking = false;
let dumpingTheViewBuffer = false;



// unfortunately, we hafe to have a list of all the view types.  here.
// this will appear in the resolution dialog
export const listOfViewClassNames = {
	manualViewDef, abstractViewDef, viewVariableViewDef,
	flatViewDef,

	drawingViewDef,
	flatDrawingViewDef, };


const DEFAULT_VIEW_CLASS_NAME =
//'manualViewDef';
//'abstractViewDef';
//'viewVariableViewDef';
//'flatViewDef';
//'flatViewDef';
'flatDrawingViewDef';

//const DEFAULT_RESOLUTION = 100;
const DEFAULT_RESOLUTION = 5;
//const DEFAULT_RESOLUTION = 25;
//const DEFAULT_RESOLUTION = process.env.MODE ? 100 : 25;
const DEFAULT_CONTINUUM = qeBasicSpace.contENDLESS;

const defaultWaveParams = {
	waveBreed: 'circular',
	waveFrequency: 1,
	stdDev: 8,
	pulseOffset: 30,
};

const defaultPotentialParams = {
	potentialBreed: 'flat',
	valleyPower: 1,
	valleyScale: 1,
	valleyOffset: 50,
};

export class SquishPanel extends React.Component {
	static propTypes = {
		token: PropTypes.number,
		////showResolutionDialog: PropTypes.func.isRequired,
	};

	// if you subclass abstractViewDef, call this to join the 'in' crowd
	// and be listed
	//static addMeToYourList(aViewClass) {
	//listOfViewClassNames[aViewClass.viewClassName] = aViewClass;
	//}

	static getListOfViews() {
		return listOfViewClassNames;
	}

	/* ************************************************ construction & reconstruction */
	constructor(props) {
		super(props);

		this.state = {
			// THE N and continuum for THE space we're currently doing
			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,
			viewClassName: DEFAULT_VIEW_CLASS_NAME,

			// the qeSpace
			space: null,  // set in setNew1DResolution()
			// space: new qeSpace([{
			// 	N: DEFAULT_RESOLUTION,
			// 	continuum: qeBasicSpace.contENDLESS,
			// 	label: 'x', coord: 'x'
			// }]),

			// see the view dir
			currentView: null,

			// this is controlled by the user (start/stop/step buttons)
			// does not really influence the rendering of the canvas... (other than running)
			isTimeAdvancing: false,

			// this is the actual 'frequency' in actual milliseconds, convert between like 1000/n
			// eg the menu on the CPToolbar says 10/sec, so this becomes 100
			iteratePeriod: 50,

			// sliders for dt & spi
			dt: .001,
			stepsPerIteration: 1000,

			runningCycleElapsedTime: 0,
			runningCycleElapsedSerial: 0,
		};

		// never changes once set
		this.canvas = null;

		// ticks and benchmarks
		const now = performance.now();
		this.prevStart  = now;
		this.timeForNextTic = now + 10;  // default so we can get rolling
		this.lastAniFrame = now;

		console.log(`SquishPanel constructor done`);
	}

	/* ******************************************************* space & wave creation */
	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			// done in qEngine qeDefineAccess();

			this.setNew1DResolution(
				DEFAULT_RESOLUTION, DEFAULT_CONTINUUM, DEFAULT_VIEW_CLASS_NAME);

			// vital properties of the space
			qe.qSpace_setDt(this.state.dt);
			qe.qSpace_setStepsPerIteration(this.state.stepsPerIteration);

			// this should be the only place animateHeartbeat() should be called
			// except for inside the function itself
			this.animateHeartbeat(performance.now());

			// use this.currentView rather than state.currentView - we just set it
			// and it takes a while.
			// Make sure you call the new view's domSetup method.
			this.currentView.domSetup(this.canvas);
		}).catch(ex => {
			console.error(`error in SquishPanel.didMount.then():`, ex.stack || ex.message || ex);
			debugger;
		});

	}

	// this is kinda cheating, but the currentView in the state takes some time to
	// get set; but we need it immediately.  So we also set it as a variable on this.
	get curView() {
		return this.currentView || this.state.currentView;
	}

	// the canvas per panel, one panel per canvas
	setGLCanvas(canvas) {
		// dunno why, but sometimes this is null.  ?#?@?@
		if (! canvas) return;
		this.canvas = canvas;
		canvas.squishPanel = this;
	}

	// init or re-init the space and the panel
	setNew1DResolution(N, continuum, viewClassName) {
		qe.theCurrentView =  null;

		qe.space = new qeSpace([{N, continuum, label: 'x'}], defaultWaveParams, defaultPotentialParams);

		// now create the view class instance as described by the space
		const vClass = listOfViewClassNames[viewClassName];
		if (! vClass)
			throw `no vClass! see for yerself! ${JSON.stringify(listOfViewClassNames)}`;

		const currentView = new vClass('main view', this.canvas, qe.space);
		currentView.completeView();

		// we've now got a qeSpace etc all set up
		this.setState({N, continuum, space: qe.space, currentView});
		this.currentView = currentView;  // this set before the setState finishes

		// kinda paranoid?  this should be deprecated.
		qe.theCurrentView = currentView;
	}

	// puts up the resolution dialog, starting with the values from this.state
	openResolutionDialog() {
		const s = this.state;

		// freeze the iteration while this is going on ... but not if relaxing
		const timeWasAdvancing = s.isTimeAdvancing;
		this.setState({isTimeAdvancing: false});

		// pass our state upward to load into the dialog
		ResolutionDialog.openResolutionDialog(
			{N: s.N, continuum: s.continuum, viewClassName: s.viewClassName},

			// OK callback
			finalParams => {
				this.setNew1DResolution(
					finalParams.N, finalParams.continuum, finalParams.viewClassName);
				this.setState({isTimeAdvancing: timeWasAdvancing});
			},

			// cancel callback
			() => {
				this.setState({isTimeAdvancing: timeWasAdvancing});
			}
		)
	}

	/* ******************************************************* iteration & animation */

	showTimeNIteration() {
		// need them instantaneously - react is too slow
		document.querySelector('.voNorthWest').innerHTML = qe.qSpace_getElapsedTime().toFixed(2);
		document.querySelector('.voNorthEast').innerHTML = qe.qSpace_getIterateSerial();
	}

	// take one integration iteration
	crunchOneFrame() {
		// (actually many visscher steps)
		qe.qSpace_oneIteration();

		//qe.createQEWaveFromCBuf();

		if (dumpingTheViewBuffer)
			this.dumpViewBuffer();
	}

	// Integrate the ODEs by one 'step', or not.  and then display.
	// called every so often in animateHeartbeat() so it's called as often as the menu setting says
	// so if needsRepaint false or absent, it'll only repaint if an iteration has been done.
	iterateOneFrame(isTimeAdvancing, needsRepaint) {
		//console.log(`time since last tic: ${now - startFrame}ms`)
// 		this.endCalc = this.startReloadVarsBuffers = this.endReloadVarsBuffers =
// 			this.endIteration = 0;
		this.startIteration = performance.now();  // absolute beginning of integrate iteration
		// could be slow.
		if (isTimeAdvancing) {
			this.crunchOneFrame();
			needsRepaint = true;
		}
		this.endCalc = performance.now();

		// if we need to repaint... if we're iterating, if the view says we have to,
		// or if this is a one shot step
		this.startReloadVarsBuffers = performance.now();
		if (needsRepaint) {
			// reload all variables
			this.curView.reloadAllVariables();

			// copy from latest wave to view buffer (c++)
			qe.qViewBuffer_getViewBuffer();
			this.endReloadVarsBuffers = performance.now();

			// draw
			qe.theCurrentView.draw();

			// populate the on-screen numbers
			this.showTimeNIteration();
		}
		else {
			this.endReloadVarsBuffers = this.startReloadVarsBuffers;
		}

		// print out per-iteration benchmarks
		this.endIteration = performance.now();
		if (areBenchmarking) {
			console.log(`times:\n`+
				`iteration calc time:     ${(this.endCalc - this.startIteration).toFixed(2)}ms\n`+
				`reload GL variables:     ${(this.endReloadVarsBuffers - this.startReloadVarsBuffers).toFixed(2)}ms\n`+
				`draw:   ${(this.endIteration - this.endReloadVarsBuffers).toFixed(2)}ms\n`+
				`total for iteration:  ${(this.endIteration - this.startIteration).toFixed(2)}ms\n` +
				`period since last:  ${(this.startIteration - this.prevStart).toFixed(2)}ms\n`);
			this.prevStart = this.startIteration;
		}

		this.continueRunningOneCycle();
	}


	// This gets called once each animation period according to requestAnimationFrame(), usually 60/sec
	// and maintaining that as long as the website is running.  Even if there's no apparent motion.
	// it will advance one heartbeat in animation time, which every so often calls iterateOneFrame()
	animateHeartbeat(now) {
		const s = this.state;

		// no matter how often animateHeartbeat() is called, it'll only iterate once in the iteratePeriod
		if (now >= this.timeForNextTic) {
			// no point in calling it continuously if it's not doing anything
			if (s.isTimeAdvancing)
				this.iterateOneFrame(true, true);
			//this.iterateOneFrame(s.isTimeAdvancing, false);

			// remember (now) is the one passed in, before iterateOneFrame(),
			// so periods are exactly timed (unless it's so slow that we get behind)
			this.timeForNextTic = now + s.iteratePeriod;
		}

		// this is in milliseconds
		const timeSince = now - this.lastAniFrame;
//		if (timeSince < 8) {
//			console.info(` skipping an ani frame cuz we got too much: ${timeSince} ms`)
//			return;  // we might have more than one cycle in here... this should fix it
//		}

		if (isNaN(timeSince)) debugger;
		//console.info(` maintaining the ReqAniFra cycle: ${timeSince.toFixed(1)} ms`)
		this.lastAniFrame = now;

		requestAnimationFrame(this.animateHeartbeat);
	}
	animateHeartbeat = this.animateHeartbeat.bind(this);  // so we can pass it as a callback

	/* ******************************************************* runningOneCycle */

	// use for benchmarking with a circular wave.  Will start iteration, and stop after
	// the leftmost state is at its peak.  Then display stats.

	// button handler
	startRunningOneCycle() {
		this.runningOneCycle = true;
		this.runningCycleStartingTime = qe.qSpace_getElapsedTime();
		this.runningCycleStartingSerial = qe.qSpace_getIterateSerial();
		this.startIterating();
	}
	startRunningOneCycle = this.startRunningOneCycle.bind(this);

	// manage runningOneCycle - called each iteration
	continueRunningOneCycle() {
		//debugger;
		if (this.runningOneCycle) {
			// get the real compoment of the first (#1) value of the wave
			const real0 = this.state.space.waveBuffer[2];

			if (real0 < this.prevReal0) {
				// we're going down - first half of the cycle
				if (this.goingUp) {
					// if we were going up, we've gone just 1 dt past the peak.  Good time to stop.
					this.runningOneCycle = false;

					this.stopIterating();

					this.setState({
						runningCycleElapsedTime: qe.qSpace_getElapsedTime() - this.runningCycleStartingTime,
						runningCycleElapsedSerial: qe.qSpace_getIterateSerial() - this.runningCycleStartingSerial,
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
		const s = this.state;

		// you can turn this on in the debugger anytime
		return <div className='runningOneCycle' style={{display: 'block'}}>
			<span>total iterations: {s.runningCycleElapsedSerial.toFixed(0)} &nbsp;
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

	singleStep() {
		this.iterateOneFrame(true);
	}
	singleStep = this.singleStep.bind(this);

	resetCounters(ev) {
		qe.qSpace_resetCounters();
		this.showTimeNIteration();
	}
	resetCounters = this.resetCounters.bind(this);

	/* ******************************************************* user settings */

	setDt(dt) {
		this.setState({dt});
		qe.qSpace_setDt(dt);
	}
	setDt = this.setDt.bind(this);

	setStepsPerIteration(stepsPerIteration) {
		console.info(`js setStepsPerIteration(${stepsPerIteration})`)
		this.setState({stepsPerIteration});
		qe.qSpace_setStepsPerIteration(stepsPerIteration);
	}
	setStepsPerIteration = this.setStepsPerIteration.bind(this);

	// completely wipe out the ψ wavefunction and replace it with one of our canned waveforms.
	// (but do not change N or anything in the state)  Called upon setWave in wave tab
	setWave(waveParams) {
// 		const wave = qe.qSpace_getWaveBuffer();
		const qewave = this.state.space.qewave;
		qewave.setFamiliarWave(waveParams);
		this.iterateOneFrame(true, true);
		//this.iterateOneFrame(false, true);
		//qe.qViewBuffer_getViewBuffer();
		//qe.createQEWaveFromCBuf();
	}
	setWave = this.setWave.bind(this);

	// completely wipe out the quantum potential and replace it with one of our canned waveforms.
	// (but do not change N or anything in the state)  Called upon set potential in potential tab
	setPotential(potentialParams) {
		setFamiliarPotential(this.state.space, this.state.space.potentialBuffer, potentialParams);
		this.iterateOneFrame(true, true);  // ???

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
	setPotential = this.setPotential.bind(this);

	// dump the view buffer, from the JS side.  Why not use the C++ version?
	dumpViewBuffer() {
		const s = this.state;
		let nRows = s.space.nPoints * 2;
		let vb = s.space.viewBuffer;
		const _ = (f) => f.toFixed(3).padStart(6);
		console.log(`dump of view buffer for ${s.space.nPoints} points in ${nRows} rows`);
		for (let i = 0; i < nRows; i++)
			console.log(_(vb[i*4]), _(vb[i*4+1]), _(vb[i*4+2]), _(vb[i*4+3]));
	}



	/* ******************************************************* rendering */

	render() {
		const s = this.state;

		return (
			<div className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
				<ControlPanel
					iterateAnimate={(shouldAnimate, freq) => this.iterateAnimate(shouldAnimate, freq)}
					isTimeAdvancing={s.isTimeAdvancing}
					startStop={this.startStop}
					singleStep={this.singleStep}
					resetCounters={this.resetCounters}

					waveParams={defaultWaveParams}
					setWave={this.setWave}

					potentialParams={defaultPotentialParams}
					setPotential={this.setPotential}

					iterateFrequency={1000 / s.iteratePeriod}
					setIterateFrequency={freq => this.setIterateFrequency(freq)}
					openResolutionDialog={() => this.openResolutionDialog()}
					space={s.space}

					dt={s.dt}
					setDt={this.setDt}
					stepsPerIteration={s.stepsPerIteration}
					setStepsPerIteration={this.setStepsPerIteration}
				/>
				{this.renderRunningOneCycle()}
			</div>
		);
	}
}

export default SquishPanel;

// do these work?  becha not.
//SquishPanel.addMeToYourList(abstractViewDef);
//SquishPanel.addMeToYourList(flatViewDef);
