import React from 'react';
import './App.css';
//import WaveView from './WaveView';
import SquishPanel from './SquishPanel';
//import ControlPanel from './ControlPanel';
import ResolutionDialog from './ResolutionDialog';

import {createStateNWave} from './wave/theWave';
import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
import qe from './wave/qe';

//import SquishView from './views/SquishView';
import abstractViewDef from './views/abstractViewDef';
import flatViewDef from './views/flatViewDef';


const DEFAULT_RESOLUTION = 5;
const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;


//export const listOfViewClassNames = {
//	flatViewDef,  // the original one
//	abstractViewDef,  // primitive dummy, also superclass of all these others
//};


class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			innerWindowWidth: window.innerWidth,

			isResolutionDialogOpen: false,

			// THE N and continuum for THE space we're currently doing
			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,

			currentJWave: null,
			currentQESpace: null,
			currentDraw: null,

			currentView: null,
		};

		this.canvas = null;

		console.log(`App constructor`);
	}

	openResolutionDialog(whetherTo) {
		this.setState({isResolutionDialogOpen: whetherTo});
	}

	setGLCanvas(canvas) {
		this.canvas = canvas;
	}

	setNew1DResolution(N, continuum) {
		qe.theCurrentView =  null;
		createStateNWave(N, continuum, currentQESpace => {
			// we've now got a qeSpace etc all set up
			this.setState({N, continuum, currentQESpace});

			// now create the view class instance as described by the space
			const vClass = listOfViewClassNames[currentQESpace.viewClassName];

			// seems kinda funny doing these all here - but they should work for every view class
			const currentView = new vClass('main view', this.canvas, currentQESpace);
			currentView.completeView();

			this.setState(currentView);
			qe.theCurrentView = currentView;
		});
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			qeDefineAccess();
			this.setNew1DResolution(DEFAULT_RESOLUTION, DEFAULT_CONTINUUM);
		}, (ex) => {
			console.error(`error in qeStartPromise:`, ex);
		});

		// keep track of any window width changes, to reset the svg
		// add listener only executed once
		window.addEventListener('resize', ev => {
			console.log(` window resize ==> `, ev);
			this.setState({innerWindowWidth: ev.currentTarget.innerWidth})
		});
	}


	render() {
		const s = this.state;

		const resDialog = (this.state.isResolutionDialogOpen)
			? <ResolutionDialog
					N={this.state.N}
					continuum={this.state.continuum}
					closeResolutionDialog={() => this.openResolutionDialog(false)}
					setNew1DResolution={(N, continuum) => this.setNew1DResolution(N, continuum)}
			  />
			: null;

		debugger;
		return (
			<div className="App">
				<h2 className="App-header">
					<img className='splatImage' src='splat.png'
						width='100px' alt='squishy icon'/>
					&nbsp; &nbsp;
					Squishy Electron
				</h2>
				{/*}<WaveView N={this.state.N} useQuantumEngine={s.useQuantumEngine}*/}
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishPanel
					openResolutionDialog={() => this.openResolutionDialog(true)} />

				{resDialog}
			</div>
		);

	}
}

export default App;


//				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
//				<ControlPanel
//					openResolutionDialog={() => this.openResolutionDialog(true)}
//				/>
