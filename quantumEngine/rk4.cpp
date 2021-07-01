#include <stdio.h>
#include "qSpace.h"

// dx is always 1.  dt is below.
static const qReal dt = 0.02;

// if they're really over i, they should be negative, right?
static const qCx dtOverI = qCx(0., -dt);
static const qCx halfDtOverI = qCx(0., -dt / 2.);

// calculate down the line, generating increments to toWave
void oneDerivative(qDimension *dim, qCx *fromWave, qCx *toWave) {
	for (int ix = dim->start; ix < dim->end; ix++) {
		toWave[ix] = hamiltonian(fromWave, ix) * halfDtOverI;
		qCheck(toWave[ix]);
	}
}


// crawl along x to find the next version of theWave, after dt, and store it there.
void qSpace::oneRk4Step(void) {
	qDimension *dim = theSpace->dimensions;
	dim->fixBoundaries(theWave);

	// use egyptWave for all the first-try psi values
	for (int ix = dim->start; ix < dim->end; ix++) {
		laosWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * halfDtOverI;
		qCheck(sumWave[ix]);
	}
	dim->fixBoundaries(egyptWave);

	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, egyptWave[ix].im);

	// then use laosWave as the input to a better rate and a better inc at sumWave.
	for (int ix = dim->start; ix < dim->end; ix++) {
		sumWave[ix] = theWave[ix] + hamiltonian(egyptWave, ix) * dtOverI;
		qCheck(sumWave[ix]);
	}

	// now flip them around
	qCx *t = sumWave;
	sumWave = theWave;
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
		theSpace->oneRk4Step();
	}
    std::clock_t c_end = std::clock();
    printf(" time for %d rk2 steps: %lf", many, (double)(c_end - c_start) / CLOCKS_PER_SEC);
	return many;
}
