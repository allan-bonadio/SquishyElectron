/*
** qeWave -- JS access to a qWave.
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import qeSpace from './qeSpace';

// this is just a 1D wave.  someday...
class qeWave {
	// wave is a Float64Array, with pairs being the real and im parts of psi
	constructor(space, wave) {
		this.space = space;
		this.wave = wave;
	}


	// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
	innerProduct() {
		const wave = this.wave;
		const {start, end} = this.space.dimensions[0];

		let tot = 0;  // always real
		for (let ix = start; ix < end; ix++)
			tot += wave[2*ix] ** 2 + wave[2*ix + 1] ** 2;
		return tot;
	}

	// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
	normalize() {
		const nPoints = this.space.nPoints;
		const wave = this.wave;

		// now adjust it so the norm comes out 1
		let t = this.innerProduct();
		let factor = Math.pow(t, -.5);

		// remember: this is jWave->map() not Array->map()
		for (let ix = 0; ix < nPoints; ix++)
			wave[ix] *= factor;
	}

	// n is  number of cycles all the way across N points.
	// n 'should' be an integer to make it meet up on ends if endless
	// pass negative to make it go backward.
	// the first point here is like x=0 as far as the trig functions, and the last like x=-1
	setCircularWave(n) {
		const dAngle = 2 * Math.PI / this.space.nStates * +n;
		const wave = this.wave;
		const {start, end} = this.space.dimensions[0];

		for (let ix = start; ix < end; ix++) {
			const angle = dAngle * (ix - start);
			wave[2*ix] = Math.cos(angle);
			wave[2*ix + 1] = Math.sin(angle);
		}
		this.normalize();
	}


	// make a superposition of two waves in opposite directions.
	// n 'should' be an integer to make it meet up on ends if wraparound
	// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
	// pass negative to make it upside down.
	setStandingWave(n) {
		const dAngle = Math.PI / this.space.nStates * n;
		const wave = this.wave;
		let {start, end} = this.space.dimensions[0];

		// good idea or bad?
		if (this.space.continuum == qeSpace.contWELL) {
			start--;
			end++;
		}

		for (let ix = start; ix < end; ix++) {
			const angle = dAngle * (ix - start);
			wave[2*ix] = Math.sin(angle);
			wave[2*ix + 1] = 0;
		}

		this.normalize();
	}


	// widthFactor is fraction of total width the packet it is, 0.0-1.0, for a fraction of N.
	// Cycles is how many circles (360°) it goes thru in that width.
	setPulseWave(widthFactor, cycles) {
		const wave = this.wave;
		const {start, end, N} = this.space.dimensions[0];

		// start with a real wave
		this.setCircularWave(cycles / widthFactor);

		// modulate with a gaussian, centered at the peak, with stdDev
		// like the real one within some factor
		const peak = Math.round(N * widthFactor) % N;  // ?? i dunno
		const stdDev = N * widthFactor / 2.;  // ?? i'm making this up

		for (let ix = start; ix < end; ix++) {
			const del = ix - peak;
			const factor = Math.exp(-del * del / stdDev);
			wave[2*ix] *= factor;
			wave[2*ix + 1] *= factor;
		}
		this.normalize();
	}


}

export default qeWave;

