/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "qSpace.h"
#include <ctime>

// dx is always 1.  dt is below.
// static const qReal dt = 0.1;
//static const qReal dt = 0.02;

// if they're really over i, they should be negative, right?
// static const qCx dtOverI = qCx(0., -dt);
// static const qCx halfDtOverI = qCx(0., -dt / 2.);

// crawl along x to find the next version of theWave, after dt, and store it there.
void qSpace::oneRk2Step(void) {
	qDimension *dim = this->dimensions;
	theQWave->fixBoundaries();
	//theQWave->dumpWave("starting theWave", true);

	// use laosWave for all the first-try psi values
	for (int ix = dim->start; ix < dim->end; ix++) {
		laosWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * this->halfDtOverI;
		qCheck(sumWave[ix]);
	}
	laosQWave->fixBoundaries();
	//laosQWave->dumpWave("laos Q Wave", true);
//	printf("whats up with this space and its dimension? %d %lf %lf\n",
//		laosQWave->space->dimensions->continuum, laosWave[0].re, laosWave[0].im);
//	laosWave[0] = laosWave[5];
//	laosWave[6] = laosWave[1];
	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, laosWave[ix].im);

	// then use laosWave as the input to a better rate and a better inc at sumWave.
	for (int ix = dim->start; ix < dim->end; ix++) {
		sumWave[ix] = theWave[ix] + hamiltonian(laosWave, ix) * this->dtOverI;
		qCheck(sumWave[ix]);
	}
	sumQWave->fixBoundaries();
	//sumQWave->dumpWave("sumWave", true);

	// now flip them around.  This type of surgery; not sure about it...
	qCx *t = sumWave;
	sumWave = theWave;
	sumQWave->buffer = theWave;
	theWave = t;
	theQWave->buffer = t;

	theQWave->fixBoundaries();
	//theQWave->dumpWave("almost done theWave", true);

	//printf("done with rk2: \n");
	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("qCx(%20.17lf, %20.17lf)\n", theWave[ix].re, theWave[ix].im);

	this->elapsedTime += dt;
	this->iterateSerial++;

	if (--this->filterCount <= 0) {
		printf("@@@ it's time for a filter %d %d\n", this->filterCount, this->nStates);
		//theQWave->dumpWave("filtering, starting", true);
 		theQWave->lowPassFilter();
		//theQWave->dumpWave("filtering, after LP, before normalize", true);
 		theQWave->normalize();
		//theQWave->dumpWave("filtering, after normalize", true);

		this->filterCount = this->nStates;
	}


//	theQWave->lowPassFilter();
//
	theQWave->dumpWave("at end of rk2", true);
}

/* ************************************************** benchmarking */

int manyRk2Steps(void) {
	const int many = 100;

    std::clock_t c_start = std::clock();
	for (int i = 0; i < many; i++) {
		theSpace->oneRk2Step();
	}
    std::clock_t c_end = std::clock();
    printf(" time for %d rk2 steps: %lf", many, (double)(c_end - c_start) / CLOCKS_PER_SEC);
	return many;
}

