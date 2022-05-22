/*
** manifestation -- the integration and simulation of a quantum mechanical wave/space
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include <ctime>
#include <limits>
#include <cfenv>

#include "../spaceWave/qSpace.h"
#include "../schrodinger/Manifestation.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"
#include "../fourier/fftMain.h"


static bool traceIterSummary = false;
static bool traceIteration = false;
static bool traceIterSteps = false;

static bool traceJustWave = false;
static bool traceJustInnerProduct = false;

const double sNAN99999 = std::numeric_limits<double>::signaling_NaN();

Manifestation::Manifestation(qSpace *sp)
	: dt(sNAN99999), stepsPerIteration(100), lowPassDilution(0.5), space(sp),
		magic('Mani'), pleaseFFT(false), isIterating(false) {

	space->mani = this;  // until I get this straightened out

	mainQWave = new qWave(space);
	scratchQWave = new qWave(space);

	resetCounters();
};

Manifestation::~Manifestation(void) {
	delete mainQWave;
	delete scratchQWave;
};

void Manifestation::resetCounters(void) {
	elapsedTime = 0.;
	iterateSerial = 0;
}

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
	stepReal(scratchQWave->wave, mainQWave->wave, 0);
	stepImaginary(scratchQWave->wave, mainQWave->wave, dt/2);


//	mainQWave = new qWave(theSpace);
//	scratchQWave = new qWave(theSpace);
//

	int doubleSteps = stepsPerIteration / 2;
	if (traceIteration)
		printf("      doubleSteps=%d   stepsPerIteration=%d\n",
			doubleSteps, stepsPerIteration);

	for (ix = 0; ix < doubleSteps; ix++) {
		// this seems to have a resolution of 100µs on Panama
		//auto start = std::chrono::steady_clock::now();////

		oneVisscherStep(mainQWave, scratchQWave);
		oneVisscherStep(scratchQWave, mainQWave);

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
	stepReal(mainQWave->wave, scratchQWave->wave, dt/2);
	stepImaginary(mainQWave->wave, scratchQWave->wave, 0);

	isIterating = false;

	iterateSerial++;

	// printf("Manifestation::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
	// 	(long) viewBuffer, (long) latestWave);
	//mainQWave = mainQWave;

	// ok the algorithm tends to diverge after thousands of iterations.  Hose it down.
	//	mainQWave->lowPassFilter(lowPassDilution);
//	mainQWave->nyquistFilter();
//	mainQWave->normalize();


	// need it; somehow? not done in JS
	theQViewBuffer->loadViewBuffer();

	if (traceIterSummary) {
		printf("🚀 🚀 finished one iteration (%d steps, N=%d), inner product: %lf",
			stepsPerIteration, space->nStates, mainQWave->innerProduct());
	}

	if (traceJustWave) {
		mainQWave->dumpWave("      at end of iteration", true);
	}
	if (traceJustInnerProduct) {
		printf("      finished one integration iteration (%d steps, N=%d), inner product: %lf\n",
			stepsPerIteration, space->nStates, mainQWave->innerProduct());
	}

	//if (pleaseFFT) {
		analyzeWaveFFT(mainQWave);
		pleaseFFT = false;
	//}
}


// user button to print it out now, or at end of the next iteration
void Manifestation::askForFFT(void) {
	if (isIterating)
		pleaseFFT = true;
	else
		analyzeWaveFFT(mainQWave);
}

/* **********************************************************  */

/* **********************************************************  */
