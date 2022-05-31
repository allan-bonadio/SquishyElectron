/*
** q Engine - main interface in JS to the quantumEngine
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import {qe, defineQEngineFuncs} from './qe';
// import qCx from './qCx';
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

// this is how enscripten/C++ gets to it
window.quantumEngineHasStarted = quantumEngineHasStarted;


// this resolves when emscripten starts up.
// Also, importing this (in SquishPanel) guarantees this file is included in the build!
export const qeStartPromise = new Promise((succeed, fail) => {
	qeStartPromiseSucceed = succeed;
	//console.info(`qeStartPromise created:`, succeed, fail);
});


/* ***************************************** data access */

// these can't be defined until emscripten is alive
function qeDefineAccess() {
	qe.createQEWaveFromCBuf = function createQEWaveFromCBuf() {
		// make this thing which is the wave buffer, as a nice TypedArray of doubles (pairs making up cx numbers)
		const wave = new Float64Array(window.Module.HEAPF64.buffer, qe.Incarnation_getWaveBuffer(), 2 * qe.space.nPoints);
		qe.space.waveBuffer = qe.waveBuffer = wave;
	}

	// get the complex wave value at this point in the wave
	// not used very much now
	// qe.get1DWave = function get1DWave(ixPoint) {
	// 	const ix = 2*ixPoint;
	// 	return qCx(
	// 		qe.waveBuffer[ix],
	// 		qe.waveBuffer[ix+1]
	// 	);
	// }
}





