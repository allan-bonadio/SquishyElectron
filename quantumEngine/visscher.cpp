/*
** visscher -- schrodinger ODE integration by staggering re and im
**			by half dx, Visscher second order accuracy
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "qSpace.h"
#include <ctime>

bool debug = true;
//bool debug = false;

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

// form the new wave from the old wave, in separate buffers, decided by our caller.
void qSpace::oneVisscherStep(qWave *oldQWave, qWave *newQWave) {
	qWave *oldQW = oldQWave;
	qWave *newQW = newQWave;
	qDimension *dim = this->dimensions;
	oldQW->fixBoundaries();
	//oldQW->dumpWave("starting theWave", true);


	// first step: advance the Reals of psi a dt, from 0 to dt
	for (int ix = dim->start; ix < dim->end; ix++) {
		double H = hamiltonian(theWave, ix).re;
		laosWave[ix].re = theWave[ix].re + dt * H * theWave[ix].im;
		qCheck(laosWave[ix]);
	}
	newQW->fixBoundaries();
	//newQW->dumpWave("Visscher wave after the Re step", true);


	// second step: advance the Imaginaries of psi a dt, from dt/2 to 3dt/2
	// given the reals we just generated
	for (int ix = dim->start; ix < dim->end; ix++) {
		double H = hamiltonian(theWave, ix).im;
		laosWave[ix].im = theWave[ix].im - dt * H * laosWave[ix].re;
		qCheck(laosWave[ix]);
	}
	newQW->fixBoundaries();
	// see below newQW->dumpWave("Visscher newQW after the Im step", true);

	if (false) {
		// now flip them around. The qWaves point to the buffers.  should do this differently...
		if (false) {
			qWave t = *newQW;
			*newQW = *oldQW;
			*oldQW = t;
			t.buffer = NULL;
		}
		else {
			// just swap buffers
			qCx *t = newQW->buffer;
			newQW->buffer = oldQW->buffer;
			oldQW->buffer = t;
		}
	}


	// ok so after this, the time has advanced dt, and real is at elapsedTime and
	// imaginary is at elapsedTime + dt/2.  Yes the re and the im are not synchronized.
	// it was Visscher's idea.  I think he got it from someone else.
	this->elapsedTime += dt;
	this->iterateSerial++;

	if (debug) {
		char atVisscher[100];
		sprintf(atVisscher, "at end of Visscher frame %1.0lf | ", this->iterateSerial);
		oldQW->dumpWave(atVisscher, true);
	}
}

