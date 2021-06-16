// wave.js and theJWave, draw and iterate are all about the internals of the wave.
// all of this is svg and d3, no react.
import {jSpace, jWave} from './wave';
import draw from './draw';
import iterate from './iterate';
import {qeSpace} from './qEngine';
import qe from './qe';

// the (old js) jWave that we're displaying and animating
export let theJSpace;
export let theJWave;

export let newWaveBuffer;
export let theDraw;
export const jWaveBuffers = {alt: null, next: null};
export let useQuantumEngine;

// range of vertical inside coordinates in the svg
export const INNER_HEIGHT = 100;

// call this when user changes number of datapoints.
// Or at startup, so we have a wave to begin with.
export function recreateWave(N, continuum, callback) {
	// create the old JS version
	theJSpace = new jSpace(N, continuum);
	theJWave = new jWave(theJSpace);
	theDraw = new draw(theJWave);
	jWaveBuffers.alt = new Array(N + 2);
	jWaveBuffers.next = new Array(N + 2);

	// create the new C++ version
	qe.space = new qeSpace([{N, continuum, label: 'x'}]);

	/* *************** testing: now iterate both */

//	theJWave.dump('JS wave before one iteraate');
//	qSpace_dumpWave('before qe Step');

//	console.time('many js iterate/RK2 stepz');
//	var i;
//	for (i = 0; i < 100; i++)
//		iterate(theJWave);
//	console.timeEnd('many js iterate/RK2 stepz');
//
//	console.time('many C++ RK2 stepz');
//	qe.manyRk2Steps();
//	//qe.qSpace_oneRk2Step();
//	console.timeEnd('many C++ RK2 stepz');

	//theJWave.dump('JS wave after one iteraate');
	//qe.qSpace_dumpWave('after qe Step');
	/* *************** testing: now iterate both */


	callback(theJWave, qe.space, theDraw);
}

// completely wipe out the Psi wavefunction and replace it with one of our canned waveforms.
// (but do not change N)
export function setWave(breed, freq) {
	switch (breed) {
	case 'standing':
		if (useQuantumEngine)
			qe.qSpace_setStandingWave(freq);
		else
			theJWave.setStandingWave(freq);
		break;

	case 'circular':
		if (useQuantumEngine)
			qe.qSpace_setCircularWave(freq);
		else
			theJWave.setCircularWave(freq);
		break;

	case 'pulse':
		if (useQuantumEngine)
			qe.qSpace_setPulseWave(10., 1.)
		else
			theJWave.setPulseWave();
		break;

	default:
		throw `setWave: no jWave breed '${breed}'`
	}
}

export function setVoltage(breed, arg) {
	switch (breed) {
	case 'zero':
		if (useQuantumEngine)
			qe.qSpace_setZeroPotential()
		else
			theJWave.setZeroVoltage();
		break;

	case 'valley':
		if (useQuantumEngine)
			qe.qSpace_setValleyPotential();
		else
			theJWave.setZeroVoltage();
		break;

//	case 'wave':
//		if (useQuantumEngine)
//			theJWave.setWaveVoltage();
//
//		break;

	default:
		throw `setVoltage: no voltage breed '${breed}'`
	}
}

/* ************************************************ iterateAnimate */

let repeatId;
//const useQuantumEngine = true;

// call this to start or stop animation/iteration.
// rate = 1, 2, 4, 8, ... or zero/false to stop it
export function iterateAnimate(uQE, rate) {
	// never changes during runtime
	useQuantumEngine = uQE;

	// if user cicks Go twice, we lose the previous repeatId and can never clear it
	if (! rate || repeatId) {
		clearInterval(repeatId);
		repeatId = null;
		return;
	}

	repeatId = setInterval(() => {
		//console.time('one iteration & draw');
		try {
			if (useQuantumEngine) {
				qe.qSpace_oneRk2Step();
			}
			else {
				iterate(theJWave);
			}
			theDraw.draw(useQuantumEngine);
		} catch (ex) {
			console.error(`Error during iterate/draw:`, ex)
		}
		//console.timeEnd('one iteration & draw');
		let ip = theJWave.innerProduct();
		//console.log(`${iterationSerial} inner product:  ${ip}`);
		if (ip < .99 || ip > 1.01) {
			theJWave.lowPassFilter()
		}
	}, 1000 / rate);
}
