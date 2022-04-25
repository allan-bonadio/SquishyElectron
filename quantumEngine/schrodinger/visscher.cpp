/*
** visscher -- schrodinger ODE integration by staggering re and im
**			by half dx, Visscher second order accuracy
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


//#include <stdio.h>
//#include <ctime>
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"


static bool debugVisscher = false;
static bool debugHalfway = false;  // confusing, not reccommended
static bool traceVischerBench = true;

/*
A fast explicit algorithm for the time-dependent Schrodinger equation
P. B. Visscher (emeritus)
Department of Physics and Astronomy, University of Alabama, Tuscaloosa, Alabama 35487-0324

reinterpreted from the article
" A fast explicit algorithm for the time-dependent Schrodinger Equation"
Computers in Physics 5, 596 (1991); doi: 10.1063/1.168415

The present algorithm is motivated by writing the Schrodinger equation in terms
of the real and imaginary parts R and I of the wave function.

We will define
		• R = 𝜓.re at times O,dt,2dt,..., and
		• I = 𝜓.im at times .5dt, 1.5dt, ...
so that in our buffers of complex numbers, the Im part is dt/2 ahead of the Re part:

            real components    imag components
new wave 0:  ψr(t + dt)         ψi(t + 3dt/2)
old wave 1:  ψr(t)              ψi(t + dt/2)

The natural discretization of Eqs. (6) is therefore
	ψr(t + dt) = ψr(t) + dt H ψi(t + dt/2)

Half a tick later, at a half odd integer multiple of dt,
	ψi(t + dt/2) = ψi(t - dt/2) - dt H ψr(t)
or
	ψi(t + 3dt/2) = ψi(t + dt/2) - dt H ψr(t + dt)

where H is hamiltonian, typically ( potential + ∂2/∂x2 )
We do the hamiltonian custom here instead of using the function in hamiltonian.cpp
and for now omit the potential
 */


// 	qCx d2 = wave[x-1] + wave[x+1] - wave[x] * 2;
// 	qCheck(d2);



// first step: advance the ψr a dt, from t to t + dt
// oldW points to buffers[1] with real = ψr(t)    imag = ψi(t + dt/2)
// newW points to buffers[0] with real = ψr(t + dt)   imag = ψi(t + 3dt/2)
// here we will calculate the ψr(t + dt) values in buffer 0 only, and fill them in.
// the ψi values in buffer 0 are still uncalculated
void qSpace::stepReal(qCx *oldW, qCx *newW, double dt) {
	qDimension *dims = dimensions;
	//printf("⚛️ start of stepReal");
	//dumpThatWave(oldW, true);
	//printf("⚛︎ stepReal start N States=(%d), dt=%lf\n",
	//	dims->nStates, dt);

	//printf("⚛︎ the hamiltonian 𝜓.re at ...\n");
	for (int ix = dims->start; ix < dims->end; ix++) {
		///double oldWr = oldW[ix].re;

		// note this is
		double d2ψi = oldW[ix-1].im + oldW[ix+1].im - oldW[ix].im * 2;

		//printf("⚛︎ x=%d  Hψ = %lf,%lf \n", ix, d2.re, d2.im);

		double Hψ = d2ψi;   // + Vψ

		// note subtraction
		newW[ix].re = oldW[ix].re - dt * Hψ;
		qCheck("vischer stepReal", newW[ix]);
	}
	if (traceVischerBench) printf("      stepReal, on to fix boundaries: time=%lf\n", getTimeDouble());
	fixThoseBoundaries(newW);
	//printf("⚛️ end of stepReal:");
	//dumpThatWave(newW, true);
}

