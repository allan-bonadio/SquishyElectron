// i don't think i'll continue my developpnment of this file 2021 dec 4
/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include <ctime>
#include "qSpace.h"
#include "qWave.h"

// dx is always 1.  dt is below.
static const qReal dt = 0.02;

// if they're really over i, they should be negative, right?
static const qCx dtOverI = qCx(0., -dt);
static const qCx halfDtOverI = qCx(0., -dt / 2.);

// when the Planck constant is expressed in SI units, it has the exact value
// h = 6.62607015×10−34 J⋅sec

// calculate deriv / dt down the entire wave,
// generating increments from fromWave to nextYWave and peruWave.
// store it by adding it to origWave into nextYWave,
//		and by adding it onto peruWave, each with multiply factors passed
// note how time is not an input to the hamiltonian - right now at least.
// factor = 1/3 or 1/6, see NumRecFort p552.
void waveDDT(qDimension *dims,
			qWave *origQWave, qWave *fromQWave, qWave *nextYQWave,
			qReal nextYFactor, qReal sumFactor) {
	qCx *origWave = origQWave->wave;
	qCx *fromWave = fromQWave->wave;
	qCx *nextYWave = nextYQWave->wave;
	fromQWave->fixBoundaries(); // always before hamiltonian
	for (int ix = dims->start; ix < dims->end; ix++) {
		qCx dPsi = hamiltonian(fromWave, ix) * dtOverI * nextYFactor;
		qCheck("waveDD", dPsi);

		// we don't actually save the dψ, we just pour it into where
		// it needs to go for the next iteration
		nextYWave[ix] = origWave[ix] + dPsi * nextYFactor;
		peruWave[ix] += dPsi * sumFactor;
	}

}


// crawl along x to find the next version of theWave, after dt, and store it there.
// I'll figure out how to minimize the number of buffers later.
void qSpace::oneRk4Step(qWave *oldQWave, qWave *newQWave) {

	qWave *oldQW = oldQWave;
	qWave *newQW = newQWave;
	qDimension *dims = theSpace->dimensions;
	theQWave->fixBoundaries();

	// the peruWave collects the k1/6 + k2/3 ... from p552
	for (int ix = dims->start; ix < dims->end; ix++)
		peruWave[ix] = qCx(0);

	theQWave->dumpWave("theWave ");

	// always start from theWave.  I need (nextYWave = k_1/2) and (peruWave += k_1/6)
	// into two separate wave buffers.  waveDDT() does both.
	waveDDT(dims, theQWave, theQWave, k1QWave, 1./2., 1./6.);
	k1QWave->dumpWave("after k1, k1Wave ");

	// same for the steps on p551
	waveDDT(dims, theQWave, k1QWave, k2QWave, 1./2., 1./3.);
	k2QWave->dumpWave("after k2 ");
	waveDDT(dims, theQWave, k2QWave, k3QWave, 1./2., 1./3.);
	k3QWave->dumpWave("after k3 ");
	waveDDT(dims, theQWave, k3QWave, k4QWave, 1., 1./6.);
	k4QWave->dumpWave("after k4 ");

	// now we have our dψ, correct to  4th order, theoretically
	for (int ix = dims->start; ix < dims->end; ix++)
		theWave[ix] += peruWave[ix];





	// use egyptWave for all the first-try ψ values
	// for (int ix = dims->start; ix < dims->end; ix++) {
	// 	laosWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * halfDtOverI;
	// 	qCheck("um", peruWave[ix]);
	// }
	// dims->fixBoundaries(egyptWave);
	//
	// //for (int ix = 0; ix <= dims->end; ix++)
	// //printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, egyptWave[ix].im);
	//
	// // then use laosWave as the input to a better rate and a better inc at peruWave.
	// for (int ix = dims->start; ix < dims->end; ix++) {
	// 	peruWave[ix] = theWave[ix] + hamiltonian(egyptWave, ix) * dtOverI;
	// 	qCheck("um", peruWave[ix]);
	// }
	//
	// // now flip them around
	// qCx *t = peruWave;
	// peruWave = theWave;
	// theWave = t;

	theQWave->fixBoundaries();

	//printf("done with rk2: \n");
	//for (int ix = 0; ix <= dims->end; ix++)
	//printf("qCx(%20.17lf, %20.17lf)\n", theWave[ix].re, theWave[ix].im);

	theSpace->elapsedTime += dt;
}

/* ************************************************** benchmarking */

// int manyRk4Steps(void) {
// 	const int many = 100;
//
//     std::clock_t c_start = std::clock();
// 	for (int i = 0; i < many; i++) {
// 		theSpace->oneRk4Step();
// 	}
//     std::clock_t c_end = std::clock();
//     printf(" time for %d rk2 steps: %lf", many,
//     	(double)(c_end - c_start) / CLOCKS_PER_SEC);
// 	return many;
// }
