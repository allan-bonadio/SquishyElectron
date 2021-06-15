/*
** q Engine - main interface in JS to the quantumEngine
*/
import {qe, defineQEngineFuncs} from './qe';
import qCx from './qCx';

const Module = window.Module;

// all of these must be attached to window to  get called by c++

/* ****************************************************** app startup */

// c++ main() calls us to tell us that it's up, and to pass the sizes of different data structures.
// (qspace can change; qReal and therefore qCx can change length)
export let maxDimensions, maxLabel;

let qeStartPromiseSucceed;

// do NOT export this; it's global cuz quantumEngine.js, the compiled C++ proxy,
// has to have access to it early on
function quantumEngineHasStarted(mDimensions, mLabel) {
	//console.log(`quantumEngineHas...Started`, mDimensions, mLabel);
	defineQEngineFuncs();

	maxDimensions = mDimensions;
	maxLabel = mLabel;

	//console.log(`quantumEngineHasStarted:  resolving qeStartPromise`);
	qeStartPromiseSucceed({mDimensions, mLabel});

};
window.quantumEngineHasStarted = quantumEngineHasStarted;

export const qeStartPromise = new Promise((succeed, fail) => {
	qeStartPromiseSucceed = succeed;
	//console.info(`qeStartPromise created:`, succeed, fail);
});


/* ****************************************************** space buffer */

// the JS representations of the c++ qSpace object
// call like this: new qeSpace([{N: 100, continuum: qeSpace.contCIRCULAR, label: 'x'}])
export class qeSpace {
	static contDISCRETE = 0;
	static contWELL = 1;
	static contCIRCULAR = 2;

	constructor(dims) {
		this.dimensions = dims.map(dim => {
			let d = {...dim};
			if (d.continuum) {
				d.start = 1;
				d.end = d.N + 1;
			}
			else {
				d.start = 0;
				d.end = d.N;
			}
			d.nStates = d.N;
			d.nPoints = d.start + d.end;

			return d;
		});

		// this actually does it over on the C++ side
		let nPoints = 1, nStates = 1;
		qe.startNewSpace();
		dims.forEach(dim => {
			qe.addSpaceDimension(dim.N, dim.continuum, dim.label);
			nPoints *= dim.N + (dim.continuum ? 2 : 0);
			nStates *= dim.N;
		});
		qe.completeNewSpace();
		this.nPoints = nPoints;
		this.nStates = nStates;

		//this.viewClassName = 'viewDef';
		this.viewClassName = 'flatView';

		// qeDefineAccess() will set this
		this.waveBuffer = null;

		// this will be good after completeNewSpace() is called
		this.potentialBuffer = qe.getPotentialBuffer();

		// a nice TypedArray of floats (4 for each row; 8 for each datapoint)
		const vb = qe.getViewBuffer()
		this.viewBuffer = qe.viewBuffer =
			new Float32Array(window.Module.HEAPF32.buffer, qe.getViewBuffer(), nPoints*8);
	}

	get1DWave = function get1DWave(ixPoint) {
		const ix = 2*ixPoint;
		return qCx(
			this.waveBuffer[ix],
			this.waveBuffer[ix+1]
		);
	}
}


/* ***************************************** data access */

// must be called after qe is created
export function qeDefineAccess() {

	// what a disaster...

	// tune into the most recently used wave buffer.  The iteration algorithm can sometimes leave the
	// results in different buffers, depending.
	qe.updateToLatestWaveBuffer = function updateToLatestWaveBuffer() {
		// make this thing which is the wave buffer, as a nice TypedArray of doubles (pairs making up cx numbers)
		qe.space.waveBuffer = qe.waveBuffer =
			new Float64Array(window.Module.HEAPF64.buffer, qe.getWaveBuffer(), 2 * qe.space.nPoints);
	}

	// get the complex wave value at this point in the wave
	qe.get1DWave = function get1DWave(ixPoint) {
		const ix = 2*ixPoint;
		return qCx(
			qe.waveBuffer[ix],
			qe.waveBuffer[ix+1]
		);
	}

	// copy  wave numbers over to view buffer
//	qe.update1DViewBuffer = function updateToLatestWaveBuffer() {
//		const highest = qe.updateViewBuffer();
//
//		return highest;
//	}


	// get the real potential value at this point
//	qe.get1DPotential = function get1DPotential(ixPoint) {
//		const ix = qe.latestPotential + 8*ixPoint;
//		return Module.getValue(ix, 'double');
//	}
//
//	qe.set1DPotential = function set1DPotential(ixPoint, pot) {
//		const ix = qe.latestPotential + 8*ixPoint;
//		return Module.setValue(ix, 'double', pot);
//	}


}
