/*
** Avatar -- the instance and simulation of a quantum mechanical wave in a space
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include <ctime>
#include <limits>
#include <cfenv>

#include "../spaceWave/qSpace.h"
#include "../schrodinger/Avatar.h"
#include "../spaceWave/qWave.h"
#include "../fourier/qSpectrum.h"
#include "../spaceWave/qViewBuffer.h"
#include "../fourier/fftMain.h"


static bool traceIterSummary = false;
static bool traceIteration = false;
static bool traceIterSteps = false;

static bool traceJustWave = false;
static bool traceJustInnerProduct = false;

const double sNAN99999 = std::numeric_limits<double>::signaling_NaN();

Avatar::Avatar(qSpace *sp)
	: dt(sNAN99999), stepsPerIteration(100), lowPassFilter(0.5),
		space(sp), magic('Inca'), pleaseFFT(false), isIterating(false) {

	space->avatar = this;  // until I get this straightened out

	mainQWave = new qWave(space);
	scratchQWave = new qWave(space);
	spect = new qSpectrum(space);

	resetCounters();
};

Avatar::~Avatar(void) {
	delete mainQWave;
	delete scratchQWave;
};

void Avatar::resetCounters(void) {
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
void Avatar::oneIteration() {
	int tt;

	//printf("the ttime: %lf\n", getTimeDouble());

	if (traceIteration)
		printf("🚀 🚀 Avatar::oneIteration() - dt=%lf   stepsPerIteration=%d\n",
			dt, stepsPerIteration);
	isIterating = true;

	// half step in beginning to move Im forward dt/2
	// cuz outside of here, re and im are for the same time.
	// Note here the latest is in scratch; iterate continues this,
	// and the halfwave at the end moves it back to main.
	stepReal(scratchQWave->wave, mainQWave->wave, 0);
	stepImaginary(scratchQWave->wave, mainQWave->wave, dt/2);


//	mainQWave = new qWave(theSpace);
//	scratchQWave = new qWave(theSpace);
//

	int doubleSteps = stepsPerIteration / 2;
	if (traceIteration)
		printf("      doubleSteps=%d   stepsPerIteration=%d\n",
			doubleSteps, stepsPerIteration);

	for (tt = 0; tt < doubleSteps; tt++) {
		// this seems to have a resolution of 100µs on Panama
		//auto start = std::chrono::steady_clock::now();////

		oneVisscherStep(mainQWave, scratchQWave);
		oneVisscherStep(scratchQWave, mainQWave);

		if (traceIteration && 0 == tt % 100) {
			printf("       step every hundred, step %d; elapsed time: %lf\n", tt * 2, getTimeDouble());
		}

		//auto end = std::chrono::steady_clock::now();////
		//std::chrono::duration<double> elapsed_seconds = end-start;////
		if (traceIterSteps) {
			printf("step done %d; elapsed time: %lf \n", tt*2, getTimeDouble());////
		}
	}


	// half step at completion to move Re forward dt/2
	// and copy back to Laos
	stepReal(mainQWave->wave, scratchQWave->wave, dt/2);
	stepImaginary(mainQWave->wave, scratchQWave->wave, 0);

	isIterating = false;

	iterateSerial++;

	// printf("Avatar::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
	// 	(long) viewBuffer, (long) latestWave);
	//mainQWave = mainQWave;

	// ok the algorithm tends to diverge after thousands of iterations.  Hose it down.
	//	mainQWave->lowPassFilter(lowPassFilter);
//	mainQWave->nyquistFilter();


	fourierFilter(lowPassFilter);

	// average the maxNorm, but first time around, just use the whole thing
	mainQWave->mixInMaxNorm();
	//if (avgMaxNorm > 0)
	//	avgMaxNorm = (63 * avgMaxNorm + maxNorm) / 64;
	//else
	//	avgMaxNorm = maxNorm;

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

	if (this->pleaseFFT) {
		analyzeWaveFFT(mainQWave);
		this->pleaseFFT = false;
	}
}



// FFT the wave, cut down the high frequencies, then iFFT it back
void Avatar::fourierFilter(double lowPassFilter) {
	spect->generateSpectrum(mainQWave);

	// the high frequencies are in the middle; the nyquist freq is at N/2
	int nyquist = spect->nPoints/2;
	double spread = nyquist / 4;  // number of freqs we'll attenuate on each side
	qCx *s = spect->wave;
	s[nyquist] = 0;
	for (int k = 1; k < spread; k++) {
		double factor = 1. - k / spread;
		s[nyquist + k] *= factor;
		s[nyquist - k] *= factor;
	}

	spect->generateWave(mainQWave);
	mainQWave->normalize();
}



// user button to print it out now, or at end of the next iteration
void Avatar::askForFFT(void) {
	if (isIterating)
		this->pleaseFFT = true;
	else
		analyzeWaveFFT(mainQWave);
}

/* **********************************************************  */

/* **********************************************************  */
