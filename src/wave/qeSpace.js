/*
** qeSpace - the JS representations of the c++ qSpace object
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/
import qe from './qe';
import qeWave from './qeWave';
import {setFamiliarPotential, getWrappedPotential} from '../widgets/utils';

let debugSpace = true;


const _ = num => num.toFixed(4).padStart(9);

// generate string for this one cx value, w, at location ix
// rewritten from the c++ version in qBuffer::dumpRow()
// pls keep in sync!
function dumpRow(ix, re, im, prev, isBorder) {
	const mag = re * re + im * im;

	let phase = 0;
	if (im || re) phase = Math.atan2(im, re) * 180 / Math.PI;  // pos or neg
	let dPhase = phase - prev.phase + 360;  // so now its positive, right?
	while (dPhase >= 360) dPhase -= 360;
	prev.phase = phase;

	if (!isBorder) prev.innerProd += mag;

	return`[${ix}] (${_(re)} , ${_(im)}) | `+
		`${_(phase)} ${_(dPhase)}} ${_(mag)}\n` ;
}


/* **************************************************************** Basic Space */
// the dimensions part of the space
// this is enough to contruct a qeWave with, so MiniGraph can use it
// pat of qeSpace but also want to use independently
// maybe not - nmight get rid of this given changes that are coming
export class qeBasicSpace {
	// note in c++ these are on qSpace; there is no qBasicSpace
	static contDISCRETE = 0;
	static contWELL = 1;
	static contENDLESS = 2;

	// dims is the raw minimal definition of the dimensions for the space to be contructed.
	// here we fill in the details.
	constructor(dims) {
		// this has SIDE EFFECTS!
		let nPoints = 1, nStates = 1;
		this.dimensions = dims.map(dim => {
			let d = {...dim};
			if (d.continuum != 'discrete') {
				d.start = 1;
				d.end = d.N + 1;
			}
			else {
				d.start = 0;
				d.end = d.N;
			}
			nStates *= d.nStates = d.N;
			nPoints *= d.nPoints = d.start + d.end;

			return d;
		});
		this.nPoints = nPoints;
		this.nStates = nStates;

		if (debugSpace) console.log(`🚀  the resulting qeBasicSpace: `, this);
	}

	// call it like this: const {start, end, N, continuum} = space.startEnd;
	get startEnd() {
		const dim = this.dimensions[0];
		return {start: dim.start, end: dim.end, N: dim.N, nPoints: this.nPoints,
			continuum: dim.continuum};
	}

	// this will return the DOUBLE of start and end so you can just loop thru += 2
	// but NOT N, it passes thru
	get startEnd2() {
		const dim = this.dimensions[0];
		return {start: dim.start*2, end: dim.end*2, N: dim.N, nPoints: this.nPoints * 2,
			continuum: dim.continuum};
	}

	// a qeSpace method to dump any wave buffer according to that space.
	// RETURNS A STRING of the wave.
	// modeled after qSpace::dumpThatWave() pls keep in sync!
	dumpThatWave(wave) {
		if (this.nPoints <= 0) throw "🚀  qeBasicSpace::dumpThatWave() with zero points";

		const {start, end, continuum} = this.startEnd2;
		let ix = 0;
		let prev = {phase: 0, innerProd: 0};
		let output = '';

		if (continuum)
			output += dumpRow(ix, wave[0], wave[1], prev, true);

		for (ix = start; ix < end; ix += 2)
			output += dumpRow(ix/2, wave[ix], wave[ix+1], prev);


		if (continuum)
			output += 'end '+ dumpRow(ix/2, wave[end], wave[end+1], prev, true);

		return output.slice(0, -1) + ' innerProd=' + _(prev.innerProd) +'\n';
	}

	// refresh the wraparound points for ANY WAVE subscribing to this space
	// 'those' or 'that' means some wave other than this.wave
	// modeled after fixThoseBoundaries() pls keep in sync!
	fixThoseBoundaries(wave) {
		if (this.nPoints <= 0) throw "🚀  qSpace::fixThoseBoundaries() with zero points";
		const {end, continuum} = this.startEnd2;

		switch (continuum) {
		case qeBasicSpace.contDISCRETE:
			break;

		case qeBasicSpace.contWELL:
			// the points on the end are ∞ potential, but the arithmetic goes bonkers
			// if I actually set the voltage to ∞.  Remember complex values 2 doubles
			wave[0] = wave[1] = wave[end] = wave[end+1] = 0;
			break;

		case qeBasicSpace.contENDLESS:
			// the points on the end get set to the opposite side.  Remember this is for complex, 2x
			wave[0] = wave[end-2];
			wave[1]  = wave[end-1];
			wave[end] = wave[2];
			wave[end+1] = wave[3];
			break;

		default: throw `🚀  bad continuum '${continuum}' in  qeSpace.fixThoseBoundaries()`;
		}
	}
}


