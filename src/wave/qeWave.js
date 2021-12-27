/*
** qeWave -- JS access to a qWave.
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import qeSpace from './qeSpace';

/* **************************************************************** dumping */

const _ = num => num.toFixed(4).padStart(9);

// generate string for this one cx value, w, at location ix
// rewritten from the c++ version in qWave, dumpRow()
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

// a qeSpace method to dump any wave buffer according to that space.
// RETURNS A STRING of the wave.
// modeled after qSpace::dumpThatWave() pls keep in sync!
qeSpace.prototype.dumpThatWave = function dumpThatWave(wave) {
	if (this.nPoints <= 0) throw "qeSpace::dumpThatWave() with zero points";

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
// modeled after qSpace::fixThoseBoundaries() pls keep in sync!
qeSpace.prototype.fixThoseBoundaries = function fixThoseBoundaries(wave) {
	if (this.nPoints <= 0) throw "qSpace::fixThoseBoundaries() with zero points";
	const {end, continuum} = this.startEnd2;

	switch (continuum) {
	case qeSpace.contDISCRETE:
		break;

	case qeSpace.contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		wave[0] = wave[1] = wave[end] = wave[end+1] = 0;
		break;

	case qeSpace.contENDLESS:
		// the points on the end get set to the opposite side
		wave[0] = wave[end-2];
		wave[1]  = wave[end-1];
		wave[end] = wave[2];
		wave[end+1] = wave[3];
		break;
	}
}

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
		console.info(`setCircularWave(${n})`);
		const {start, end, N} = this.space.startEnd2;
		const dAngle = 2 * Math.PI / N * (+n);
		const wave = this.wave;

		for (let ix = start; ix < end; ix += 2) {
			const angle = dAngle * (ix - start);
			wave[ix] = Math.cos(angle);
			wave[ix + 1] = Math.sin(angle);
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		this.dumpWave('qeWave.setCircularWave() done');
	}


	// make a superposition of two waves in opposite directions.
	// n 'should' be an integer to make it meet up on ends if wraparound
	// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
	// pass negative to make it upside down.
	setStandingWave(n) {
		console.info(`untested`)
		debugger;

		const {start, end, N} = this.space.startEnd2;
		const dAngle = Math.PI / N * (+n);
		const wave = this.wave;

		// good idea or bad?
// 		if (this.space.continuum == qeSpace.contWELL) {
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
		this.dumpWave('qeWave.setStandingWave() done');
	}

	// freq is just like circular, although as a fraction of the stdDev instead of N
	// 2𝛔 is width of the packet, as percentage of N (0%...100%).
	// offset is how far along is the peak, as an integer X value (0...N).
	setPulseWave(freq, 𝛔, offset) {
		console.info(`untested`)
		debugger;

		const wave = this.wave;
		const {start, end, N} = this.space.startEnd;

		// start with a circular wave
		this.setCircularWave(freq * 2*𝛔/100 * N);

		// modulate with a gaussian, centered at the offset, with stdDev
		const s2 = 1 / (𝛔 * 2);
		for (let ix = start; ix < end; ix++) {
			const 𝜟 = ix - offset;
			const stretch = Math.exp(-𝜟 * 𝜟 * s2);
			wave[2*ix] *= stretch;
			wave[2*ix + 1] *= stretch;
		}

		this.space.fixThoseBoundaries(wave);
		this.normalize();
		this.dumpWave('qeWave.setPulseWave() done');
	}

	// set one of the above canned waveforms, according to the waveParams object's values
	setFamiliarWave(waveParams) {
		// should the boundaries, normalize and dump be moved to the end of here?
		switch (waveParams.waveBreed) {
		case 'circular':
			this.setCircularWave(waveParams.waveFrequency);
			break;

		case 'standing':
			this.setStandingWave(waveParams.waveFrequency);
			break;

		case 'pulse':
			this.setPulseWave(waveParams.waveFrequency, waveParams.stdDev, waveParams.pulseOffset);
			break;
		}
	}
}

export default qeWave;

