#include <stdio.h>
#include "qSpace.h"

static const qReal dt = 0.1;

// if they're really over i, they should be negative, right?
static const qCx dtOverI = qCx(0., -dt);
static const qCx halfDtOverI = qCx(0., -dt / 2.);


// iterate along x to find the next version of theWave, after dt, and store it there.
void qSpace::oneRk2Step(void) {
	qDimension *dim = theSpace->dimensions;
	dim->fixBoundaries(theWave);

	// use nextWave for all the first-try psi values
	for (int ix = dim->start; ix < dim->end; ix++) {
		tempWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * halfDtOverI;
		qCheck(nextWave[ix]);
	}
	dim->fixBoundaries(tempWave);

	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("INRK2 %d\t%lf\t%lf\n", ix, tempWave[ix].re, tempWave[ix].im);

	// then use nextWave as the input to a better rate and a better inc
	for (int ix = dim->start; ix < dim->end; ix++) {
		nextWave[ix] = theWave[ix] + hamiltonian(tempWave, ix) * dtOverI;
		qCheck(nextWave[ix]);
	}

	// now flip them around
	qCx *t = nextWave;
	nextWave = theWave;
	theWave = t;

	dim->fixBoundaries(theWave);

	//printf("done with rk2: \n");
	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("qCx(%20.17lf, %20.17lf)\n", theWave[ix].re, theWave[ix].im);

	theSpace->elapsedTime += dt;
}

/* ************************************************** benchmarking */
#include <ctime>

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
