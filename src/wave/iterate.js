//import jWave from './wave';
//import complex from 'complex';
import qCx from './qCx';
//import {jWaveBuffers} from './theWave';

let jWaveBuffers;

// schrodinger's:
//    ih ∂ψ / ∂t  =  [V - (h^2/2m) (∂^2/∂x^2)] ψ
// so have to calculate second derivative of it all.  dx=1 always.
//

export const DEFAULT_DT = 0.1;
const h2_2m = 1;
//const dx = 1;

function check(aCx) {
		if (isNaN(aCx.re) || isNaN(aCx.im)) debugger;
}

export function iterate(wave, dt = DEFAULT_DT) {
	let {psi: mainWave, space} = wave;
	let {V, N} = space;

	// so at location n,
	// the derivative would be (ψ[n+1] - ψ[n]) / dn
	//                      or (ψ[n] - ψ[n-1]) / dn
	// so second deriv would be ψ[n+1] + ψ[n-1] - 2* ψ[n]

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

		//console.log(`js ${ix}first d2=${d2Psi_dx2_t0.re.toFixed(6)}`+
		//` ${d2Psi_dx2_t0.im.toFixed(6)}`);////

		// dPsi_dt_t0 = V[ix] * mainWave[ix] - h2_2m * d2Psi_dt2_t0_t0[ix];
		let VPsi = mainWave[ix].multBy(V[ix]);
		let dPsi_dt_t0 = VPsi.addTo(d2Psi_dx2_t0, -h2_2m);
		//console.log(`js ${ix}first hamiltonian=${dPsi_dt_t0.re.toFixed(6)}`+
		//` ${dPsi_dt_t0.im.toFixed(6)}`);////
		dPsi_dt_t0 = dPsi_dt_t0.multBy(qCx(0,-1));
		check(dPsi_dt_t0);

		// ψ at t_1/2 given that derivative - must finish in this loop
		// to take 2nd derivitive next loop
		jWaveBuffers.alt[ix] = mainWave[ix].addTo(dPsi_dt_t0, dt/2);
		check(jWaveBuffers.alt[ix]);
	}
	wave.fixBoundaries(jWaveBuffers.alt);

		//	console.info(`d𝜓/dt(t_0): `, dPsi_dt_t0);
		//console.info(`𝜓(t_half): `, jWaveBuffers.alt);
		//for (let ix = 0; ix <= N+1; ix++)
		//console.log(`iterate ${ix}\t${jWaveBuffers.alt[ix].re.toFixed(6)}`+
		//`\t${jWaveBuffers.alt[ix].im.toFixed(6)}`);


	// given that, calc d𝜓/dt at t_1/2
	for (let ix = 1; ix <= N; ix++) {
		// second derivative at the time tHalf
		let d2Psi_dx2_tHalf = jWaveBuffers.alt[ix+1]
			.addTo(jWaveBuffers.alt[ix-1])
			.addTo(jWaveBuffers.alt[ix], -2)
			// always 1 .multBy(1 / (dx * dx));
		check(d2Psi_dx2_tHalf);
		//console.log(`js ${ix}second d2=${d2Psi_dx2_tHalf.re.toFixed(6)}`+
		//` ${d2Psi_dx2_tHalf.im.toFixed(6)}`);////

		// now calculate dPsi_dt_tHalf, the actual derivative halfway thru
		let VPsi_half = jWaveBuffers.alt[ix].multBy(V[ix]);
		let dPsi_dt_tHalf = VPsi_half.addTo(d2Psi_dx2_tHalf, -h2_2m);
		check(dPsi_dt_tHalf);
		//console.log(`js ${ix}second hamiltonian=${dPsi_dt_tHalf.re.toFixed(6)}`+
		//` ${dPsi_dt_tHalf.im.toFixed(6)}`);////
		dPsi_dt_tHalf = dPsi_dt_tHalf.multBy(qCx(0,-1));
		check(dPsi_dt_tHalf);

		// now increment ψ by full step dt * derivative_Half, shbe right
		jWaveBuffers.next[ix] = mainWave[ix].addTo(dPsi_dt_tHalf, dt);
		check(jWaveBuffers.next[ix]);
	}

	// flip around.  do we really need all these buffers?!?!?
	const oldWave = wave.psi;
	wave.psi = jWaveBuffers.next;
	jWaveBuffers.next = oldWave;

	wave.fixBoundaries();
}


export default iterate;
