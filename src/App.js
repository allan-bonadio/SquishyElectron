import React from 'react';
import './App.css';
import WaveView from './WaveView';
import ControlPanel from './ControlPanel';
import ResolutionDialog from './ResolutionDialog';
import {recreateWave, theDraw} from './wave/theWave';
import {qeSpace, qeStartPromise, qeDefineAccess} from './wave/qEngine';
//import qe from './wave/qe';
import SquishView from './views/SquishView';

const DEFAULT_RESOLUTION = 50;
const DEFAULT_CONTINUUM = qeSpace.contCIRCULAR;

// someday I need an error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

//function getExceptionMessage(exception) {
//  return typeof exception == 'number'
//	? Module.getExceptionMessage(exception)
//	: exception;
//}
// also see what i tried to do in main.cpp




class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			innerWindowWidth: window.innerWidth,

			isResolutionDialogOpen: false,

			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,

			// whether to use the new C++ quantum engine, or the old JS code
			// this is where it's set and not changed anywhere else
			useQuantumEngine: true,

			currentJWave: null,
			currentQESpace: null,
			currentDraw: null,
		};

		console.log(`App constructor`);
	}

//	static me = this;
//	static setTheJWave(theJWave, theDraw) {
//		App.me.setState(theJWave, theDraw);
//	}
//	static setTheQESpace(theQEWave, theDraw) {
//		App.me.setState(theQEWave, theDraw);
//	}


	openResolutionDialog(whetherTo) {
		this.setState({isResolutionDialogOpen: whetherTo});
	}

	setNew1DResolution(N, continuum) {
		recreateWave(N, continuum, (currentJWave, currentQESpace, currentDraw) => {
			this.setState({N, continuum, currentJWave, currentQESpace, currentDraw});
		});
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			this.setNew1DResolution(DEFAULT_RESOLUTION, DEFAULT_CONTINUUM);
			// wont work currentDraw.draw();
			qeDefineAccess();
			theDraw.draw(this.state.useQuantumEngine);
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

		console.log(`about to render app, currentJWave=..., qe.Wave=...`, s.currentJWave, s.currentJWave);
		return (
			<div className="App">
				<h2 className="App-header">
					<img className='splatImage' src='splat.png'
						width='100px' alt='squishy icon'/>
					&nbsp; &nbsp;
					Squishy Electron
				</h2>
				<WaveView N={this.state.N} useQuantumEngine={s.useQuantumEngine}
					innerWindowWidth={s.innerWindowWidth}/>
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog(true)}
					useQuantumEngine={this.state.useQuantumEngine}
				/>

				========= just kidding ===========
				<SquishView />

				{resDialog}
			</div>
		);

	}
}

export default App;

