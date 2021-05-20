import React from 'react';
import './App.css';
import WaveDisplay from './WaveDisplay';
import ControlPanel from './ControlPanel';
import ResolutionDialog from './ResolutionDialog';



class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			kickCount: 0, // remove this someday

			innerWindowWidth: window.innerWidth,

			resolutionDialogOpen: false,
		};

		// keep track of any window width changes, to reset the svg
		// add listener only executed once
		window.addEventListener('resize', ev => {
			console.log(` window resize ==> `, ev);
			this.setState({innerWindowWidth: ev.currentTarget.innerWidth})
		});
	}

	kickMe() {
		this.setState({kickCount: this.state.kickCount + 1});
	}

	openResolutionDialog(whetherTo) {
		this.setState({resolutionDialogOpen: whetherTo});
	}

	render() {
		return (
			<div className="App">
				<h2 className="App-header">
					<img className='splatImage' src='splat.png'
						width='100px' alt='squishy icon'/>
					&nbsp; &nbsp;
					Squishy Electron
				</h2>
				<WaveDisplay innerWindowWidth={this.state.innerWindowWidth}/>
				<ControlPanel
					kickMe={() => this.kickMe()}
					openResolutionDialog={() => this.openResolutionDialog(true)}
				/>
				<ResolutionDialog visible={this.state.resolutionDialogOpen}
					closeResolutionDialog={() => this.openResolutionDialog(false)}
				/>
			</div>
		);

	}
}

export default App;
