import React from 'react';
import PropTypes from 'prop-types';

import ControlPanel from './ControlPanel';

import {createStateNWave} from './wave/theWave';
import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
import qe from './wave/qe';

import SquishView from './views/SquishView';
import abstractViewDef from './views/abstractViewDef';
import flatViewDef from './views/flatViewDef';


const DEFAULT_RESOLUTION = 5;
const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;


export const listOfViewClassNames = {
	flatViewDef,  // the original one
	abstractViewDef,  // primitive dummy, also superclass of all these others
};


class SquishPanel extends React.Component {
	constructor(props) {
		super(props);

		debugger;
		this.state = {
			// THE N and continuum for THE space we're currently doing
			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,

			currentQESpace: null,
			currentView: null,
		};

		this.canvas = null;

		console.log(`SquishPanel constructor done`);
	}

	// the canvas per panel, one panel per canvas
	setGLCanvas(canvas) {
		debugger;
		this.canvas = canvas;
		canvas.squishPanel = this;
	}

	setNew1DResolution(N, continuum) {
		debugger;
		qe.theCurrentView =  null;
		createStateNWave(N, continuum, currentQESpace => {
			// we've now got a qeSpace etc all set up
			this.setState({N, continuum, currentQESpace});

			// now create the view class instance as described by the space
			const vClass = listOfViewClassNames[currentQESpace.viewClassName];

			const currentView = new vClass('main view', this.canvas, currentQESpace);
			currentView.completeView();

			this.setState(currentView);

			// kinda paranoid?
			qe.theCurrentView = currentView;
		});
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
	}

	render() {
		const s = this.state;
		let resDialog = null;  // what's this supposed to be?


		debugger;
		return (
			<div className="SquishPanel">
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
				<ControlPanel

				/>

				{resDialog}
			</div>
		);

	}
}

export default SquishPanel;

