import wave from './wave';
//import complex from 'complex';
import cx from './cx';

// schrodinger's:
//    ih ∂psi / ∂t  =  [V - (h^2/2m) (∂^2/∂x^2)] psi
// so have to calculate second derivative of it all.  dx=1 always.
//

export const DEFAULT_DT = 0.1;
const h2_2m = 1;
const dx = 1;

let psi_tHalf;
let psi_tHalf_N;

function check(aCx) {
		if (isNaN(aCx.real) || isNaN(aCx.im)) debugger;
}

export function iterate(wave, dt = DEFAULT_DT) {
	let {psi, space} = wave;
	let {V, N, end} = space;
	let psi_t0 = psi;

	// avoid reallocating this
	if (N != psi_tHalf_N) {
		psi_tHalf_N = N;
		psi_tHalf = new Array(N + 2);
	}

	// so at location n,
	// the derivative would be (psi[n+1] - psi[n]) / dn
	//                      or (psi[n] - psi[n-1]) / dn
	// so second deriv would be psi[n+1] + psi[n-1] - 2* psi[n]

	wave.fixBoundaries();
	//console.info(`𝜓(t_0): `, psi_t0);

	// d𝜓/dt as calculated from 2nd deriv, at time t0
	for (let ix = 1; ix < end; ix++) {
		// second derivative at the current time t0
		let d2Psi_dx2_t0 = psi_t0[ix+1]
			.addTo(psi_t0[ix-1])
			.addTo(psi_t0[ix], -2)
			//its always 1 .multBy(1 / (dx * dx));
		check(d2Psi_dx2_t0);

		// dPsi_dt_t0 = V[ix] * psi_t0[ix] - h2_2m * d2Psi_dt2_t0_t0[ix];
		let VPsi = psi_t0[ix].multBy(V[ix]);
		let dPsi_dt_t0 = VPsi.addTo(d2Psi_dx2_t0, -h2_2m).multBy(cx(0,-1));
		check(dPsi_dt_t0);

		// psi at t_1/2 given that derivative - must finish in this loop to take 2nd derivitive next loop
		psi_tHalf[ix] = psi_t0[ix].addTo(dPsi_dt_t0, dt/2);
		check(psi_tHalf[ix]);
	}
	wave.fixBoundaries(psi_tHalf);
//	console.info(`d𝜓/dt(t_0): `, dPsi_dt_t0);
	//console.info(`𝜓(t_half): `, psi_tHalf);

	// given that, calc d𝜓/dt at t_1/2
	for (let ix = 1; ix < end; ix++) {
		// second derivative at the time tHalf
		let d2Psi_dx2_tHalf = psi_tHalf[ix+1]
			.addTo(psi_tHalf[ix-1])
			.addTo(psi_tHalf[ix], -2)
			// always 1 .multBy(1 / (dx * dx));
		check(d2Psi_dx2_tHalf);

		// now calculate dPsi_dt_tHalf, the actual derivative halfway thru
		let VPsi_half = psi_tHalf[ix].multBy(V[ix]);
		let dPsi_dt_tHalf = VPsi_half.addTo(d2Psi_dx2_tHalf, -h2_2m).multBy(cx(0,-1));
		check(dPsi_dt_tHalf);

		// now increment psi by full step dt * derivative_Half, shbe right
		wave.psi[ix] = psi[ix].addTo(dPsi_dt_tHalf, dt);
		check(wave.psi[ix]);
	}

	// hokey.  what if i normalized again...
	//wave.normalize();

	//console.info(`psi: `, psi);
	//wave.dump('𝜓 after')
}


export default iterate;
