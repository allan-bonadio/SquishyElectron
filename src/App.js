import React from 'react';
import './App.css';

import SquishPanel from './SquishPanel';
import SquishDialog from './SquishDialog';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			innerWindowWidth: window.innerWidth,

			isDialogShowing: false,
		};

		App.me = this;

		console.log(`App constructor`);
	}

	/* ************************************************ dialog */

	// deprecated
	// stateParams is {N, continuum, viewClassName}
	// this is kindof what you need to start up a dialog: the input arguments.
	// I guess we use a default if its null?  No, this function not meant for anybody but
	// SquishPanel, just pass it the arguments and walk away
//	showResolutionDialog(stateParams, callback) {
//		this.dialogCallback = callback;
//		debugger;
//
//
//			// now create the view class instance as described by the space
////			const vClass = listOfViewClassNames[currentQESpace.viewClassName];
//
//		// really we have no business messing around with the SquishyPanel's business
//		// state params = the input arguments to dialog; otherwise
//		// a general dialog system would just pass in some object
//		this.setState({isDialogShowing: true, stateParams});
//		this.stateParams = stateParams;
//	}


	// this is called before the ResolutionDialog has been instantiated
	static showDialog(dialogCloseCallback) {
		App.dialogCloseCallback = dialogCloseCallback;
		App.me.setState({isDialogShowing: true});
	}

	static hideDialog() {
		App.me.setState({isDialogShowing: false});
		App.dialogCloseCallback(0);
		App.dialogCloseCallback = null;
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

	/* ************************************************ App */

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
		//const stateParams = sParams || s.stateParams;
		const sqDialog = s.isDialogShowing ? <SquishDialog  /> : null;
			//stateParams={stateParams}
			//closeResolutionDialog={() => this.closeResolutionDialog()}

		return (
			<div className="App">
				<h2 className="App-header">
					<img className='splatImage' src='splat.png'
						width='100px' alt='squishy icon'/>
					&nbsp; &nbsp;
					Squishy Electron
				</h2>
				{/*}<WaveView N={s.N} useQuantumEngine={s.useQuantumEngine}*/}
				{/*innerWindowWidth={s.innerWindowWidth}/>*/}
				<SquishPanel />

				{sqDialog}
			</div>
		);

//		showResolutionDialog={stateParams => this.showResolutionDialog(stateParams)}
//		stateParams={sParams}
	}
}

export default App;


//				<SquishView setGLCanvas={canvas => this.setGLCanvas(canvas)} />
//				<ControlPanel
//					showResolutionDialog={() => this.showResolutionDialog(true)}
//				/>
