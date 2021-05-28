// we have an N element array for the psi values, indexed (sortof) by X,
// whatever mins/maxes/increments, will be calculated.
// Boundary conditions: each row will have N+2 elements, where the 0th and the
// N+1-th element are the low and high boundaries.  They kindof have to be clamped to psi =
// zero, and the corresponding V must be infinite, to completely shut out any ψ
// off the ends.

// the wave function ψ in a quantum-101 simiple potential energy well.
// N is number of data points, including the boundaries

import qCx from './qCx';
import iterate from './iterate';
//const isZero = c => (Math.abs(c.real) < 1e-10 && Math.abs(c.im) < 1e-10);

export class space {
	constructor(N) {
		this.N = +N;

		// all the points range from 1 thru end-1 so loops go ix=1, ix <= N
		this.end = this.N + 1;

		// V, the potential, is always real numbers
		this.V = new Array(this.N + 2);
		this.setZeroVoltage();

		this.walls = false;

		console.info(`space constructed: `, this)
	}

	/* *************************************** voltage */

	setVoltage(V) {
		this.V = V;
	}

	// default
	setZeroVoltage() {
		let V = this.V;
		V.fill(0);
		this.walls = false;
	}

	// infinite walled well at  ends
	setWaveVoltage() {
		let {V, N} = this;
		V.fill(0);

		// tried Infinity; i get NaNs and I can't do anything with them..
		// tried 10, just doesn't cut it.
		this.walls = true;
		//V[1] = V[N] = 10;
		//V[1] = V[N] = Infinity;
	}

}

// psi itself; can have more than one per space
export class wave {
	// N is the resolution of the wave buffer; the array is 2 more cells
	constructor(space) {
		this.space = space;
		let {N} = space;

		// the wave function itself
		this.psi = new Array(N + 2);
		this.setConstantWave(1);

		console.info(`wave constructed: `, this)
	}

	dump(title = 'a wave') {
		console.info(`${title} ==> ⟨ψ | ψ⟩ = `, this.innerProduct());
		this.psi.forEach((p, ix) => console.info(`   psi[${ix}]: ${p}`));
	}

	// just iterate over all.  psi must be created already
	forEach(callback) {
		let {space: {N}, psi} = this;
		for (let ix = 1; ix <= N; ix++)
			callback(psi[ix], ix-1);
	}

	// for in-place arithmetic on each point
	// we can use this for original wavefunctions with no psi existing;
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
		let {N} = this.space;
		if (this.walls) {
			// the points on the end are ∞ potential, but the arithmetic goes bonkers
			// if I actually set the voltage to ∞
			psiAr[0] = qCx();
			psiAr[N+1] = qCx();
		}
		else {
			// the points on the end get set to the opposite side
			psiAr[0] = psiAr[N];
			psiAr[N+1] = psiAr[1];
		}
	}

	// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
	innerProduct() {
		let {N, psi} = this;
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

		// remember: this is wave->map() not Array->map()
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
		console.log(`did low pass filter`);
	}

	/* *************************************** set wave */

	// fill the wave with an electron that's a standing wave of frequency n
	// n >= 1 and should be integer, although you can try other values.
	setHarmonicWave(n = 1) {
		n = +n;

		let N = this.space.N;
		const dAngle = Math.PI / N;
		this.map((p, ix) => qCx(Math.sin(dAngle * ix * n)) );

		this.normalize();

		//this.innerProduct();
	}

	// fill the wave with an unrealistic electron that's constant magnitude,
	// moving with frequency n
	// n >= 1 and can be any positive or negative real.
	setConstantWave(n = 1) {
		let N = this.space.N;
		const dAngle = 2 * Math.PI / N;
		this.map((p, ix) => {
			let angle = dAngle * ix * n;
			return qCx(Math.cos(angle), Math.sin(angle));
		} );
		this.normalize();
	}

	// fill the wave with a dirac delta wave function
	setDiracDelta() {
		this.psi = null;
		this.map(p => qCx(0));
		this.psi[Math.floor((this.N + 1) / 2)] = qCx(1);
		this.normalize();
	}

}

