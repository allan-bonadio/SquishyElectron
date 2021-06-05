import wave from './wave';
//import complex from 'complex';
import qCx from './qCx';
import {waveBuffers} from './theWave';

// schrodinger's:
//    ih ∂psi / ∂t  =  [V - (h^2/2m) (∂^2/∂x^2)] psi
// so have to calculate second derivative of it all.  dx=1 always.
//

export const DEFAULT_DT = 0.1;
const h2_2m = 1;
const dx = 1;

function check(aCx) {
		if (isNaN(aCx.real) || isNaN(aCx.im)) debugger;
}

export function iterate(wave, dt = DEFAULT_DT) {
	let {psi: mainWave, space} = wave;
	let {V, N, end} = space;

	// so at location n,
	// the derivative would be (psi[n+1] - psi[n]) / dn
	//                      or (psi[n] - psi[n-1]) / dn
	// so second deriv would be psi[n+1] + psi[n-1] - 2* psi[n]

	wave.fixBoundaries();
	//console.info(`𝜓(t_0): `, mainWave);

	// d𝜓/dt as calculated from 2nd deriv, at time t0
	for (let ix = 1; ix <= N; ix++) {
		// second derivative at the current time t0
		let d2Psi_dx2_t0 = mainWave[ix+1]
			.addTo(mainWave[ix-1])
			.addTo(mainWave[ix], -2)
			//its always 1 .multBy(1 / (dx * dx));
		check(d2Psi_dx2_t0);

console.log(`js ${ix}first d2=${d2Psi_dx2_t0.real.toFixed(6)} ${d2Psi_dx2_t0.im.toFixed(6)}`);////

		// dPsi_dt_t0 = V[ix] * mainWave[ix] - h2_2m * d2Psi_dt2_t0_t0[ix];
		let VPsi = mainWave[ix].multBy(V[ix]);
		let dPsi_dt_t0 = VPsi.addTo(d2Psi_dx2_t0, -h2_2m);
//console.log(`js ${ix}first hamiltonian=${dPsi_dt_t0.real.toFixed(6)} ${dPsi_dt_t0.im.toFixed(6)}`);////
		dPsi_dt_t0 = dPsi_dt_t0.multBy(qCx(0,-1));
		check(dPsi_dt_t0);

		// psi at t_1/2 given that derivative - must finish in this loop to take 2nd derivitive next loop
		waveBuffers.alt[ix] = mainWave[ix].addTo(dPsi_dt_t0, dt/2);
		check(waveBuffers.alt[ix]);
	}
	wave.fixBoundaries(waveBuffers.alt);

//	console.info(`d𝜓/dt(t_0): `, dPsi_dt_t0);
//console.info(`𝜓(t_half): `, waveBuffers.alt);
for (let ix = 0; ix <= N+1; ix++)
console.log(`iterate ${ix}\t${waveBuffers.alt[ix].real.toFixed(6)}\t${waveBuffers.alt[ix].im.toFixed(6)}`)


	// given that, calc d𝜓/dt at t_1/2
	for (let ix = 1; ix <= N; ix++) {
		// second derivative at the time tHalf
		let d2Psi_dx2_tHalf = waveBuffers.alt[ix+1]
			.addTo(waveBuffers.alt[ix-1])
			.addTo(waveBuffers.alt[ix], -2)
			// always 1 .multBy(1 / (dx * dx));
		check(d2Psi_dx2_tHalf);
console.log(`js ${ix}second d2=${d2Psi_dx2_tHalf.real.toFixed(6)} ${d2Psi_dx2_tHalf.im.toFixed(6)}`);////

		// now calculate dPsi_dt_tHalf, the actual derivative halfway thru
		let VPsi_half = waveBuffers.alt[ix].multBy(V[ix]);
		let dPsi_dt_tHalf = VPsi_half.addTo(d2Psi_dx2_tHalf, -h2_2m);
		check(dPsi_dt_tHalf);
//console.log(`js ${ix}second hamiltonian=${dPsi_dt_tHalf.real.toFixed(6)} ${dPsi_dt_tHalf.im.toFixed(6)}`);////
		dPsi_dt_tHalf = dPsi_dt_tHalf.multBy(qCx(0,-1));
		check(dPsi_dt_tHalf);

		// now increment psi by full step dt * derivative_Half, shbe right
		waveBuffers.next[ix] = mainWave[ix].addTo(dPsi_dt_tHalf, dt);
		check(waveBuffers.next[ix]);
	}

	// flip around.  do we really need all these buffers?!?!?
	const oldWave = wave.psi;
	wave.psi = waveBuffers.next;
	waveBuffers.next = oldWave;

	wave.fixBoundaries();
}


export default iterate;
