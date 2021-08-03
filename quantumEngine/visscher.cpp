/*
** visscher 2 -- schrodinger ODE integration by staggering re and im
**			by half dx, Visscher second order accuracy
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "qSpace.h"
#include <ctime>


/*
partly from the article
" A fast explicit algorithm for the time-dependent Schrodinger Equation"
The present algorithm is motivated by writing the Schrodinger equation in terms
of the real and imaginary parts R and I of the wave function

We will define
		• R = x.re at times O,dt,2dt,..., and
		• I = x.im at times .5dt, 1.5dt, ...
so that in our buffer of complex numbers, the Im part is dt/2 ahead of the Re part.
The natural discretization of Eqs. (6) is therefore
	R(t + dt) = R(t) + dt H I(t + dt/2)
Half a tick later, at a half odd integer multiple of dt,
	I(t + dt) = I(t) - dt H R(t + dt/2)
where H is hamiltonian
 */


// crawl along x to find the next version of theWave, after dt, and store it there.
void qSpace::oneVisscher2Step(void) {
	qDimension *dim = this->dimensions;
	theQWave->fixBoundaries();
	//theQWave->dumpWave("starting theWave", true);

	double H = hamiltonian(theWave, ix);

	// first step: advance the Reals of psi a dt, from 0 to dt
	for (int ix = dim->start; ix < dim->end; ix++) {
		laosWave[ix].re = theWave[ix].re + dt * H * theWave[ix].im;
		qCheck(laosWave[ix]);
	}
	laosQWave->fixBoundaries();
	laosQWave->dumpWave("Visscher wave after the Re step", true);


	// second step: advance the Imaginaries of psi a dt, from dt/2 to 3dt/2
	for (int ix = dim->start; ix < dim->end; ix++) {
		laosWave[ix].im = theWave[ix].im - dt * H * theWave[ix].re;
		qCheck(laosWave[ix]);
	}
	laosQWave->fixBoundaries();
	laosQWave->dumpWave("laosQWave after the Im step", true);

	// now flip them around. The qWaves point to the buffers.
	qWave t = laosQWave;
	laosQWave = theQWave;
	theQWave = t;

	// ok so now theQWave is the result and laosQWave is the previous one.
	//theQWave->fixBoundaries();
	//theQWave->dumpWave("almost done theWave", true);

	// ok so after this, the time has advanced dt, and real is at elapsedTime and
	// imaginary is at elapsedTime + dt/2.  Yes the re and the im are not synchronized.
	// it was Visscher's idea.  I think he got it from someone else.
	this->elapsedTime += dt;
	this->iterateSerial++;

	if (true) {
		char atVisscher[100];
		sprintf(atVisscher, "at end of Visscher frame %1.0lf ", this->iterateSerial);
		theQWave->dumpWave(atVisscher, true);
	}
}

