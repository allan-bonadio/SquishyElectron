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
// call like this: new qeSpace([{N: 100, continuum: contCIRCULAR, label: 'x'}])
export class qeSpace {
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
			d.nStates = d.N;  // only if 1 dimension
			d.nPoints = d.start + d.end;  // only if 1 dimension

			return d;
		});

		// this actually does it over on the other side
		qe.startNewSpace();
		dims.forEach(dim => {
			qe.addSpaceDimension(dim.N, dim.continuum, dim.label);
		});
		qe.completeNewSpace();
	}

	static contDISCRETE = 0;
	static contWELL = 1;
	static contCIRCULAR = 2;

}


/* ***************************************** data access */

// must be called after qe is created
export function qeDefineAccess() {
	// tune into the most recently used wave and potential buffers
	qe.latestWave = function latestNumbers() {
		qe.latestWave = qe.getWaveBuffer();
	}

	// get the complex wave value at this point
	qe.get1DWave = function get1DWave(ixPoint) {
		const ix = qe.latestWave + 8*2*ixPoint;
		return qCx(
			Module.getValue(ix, 'double'),
			Module.getValue(ix + 8, 'double')
		);
	}

	// tune into the most recently used wave and potential buffers
	qe.latestPotential = function latestNumbers() {
		qe.latestPotential = qe.getPotentialBuffer();
	}

	// get the real potential value at this point
	qe.get1DPotential = function get1DPotential(ixPoint) {
		const ix = qe.latestPotential + 8*ixPoint;
		return Module.getValue(ix, 'double');
	}

	qe.set1DPotential = function set1DPotential(ixPoint, pot) {
		const ix = qe.latestPotential + 8*ixPoint;
		return Module.setValue(ix, 'double', pot);
	}


}
