/*
** qeWave -- JS access to a qWave.
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

// import {qeBasicSpace} from './qeSpace';
//import {qe} from './qe';
import cxToRgb from '../view/cxToRgb';

/* **************************************************************** dumping */


// this is just a 1D wave.  someday...
class qeWave {
	// waveArg is one of these:
	// • a C++ wave/spectrum buffer ptr, ask any qBuffer to pass back its wave and it comes out as an integer
	// • a Float64Array[2*nPoints], with pairs being the real and im parts of psi.
	//       From any source, C++ or JS.
	// 	   (I bet you could pass it a JS array and some stuff would work)
	// • Or absent/null, in which case it's dynamially allocated to space.nPoints; JS only
	constructor(space, waveArg) {
		this.space = space;
		this.start = space.start;
		this.end = space.end;
		this.nPoints = space.nPoints;

		// now for the buffer
		if (!waveArg) {
			this.wave = new Float64Array(2 * space.nPoints);
		}
		else if (Array.isArray(waveArg)) {
			// an existing Float64Array
			this.wave = waveArg;
		}
		else if (Number.isInteger(waveArg)) {
			// from C++
			const wave = new Float64Array(window.Module.HEAPF64.buffer, waveArg, 2 * space.nPoints);
			//space.waveBuffer = qe.waveBuffer = wave;
			this.wave = wave;

			// smoke test
			for (let j = 0; j < this.nPoints*2; j++)
				wave[j] = -99.;
		}
		else
			throw `call to construct qeWave failed cuz bad waveArg=${waveArg}`;
	}

	// dump out wave content.  Modeled after qWave::dumpWave() pls keep in sync!
	dumpWave(title) {
		console.log(`\n🌊 ==== Wave | ${title} `+
			this.space.dumpThatWave(this.wave) +
			`\n🌊 ==== end of Wave ====\n\n`);
	}

	rainbowDump(title) {
		const wave = this.wave;
		const {start, end} = this.space.startEnd2;

		console.log(`%c rainbow dump    🌊   ${title}`,
			`font: times 16px italic; color: #222; background-color: #fff; padding-right: 70%; font: 14px Palatino;`);

		let tot = 0;  // always real
		for (let ix = start; ix < end; ix += 2) {
			let mag = (wave[ix] ** 2 + wave[ix + 1] ** 2) * 10000;
			let color = cxToRgb({re: wave[ix], im: wave[ix + 1]});
			console.log(`%c🌊  `, `background-color: ${color}; padding-right: ${mag}px; `);
		}
		return tot;
	}

	/* ********************************************************************** calculatons */

	// calculate ⟨ψ | ψ⟩  'inner product'
	innerProduct() {
		const wave = this.wave;
		const {start, end} = this.space.startEnd2;

		let tot = 0;  // always real
		for (let ix = start; ix < end; ix += 2)
			tot += wave[ix] ** 2 + wave[ix + 1] ** 2;
		return tot;
	}

	// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
	normalize() {
		const wave = this.wave;

		// now adjust it so the norm comes out 1
		let t = this.innerProduct();
		let factor = Math.pow(t, -.5);

		// treat ALL points, including border ones.
		// And real and imaginary, go by ones
		let {nPoints} = this.space.startEnd2;
		for (let ix = 0; ix < nPoints; ix++)
			wave[ix] *= factor;
	}

	/* ********************************************************************** set wave */

