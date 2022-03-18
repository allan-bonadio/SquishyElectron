/*
** quantum Space -- where an electron (or whatever) lives and moves around
**		and the forces that impact it's motion and time evolution
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include <chrono>
#include "qSpace.h"
#include "qWave.h"
#include "../fourier/fftMain.h"

extern void analyzeWaveFFT(qWave *qw);
class qSpace *theSpace = NULL;
double *thePotential = NULL;


static bool debugIterSummary = true;
static bool debugIteration = false;
static bool debugJustWave = false;
static bool debugJustInnerProduct = false;
static bool debugFreeBuffer = true;


// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

/* ********************************************************** qSpace construction */

// resetCounters
void qSpace::resetCounters(void) {
	elapsedTime = 0.;
	iterateSerial = 0;
}

// note if you just use the constructor and these functions,
// NO waves or buffers will be allocated for you
qSpace::qSpace(const char *lab) {
	printf("🚀 🚀 qSpace::qSpace() theSpace this: x%p\n", (this));
	nDimensions = 0;

	resetCounters();
	lowPassDilution = 0.5;

	pleaseFFT = false;
	isIterating = false;

	strncpy(label, lab, LABEL_LEN);
	label[LABEL_LEN-1] = 0;

	printf("🚀 🚀 qSpace::qSpace() done this: x%p, length %lx\n", (this), sizeof(qSpace));
}

qSpace::~qSpace(void) {
	printf("🚀 🚀 qSpace destructor of %s, this: x%p\n", label, (this));
	// these cached buffers need to go free
	clearFreeBuffers();
	printf("🚀 🚀 qSpace destructor done this: x%p\n", (this));
}

// after the contructor, call this to add each dimension up to MAX_DIMENSIONS
void qSpace::addDimension(int N, int continuum, const char *label) {
	if (nDimensions >= MAX_DIMENSIONS) {
		printf("🚀 🚀 Error dimensions: %d\n", nDimensions);
		throw "🚀 🚀 too many dimensions";
	}

	qDimension *dims = dimensions + nDimensions;
	dims->N = N;
	dims->continuum = continuum;
	if (continuum) {
		dims->start = 1;
		dims->end = N + 1;
	}
	else {
		dims->start = 0;
		dims->end = N;
	}

	strncpy(dims->label, label, LABEL_LEN-1);
	dims->label[LABEL_LEN-1] = 0;

	nDimensions++;
}

// after all the addDimension calls, what have we got?  calculate, not alloc.
void qSpace::tallyDimensions(void) {
	nPoints = 1;
	nStates = 1;

	int ix;
	// finish up all the dimensions now that we know them all
	for (ix = nDimensions-1; ix >= 0; ix--) {
		qDimension *dims = dimensions + ix;

		nStates *= dims->N;
		dims->nStates = nStates;
		nPoints *= dims->start + dims->end;
		dims->nPoints = nPoints;
	}

	chooseSpectrumSize();

	if (nPoints > spectrumSize)
		freeBufferLength = nPoints;
	else
		freeBufferLength = spectrumSize;
	if (debugFreeBuffer) {
		printf("🚀 🚀 qSpace::tallyDimensions, nPoints=x%x   spectrumSize=x%x   freeBufferLength=x%x   ",
			nPoints, spectrumSize, freeBufferLength);
	}

	//printf("🚀 🚀  got past tallyDimensions; nStates=%d  nPoints=%d\n", nStates, nPoints);
}

// call this After addDIMENSION calls to get it ready to go.
// If nPoints is still zero, initSpace hasn't been called yet; failure
void qSpace::initSpace() {
	tallyDimensions();

	// try out different formulas here.  Um, this is actually set manually
	double dt = dt = 1. / (nStates * nStates);
	//double dt = dt = nStates * 0.02;  // try out different factors here

	// used only for the RKs - therefore obsolete
//	dtOverI = qCx(0., -dt);
//	halfDtOverI = qCx(0., -dt / 2.);
//	bufferNum = 0;
}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dims = dimensions;

	printf("🚀 🚀 == Potential %s, %d...%d", title, dims->start, dims->end);
	if (dims->continuum) printf("  start [O]=%lf", thePotential[0]);
	printf("\n");

	for (ix = dims->start; ix < dims->end; ix++) {
		if (0 == ix % 10) printf("\n[%d] ", ix);
		printf("%lf ", thePotential[ix]);
	}
	if (dims->continuum) printf("\n🚀 🚀 end [%d]=%lf", ix, thePotential[ix]);
	printf("\n");
}

void qSpace::setZeroPotential(void) {
	qDimension *dims = dimensions;
	for (int ix = 0; ix < dims->nPoints; ix++)
		thePotential[ix] = 0.;
}

