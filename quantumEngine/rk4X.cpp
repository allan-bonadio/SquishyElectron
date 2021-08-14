/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "qSpace.h"
#include <ctime>

// dx is always 1.  dt is below.
static const qReal dt = 0.02;

// when the Planck constant is expressed in SI units, it has the exact value
// h = 6.62607015×10−34 J⋅sec


// if they're really over i, they should be negative, right?
static const qCx dtOverI = qCx(0., -dt);
static const qCx halfDtOverI = qCx(0., -dt / 2.);

// calculate deriv / dt down the entire wave,
// generating increments from fromWave to nextYWave and peruWave.
// store it by adding it to origWave into nextYWave,
//		and by adding it onto peruWave, each with multiply factors passed
// note how time is not an input to the hamiltonian - right now at least.
// factor = 1/3 or 1/6, see NumRecFort p552.
void waveDDT(qDimension *dim,
			qCx *origWave, qCx *fromWave, qCx *nextYWave,
			qReal nextYFactor, qReal sumFactor) {
	dim->fixBoundaries(fromWave); // always before hamiltonian
	for (int ix = dim->start; ix < dim->end; ix++) {
		qCx dPsi = hamiltonian(fromWave, ix) * dtOverI * nextYFactor;
		qCheck(dPsi);

		// we don't actually save the dPsi, we just pour it into where
		// it needs to go for the next iteration
		nextYWave[ix] = origWave[ix] + dPsi * nextYFactor;
		peruWave[ix] += dPsi * sumFactor;
	}

}


// crawl along x to find the next version of theWave, after dt, and store it there.
// I'll figure out how to minimize the number of buffers later.
void qSpace::oneRk4Step(void) {
	qDimension *dim = theSpace->dimensions;
	dim->fixBoundaries(theWave);

	// the sumwave collects the k1/6 + k2/3 ... from p552
	for (int ix = dim->start; ix < dim->end; ix++)
		peruWave[ix] = qCx(0);

	this->dumpWave("theWave ", theWave);

	// always start from theWave.  I need (nextYWave = k_1/2) and (peruWave += k_1/6)
	// into two separate wave buffers.  waveDDT() does both.
	waveDDT(dim, theWave, theWave, k1Wave, 1./2., 1./6.);
	this->dumpWave("after k1, k1Wave ", k1Wave);

	// same for the steps on p551
	waveDDT(dim, theWave, k1Wave, k2Wave, 1./2., 1./3.);
	this->dumpWave("after k2 ", k2Wave);
	waveDDT(dim, theWave, k2Wave, k3Wave, 1./2., 1./3.);
	this->dumpWave("after k3 ", k3Wave);
	waveDDT(dim, theWave, k3Wave, k4Wave, 1., 1./6.);
	this->dumpWave("after k4 ", k4Wave);

	// now we have our dPsi, correct to  4th order, theoretically
	for (int ix = dim->start; ix < dim->end; ix++)
		theWave[ix] += peruWave[ix];





	// use egyptWave for all the first-try ψ values
	// for (int ix = dim->start; ix < dim->end; ix++) {
	// 	laosWave[ix] = theWave[ix] + hamiltonian(theWave, ix) * halfDtOverI;
	// 	qCheck(peruWave[ix]);
	// }
	// dim->fixBoundaries(egyptWave);
	//
	// //for (int ix = 0; ix <= dim->end; ix++)
	// //printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, egyptWave[ix].im);
	//
	// // then use laosWave as the input to a better rate and a better inc at peruWave.
	// for (int ix = dim->start; ix < dim->end; ix++) {
	// 	peruWave[ix] = theWave[ix] + hamiltonian(egyptWave, ix) * dtOverI;
	// 	qCheck(peruWave[ix]);
	// }
	//
	// // now flip them around
	// qCx *t = peruWave;
	// peruWave = theWave;
	// theWave = t;

	dim->fixBoundaries(theWave);

	//printf("done with rk2: \n");
	//for (int ix = 0; ix <= dim->end; ix++)
	//printf("qCx(%20.17lf, %20.17lf)\n", theWave[ix].re, theWave[ix].im);

	theSpace->elapsedTime += dt;
}

/* ************************************************** benchmarking */

int manyRk4Steps(void) {
	const int many = 100;

    std::clock_t c_start = std::clock();
	for (int i = 0; i < many; i++) {
		theSpace->oneRk4Step();
	}
    std::clock_t c_end = std::clock();
    printf(" time for %d rk2 steps: %lf", many,
    	(double)(c_end - c_start) / CLOCKS_PER_SEC);
	return many;
}
