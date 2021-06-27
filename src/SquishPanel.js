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



const makeSureTheyreAllImported = {flatViewDef,  abstractViewDef,      manualViewDef,     viewVariableViewDef};
const DEFAULT_VIEW_CLASS_NAME =
//'manualViewDef';
//'abstractViewDef';
//'viewVariableViewDef';
'flatViewDef';
makeSureTheyreAllImported[0] = 'use me';

const DEFAULT_RESOLUTION = 5;
const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;


// this will appear in the resolution dialog
export const listOfViewClassNames = {};


export class SquishPanel extends React.Component {
	static propTypes = {
		token: PropTypes.number,
		////showResolutionDialog: PropTypes.func.isRequired,
	};

	// if you subclass abstractViewDef, call this to join the 'in' crowd
	// and be listed
	static addMeToYourList(aViewClass) {
		listOfViewClassNames[aViewClass.name] = aViewClass;
	}

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

		// although these are, in a sense, 'state', changes don't cause a re-rendering
		// (ie react) of the canvas; just a redrawing of its contents (ie webgl)
		this.curUnitHeight = 1;  // always what's displayed
		this.targetUnitHeight = 1;  // always a power of 2; only changes cuz highest

		// never changes once set
		this.canvas = null;

		// runtime debugging flags
		this.areBenchmarking = false;
		this.dumpingTheViewBuffer = false;
		if (this.areBenchmarking)
			this.prevStart  = performance.now();


		console.log(`SquishPanel constructor done`);
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

			// kinda paranoid?
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

			// success callback
			finalParams => {
				this.setNew1DResolution(
					finalParams.N, finalParams.continuum, finalParams.viewClassName);
				this.setState({isTimeAdvancing: timeWasAdvancing});
			},

			// failure callback
			() => {
				this.setState({isTimeAdvancing: timeWasAdvancing});
			}
		)
	}

	/* ******************************************************* iteration & animation */

	// the name says it all.  requestAnimationFrame() will call this probably 60x/sec
	// it will advance one 'frame' in wave time, which i dunno what that is need to tihink about it more.
	animateOneFrame(now) {
		const s = this.state;

		//console.log(`time since last tic: ${now - startFrame}ms`)
		let startRK = 0, startUpdate = 0, startReload = 0, startDraw = 0, endFrame = 0;
		const areBenchmarking = this.areBenchmarking;

		// could be slow.  sometime in the future.
		if (areBenchmarking) startRK = performance.now();
		if (s.isTimeAdvancing) {
			qe.qSpace_oneRk2Step();
			qe.updateToLatestWaveBuffer();

			if (areBenchmarking) startUpdate = performance.now();
			let highest = qe.updateViewBuffer();
			if (this.dumpingTheViewBuffer) this.dumpViewBuffer();

			// adjust our unit height?
			const highestHeight = highest * this.targetUnitHeight;
			if (highestHeight > 1.)
				this.targetUnitHeight /= 2;
			else if (highestHeight < .25)
				this.targetUnitHeight *= 2;
		}

		// if we need to repaint...
		if (s.isTimeAdvancing || this.curUnitHeight != this.targetUnitHeight || this.onceMore) {
			if (areBenchmarking) startReload = performance.now();
			qe.theCurrentView.viewVariables.forEach(v => v.reloadVariable());
			//qe.theCurrentView.viewVariables[0].reloadVariable();

			if (areBenchmarking) startDraw = performance.now();
			qe.theCurrentView.draw(this.curUnitHeight);

			endFrame = performance.now();
			if (areBenchmarking) {
				console.log(`times:\n`+
					`RK:     ${(startUpdate - startRK).toFixed(2)}ms\n`+
					`up:     ${(startReload - startUpdate).toFixed(2)}ms\n`+
					`reload: ${(startDraw - startReload).toFixed(2)}ms\n`+
					`draw:   ${(endFrame - startDraw).toFixed(2)}ms\n`+
					`total:  ${(endFrame - startRK).toFixed(2)}ms\n\n` +
					`period:  ${(startRK - this.prevStart).toFixed(2)}ms\n`);
				this.prevStart = startRK;
			}

			if (this.onceMore)
				this.setState({isTimeAdvancing: false});
			this.onceMore = false;

			if (this.curUnitHeight != this.targetUnitHeight) {
				// exponential relaxation
				this.curUnitHeight = (15 * this.curUnitHeight + this.targetUnitHeight) / 16;
				if (Math.abs((this.curUnitHeight - this.targetUnitHeight) / this.targetUnitHeight) < .01) {
					//ok we're done.  close enough.
					this.curUnitHeight = this.targetUnitHeight;
					//this.onceMore = true;  // just to make sure it paints
				}
			}
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
		this.onceMore = true;
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
