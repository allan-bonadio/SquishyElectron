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

import abstractViewDef from './view/abstractViewDef';
import manualViewDef from './view/manualViewDef';
import viewVariableViewDef from './view/viewVariableViewDef';
import flatViewDef from './view/flatViewDef';

import ResolutionDialog from './ResolutionDialog';


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

	constructor(props) {
		super(props);

		this.state = {
			// THE N and continuum for THE space we're currently doing
			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,
			viewClassName: DEFAULT_VIEW_CLASS_NAME,

			currentQESpace: null,
			currentView: null,
		};

		this.canvas = null;

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
		createSpaceNWave(N, continuum, currentQESpace => {
			// we've now got a qeSpace etc all set up
			this.setState({N, continuum, currentQESpace});

			// now create the view class instance as described by the space
			const vClass = listOfViewClassNames[viewClassName];


			if (! vClass)
				alert(`no vClass! see for yerself! ${JSON.stringify(listOfViewClassNames)}`);
			else {

				const currentView = new vClass('main view', this.canvas, currentQESpace);
				currentView.completeView();

				this.setState(currentView);

				// kinda paranoid?
				qe.theCurrentView = currentView;
			}
		});
	}

	// puts up the resolution dialog, starting with the values from this.state
	openResolutionDialog() {
		const s = this.state;
		// pass our state upward to load into the dialog
		ResolutionDialog.openDialog(
			{N: s.N, continuum: s.continuum, viewClassName: s.viewClassName},
			stateParams => this.setNew1DResolution(
				stateParams.N, stateParams.continuum, stateParams.viewClassName),
			() => {debugger}
		)
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			qeDefineAccess();

			this.setNew1DResolution(
				DEFAULT_RESOLUTION, DEFAULT_CONTINUUM, DEFAULT_VIEW_CLASS_NAME);
		}).catch(ex => {
			console.error(`error in SquishPanel.didMount.then:`, ex);
			debugger;
		});

	}

	render() {
//		const s = this.state;

		return (
			<div className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog()}
				/>
			</div>
		);

	}
}

export default SquishPanel;

// do these work?  becha not.
//SquishPanel.addMeToYourList(abstractViewDef);
//SquishPanel.addMeToYourList(flatViewDef);
