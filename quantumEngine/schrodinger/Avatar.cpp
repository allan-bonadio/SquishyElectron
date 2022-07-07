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
static bool traceFourierFilter = false;

static bool traceInfrequentFFTs = true;

//const double sNAN99999 = std::numeric_limits<double>::signaling_NaN();

// make sure these values are doable by the sliders' steps
Avatar::Avatar(qSpace *sp)
	: dt(1e-3), stepsPerIteration(100), lowPassFilter(1),
		space(sp), magic('Avat'), pleaseFFT(false), isIterating(false) {

	mainQWave = new qWave(space);
	scratchQWave = NULL;  // until used
	spect = NULL;  // until used

	resetCounters();

	// we always need a view buffer; that's the whole idea behind an avatar
	qvBuffer = new qViewBuffer(space, this);

	//dumpOffsets();
};

// some uses never need these so wait till they do
qWave *Avatar::getScratchWave(void) {
	if (!scratchQWave)
		scratchQWave = new qWave(space);
	return scratchQWave;
};

qSpectrum *Avatar::getSpect(void) {
	if (!spect)
		spect = new qSpectrum(space);
	return spect;
};

Avatar::~Avatar(void) {
	delete mainQWave;
	delete qvBuffer;

	// these may or may not have been allocated, depending on whether they were needed
	if (scratchQWave)
		delete scratchQWave;
	if (spect)
		delete spect;
};

// need these numbers for the js interface to this object, to figure out the offsets.
// see jsAvatar.js  usually disabled.
void Avatar::dumpOffsets(void) {
	printf("△ magic=%d\n", (int) ((byte *) &this->magic - (byte *) this));
	printf("△ space=%d\n", (int) ((byte *) &this->space - (byte *) this));
	printf("△ elapsedTime=%d\n", (int) ((byte *) &this->elapsedTime - (byte *) this));
	printf("△ iterateSerial=%d\n", (int) ((byte *) &this->iterateSerial - (byte *) this));
	printf("△ dt=%d\n", (int) ((byte *) &this->dt - (byte *) this));
	printf("△ lowPassFilter=%d\n", (int) ((byte *) &this->lowPassFilter - (byte *) this));
	printf("△ stepsPerIteration=%d\n", (int) ((byte *) &this->stepsPerIteration - (byte *) this));
	printf("△ isIterating=%d\n", (int) ((byte *) &this->isIterating - (byte *) this));
	printf("△ pleaseFFT=%d\n", (int) ((byte *) &this->pleaseFFT - (byte *) this));
	printf("\n");
	printf("△ mainQWave=%d\n", (int) ((byte *) &this->mainQWave - (byte *) this));
	printf("△ scratchQWave=%d\n", (int) ((byte *) &this->scratchQWave - (byte *) this));
	printf("△ spect=%d\n", (int) ((byte *) &this->spect - (byte *) this));
	printf("△ qvBuffer=%d\n", (int) ((byte *) &this->qvBuffer - (byte *) this));
}

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

	// some uses never need this so wait till we do
	getScratchWave();

	// update this all the time cuz user might have changed it.  Well, actually,
	// since it's a pointer, maybe not.... maybe just the factor...
	potential = space->potential;
	potentialFactor = space->potentialFactor;

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
	// and copy back to Main
	stepReal(mainQWave->wave, scratchQWave->wave, dt/2);
	stepImaginary(mainQWave->wave, scratchQWave->wave, 0);

	isIterating = false;

	iterateSerial++;

	// printf("Avatar::oneIteration(): qvBuffer %ld and latestWave=%ld\n",
	// 	(long) qvBuffer, (long) latestWave);
	//mainQWave = mainQWave;

	// ok the algorithm tends to diverge after thousands of iterations.  Hose it down.
	fourierFilter(lowPassFilter);


	// need it; somehow? not done in JS.  YES IT IS!  remove this when you have the oppty
	//theQViewBuffer->loadViewBuffer();

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



// FFT the wave, cut down the high frequencies, then iFFT it back.
// lowPassFilter is #frequencies we zero out - max N/4
// default is N/8.  Can't we eventually find a simple convolution to do this instead of FFT/iFFT?
void Avatar::fourierFilter(int lowPassFilter) {
	spect = getSpect();
	spect->generateSpectrum(mainQWave);

	// the high frequencies are in the middle; the nyquist freq is at N/2
	int nyquist = spect->nPoints/2;
	qCx *s = spect->wave;
	s[nyquist] = 0;

	if (traceFourierFilter)
		printf("🌈  fourierFilter: nPoints=%d  nyquist=%d    lowPassFilter=%d\n",
			spect->nPoints, nyquist, lowPassFilter);
	if (lowPassFilter > nyquist/2)  // sorry can't do that
		lowPassFilter = nyquist/2;

	for (int k = 1; k < lowPassFilter; k++) {
		double factor = 0;
		if (traceFourierFilter) {
			printf("🌈  fourierFilter: smashing lowPassFilter=%d   freqs %d which was %lf, "
				"and %d which was %lf, by factor %lf\n",
				lowPassFilter, nyquist - k, s[nyquist - k].norm(), nyquist + k, s[nyquist + k].norm(), factor);
		}
		s[nyquist + k] = 0;
		s[nyquist - k] = 0;
		//s[nyquist + k] *= factor;
		//s[nyquist - k] *= factor;
		if (traceFourierFilter) printf("resulting poimts: (%lf %lf)  (%lf %lf)\n",
				s[nyquist - k].re, s[nyquist - k].im, s[nyquist + k].re, s[nyquist + k].im);
	}

	if (traceInfrequentFFTs && (((int) iterateSerial & 0x3FF) == 0) && iterateSerial > 15000) {
		printf("fourierFilter iteration %8.0lf", iterateSerial);
		for (int ix = nyquist - 10; ix < nyquist+10; ix++)
			printf("[%d] (%8.4lf,%8.4lf)\n", ix, s[ix] .re, s[ix] .im);

		//spect->dumpSpectrum("periodic spectrum check after fourierFilter iteration");
		traceFourierFilter = true;
	}
	else
		traceFourierFilter = false;

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