void qSpace::setValleyPotential(double power = 1, double scale = 1, double offset = 0) {
	qDimension *dims = dimensions;
	double mid = floor(dims->nPoints / 2);
	for (int ix = 0; ix < dims->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}
}


/* ********************************************************** integration */


// does several visscher steps, we'll call that two 'steps'
void qSpace::oneIteration() {
	int ix;

	if (debugIteration)
		printf("🚀 🚀 qSpace::oneIteration() - dt=%lf   stepsPerIteration=%d\n",
			dt, stepsPerIteration);

	int steps = stepsPerIteration / 2;
	if (debugIteration)
		printf("🚀 🚀 qSpace::oneIteration() - steps=%d   stepsPerIteration=%d\n",
			steps, stepsPerIteration);

	isIterating = true;
	for (ix = 0; ix < steps; ix++) {
		// this seems to have a resolution of 100µs on Panama
		//auto start = std::chrono::steady_clock::now();////

		oneVisscherStep(laosQWave, peruQWave);
		oneVisscherStep(peruQWave, laosQWave);
		if (debugIteration && 0 == ix % 100)
			printf("🚀 🚀  step every hundred, step %d\n", ix * 2);

		//auto end = std::chrono::steady_clock::now();////
		//std::chrono::duration<double> elapsed_seconds = end-start;////
		//printf("elapsed time: %lf \n", elapsed_seconds.count());////
	}
	isIterating = false;

	iterateSerial++;

	// printf("qSpace::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
	// 	(long) viewBuffer, (long) latestWave);
	latestQWave = laosQWave;

	// ok the algorithm tends to diverge after thousands of iterations.  Hose it down.
	//	latestQWave->lowPassFilter(lowPassDilution);
	latestQWave->nyquistFilter();
	latestQWave->normalize();


	// need it; somehow? not done in JS
	theQViewBuffer->loadViewBuffer();

	if (debugIterSummary) {
		char buf[100];
		sprintf(buf, "🚀 🚀 finished one iteration (%d steps, N=%d), inner product: %lf",
			stepsPerIteration, dimensions->N, latestQWave->innerProduct());
	}

	if (debugJustWave) {
		char buf[100];
		latestQWave->dumpWave(buf, true);
	}
	if (debugJustInnerProduct) {
printf("🚀 🚀 finished one integration iteration (%d steps, N=%d), inner product: %lf\n",
stepsPerIteration, dimensions->N, latestQWave->innerProduct());
	}

	if (pleaseFFT) {
		analyzeWaveFFT(latestQWave);
		pleaseFFT = false;
	}
}


// user button to print it out now, or at end of the next iteration
void qSpace::askForFFT(void) {
	if (isIterating)
		pleaseFFT = true;
	else
		analyzeWaveFFT(latestQWave);
}


/* ********************************************************** FreeBuffer */

// this is all on the honor system.  If you borrow a buf, you either have to return it
// with returnBuffer() or you free it with freeWave().
qCx *qSpace::borrowBuffer(void) {
	FreeBuffer *rentedCache = freeBufferList;
	if (rentedCache) {
		if (debugFreeBuffer) {
			printf("🚀 🚀 qSpace::borrowBuffer() with some cached. freeBufferList: x%p\n",
			(freeBufferList));
		}

		// there was one available on the free list, pop it off
		freeBufferList = rentedCache->next;
		return (qCx *) rentedCache;
	}
	else {
		// must make a new one
		if (debugFreeBuffer) {
			printf("🚀 🚀 qSpace::borrowBuffer() with none cached. freeBufferList: x%p   freeBufferLength: %d\n",
			(freeBufferList), freeBufferLength);
		}
		return allocateWave(freeBufferLength);
	}
}

// return the buffer to the free list.  Potentially endless but probably not.
// do not return buffers that aren't the right size - freeBufferLength
void qSpace::returnBuffer(qCx *rentedBuffer) {
	printf("rentedBuffer: x%p  freeBufferList=x%p",
		rentedBuffer, freeBufferList);
	FreeBuffer *rented = (FreeBuffer *) rentedBuffer;
	rented->next = freeBufferList;
	freeBufferList = rented;
}

// this is the only way they're freed; otherwise they just collect.
// shouldn't be too many, though.  Called by destructor.
void qSpace::clearFreeBuffers() {
printf("🚀 🚀 qSpace::clearFreeBuffers() starting. freeBufferList: x%p\n",
	(freeBufferList));
	FreeBuffer *n;
	for (FreeBuffer *f = freeBufferList; f; f = n) {
		n = f->next;
printf("           🚀 🚀 about to free this one: x%p\n",
(f));
		freeWave((qCx *) f);
	}
	freeBufferList = NULL;
	printf("              🚀 🚀 qSpace::clearFreeBuffers() done. freeBufferList=x%p\n",
		freeBufferList);
}
