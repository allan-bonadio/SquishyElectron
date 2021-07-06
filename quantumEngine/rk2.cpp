#include <stdio.h>
#include "qSpace.h"
#include <ctime>

// dx is always 1.  dt is below.
static const qReal dt = 0.02;

// if they're really over i, they should be negative, right?
static const qCx dtOverI = qCx(0., -dt);
static const qCx halfDtOverI = qCx(0., -dt / 2.);

void dumpMyPoint(qCx val, int ix) {
	printf("appoint a point %6d  %8.4f %8.4f ", ix, val.re, val.im);
}

// crawl along x to find the next version of theWave, after dt, and store it there.
void qSpace::oneRk2Step(void) {
	qDimension *dim = theSpace->dimensions;
	theQWave->fixBoundaries();
	theQWave->dumpWave("starting theWave");
	//qCx *laosWave = theWave;

	// use laosWave for all the first-try psi values
	for (int ix = dim->start; ix < dim->end; ix++) {
		laosWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * halfDtOverI;
		qCheck(sumWave[ix]);
	}
	theQWave->fixBoundaries();
	laosQWave->dumpWave("laos Q Wave");

	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, laosWave[ix].im);

	// then use laosWave as the input to a better rate and a better inc at sumWave.
	for (int ix = dim->start; ix < dim->end; ix++) {
		sumWave[ix] = theWave[ix] + hamiltonian(laosWave, ix) * dtOverI;
		qCheck(sumWave[ix]);
	}
	sumQWave->dumpWave("sumWave");

	// now flip them around.  This type of surgery; not sure about it...
	qCx *t = sumWave;
	sumWave = theWave;
	sumQWave->buffer = theWave;
	theWave = t;
	theQWave->buffer = t;

	theQWave->fixBoundaries();
	theQWave->dumpWave("almost done theWave");

	//printf("done with rk2: \n");
	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("qCx(%20.17lf, %20.17lf)\n", theWave[ix].re, theWave[ix].im);

	theSpace->elapsedTime += dt;

	theQWave->lowPassFilter();

	// which one i better?  who cares, forEachPoint works!
	theQWave->forEachPoint(dumpMyPoint);
	theQWave->dumpWave("after low pass theWave");
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
