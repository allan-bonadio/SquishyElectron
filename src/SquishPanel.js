/*
** squish panel -- like a self-contained quantum system, including space,
** 				waves, and drawings and interactivity.
*/
import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './controlPanel/ControlPanel';

import {createSpaceNWave} from './wave/theWave';
import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
import qe from './wave/qe';

import SquishView from './view/SquishView';
import ResolutionDialog from './ResolutionDialog';

// must make sure somebody imports all of them
import abstractViewDef from './view/abstractViewDef';
import manualViewDef from './view/manualViewDef';
import viewVariableViewDef from './view/viewVariableViewDef';
import flatViewDef from './view/flatViewDef';
import flatDrawingViewDef from './view/flatDrawingViewDef';
import drawingViewDef from './view/drawingViewDef';


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

const DEFAULT_RESOLUTION = process.env.MODE ? 100 : 5;
const DEFAULT_CONTINUUM = qeSpace.contENDLESS;



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

			space: null,
			currentView: null,

			// this is controlled by the user (start/stop/step buttons)
			// does not really influence the rendering of the canvas... (other than running)
			// but more the control panel
			isTimeAdvancing: false,

			// this is the actual 'frequency' in actual milliseconds, convert between like 1000/n
			iteratePeriod: 250,
		};

		this.timeClock = 0;
		this.iterateSerial = 0;

		// never changes once set
		this.canvas = null;

		// runtime debugging flags
		this.areBenchmarking = false;
		this.dumpingTheViewBuffer = false;
		const now = performance.now();
		this.prevStart  = now;

		this.timeForNextTic = now + 10;
		this.lastAniFrame = now;

		console.log(`SquishPanel constructor done`);
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
		createSpaceNWave(N, continuum, space => {

			// now create the view class instance as described by the space
			const vClass = listOfViewClassNames[viewClassName];
			if (! vClass)
				throw `no vClass! see for yerself! ${JSON.stringify(listOfViewClassNames)}`;

			const currentView = new vClass('main view', this.canvas, space);
			currentView.completeView();

			this.timeClock = 0;
			this.iterateSerial = 0;

			// we've now got a qeSpace etc all set up
			this.setState({N, continuum, space, currentView});
			this.currentView = currentView;  // this gets set sooner

			// kinda paranoid?  this should be deprecated.
			qe.theCurrentView = currentView;
		});
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


	// take one RK integration step
	crunchOneFrame() {
		qe.qSpace_oneRk2Step();
		qe.updateToLatestWaveBuffer();

		this.startUpdate = performance.now();
		let highest = qe.updateViewBuffer();
		this.curView.reloadAllVariables();  // am i doing this twice?

		const s = this.state;
		this.iterateSerial++;
		this.timeClock += .43;

		if (this.dumpingTheViewBuffer)
			this.dumpViewBuffer();

		// adjust our unit height?
		//const highestHeight = highest * this.targetUnitHeight;
		//if (highestHeight > 1.)
		//	this.targetUnitHeight /= 2;
		//else if (highestHeight < .25)
		//	this.targetUnitHeight *= 2;

	}

	// Integrate the ODEs by one dt, and display.  One step in Squishy, one trip thru the RK and variables and draw.
	// called every so often in animateOneFrame() which goes like 1/60 sec
	// this is called usually more like 5 or 20 times a second, whatever the user chooses.
	iterateOneFrame(isTimeAdvancing, needsRepaint) {
		const s = this.state;

		//console.log(`time since last tic: ${now - startFrame}ms`)
		this.startRK = this.startUpdate = this.startReload = this.startDraw = this.endFrame = 0;
		const areBenchmarking = this.areBenchmarking;

		// could be slow.  sometime in the future.
		this.startRK = performance.now();
		if (isTimeAdvancing) {
			this.crunchOneFrame();
		}

		// if we need to repaint... if we're iterating, if the view says we have to,
		// or if this is a one shot step
		if (isTimeAdvancing || needsRepaint) {
			// reload all variables
			this.startReload = performance.now();
			this.curView.reloadAllVariables();  // am i doing this twice?

			// am i missing a step in here?

			// draw
			this.startDraw = performance.now();
			qe.theCurrentView.draw();

			// print out benchmarks
			this.endFrame = performance.now();
			if (areBenchmarking) {
				console.log(`times:\n`+
					`RK:     ${(this.startUpdate - this.startRK).toFixed(2)}ms\n`+
					`up:     ${(this.startReload - this.startUpdate).toFixed(2)}ms\n`+
					`reload: ${(this.startDraw - this.startReload).toFixed(2)}ms\n`+
					`draw:   ${(this.endFrame - this.startDraw).toFixed(2)}ms\n`+
					`total:  ${(this.endFrame - this.startRK).toFixed(2)}ms\n\n` +
					`period:  ${(this.startRK - this.prevStart).toFixed(2)}ms\n`);
				this.prevStart = this.startRK;
			}

			//if (this.onceMore)
			//	this.setState({isTimeAdvancing: false});
			//this.onceMore = false;

			//if (this.curUnitHeight != this.targetUnitHeight) {
			//	// exponential relaxation
			//	this.curUnitHeight = (15 * this.curUnitHeight + this.targetUnitHeight) / 16;
			//	if (Math.abs((this.curUnitHeight - this.targetUnitHeight) / this.targetUnitHeight) < .01) {
			//		//ok we're done.  close enough.
			//		this.curUnitHeight = this.targetUnitHeight;
			//		//this.onceMore = true;  // just to make sure it paints
			//	}
			//}
		}
	}

	// This is responsible for getting called once each animation frame according to requestAnimationFrame,
	// and maintaining that as long as the website is running.  requestAnimationFrame() will call this probably 60x/sec
	// it will advance one 'frame' in animation time, which every so often calls iterateOneFrame()
	animateOneFrame(now) {
		const s = this.state;

		// nomatter how often animateOneFrame() is called, it'll only iterate once in the iteratePeriod
		if (now >= this.timeForNextTic) {
			this.iterateOneFrame(s.isTimeAdvancing);

			// remember (now) is the one passed in, before iterateOneFrame(), not really 'now' anymore
			this.timeForNextTic = now + s.iteratePeriod;
		}

		//if (this.onceMore)
		//	this.setState({isTimeAdvancing: false});
		//this.onceMore = false;

			//if (this.curUnitHeight != this.targetUnitHeight) {
			//	// exponential relaxation
			//	this.curUnitHeight = (15 * this.curUnitHeight + this.targetUnitHeight) / 16;
			//	if (Math.abs((this.curUnitHeight - this.targetUnitHeight) / this.targetUnitHeight) < .01) {
			//		//ok we're done.  close enough.
			//		this.curUnitHeight = this.targetUnitHeight;
			//		//this.onceMore = true;  // just to make sure it paints
			//	}
			//}
		//}

		// this is in milliseconds
		const timeSince = now - this.lastAniFrame;
//		if (timeSince < 8) {
//			console.info(` skipping an ani frame cuz we got too much: ${timeSince} ms`)
//			return;  // we might have more than one cycle in here... this should fix it
//		}

		if (isNaN(timeSince)) debugger;
		//console.info(` maintaining the ReqAniFra cycle: ${timeSince.toFixed(1)} ms`)
		this.lastAniFrame = now;

		requestAnimationFrame(now => this.animateOneFrame(now));
	}

	/* ******************************************************* UI & user actions */

	// start/stop or single step the animation
	// shouldAnimate falsy = stop it if running
	// true = start it or continue it if running
	// freq is how fast it goes, or 'one' to single step.
	// I guess it's irrelevant now with requestAnimationFrame()
	iterateAnimate(shouldAnimate, freq) {
		if (! shouldAnimate || ! freq || !qe.theCurrentView) {
			//this.onceMore = false;
			this.setState({isTimeAdvancing: false});
			return;
		}
		if (freq == 'one') {
			//this.onceMore = true;
			this.setState({isTimeAdvancing: true});
			return;
		}

		//this.onceMore = false;
		if (this.state.isTimeAdvancing)
			return;  // its already doing it

		this.setState({isTimeAdvancing: true});

		this.animateOneFrame(performance.now());
	//	requestAnimationFrame(animateOneFrame);
	}

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

	singleStep() {
		this.iterateOneFrame(true);
		//this.onceMore = true;  // will stop iterating after next frame
		//this.setState({isTimeAdvancing: true});
	}

	// completely wipe out the Psi wavefunction and replace it with one of our canned waveforms.
	// (but do not change N)
	setWave(breed, freq) {
		switch (breed) {
		case 'standing':
			qe.qWave_setStandingWave(freq);
			break;

		case 'circular':
			qe.qWave_setCircularWave(freq);
			break;

		case 'pulse':
			qe.qWave_setPulseWave(10., 1.)
			break;

		default:
			throw `setWave: no jWave breed '${breed}'`
		}

		this.iterateOneFrame(false, true);
	}

	setPotential(breed, arg1 = 1, arg2 = 1, arg3 = 0) {
		switch (breed) {
		case 'zero':
			qe.qSpace_setZeroPotential()
			break;

		case 'valley':
			qe.qSpace_setValleyPotential(arg1, arg2, arg3);
			break;

		default:
			throw `setPotential: no voltage breed '${breed}'`
		}
		this.iterateOneFrame(false, true);
	}

	dumpViewBuffer() {
		const s = this.state;
		let nRows = s.space.nPoints * 2;
		let vb = s.space.viewBuffer;
		const _ = (f) => f.toFixed(3).padStart(6);
		console.log(`dump of view buffer for ${s.space.nPoints} points in ${nRows} rows`);
		for (let i = 0; i < nRows; i++)
			console.log(_(vb[i*4]), _(vb[i*4+1]), _(vb[i*4+2]), _(vb[i*4+3]));
	}

	/* ******************************************************* rendering etc */
	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			qeDefineAccess();

			this.setNew1DResolution(
				DEFAULT_RESOLUTION, DEFAULT_CONTINUUM, DEFAULT_VIEW_CLASS_NAME);

			// this should be the only place animateOneFrame() should be called
			// except for inside the function itself
			this.animateOneFrame(performance.now());

			// use this.currentView rather than state.currentView - we just set it
			// and it takes a while.
			// Make sure you call the new view's domSetup method.
			this.currentView.domSetup(this.canvas);
		}).catch(ex => {
			console.error(`error in SquishPanel.didMount.then:`, ex);
			debugger;
		});

	}

	render() {
		const s = this.state;
		return (
			<div className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog()}
					iterateAnimate={(shouldAnimate, freq) => this.iterateAnimate(shouldAnimate, freq)}
					isTimeAdvancing={s.isTimeAdvancing}
					iterateFrequency={1000 / s.iteratePeriod}
					startIterating={() => this.startIterating()}
					stopIterating={() => this.stopIterating()}
					singleStep={() => this.singleStep()}
					setWave={(breed, freq) => this.setWave(breed, freq)}
					setPotential={(breed, power, scale, offset) => this.setPotential(breed, power, scale, offset)}
					setIterateFrequency={freq => this.setIterateFrequency(freq)}
					timeClock={this.timeClock}
					iterateSerial={this.iterateSerial}
				/>
			</div>
		);

	}
}

export default SquishPanel;

// do these work?  becha not.
//SquishPanel.addMeToYourList(abstractViewDef);
//SquishPanel.addMeToYourList(flatViewDef);
