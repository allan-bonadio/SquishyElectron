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
// static const double dt = 0.1;
//static const double dt = 0.02;

// if they're really over i, they should be negative, right?
// static const qCx dtOverI = qCx(0., -dt);
// static const qCx halfDtOverI = qCx(0., -dt / 2.);

// crawl along x to find the next version of the Wave, after dt, and store it there.
void qSpace::oneRk2Step(qWave *oldQWave, qWave *newQWave) {
	qWave *oldQW = oldQWave;
	qCx *oldW = oldQW->wave;
	qWave *newQW = newQWave;
	qCx *newW = newQW->wave;


	qDimension *dims = this->dimensions;
	oldQW->fixBoundaries();
	//oldQW->dumpWave("starting oldW", true);

	// use laosWave for all the first-try ψ values
	for (int ix = dims->start; ix < dims->end; ix++) {
		laosWave[ix] = oldW[ix] + hamiltonian(oldW, ix) * this->halfDtOverI;
		qCheck("oneRk2Step A", newW[ix]);
	}
	laosQWave->fixBoundaries();
	//laosQWave->dumpWave("laos Q Wave", true);
//	printf("whats up with this space and its dimension? %d %lf %lf\n",
//		laosQWave->space->dimensions->continuum, laosWave[0].re, laosWave[0].im);
//	laosWave[0] = laosWave[5];
//	laosWave[6] = laosWave[1];
	//for (int ix = 0; ix <= dims->end; ix++)
	//printf("INRK2 %d\t%lf\t%lf\n", ix, laosWave[ix].re, laosWave[ix].im);

	// then use laosWave as the input to a better rate and a better inc at newW.
	for (int ix = dims->start; ix < dims->end; ix++) {
		newW[ix] = oldW[ix] + hamiltonian(laosWave, ix) * this->dtOverI;
		qCheck("oneRk2Step B", newW[ix]);
	}
	newQW->fixBoundaries();
	//newQW->dumpWave("newW", true);

	// now flip them around.  This type of surgery; not sure about it...
	qCx *t = newW;
	// 	newW = oldW;
	// 	newQW->wave = oldW;
	// 	oldW = t;
	// 	oldQW->wave = t;
oldW = newW;  // fix this someday!!!
	oldQW->fixBoundaries();
	//oldQW->dumpWave("almost done oldW", true);

//	if (this->continuousLowPass) {
// 		oldQW->lowPassFilter(this->continuousLowPass);
//	}

//	if (this->doLowPass && --this->filterCount <= 0) {
//		printf("\n@@@@@@ it's time for a filter %d %d  frame%1.0lf @@@@@@\n",
//			this->filterCount, this->nStates, this->iterateSerial);
//		//oldQW->dumpWave("filtering, starting", true);
// 		//oldQW->lowPassFilter();
//		//oldQW->dumpWave("filtering, after LP, before normalize", true);
// 		oldQW->normalize();
//		//oldQW->dumpWave("filtering, after normalize", true);
//
//		// just a guess but this should depend on how wayward the wave has gotten.
//		this->filterCount = 100;
//		//this->filterCount = this->nStates;
//	}

	this->elapsedTime += dt;
	this->iterateSerial++;


//	oldQW->lowPassFilter();
//
	if (true) {
		char atRk2[100];
		sprintf(atRk2, "at end of rk2 frame %1.0lf ", this->iterateSerial);
		oldQW->dumpWave(atRk2, true);
	}
}

/* ************************************************** benchmarking */

// int manyRk2Steps(void) {
// 	const int many = 100;
//
//     std::clock_t c_start = std::clock();
// 	for (int i = 0; i < many; i++) {
// 		theSpace->oneRk2Step();
// 	}
//     std::clock_t c_end = std::clock();
//     printf(" time for %d rk2 steps: %lf", many, (double)(c_end - c_start) / CLOCKS_PER_SEC);
// 	return many;
// }
//
