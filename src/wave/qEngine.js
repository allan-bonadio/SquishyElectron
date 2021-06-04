/*
** q Engine - main interface in JS to the quantumEngine
*/
import {qe, defineQEngineFuncs} from './qe';

// all of these must be attached to window to  get called by c++

/* ****************************************************** app startup */

// c++ main() calls us to tell us that it's up, and to pass the sizes of different data structures.
// (qspace can change; qReal and therefore qCx can change length)
export let maxDimensions, maxLabel;

let qeStartPromiseSucceed;

export function quantumEngineHasStarted(mDimensions, mLabel) {

	console.log(`quantumEngineHas...Started`, mDimensions, mLabel);
	defineQEngineFuncs();

	maxDimensions = mDimensions;
	maxLabel = mLabel;

//	headerLen = sQuantumSpace - mDimensions * sDimension;

	console.log(`quantumEngineHasStarted:  resolving qeStartPromise`);
	qeStartPromiseSucceed(mDimensions*1000 + mLabel);

};
window.quantumEngineHasStarted = quantumEngineHasStarted;

export const qeStartPromise = new Promise((succeed, fail) => {
	qeStartPromiseSucceed = succeed;
	console.info(`qeStartPromise created:`, succeed, fail);
});


/* ****************************************************** space buffer */


// call like this: new qSpace([{N: 100, continuum: contCIRCULAR, label: 'x'}])
export class qSpace {
	constructor(dims) {
		qe.startNewSpace();
		dims.forEach(dim => qe.addSpaceDimension(dim.N, dim.continuum, dim.label));
		qe.completeNewSpace();

		qe.qSpace_dumpPotential('done making potential');
	}

	static contDISCRETE = 0;
	static contWELL = 1;
	static contCIRCULAR = 2;
}
