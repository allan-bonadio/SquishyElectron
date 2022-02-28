/*
** qeWave -- JS access to a qWave.
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

// import {qeBasicSpace} from './qeSpace';

/* **************************************************************** dumping */


// this is just a 1D wave.  someday...
class qeWave {
	// wave is a Float64Array[2*nPoints], with pairs being the real and im parts of psi.
	// Or absent/null, in which case it's dynamially allocated.
	constructor(space, wave) {
		this.space = space;
		if (wave)
			this.wave = wave;
		else
			this.wave = new Float64Array(2 * space.nPoints);
	}

	// dump out wave content.  Modeled after qWave::dumpWave() pls keep in sync!
	dumpWave(title) {
		console.log(`\n==== Wave | ${title} `+
			this.space.dumpThatWave(this.wave) +
			`\n==== end of Wave ====\n\n`);
	}

	/* ********************************************************************** calculatons */

	// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?  yes
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
	}

	// freq is just like circular, although as a fraction of the stdDev instead of N
	// 2stdDev is width of the packet, as percentage of N (0%...100%).
	// offset is how far along is the peak, as an integer X value (0...N).
	setPulseWave(freqUi, stdDev, offsetUi) {
		const wave = this.wave;
		const {start, end, N} = this.space.startEnd2;
		let offset = offsetUi * N / 100;  // now in units of X
		const freq = Math.round(freqUi);
		console.log(`setPulseWave freq=${freqUi} => ${freq} `+
			`  offset=${offsetUi}% => ${offset}`)

		//const dAngle = 4 * Math.PI / N;
		const dAngle = 1.0 * Math.PI / N;
		let freqLow = freq - 1.;  // could be zero!  but still works.
		let freqLowLow = freqLow - 1.;  // could be zero!  but still works.
		let freqHigh = freq + 1.;
		let freqHighHigh = freqHigh + 1.;

		// weighting
		let weightOne = 0.5;
		let weightTwo = .0333

		for (let ix = start; ix < end; ix += 2) {
			const angle = dAngle * (ix - start - offset);


			wave[ix] = Math.cos(freqLowLow*angle) * weightTwo + Math.cos(freqLow*angle) * weightOne +
				Math.cos(freq*angle) +
				Math.cos(freqHigh*angle) * weightOne + Math.cos(freqHighHigh*angle) * weightTwo;
			wave[ix+1] = Math.sin(freqLowLow*angle) * weightTwo +Math.sin(freqLow*angle) * weightOne +
				Math.sin(freq*angle) +
				Math.sin(freqHigh*angle) * weightOne + Math.sin(freqHighHigh*angle) * weightTwo;




// the old alg - I need frequencies that fit in the finite universe
// 		// start with a circular wave, freq WITHIN the pulse width
// 		this.setCircularWave(freq);
//
// 		// modulate with a gaussian, centered at the offset, with stdDev
// 		const s2 = 1 / (stdDev * 2);
// 		for (let ix = start; ix < end; ix++) {
// 			const 𝜟 = ix - offset;
// 			const stretch = Math.exp(-𝜟 * 𝜟 * s2);
// 			wave[2*ix] *= stretch;
// 			wave[2*ix + 1] *= stretch;
// 		}
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		//this.dumpWave('qeWave.setPulseWave() done');
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
		}
	}
}

export default qeWave;