/* **************************************** older; finish this... */
//export class well {
//	// N is the resolution of the wave buffer; the array is 2 more cells
//	constructor(N) {
//		this.N = +N;
//
//		// all the points range from 1 thru end-1 so loops go ix=1, ix <= N
//		this.end = this.N + 1;
//
//		// the wave function itself
//		this.psi = new Array(this.N + 2);
//		this.setConstantWave(1);
//
//		// V, the potential, is always real numbers
//		this.V = new Array(this.N + 2);
//		this.setZeroVoltage();
//
//		this.walls = false;
//
//		console.info(`well constructed: `, this)
//	}
//
//	dump(title = 'a well') {
//		console.info(`${title} ==> ⟨ψ | ψ⟩ = `, this.innerProduct());
//		this.psi.forEach((p, ix) => console.info(`   psi[${ix}]: ${p}`));
//	}
//
//	// just iterate over all.  psi must be created already
//	forEach(callback) {
//		let {space: {N}, psi} = this;
//		for (let ix = 1; ix <= N; ix++)
//			callback(psi[ix], ix-1);
//	}
//
//	// for in-place arithmetic on each point
//	// we can use this for original wavefunctions with no psi existing;
//	map(callback) {
//		let {space: {N}, psi} = this;
//		if (!psi)
//			this.psi = psi = [];
//		for (let ix = 1; ix <= N; ix++)
//			psi[ix] = callback(psi[ix], ix-1);
//		this.fixBoundaries();
//	}
//
//	/* *************************************** basic math */
//
//	// fix  the [0] and [N+1] cells depending on what's going on
//	fixBoundaries(psiAr = this.psi) {
//		if (this.walls) {
//			// the points on the end are ∞ potential, but the arithmetic goes bonkers
//			// if I actually set the voltage to ∞
//			psiAr[0] = qCx();
//			psiAr[this.N+1] = qCx();
//		}
//		else {
//			// the points on the end get set to the opposite side
//			psiAr[0] = psiAr[this.N];
//			psiAr[this.N+1] = psiAr[1];
//		}
//	}
//
//	// calculate ( ψ | x )
//	// x is a naked array of complex numbers
//	dot(x) {
//		console.error('warning not tested')
////		let t = qCx(0);
////		let psi = this.psi;
//////		t = this.psi.map((p, ix) => qCx(p).multiply(x[ix])).reduce((a, b) => a + b, 0);
////		for (let ix = 1; ix <= N; ix++)
////			t.addTo(qCx(psi[ix]).multiply(x[ix]));
////		return t;
//	}
//
//	// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
//	innerProduct() {
//		let {N, psi} = this;
//		let tot = 0;  // always real
//		this.forEach(p => {
//			tot += p.real ** 2 + p.im ** 2;
//		})
//		return tot;
//	}
//
//	// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
//	normalize() {
//		let t = this.innerProduct();
//
//		// now adjust it so the norm comes out 1
//		let factor = Math.pow(t, -.5);
//
//		// remember: this is well->map() not Array->map()
//		this.map(p => {
//			if (!p) debugger;
//			return p.multBy(factor);
//		});
//	}
//
//	// this difeq tends to diverge with freq=2, alternating points.
//	// Filter out that junk. (also normalize)
//	lowPassFilter() {
//		let {space: {N}, psi} = this;
//		let newPsi = new Array(N+2);
//		for (let ix = 1; ix <= N; ix++) {
//			newPsi[ix] = psi[ix-1].addTo(psi[ix], 2).addTo(psi[ix+1]);
//		}
//		this.psi = newPsi;
//		this.normalize();
//		console.log(`did low pass filter`);
//	}
//
//	/* *************************************** set wave */
//
//	// fill the well with an electron that's a standing wave of frequency n
//	// n >= 1 and should be integer, although you can try other values.
//	setHarmonicWave(n = 1) {
//		n = +n;
//
//		let N = this.space.N;
//		const dAngle = Math.PI / N;
//		this.map((p, ix) => qCx(Math.sin(dAngle * ix * n)) );
//
//		this.normalize();
//
//		//this.innerProduct();
//	}
//
//	// fill the well with an unrealistic electron that's constant magnitude,
//	// moving with frequency n
//	// n >= 1 and can be any positive or negative real.
//	setConstantWave(n = 1) {
//		let N = this.space.N;
//		const dAngle = 2 * Math.PI / N;
//		this.map((p, ix) => {
//			let angle = dAngle * ix * n;
//			return qCx(Math.cos(angle), Math.sin(angle));
//		} );
//		this.normalize();
//	}
//
//	// fill the well with a dirac delta wave function
//	setDiracDelta() {
//		this.psi = null;
//		this.map(p => qCx(0));
//		this.psi[Math.floor((this.N + 1) / 2)] = qCx(1);
//		this.normalize();
//	}
//
//
//	// why doesn't this work!??!
//	iterate: iterate;
//};

export default wave;
