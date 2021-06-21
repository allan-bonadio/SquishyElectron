import React from 'react';
import './App.css';
//import WaveView from './WaveView';
//import ControlPanel from './ControlPanel';
import ResolutionDialog from './ResolutionDialog';

// kindof superfluous
import SquishPanel, {listOfViewClasses} from './SquishPanel';

//import {createSpaceNWave} from './wave/theWave';
//import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
//import qe from './wave/qe';

//import SquishView from './views/SquishView';
//import abstractViewDef from './views/abstractViewDef';
//import flatViewDef from './views/flatViewDef';


//const DEFAULT_RESOLUTION = 5;
//const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;
//
//
//export const listOfViewClasses = {
//	flatViewDef,  // the original one
//	abstractViewDef,  // primitive dummy, also superclass of all these others
//};


class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			innerWindowWidth: window.innerWidth,

			isResolutionDialogOpen: false,
			stateParams: {
//N: DEFAULT_RESOLUTION,
//continuum: DEFAULT_CONTINUUM,

//currentQESpace: null,
//
//currentView: null,


			},

			// THE N and continuum for THE space we're currently doing

		};

		this.canvas = null;

		console.log(`App constructor`);
	}

	// stateParams is {N, continuum, viewClassName}
	// this is kindof what you need to start up a dialog: the input arguments.
	// I guess we use a default if its null?  No, this function not meant for anybody but
	// SquishPanel, just pass it the arguments and walk away
	showResolutionDialog(stateParams) {

		// reallyt we have no business messing around with the SquishyPanel's business
		// state params = the input arguments to dialog; otherwise
		// a general dialog system would just pass in some object
		this.setState({isResolutionDialogOpen: true, stateParams});
		this.stateParams = stateParams;
	}
	closeResolutionDialog() {
		this.setState({isResolutionDialogOpen: false, stateParams: null});
		this.stateParams = null;
	}

//	setGLCanvas(canvas) {
//		this.canvas = canvas;
//	}

//	setNew1DResolution(N, continuum) {
//		qe.theCurrentView =  null;
//		createSpaceNWave(N, continuum, currentQESpace => {
//			// we've now got a qeSpace etc all set up
//			this.setState({N, continuum, currentQESpace});
//
//			// now create the view class instance as described by the space
//			const vClass = listOfViewClasses[currentQESpace.viewClassName];
//
//			// seems kinda funny doing these all here - but they should work for every view class
//			const currentView = new vClass('main view', this.canvas, currentQESpace);
//			currentView.completeView();
//
//			this.setState(currentView);
//			qe.theCurrentView = currentView;
//		});
//	}
//					setNew1DResolution={(N, continuum) => this.setNew1DResolution(N, continuum)}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// keep track of any window width changes, to reset the svg
		// add listener only executed once
		window.addEventListener('resize', ev => {
			console.log(` window resize ==> `, ev);
			this.setState({innerWindowWidth: ev.currentTarget.innerWidth})
		});
	}


	render() {
		const s = this.state;
		const stateParams = this.stateParams || this.state.stateParams;
		const resDialog = (this.state.isResolutionDialogOpen && stateParams)
			? <ResolutionDialog
					stateParams={stateParams}
					closeResolutionDialog={() => this.closeResolutionDialog()}
			  />
			: null;

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
					showResolutionDialog={stateParams => this.showResolutionDialog(stateParams)}
					stateParams={this.stateParams} />

				{resDialog}
			</div>
		);

	}
}

export default App;


//				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
//				<ControlPanel
//					showResolutionDialog={() => this.showResolutionDialog(true)}
//				/>
