/*
** manifestation -- the integration and simulation of a quantum mechanical wave/space
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include <ctime>

#include "../spaceWave/qSpace.h"
#include "../schrodinger/Manifestation.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"

static bool traceIterSummary = false;
static bool traceIteration = false;
static bool traceIterSteps = false;

static bool traceJustWave = false;
static bool traceJustInnerProduct = false;

Manifestation::Manifestation(qSpace *sp)
	: dt(1.0), stepsPerIteration(100) {
	lowPassDilution = 0.5;
	space = sp;
	space->mani = this;  // until I get this straightened out
	magic = 'Mani';
	pleaseFFT = false;
	isIterating = false;

};

Manifestation::~Manifestation(void) {
};

/* ********************************************************** integration */


double getTimeDouble()
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}




// does several visscher steps (eg 100 or 500)
// actually does stepsPerIteration+1 steps; half steps at start and finish
void Manifestation::oneIteration() {
	int ix;

	printf("the ttime: %lf\n", getTimeDouble());

	if (traceIteration)
		printf("🚀 🚀 Manifestation::oneIteration() - dt=%lf   stepsPerIteration=%d\n",
			dt, stepsPerIteration);
	isIterating = true;

	// half step in beginning to move Im forward dt/2
	// cuz outside of here, re and im are for the same time
	// and stored in laosWave
	stepReal(peruQWave->wave, laosQWave->wave, 0);
	stepImaginary(peruQWave->wave, laosQWave->wave, dt/2);




	int doubleSteps = stepsPerIteration / 2;
	if (traceIteration)
		printf("      doubleSteps=%d   stepsPerIteration=%d\n",
			doubleSteps, stepsPerIteration);

	for (ix = 0; ix < doubleSteps; ix++) {
		// this seems to have a resolution of 100µs on Panama
		//auto start = std::chrono::steady_clock::now();////

		oneVisscherStep(laosQWave, peruQWave);
		oneVisscherStep(peruQWave, laosQWave);

		if (traceIteration && 0 == ix % 100) {
			printf("       step every hundred, step %d; elapsed time: %lf\n", ix * 2, getTimeDouble());
		}

		//auto end = std::chrono::steady_clock::now();////
		//std::chrono::duration<double> elapsed_seconds = end-start;////
		if (traceIterSteps) {
			printf("step done %d; elapsed time: %lf \n", ix*2, getTimeDouble());////
		}
	}


	// half step at completion to move Re forward dt/2
	// and copy back to Laos
	stepReal(laosQWave->wave, peruQWave->wave, dt/2);
	stepImaginary(laosQWave->wave, peruQWave->wave, 0);

	isIterating = false;

	iterateSerial++;

	// printf("Manifestation::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
	// 	(long) viewBuffer, (long) latestWave);
	latestQWave = laosQWave;

	// ok the algorithm tends to diverge after thousands of iterations.  Hose it down.
	//	latestQWave->lowPassFilter(lowPassDilution);
//	latestQWave->nyquistFilter();
//	latestQWave->normalize();


	// need it; somehow? not done in JS
	theQViewBuffer->loadViewBuffer();

	if (traceIterSummary) {
		printf("🚀 🚀 finished one iteration (%d steps, N=%d), inner product: %lf",
			stepsPerIteration, space->nStates, latestQWave->innerProduct());
	}

	if (traceJustWave) {
		latestQWave->dumpWave("      at end of iteration", true);
	}
	if (traceJustInnerProduct) {
		printf("      finished one integration iteration (%d steps, N=%d), inner product: %lf\n",
			stepsPerIteration, space->nStates, latestQWave->innerProduct());
	}

	if (pleaseFFT) {
		//analyzeWaveFFT(latestQWave);
		pleaseFFT = false;
	}
}


// user button to print it out now, or at end of the next iteration
void Manifestation::askForFFT(void) {
	if (isIterating)
		pleaseFFT = true;
	else
		;//analyzeWaveFFT(latestQWave);
}

/* **********************************************************  */

void Manifestation::resetCounters(void) {
	elapsedTime = 0.;
	iterateSerial = 0;
}

/* **********************************************************  */
