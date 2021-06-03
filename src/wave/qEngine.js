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


/* ********************************************** new space */

//let cwrap;
//
//// these directly call in to the C++ functions of the same name
//let startNewSpace;
//let addSpaceDimension;
//let completeNewSpace;
//
//let getTheWave;
//let getThePotential;
//let getElapsedTime;
//
//let qSpace_dumpPotential;
//let qSpace_setZeroPotential;
//
//export let qSpace_dumpWave;
//let qSpace_setCircularWave;
//let qSpace_setStandingWave;
//let qSpace_setWavePacket;
//export let qSpace_oneRk2Step;
//
//
//export function defineQEngineFuncs() {
//	cwrap = window.Module.cwrap;
//	startNewSpace = cwrap('startNewSpace', 'bool', []);
//	addSpaceDimension = cwrap('addSpaceDimension', 'bool', ['number', 'number', 'string']);
//	completeNewSpace = cwrap('completeNewSpace', 'bool', []);
//
//	getTheWave = cwrap('getTheWave', 'number', []);
//	getThePotential = cwrap('getThePotential', 'number', []);
//	getElapsedTime = cwrap('getElapsedTime', 'number', []);
//
//	qSpace_dumpPotential = cwrap('qSpace_dumpPotential', null, ['string']);
//	qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', null, []);
//
//	qSpace_dumpWave = cwrap('qSpace_dumpWave', null, ['string']);
//	qSpace_setCircularWave = cwrap('qSpace_setCircularWave', null, ['number']);
//	qSpace_setStandingWave = cwrap('qSpace_setStandingWave', null, ['number']);
//	qSpace_setWavePacket = cwrap('qSpace_setWavePacket', null, ['number', 'number']);
//	qSpace_oneRk2Step = cwrap('qSpace_oneRk2Step', null, []);
//}

/* ********************************************** new space */

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
