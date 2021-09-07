/*
** visscher -- schrodinger ODE integration by staggering re and im
**			by half dx, Visscher second order accuracy
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include <ctime>
#include "qSpace.h"
#include "qWave.h"

static bool debug = true;
//bool debug = false;

static bool debugHalfway = false;  // confusing, not recc

/*
A fast explicit algorithm for the time-dependent Schrodinger equation
P. B. Visscher (emeritus)
Department of Physics and Astronomy, University of Alabama, Tuscaloosa, Alabama 35487-0324

partly from the article
" A fast explicit algorithm for the time-dependent Schrodinger Equation"
The present algorithm is motivated by writing the Schrodinger equation in terms
of the real and imaginary parts R and I of the wave function

We will define
		• R = ψ.re at times O,dt,2dt,..., and
		• I = ψ.im at times .5dt, 1.5dt, ...
so that in our buffer of complex numbers, the Im part is dt/2 ahead of the Re part.
The natural discretization of Eqs. (6) is therefore
	R(t + dt) = R(t) + dt H I(t + dt/2)
Half a tick later, at a half odd integer multiple of dt,
	I(t + dt) = I(t) - dt H R(t + dt/2)

allan:
where H is hamiltonian, and the time arguments aren't used here so don't worry
 */


// 	qCx d2 = wave[x-1] + wave[x+1] - wave[x] * 2;
// 	qCheck(d2);



// first step: advance the Reals of ψ a dt, from 0 to dt
void qSpace::stepReal(qCx *oldW, qCx *newW, double dt) {
	qDimension *dims = this->dimensions;
	printf("end of stepREal");
	this->dumpThatWave(oldW, true);
	printf("stepReal start dims(%d), dt=%lf\n",
		dims->nStates, dt);

	printf("the hamiltonian ψ.re at ...\n");
	for (int ix = dims->start; ix < dims->end; ix++) {
		qCx oldW1 = oldW[ix];

		qCx d2 = oldW[ix-1] + oldW[ix+1] - oldW[ix] * 2;
		// qCx H = hamiltonian(oldW, ix).re;

		printf("x=%d  Hψ = %lf,%lf \n", ix, d2.re, d2.im);

		newW[ix].re = oldW1.re + dt * d2.re;
		//newW[ix].re = oldW1.re + dt * H.re * oldW1.im;
		qCheck(newW[ix]);
	}
	this->fixThoseBoundaries(newW);
	printf("end of stepREal");
	this->dumpThatWave(newW, true);
}

// second step: advance the Imaginaries of ψ a dt, from dt/2 to 3dt/2
// given the reals we just generated
void qSpace::stepImaginary(qCx *oldW, qCx *newW, double dt) {
	qDimension *dims = this->dimensions;
	printf("start of stepImaginary");
	this->dumpThatWave(oldW, true);
	printf("dt=%lf\n", dt);

	printf("the hamiltonian ψ.im at ...\n");
	for (int ix = dims->start; ix < dims->end; ix++) {
		qCx oldW1 = oldW[ix];

		qCx d2 = oldW[ix-1] + oldW[ix+1] - oldW[ix] * 2;
		//qCx HH = hamiltonian(oldW, ix);

		// actually H times ψ
		// qCx H = hamiltonian(oldW, ix);

		printf("the hamiltonian ψ.im at x=%d  then dt=%lf d2x=%lf,%lf oldW1=%lf,%lf\n",
			ix, dt, d2.re,d2.im, oldW1.re, oldW1.im);

		newW[ix].im = oldW1.im - dt * d2.im;
		//newW[ix].im = oldW1.im - dt * H.im * newW[ix].re;
		qCheck(newW[ix]);
	}
	this->fixThoseBoundaries(newW);
	printf("end of stepImaginary ");
	this->dumpThatWave(newW, true);
}

// form the new wave from the old wave, in separate buffers, chosen by our caller.
void qSpace::oneVisscherStep(qWave *oldQWave, qWave *newQWave) {
	qWave *oldQW = oldQWave;
	qCx *oldW = oldQWave->buffer;
	qWave *newQW = newQWave;
	qCx *newW = newQWave->buffer;

	qDimension *dims = this->dimensions;
	oldQW->fixBoundaries();
	oldQW->dumpWave("starting oneVisscherStep", true);

	// see if this makes a diff
//	for (int i = dims->start; i < dims->end; i++)
//		newW[i] = qCx(i);

	stepReal(oldW, newW, dt);
	if (debugHalfway) newQWave->dumpWave("Visscher wave after the Re step", true);
	// now at an half-odd fraction of dt

	stepImaginary(oldW, newW, dt);
	// now at an integer fraction of dt

	// ok so after this, the time has advanced dt, and real is at elapsedTime and
	// imaginary is at elapsedTime + dt/2.  Yes the re and the im are not synchronized.
	// it was Visscher's idea.  I think he got it from someone else.
	this->elapsedTime += dt;
	this->iterateSerial++;

	if (true) {
		char atVisscher[100];
		sprintf(atVisscher, "at end of Visscher frame %1.0lf | ", this->iterateSerial);
		newQW->dumpWave(atVisscher, true);
	}
}

// can I make this useful?  Is it needed ? when I get viss working,
// I should know.
// shift the Im components of the old wave a half tick forward and store in newQWave.
// if we're using visscher, we need to initialize waves with the
// im component a half dt ahead.  This does it for newly created stuff, like set waves.
// If not visscher, returns harmlessly.
void qSpace::visscherHalfStep(qWave *oldQWave, qWave *newQWave) {
	if (this->algorithm != algVISSCHER)
		throw "qSpace::visscherHalfStep() shouldn't on non-Visscher";
	qDimension *dims = this->dimensions;
	qCx *oldW = oldQWave->buffer;
	qCx *newW = newQWave->buffer;

	// let's try moving the im forward dt/2 for the next wave.
	// the current wave here is corrupt (being at the same time re/im) so add new one
	qReal halfDt = this->dt / 2;

	// fake stepReal() by just copying over the real values
	for (int ix = dims->start; ix < dims->end; ix++)
		newW[ix].re = oldW[ix].re;

	stepImaginary(oldQWave->buffer, newQWave->buffer, halfDt);
	this->fixThoseBoundaries(newW);
}

// If not visscher, returns harmlessly.
//void qSpace::visscherHalfStep4(qWave *oldQWave, qWave *newQWave) {
//	if (this->algorithm != algVISSCHER)
//		return;
//
//	// let's try moving the real backward 1/4  dt and moving im forward 1/4
//	qReal quarterDt = this->dt / 4;
//
//	stepReal(oldQWave, newQWave, this->dimensions, -quarterDt);
//
//	stepImaginary(oldQWave, newQWave, this->dimensions, quarterDt);
//}