/* **************************************************************** Space */
// this is how you create a qSpace - start from JS and call this.
// call like this:
// new qeSpace([{N: 128, continuum: qeBasicSpace.contENDLESS, label: 'x', coord: 'x'}])
// labels must be unique.  Modeled after qSpace in C++,
// does all dimensions in constructor, at least.
// Coords are the same if two dims are parallel, eg two particles with x coords.
// Not the same if one particle with x and y coords; eg you could have an endless canal.
export class qeSpace extends qeBasicSpace {
	static contCodeToText = code => ['Discrete', 'Well', 'Endless'][code];

	constructor(dims, waveParams, potentialParams) {
		super(dims);

		// this actually does it over on the C++ side
		qe.startNewSpace("a qeSpace");
		dims.forEach(dim => {
			qe.addSpaceDimension(dim.N, dim.continuum, dim.label);

			// these are convenient to have
			// change this when we get to multiple dimensions
			this.N = dim.N;
			this.start = dim.continuum ? 1 : 0;
			this.end = this.start + this.N;
			this.nPoints = this.start + this.end;
		});
		qe.completeNewSpace();

		// the qSpace already has allocated a wave, wrap as a nice TypedArray of doubles (pairs making up cx numbers)
// 		this.wave = new Float64Array(window.Module.HEAPF64.buffer, qe.Timeline_getWaveBuffer(), 2 * this.nPoints);

// 		let dim = dims[0];
// 		this.start = dim.start;
// 		this.end = dim.end;
// 		this.nPoints = dim.nPoints;
		//console.log(`🚀  qViewBuffer_getViewBuffer 170: 🛸`, qe.qViewBuffer_getViewBuffer());

		//qe.space.waveBuffer = qe.waveBuffer = wave;
		//console.info(`the wave we're createQEWaveFromCBuf():`, wave);
		this.qewave = new qeWave(this, qe.Timeline_getWaveBuffer());
		this.wave = this.qewave.wave;

		//console.log(`🚀  qViewBuffer_getViewBuffer 176: 🛸`, qe.qViewBuffer_getViewBuffer());
 		//if (qe.qViewBuffer_getViewBuffer() & 3) debugger;




		// by default it's set to 1s, but we want something good.
		this.qewave.setFamiliarWave(waveParams);

		//console.log(`🚀  qViewBuffer_getViewBuffer 181: 🛸`, qe.qViewBuffer_getViewBuffer());

		//console.log(`🚀  qViewBuffer_getViewBuffer 195: 🛸`, qe.qViewBuffer_getViewBuffer());
 		//if (qe.qViewBuffer_getViewBuffer() & 3) debugger;

		// this will be good after completeNewSpace() is called
		this.potentialBuffer = getWrappedPotential(this);
		setFamiliarPotential(this, this.potentialBuffer, potentialParams);

		//console.log(`🚀  qViewBuffer_getViewBuffer 187: 🛸`, qe.qViewBuffer_getViewBuffer());

		// wrap viewbuffer as a nice TypedArray of floats (4 for each row; 8 for each datapoint)
		//console.log(`🚀  qViewBuffer_getViewBuffer 193: 🛸`, qe.qViewBuffer_getViewBuffer());
// isn't the viewBuffer itself suipposed to do rthat?  oh ytean that's C++.  Here we make our own.
		let emscriptenMemory = window.Module.HEAPF32.buffer;
		let address = qe.qViewBuffer_getViewBuffer();
		let np = this.nPoints * 16;  // 16 = sizeof(qCx)

		this.viewBuffer = qe.viewBuffer =
			new Float32Array(emscriptenMemory, address, np);
// 		this.viewBuffer = qe.viewBuffer =
// 			new Float32Array(window.Module.HEAPF32.buffer, qe.qViewBuffer_getViewBuffer(), this.nPoints*8);
		qe.qViewBuffer_loadViewBuffer();

		//console.log(`🚀  qViewBuffer_getViewBuffer 200: 🛸`, qe.qViewBuffer_getViewBuffer());

		if (debugSpace) console.log(`🚀  done with the resulting qeSpace:`, this);
	}

}


export default qeSpace;
