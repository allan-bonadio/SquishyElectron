/*
** visscher -- schrodinger ODE integration by staggering re and im
**			by half dx, Visscher second order accuracy
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "qSpace.h"
#include <ctime>

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
where H is hamiltonian, and the time arguments aren't used here so don't worry
 */

// first step: advance the Reals of ψ a dt, from 0 to dt
void stepReal(qWave *oldQWave, qWave *newQWave, qDimension *dim, double dt) {
	qCx *oldW = oldQWave->buffer;
	qCx *newW = newQWave->buffer;
	printf("stepReal(oldQWave(%lf %lf), newQWave(%lf %lf), dim(%d), dt=%lf\n",
		oldW[1].re, oldW[1].im, newW[1].re, newW[1].im, dim->nStates, dt);

	for (int ix = dim->start; ix < dim->end; ix++) {
		qCx oldW1 = oldW[ix];
		qCx H = hamiltonian(oldW, ix).re;
		printf("the hamiltonian at x=%d   %lf,%lf \n", ix, H.re, H.im);
		newW[ix].re = oldW1.re + dt * H.re * oldW1.im;
		qCheck(newW[ix]);
	}
	newQWave->fixBoundaries();
	newQWave->dumpWave("end of stepReal");
}

// second step: advance the Imaginaries of ψ a dt, from dt/2 to 3dt/2
// given the reals we just generated
void stepImaginary(qWave *oldQWave, qWave *newQWave, qDimension *dim, double dt) {
	qCx *oldW = oldQWave->buffer;
	qCx *newW = newQWave->buffer;
	printf("stepImaginary(oldQWave(%lf %lf), newQWave(%lf %lf), dim(%d), dt=%lf\n",
		oldW[1].re, oldW[1].im, newW[1].re, newW[1].im, dim->nStates, dt);

	for (int ix = dim->start; ix < dim->end; ix++) {
		qCx oldW1 = oldW[ix];
		//qCx HH = hamiltonian(oldW, ix);

		qCx H = hamiltonian(oldW, ix);
		printf("the hamiltonian.im at x=%d  then dt=%lf H=%lf,%lf oldW1=%lf,%lf\n",
			ix, dt, H.re, H.im, oldW1.re, oldW1.im);
		newW[ix].im = oldW1.im - dt * H.im * newW[ix].re;
		qCheck(newW[ix]);
	}
	newQWave->fixBoundaries();
	newQWave->dumpWave("end of stepImaginary");
}

// form the new wave from the old wave, in separate buffers, chosen by our caller.
void qSpace::oneVisscherStep(qWave *oldQWave, qWave *newQWave) {
	qWave *oldQW = oldQWave;
	qCx *oldW = oldQWave->buffer;
	qWave *newQW = newQWave;
	qCx *newW = newQWave->buffer;

	qDimension *dim = this->dimensions;
	oldQW->fixBoundaries();
	//oldQW->dumpWave("starting oldW", true);

	// see if this makes a diff
	for (int i = dim->start; i < dim->end; i++)
		newW[i] = qCx(i);

	stepReal(oldQWave, newQWave, dim, dt);
	if (debugHalfway) newQWave->dumpWave("Visscher wave after the Re step", true);

	stepImaginary(oldQWave, newQWave, dim, dt);

	// ok so after this, the time has advanced dt, and real is at elapsedTime and
	// imaginary is at elapsedTime + dt/2.  Yes the re and the im are not synchronized.
	// it was Visscher's idea.  I think he got it from someone else.
	this->elapsedTime += dt;
	this->iterateSerial++;

	if (debug) {
		char atVisscher[100];
		sprintf(atVisscher, "at end of Visscher frame %1.0lf | ", this->iterateSerial);
		newQW->dumpWave(atVisscher, true);
	}
}

// if we're using visscher, we need to initialize waves with the
// im component a half dt ahead.  This does it.
// If not visscher, returns harmlessly.
void qSpace::visscherHalfStep(qWave *oldQWave, qWave *newQWave) {
	if (this->algorithm != algVISSCHER)
		return;

	// let's try moving the real backward 1/4  dt and moving im forward 1/4
	qReal quarterDt = this->dt / 4;

	stepReal(oldQWave, newQWave, this->dimensions, -quarterDt);

	stepImaginary(oldQWave, newQWave, this->dimensions, quarterDt);
}