	// n is  number of cycles all the way across N points.
	// n 'should' be an integer to make it meet up on ends if endless
	// pass negative to make it go backward.
	// the first point here is like x=0 as far as the trig functions, and the last like x=-1
	setCircularWave(n) {
		//console.info(`setCircularWave(${n})`);
		const {start, end, N} = this.space.startEnd2;
		const dAngle = Math.PI / N * (+n) * 2;
		const wave = this.wave;

		for (let ix = start; ix < end; ix += 2) {
			const angle = dAngle * (ix - start) / 2;
			wave[ix] = Math.cos(angle);
			wave[ix + 1] = Math.sin(angle);
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		//this.dumpWave('qeWave.setCircularWave() done');
		//this.rainbowDump('🌊  qeWave.setCircularWave() done');
	}


	// make a superposition of two waves in opposite directions.
	// n 'should' be an integer to make it meet up on ends if wraparound
	// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
	// pass negative to make it upside down.
	setStandingWave(n) {
		const {start, end, N} = this.space.startEnd2;
		const dAngle = Math.PI / N * (+n);
		const wave = this.wave;

		// good idea or bad?
// 		if (this.space.continuum == qeBasicSpace.contWELL) {
// 			start--;
// 			end++;
// 		}

		for (let ix = start; ix < end; ix += 2) {
			const angle = dAngle * (ix - start);
			wave[ix] = Math.sin(angle);
			wave[ix + 1] = 0;
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		//this.dumpWave('qeWave.setStandingWave() done');
		//this.rainbowDump('🌊  qeWave.setStandingWave() done');
	}

	// freq is just like circular, although as a fraction of the stdDev instead of N
	// 2stdDev is width of the packet, as percentage of N (0%...100%).
	// offset is how far along is the peak, as an integer X value (0...N).
	setPulseWave(freqUi, stdDev, offsetUi) {
		const wave = this.wave;
		const {start, end, N} = this.space.startEnd2;
		let offset = offsetUi * N / 100;  // now in units of X
		const freq = Math.round(freqUi);
		console.log(`🌊  setPulseWave freq=${freqUi} => ${freq} `+
			`  offset=${offsetUi}% => ${offset}`)

		// start with a circular wave, freq WITHIN the pulse width
		this.setCircularWave(freq);

		// modulate with a gaussian, centered at the offset, with stdDev
		const s2 = 1 / (stdDev * 2);
		for (let ix = start; ix < end; ix += 2) {
			const 𝜟 = ix - offset;
			const stretch = Math.exp(-𝜟 * 𝜟 * s2);
			wave[ix] *= stretch;
			wave[ix + 1] *= stretch;
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		//this.dumpWave('qeWave.setPulseWave() done');
		this.rainbowDump('qeWave.setPulseWave() done');
	}



	// freq is just like circular, although as a fraction of the stdDev instead of N
	// 2stdDev is width of the packet, as percentage of N (0%...100%).
	// offset is how far along is the peak, as an integer X value (0...N).
	setChordWave(freqUi, stdDev, offsetUi) {
		const wave = this.wave;
		const {start, end, N} = this.space.startEnd2;
		let offset = offsetUi * N / 100;  // now in units of X
		const freq = Math.round(freqUi);
		console.log(`🌊  setPulseWave freq=${freqUi} => ${freq} `+
			`  offset=${offsetUi}% => ${offset}`)


		//const dAngle = 4 * Math.PI / N;
		const dAngle = 1.0 * Math.PI / N;
		let freqLow = freq - 1.;  // could be zero!  but still works.
		let freqLowLow = freqLow - 1.;  // could be zero!  but still works.
		let freqHigh = freq + 1.;
		let freqHighHigh = freqHigh + 1.;

		// FIve neighboring frequencies, weighting, where the middle freq has weight 1.0
		let nearWeight = 0.9;
		let farWeight = .8

		for (let ix = start; ix < end; ix += 2) {
			const angle = dAngle * (ix - start - offset);

		//
			wave[ix] = Math.cos(freqLowLow*angle) * farWeight + Math.cos(freqLow*angle) * nearWeight +
				Math.cos(freq*angle) +
				Math.cos(freqHigh*angle) * nearWeight + Math.cos(freqHighHigh*angle) * farWeight;

		//
			wave[ix+1] = Math.sin(freqLowLow*angle) * farWeight +Math.sin(freqLow*angle) * nearWeight +
				Math.sin(freq*angle) +
				Math.sin(freqHigh*angle) * nearWeight + Math.sin(freqHighHigh*angle) * farWeight;


		//
		}

		//		this.space.fixThoseBoundaries(wave);
		//		this.normalize();
		//		//this.dumpWave('qeWave.setPulseWave() done');
		this.rainbowDump('qeWave.setChordWave() done');
	}

	// set one of the above canned waveforms, according to the waveParams object's values
	setFamiliarWave(waveParams) {
		// should the boundaries, normalize and dump be moved to the end of here?
		switch (waveParams.waveBreed) {
		case 'circular':
			this.setCircularWave(+waveParams.waveFrequency);
			break;

		case 'standing':
			this.setStandingWave(+waveParams.waveFrequency);
			break;

		case 'pulse':
			this.setPulseWave(+waveParams.waveFrequency, +waveParams.stdDev, +waveParams.pulseOffset);
			break;

		case 'chord':
			this.setChordWave(+waveParams.waveFrequency, +waveParams.stdDev, +waveParams.pulseOffset);
			break;
		}
	}
}

export default qeWave;

