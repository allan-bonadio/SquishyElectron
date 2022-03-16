/*
** q Engine - main interface in JS to the quantumEngine
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import {qe, defineQEngineFuncs} from './qe';
import qCx from './qCx';
//import qeWave from './qeWave';
//import qeSpace from './qeSpace';

// all of these must be attached to window to  get called by c++

/* ****************************************************** app startup */

// c++ main() calls us to tell us that it's up, and to pass the sizes of different data structures.
// (qspace can change; double and therefore qCx can change length)
export let maxDimensions, maxLabel;

let qeStartPromiseSucceed;

// do NOT export this; it's global cuz quantumEngine.js, the compiled C++ proxy,
// has to have access to it early on
function quantumEngineHasStarted(mDimensions, mLabel) {
	//console.log(`quantumEngineHas...Started`, mDimensions, mLabel);
	defineQEngineFuncs();
	qeDefineAccess();

	maxDimensions = mDimensions;
	maxLabel = mLabel;

	qe.cppLoaded = true;

	//console.log(`quantumEngineHasStarted:  resolving qeStartPromise`);
	qeStartPromiseSucceed({mDimensions, mLabel});
};
window.quantumEngineHasStarted = quantumEngineHasStarted;

export const qeStartPromise = new Promise((succeed, fail) => {
	qeStartPromiseSucceed = succeed;
	//console.info(`qeStartPromise created:`, succeed, fail);
});


/* ****************************************************** space buffer */
// see qeSpace.js

/* ***************************************** data access */

// must be called after qe is created
//function qeDefineAccess() {
//	// tune into the most recently used wave and potential buffers
//	qe.latestWave = function latestWave() {
//		qe.latestWaveBuffer = qe.qSpace_getWaveBuffer();
//	}
//
//	// get the complex wave value at this point
//	qe.get1DWave = function get1DWave(ix) {
//		const vPtr = qe.latestWaveBuffer + 8*2*ix;
//		return qCx(
//			Module.getValue(vPtr, 'double'),
//			Module.getValue(vPtr + 8, 'double')
//		);
//	}
//
//	qe.set1DWave = function set1DWave(ix, ψ) {
//		const vPtr = qe.latestWaveBuffer + 8*2*ix;
//		Module.setValue(vPtr, ψ, 'double');
//		Module.setValue(vPtr + 8, ψ, 'double');
//	}
//
//	// tune into the most recently used wave and potential buffers
//	qe.latestPotential = function latestPotential() {
//		qe.latestPotentialBuffer = qe.qSpace_getPotentialBuffer();
//	}
//
//	// get the real potential value at this point
//	qe.get1DPotential = function get1DPotential(ix) {
//		const vPtr = qe.latestPotentialBuffer + 8*ix;
//		return Module.getValue(vPtr, 'double');
//	}
//
//	qe.set1DPotential = function set1DPotential(ix, pot) {
//		const vPtr = qe.latestPotentialBuffer + 8*ix;
//		return Module.setValue(vPtr, pot, 'double');
//	}
export function qeDefineAccess() {

	// what a disaster...

	// nobody uses this anymore
	// tune into the most recently used wave buffer.  The iteration algorithm can sometimes leave the
	// results in different buffers, depending.  No, not any more!
	qe.createQEWaveFromCBuf = function createQEWaveFromCBuf() {
		// make this thing which is the wave buffer, as a nice TypedArray of doubles (pairs making up cx numbers)
		const wave = new Float64Array(window.Module.HEAPF64.buffer, qe.qSpace_getWaveBuffer(), 2 * qe.space.nPoints);
		qe.space.waveBuffer = qe.waveBuffer = wave;
	}

	// get the complex wave value at this point in the wave
	// not used very much now
	qe.get1DWave = function get1DWave(ixPoint) {
		const ix = 2*ixPoint;
		return qCx(
			qe.waveBuffer[ix],
			qe.waveBuffer[ix+1]
		);
	}



// 	qe.testFFT();

}