// second step: advance the Imaginaries of 𝜓 a dt, from dt/2 to 3dt/2
// given the reals we just generated in stepReal() (usually)
void qSpace::stepImaginary(qCx *oldW, qCx *newW, double dt) {
	qDimension *dims = dimensions;
	//printf("⚛︎ start of stepImaginary(), oldWave=");
	//dumpThatWave(oldW, true);
	//printf("⚛︎ dt=%lf\n", dt);

	//double *potential = potential;
	//printf("⚛︎ the hamiltonian 𝜓.im at ...\n");
	for (int ix = dims->start; ix < dims->end; ix++) {

		double d2ψr = oldW[ix-1].re + oldW[ix+1].re - oldW[ix].re * 2;

		//printf("⚛︎ the hamiltonian 𝜓.im at x=%d  then dt=%lf d2x=%lf,%lf oldW1=%lf,%lf\n",
		//	ix, dt, d2.re,d2.im, oldW1.re, oldW1.im);

		double Hψ = d2ψr; // + potential[ix];
		//double Hψ = d2ψr;  // without potential

		// note addition
		newW[ix].im = oldW[ix].im + dt * Hψ;

		//newW[ix].im = oldW1.im - dt * d2.im;
		//newW[ix].im = oldW1.im - dt * H.im * newW[ix].re;
		qCheck("vischer stepImaginary", newW[ix]);
	}
	if (traceVischerBench) printf("      stepImaginary, on to fix boundaries: time=%lf\n", getTimeDouble());

	fixThoseBoundaries(newW);
	//printf("⚛️ end of stepImaginary - result wave:");
	//dumpThatWave(newW, true);
}

// form the new wave from the old wave, in separate buffers, chosen by our caller.
void qSpace::oneVisscherStep(qWave *oldQWave, qWave *newQWave) {
	qWave *oldQW = oldQWave;
	qCx *oldW = oldQWave->wave;
	qWave *newQW = newQWave;
	qCx *newW = newQWave->wave;

	if (traceVischerBench) printf("❇️ oneVisscherStep, start: time=%lf\n", getTimeDouble());
	if (traceVischerBench) printf("❇️ oneVisscherStep, consecutive: time=%lf\n", getTimeDouble());

	qDimension *dims = dimensions;
	oldQW->fixBoundaries();
	if (debugVisscher) oldQW->dumpWave("starting oneVisscherStep", true);

	if (traceVischerBench) printf("         oneVisscherStep, about to stepReal: time=%lf\n", getTimeDouble());
	stepReal(oldW, newW, dt);
	if (debugHalfway) newQWave->dumpWave("Visscher wave after the Re step", true);
	// now at an half-odd fraction of dt

	if (traceVischerBench) printf("         oneVisscherStep, about to stepImaginary: time=%lf\n", getTimeDouble());
	stepImaginary(oldW, newW, dt);
	// now at an integer fraction of dt

	// ok so after this, the time has advanced dt, and real is at elapsedTime and
	// imaginary is at elapsedTime + dt/2.  Yes the re and the im are not synchronized.
	// it was Visscher's idea.  I think he got it from someone else.
	elapsedTime += dt;

	if (debugVisscher) {
		char atVisscher[100];
		snprintf(atVisscher, 100, "at end of Visscher frame %1.0lf | ", iterateSerial);
		newQW->dumpWave(atVisscher, true);
	}
	if (traceVischerBench) printf("         oneVisscherStep, done: time=%lf\n", getTimeDouble());
}

// can I make this useful?  Is it needed ? when I get viss working,
// I should know.
// shift the Im components of the old wave a half tick forward and store in newQWave.
// if we're using visscher, we need to initialize waves with the
// im component a half dt ahead.  This does it for newly created stuff, like set waves.
// If not visscher, returns harmlessly.
void qSpace::visscherHalfStep(qWave *oldQWave, qWave *newQWave) {
	qDimension *dims = dimensions;
	qCx *oldW = oldQWave->wave;
	qCx *newW = newQWave->wave;

	// let's try moving the im forward dt/2 for the next wave.
	// the current wave here is corrupt (being at the same time re/im) so add new one
	double halfDt = dt / 2;

	// fake stepReal() by just copying over the real values
	for (int ix = dims->start; ix < dims->end; ix++)
		newW[ix].re = oldW[ix].re;

	stepImaginary(oldQWave->wave, newQWave->wave, halfDt);
	fixThoseBoundaries(newW);
}

