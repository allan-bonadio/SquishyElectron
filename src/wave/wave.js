/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

// we have an N element array for the ψ values, indexed (sortof) by X,
// whatever mins/maxes/increments, will be calculated.
// Boundary conditions: each row will have N+2 elements, where the 0th and the
// N+1-th element are the low and high boundaries.  They kindof have to be clamped to ψ =
// zero, and the corresponding V must be infinite, to completely shut out any ψ
// off the ends.

// the wave function ψ in a quantum-101 simiple potential energy well.
// N is number of data points, including the boundaries

import qCx from './qCx';
import qeSpace from './qeSpace';

export class jSpace {
	constructor(N, continuum) {
		//const boundaries = continuum ? 2 : 0;
		this.N = +N;

		// all the points range from 1 thru N (inclusive) so loops go ix=1, ix <= N
		//this.end = this.N + 1;

		// V, the potential, is always real numbers
		this.V = new Array(this.N + 2);
		this.setZeroVoltage();

		this.continuum = continuum;
		if (qeSpace.contDISCRETE == continuum)
			throw `Cannot do contDISCRETE in JS`;

		//console.info(`JS jSpace constructed: `, this)
	}

	/* *************************************** voltage */

	setVoltage(V) {
		this.V = V;
	}

	// default
	setZeroVoltage() {
		let V = this.V;
		V.fill(0);
		this.continuum = qeSpace.contENDLESS;
	}

	// infinite walled well at  ends
//	setWaveVoltage() {
//		let {V} = this;
//		V.fill(0);
//
//		// tried Infinity; i get NaNs and I can't do anything with them..
//		// tried 10, just doesn't cut it.
//		this.continuum = qeSpace.contWELL;
//		//V[1] = V[N] = 10;
//		//V[1] = V[N] = Infinity;
//	}

}

// ψ itself; can have more than one per jSpace
export class jWave {
	// N is the resolution of the jWave buffer; the array is 2 more cells
	constructor(space) {
		this.space = space;
		let {N} = space;

		// the wave function itself
		this.psi = new Array(N + 2);
		this.setCircularWave(1);

		//console.info(`JS jWave constructed: `, this)
	}

	dump(title = 'a jWave') {
		console.info(`${title} ==> ⟨ψ | ψ⟩ = `, this.innerProduct());
		this.psi.forEach((p, ix) => console.info(`   ψ[${ix}]: ${p.real.toFixed(6)}\t${p.im.toFixed(6)}`));
	}

	// just iterate over all.  ψ must be created already
	forEach(callback) {
		let {space: {N}, psi} = this;
		for (let ix = 1; ix <= N; ix++)
			callback(psi[ix], ix-1);
	}

	// for in-place arithmetic on each point
	// we can use this for original wavefunctions with no ψ existing;
	map(callback) {
		let {space: {N}, psi} = this;
		if (!psi)
			psi = [];
		for (let ix = 1; ix <= N; ix++)
			psi[ix] = callback(psi[ix], ix-1);
		this.psi = psi;
		this.fixBoundaries();
	}

	/* *************************************** basic math */

	// fix  the [0] and [N+1] cells depending on what's going on
	fixBoundaries(psiAr = this.psi) {
		let {N, continuum} = this.space;
		switch (continuum) {
		case qeSpace.contDISCRETE:
			// ain't no points on the end
			break;

		case qeSpace.contWELL:
			// the points on the end are ∞ potential, but the arithmetic
			// goes bonkers if I actually set the voltage to ∞
			psiAr[0] = qCx(0);
			psiAr[N+1] = qCx(0);
			break;

		case qeSpace.contENDLESS:
			// the points on the end get set to the opposite side
			psiAr[0] = psiAr[N];
			psiAr[N+1] = psiAr[1];
			break;
		}
	}

	// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
	innerProduct() {
		let tot = 0;  // always real
		this.forEach(p => {
			tot += p.real ** 2 + p.im ** 2;
		})
		return tot;
	}

	// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
	normalize() {
		let t = this.innerProduct();

		// now adjust it so the norm comes out 1
		let factor = Math.pow(t, -.5);

		// remember: this is jWave->map() not Array->map()
		this.map(p => {
			if (!p) debugger;
			return p.multBy(factor);
		});
	}

	// this difeq tends to diverge with freq=2, alternating points.
	// Filter out that junk. (also normalize)
	lowPassFilter() {
		let {space: {N}, psi} = this;
		let newPsi = new Array(N+2);
		for (let ix = 1; ix <= N; ix++) {
			newPsi[ix] = psi[ix-1].addTo(psi[ix], 2).addTo(psi[ix+1]);
		}
		this.psi = newPsi;
		this.normalize();
		console.log(`============================== did low pass filter`);
	}

	/* *************************************** set jWave */

	// fill the jWave with an unrealistic electron that's constant magnitude,
	// moving with frequency n
	// n >= 1 and can be any positive or negative real.
	setCircularWave(n = 1) {
		let N = this.space.N;
		const dAngle = 2 * Math.PI / N;
		this.map((p, ix) => {
			let angle = dAngle * ix * n;
			return qCx(Math.cos(angle), Math.sin(angle));
		} );
		this.normalize();
	}

	// fill the jWave with an electron that's a standing wave of frequency n
	// n >= 1 and should be integer, although you can try other values.
	setStandingWave(n = 1) {
		n = +n;

		let N = this.space.N;
		const dAngle = Math.PI / N;
		this.map((p, ix) => qCx(Math.sin(dAngle * ix * n)) );

		this.normalize();

		//this.innerProduct();
	}

	// fill the jWave with a dirac delta jWave function
	setPulseWave() {
		this.psi = null;
		this.map(p => qCx(0));
		this.psi[Math.floor((this.N + 1) / 2)] = qCx(1);
		this.normalize();
	}

}

export default jWave;
