import React from 'react';
import './App.css';
import WaveDisplay from './WaveDisplay';
import ControlPanel from './ControlPanel';
import ResolutionDialog from './ResolutionDialog';
import {recreateWave} from './wave/theWave';
import {qDimension, qeStartPromise, quantumEngineHasStarted} from './wave/qEngine';

const DEFAULT_RESOLUTION = 25;
const DEFAULT_CONTINUUM = qDimension.contCIRCULAR;


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			innerWindowWidth: window.innerWidth,

			isResolutionDialogOpen: false,

			N: DEFAULT_RESOLUTION,
			continuum: DEFAULT_CONTINUUM,

			theWave: null,
			theDraw: null,
		};

		console.log(`App constructor`);
	}

	static me = this;
	static setTheWave(theWave, theDraw) {
		App.me.setState(theWave, theDraw);
	}


	openResolutionDialog(whetherTo) {
		this.setState({isResolutionDialogOpen: whetherTo});
	}

	setNewResolution(N, continuum) {
		recreateWave(N, continuum, (theWave, theDraw) => {
			this.setState({N, continuum, theWave, theDraw});
		});
	}

	// constructor runs twice, so do this once here
	componentDidMount() {
		// upon startup, after C++ says it's ready, but remember constructor runs twice
		qeStartPromise.then((arg) => {
			this.setNewResolution(DEFAULT_RESOLUTION, DEFAULT_CONTINUUM);
			// wont work theDraw.draw();
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
					setNewResolution={(N, continuum) => this.setNewResolution(N, continuum)}
			  />

			: null;

		console.log(`about to render app, theWave=${s.theWave}`);
		return (
			<div className="App">
				<h2 className="App-header">
					<img className='splatImage' src='splat.png'
						width='100px' alt='squishy icon'/>
					&nbsp; &nbsp;
					Squishy Electron
				</h2>
				<WaveDisplay theWave={s.theWave} innerWindowWidth={s.innerWindowWidth}/>
				<ControlPanel
					openResolutionDialog={() => this.openResolutionDialog(true)}
				/>
				{resDialog}
			</div>
		);

	}
}

export default App;

