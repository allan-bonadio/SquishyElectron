// wave.js and theJWave, draw and iterate are all about the internals of the wave.
// all of this is svg and d3, no react.
import {jSpace, jWave} from './wave';
//import draw from './draw';
import iterate from './iterate';
import {qeSpace} from './qEngine';
import qe from './qe';
//import App from '../App';

// the (old js) jWave that we're displaying and animating
export let theJSpace;
export let theJWave;  // deprecated, doesn't seem used much

export let newWaveBuffer;

// range of vertical inside coordinates in the svg?
export const INNER_HEIGHT = 100;

// call this when user changes number of datapoints.
// Or at startup, so we have a wave to begin with.
// the callback gets called wtih the qSpace instance, when it's done being created
export function createStateNWave(N, continuum, callback) {
	// create the old JS version?
//	theJSpace = new jSpace(N, continuum);
//	theJWave = new jWave(theJSpace);

	// create the new C++ version
	qe.space = new qeSpace([{N, continuum, label: 'x'}]);

	callback(qe.space);
}

// completely wipe out the Psi wavefunction and replace it with one of our canned waveforms.
// (but do not change N)
export function setWave(breed, freq) {
	switch (breed) {
	case 'standing':
		qe.qSpace_setStandingWave(freq);
		break;

	case 'circular':
		qe.qSpace_setCircularWave(freq);
		break;

	case 'pulse':
		qe.qSpace_setPulseWave(10., 1.)
		break;

	default:
		throw `setWave: no jWave breed '${breed}'`
	}
}

export function setVoltage(breed, arg) {
	switch (breed) {
	case 'zero':
		qe.qSpace_setZeroPotential()
		break;

	case 'valley':
		qe.qSpace_setValleyPotential();
		break;

	default:
		throw `setVoltage: no voltage breed '${breed}'`
	}
}

/* ************************************************ iterateAnimate */

let repeatId;
//const useQuantumEngine = true;

// call this to start or stop animation/iteration.
// rate = 1, 2, 4, 8, ... or zero/false to stop it
export function oldIterateAnimate(useQuantumEngine, rate) {
	useQuantumEngine = true;
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
			//theDraw.draw(useQuantumEngine);
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

let isAnimating = false;

// runtime debugging flags
const areBenchmarking = true;
const dumpTheViewBuffer = true;
let prevStart  = performance.now();

// the name says it all.  requestAnimationFrame() will call this probably 60x/sec
// it will advance one 'frame' in wave time, which i dunno what that is need to tihink about it more.
function animateOneFrame(now) {
	//console.log(`time since last tic: ${now - startFrame}ms`)
	let startRK = 0, startUpdate = 0, startReload = 0, startDraw = 0, endFrame = 0;

	// could be slow.  sometime in the future.
	if (areBenchmarking) startRK = performance.now();
	qe.qSpace_oneRk2Step();
	qe.updateToLatestWaveBuffer();

	if (areBenchmarking) startUpdate = performance.now();
	let highest = qe.updateViewBuffer();
	if (dumpTheViewBuffer) dumpViewBuffer();

	if (areBenchmarking) startReload = performance.now();
	qe.theCurrentView.viewVariables.forEach(v => v.reloadVariable());
	//qe.theCurrentView.viewVariables[0].reloadVariable();

	if (areBenchmarking) startDraw = performance.now();
	qe.theCurrentView.draw();

	endFrame = performance.now();
	if (areBenchmarking) {
		console.log(`times:\n`+
			`RK:     ${(startUpdate - startRK).toFixed(2)}ms\n`+
			`up:     ${(startReload - startUpdate).toFixed(2)}ms\n`+
			`reload: ${(startDraw - startReload).toFixed(2)}ms\n`+
			`draw:   ${(endFrame - startDraw).toFixed(2)}ms\n`+
			`total:  ${(endFrame - startRK).toFixed(2)}ms\n\n` +
			`period:  ${(startRK - prevStart).toFixed(2)}ms\n`);
		prevStart = startRK;
	}

	if (isAnimating) {
		requestAnimationFrame(animateOneFrame);
	}
}


export function iterateAnimate(isTrue, rate) {
	// hmmm i'm not using the Rate here...
	if (! rate || !qe.theCurrentView) {
		isAnimating = false;
		return;
	}
	if (rate == 'one') {
		isAnimating = false;
		animateOneFrame(performance.now());
		return;
	}
	isAnimating = true;

	// also performance.now()


	requestAnimationFrame(animateOneFrame);
}

function dumpViewBuffer() {
	let nRows = qe.space.nPoints * 2;
	let vb = qe.space.viewBuffer;
	const _ = (f) => f.toFixed(3).padStart(6);
	console.log(`dump of view buffer for ${qe.space.nPoints} points in ${nRows} rows`);
	for (let i = 0; i < nRows; i++)
		console.log(_(vb[i*4]), _(vb[i*4+1]), _(vb[i*4+2]), _(vb[i*4+3]));
}
