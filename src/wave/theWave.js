// wave.js and theWave, draw and iterate are all about the internals of the wave.
// all of this is svg and d3, no react.
import {space, wave} from './wave';
import draw from './draw';
import iterate from './iterate';
import {qeStartPromise, qSpace} from './qEngine';
import qe from './qe';

// the (old js) wave that we're displaying and animating
export let theSpace;
export let theWave;

export let newWaveBuffer;
export let theDraw;
export const waveBuffers = {alt: null, next: null};

export let theQSpace;

let iterationSerial = 0;


// range of vertical inside coordinates in the svg
export const INNER_HEIGHT = 100;

// call this when user changes number of datapoints.
// Or at startup, so we have a wave to begin with.
export function recreateWave(N, continuum, callback) {
	// create the old JS version
	theSpace = new space(N, continuum);
	theWave = new wave(theSpace);
	theDraw = new draw(theWave);
	waveBuffers.alt = new Array(N + 2);
	waveBuffers.next = new Array(N + 2);

	// create the new C++ version
	theQSpace = new qSpace([{N, continuum, label: 'x'}]);

	/* *************** testing: now iterate both */
//	theWave.dump('JS wave before one iteraate');
//	qSpace_dumpWave('before qe Step');

	iterate(theWave);
	console.time('one RK2 step');
	qe.qSpace_oneRk2Step();
	console.timeEnd('one RK2 step');

	theWave.dump('JS wave after one iteraate');
	qe.qSpace_dumpWave('after qe Step');
	/* *************** testing: now iterate both */


	callback(theWave, theDraw);
}

// completely wipe out the Psi wavefunction and replace it with one of our canned waveforms.
// (but do not change N)
export function setWave(breed, freq) {
	switch (breed) {
	case 'harmonic':
		theWave.setHarmonicWave(freq);
		break;

	case 'constant':
		theWave.setConstantWave(freq);
		break;

	case 'diracDelta':
		theWave.setDiracDelta();
		break;

	default:
		throw `setWave: no wave breed '${breed}'`
	}
}

export function setVoltage(breed, arg) {
	switch (breed) {
	case 'zero':
		theWave.setZeroVoltage();
		break;

	case 'wave':
		theWave.setWaveVoltage();
		break;

	default:
		throw `setVoltage: no voltage breed '${breed}'`
	}
}

/* ************************************************ iterateAnimate */

let repeatId;

// call this to start or stop animation/iteration.
// rate = 1, 2, 4, 8, ... or zero/false to stop it
export function iterateAnimate(rate) {
	// if user cicks Go twice, we lose the previous repeatId and can never clear it
	if (! rate || repeatId) {
		clearInterval(repeatId);
		repeatId = null;
		return;
	}

	repeatId = setInterval(() => {
		iterationSerial++;

		console.time('one iteration');
		try {
			iterate(theWave);
			theDraw.draw();
		} catch (ex) {
			console.error(`Error during iterate/draw:`, ex)
		}
		console.timeEnd('one iteration');
		let ip = theWave.innerProduct();
		console.log(`${iterationSerial} inner product:  ${ip}`);
		if (ip < .99 || ip > 1.01) {
			theWave.lowPassFilter()
		}
	}, 1000 / rate);
}
