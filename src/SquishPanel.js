import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './ControlPanel';

import {createSpaceNWave} from './wave/theWave';
import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
import qe from './wave/qe';

import SquishView from './views/SquishView';

import {abstractViewDef, manualViewDef, viewVariableViewDef} from './views/abstractViewDef';
import flatViewDef from './views/flatViewDef';


// flatViewDef  abstractViewDef      manualViewDef     viewVariableViewDef
const DEFAULT_VIEW_CLASS_NAME =
//'flatViewDef';
//'abstractViewDef';
//'viewVariableViewDef';
'manualViewDef';

const DEFAULT_RESOLUTION = 5;
const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;


// this will appear in the resolution dialog
export const listOfViewClasses = {
	// had this been a real webiste, these would have automatically been filled in.
	abstractViewDef, manualViewDef, viewVariableViewDef,
	flatViewDef,
};



export class SquishPanel extends React.Component {
	static propTypes = {
		showResolutionDialog: PropTypes.func.isRequired,
	};

	// if you subclass abstractViewDef, call this to join the 'in' crowd
	static addMeToYourList(aViewClass) {
		listOfViewClasses[aViewClass.viewClassName] = aViewClass;
	}

	static getListOfViews() {
		return listOfViewClasses;
	}

	constructor(props) {
		super(props);

		this.state = {
			// THE N and continuum for THE space we're currently doing
			// stateParams is {N, continuum, viewClassName}.  I'll modularize that somemday
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

			// now create the view class instance as described by the setting
			const vClass = listOfViewClasses[viewClassName];
			//const vClass = listOfViewClasses[currentQESpace.viewClassName];

			if (! vClass)
				alert(`no vClass! see for yerself! ${JSON.stringify(listOfViewClasses)}`);
			else {
				// seems kinda funny doing these all here - but they should work for every view class
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
		this.props.showResolutionDialog(
			{N: s.N, continuum: s.continuum, viewClassName: s.viewClassName}
		)
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			qeDefineAccess();
			setTimeout(() => {
				this.setNew1DResolution(
					DEFAULT_RESOLUTION, DEFAULT_CONTINUUM, DEFAULT_VIEW_CLASS_NAME);
			}, 2000);
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
				/>
			</div>
		);

	}
}

export default SquishPanel;

SquishPanel.addMeToYourList(abstractViewDef);
SquishPanel.addMeToYourList(flatViewDef);


