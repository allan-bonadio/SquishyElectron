/*
** squish panel -- like a self-contained quantum system, including space,
** 				waves, and drawings and interactivity.
*/
import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './ControlPanel';

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
			// does not really influence the rendering of the canvas...
			// but more the control panel
			isTimeAdvancing: false,
		};

		// never changes once set
		this.canvas = null;

		// runtime debugging flags
		this.areBenchmarking = false;
		this.dumpingTheViewBuffer = false;
		if (this.areBenchmarking)
			this.prevStart  = performance.now();


		console.log(`SquishPanel constructor done`);
	}

	// this is kinda cheating, but the currentView in the state takes some time to
	// get set; but we need it immediately.  So we also set it as a variable on this.
	get curView() {
		return this.currentView || this.state.currentView;
	}

	// the canvas per panel, one panel per canvas
	setGLCanvas(canvas) {
		this.canvas = canvas;
		canvas.squishPanel = this;
	}

	// init or re-init the space and the panel
	setNew1DResolution(N, continuum, viewClassName) {
		qe.theCurrentView =  null;
		createSpaceNWave(N, continuum, space => {
			// we've now got a qeSpace etc all set up
			this.setState({N, continuum, space});

			// now create the view class instance as described by the space
			const vClass = listOfViewClassNames[viewClassName];
			if (! vClass)
				throw `no vClass! see for yerself! ${JSON.stringify(listOfViewClassNames)}`;

			const currentView = new vClass('main view', this.canvas, space);
			currentView.completeView();

			this.setState(currentView);
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
		let cView = this.curView;
		//if (cView.reportHighest)
		//	needsRepaint = needsRepaint || cView.ifNeedsPaint(highest);

		if (this.dumpingTheViewBuffer)
			this.dumpViewBuffer();

		// adjust our unit height?
		//const highestHeight = highest * this.targetUnitHeight;
		//if (highestHeight > 1.)
		//	this.targetUnitHeight /= 2;
		//else if (highestHeight < .25)
		//	this.targetUnitHeight *= 2;

	}

	oneFramePerTick: 60;
	howManyTics:0

	// the name says it all.  requestAnimationFrame() will call this probably 60x/sec
	// it will advance one 'frame' in wave time, which i dunno what that
	// is need to tihink about it more.
	animateOneFrame(now) {
		const s = this.state;
		let needsRepaint = false;

		//console.log(`time since last tic: ${now - startFrame}ms`)
		this.startRK = this.startUpdate = this.startReload = this.startDraw = this.endFrame = 0;
		const areBenchmarking = this.areBenchmarking;

		// could be slow.  sometime in the future.
		this.startRK = performance.now();
		if (s.isTimeAdvancing) {
			this.crunchOneFrame();
		}

		// if we need to repaint... if we're iterating, if the view says we have to,
		// or if this is a one shot step
		if (s.isTimeAdvancing || needsRepaint || this.onceMore) {
			// reload all variables
			this.startReload = performance.now();
			let cView = this.curView;
			cView.viewVariables.forEach(v => v.reloadVariable());
			cView.drawings.forEach(dr => {
				dr.viewVariables.forEach(v => v.reloadVariable());
			});

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

			if (this.onceMore)
				this.setState({isTimeAdvancing: false});
			this.onceMore = false;

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

		// harmless if this just falls thru, right?
		//if (isAnimating) {
			requestAnimationFrame(now => this.animateOneFrame(now));
		//}
	}

	// start/stop or single step the animation
	// shouldAnimate falsy = stop it if running
	// true = start it or continue it if running
	// rate is how fast it goes, or 'one' to single step.
	// I guess it's irrelevant now with requestAnimationFrame()
	iterateAnimate(shouldAnimate, rate) {
		// hmmm i'm not using the Rate here...
		if (! shouldAnimate || ! rate || !qe.theCurrentView) {
			this.onceMore = false;
			this.setState({isTimeAdvancing: false});
			return;
		}
		if (rate == 'one') {
			this.onceMore = true;
			this.setState({isTimeAdvancing: true});
			return;
		}

		this.onceMore = false;
		if (this.state.isTimeAdvancing)
			return;  // its already doing it

		this.setState({isTimeAdvancing: true});

		this.animateOneFrame(performance.now());
	//	requestAnimationFrame(animateOneFrame);
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

	startIterating() {
		if (this.state.isTimeAdvancing)
			return;

		this.onceMore = false;
		this.setState({isTimeAdvancing: true});
	}

	stopIterating() {
		if (!this.state.isTimeAdvancing)
			return;

		this.onceMore = false;
		this.setState({isTimeAdvancing: false});
	}

	singleStep() {
		this.onceMore = true;  // will stop iterating after next frame
		this.setState({isTimeAdvancing: true});
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
		return (
			<div className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog()}
					iterateAnimate={(shouldAnimate, rate) => this.iterateAnimate(shouldAnimate, rate)}
					isTimeAdvancing={this.state.isTimeAdvancing}
					startIterating={() => this.startIterating()}
					stopIterating={() => this.stopIterating()}
					singleStep={() => this.startIterating()}
				/>
			</div>
		);

	}
}

export default SquishPanel;

// do these work?  becha not.
//SquishPanel.addMeToYourList(abstractViewDef);
//SquishPanel.addMeToYourList(flatViewDef);
