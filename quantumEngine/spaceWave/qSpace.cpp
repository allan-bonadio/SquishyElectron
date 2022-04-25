/*
** quantum Space -- where an electron (or whatever) lives and moves around
**		and the forces that impact it's motion and time evolution
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


#include <ctime>
#include <cstring>
#include "qSpace.h"
#include "qWave.h"
#include "qViewBuffer.h"
//#include "../fourier/fftMain.h"

//extern void analyzeWaveFFT(qWave *qw);
class qSpace *theSpace = NULL;
double *thePotential = NULL;


static bool traceIterSummary = true;
static bool traceIteration = false;
static bool traceIterSteps = false;

static bool traceJustWave = false;
static bool traceJustInnerProduct = false;
static bool traceFreeBuffer = false;

// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

/* ********************************************************** qSpace construction */

// note if you just use the constructor and these functions,
// NO waves or buffers will be allocated for you
qSpace::qSpace(const char *lab)
	: dt(1.0), stepsPerIteration(100) {
	magic = 'qSpa';

	//printf("🚀 🚀 qSpace::qSpace() constructor starts label:'%s'  this= %p\n", lab, (this));
	nDimensions = 0;

	resetCounters();
	lowPassDilution = 0.5;

	pleaseFFT = false;
	isIterating = false;

	strncpy(label, lab, LABEL_LEN);
	label[LABEL_LEN] = 0;

	freeBufferList = NULL;

	//printf("🚀 🚀 qSpace::qSpace() constructor done this= %p, length %lx\n",
	//	(this), sizeof(qSpace));
}

qSpace::~qSpace(void) {
//	printf("🚀 🚀 qSpace destructor starting %s, this= %p  \n", label, (this));
//	printf("🧨 🧨    made it this far, %s:%d    freeBufferList=%p\n", __FILE__, __LINE__, this->freeBufferList);


	// these cached buffers need to go free
	clearFreeBuffers();
//	printf("🚀 🚀 qSpace destructor done this= %p\n", (this));
//	printf("🧨 🧨    made it this far, %s:%d  freeBufferList=%p\n", __FILE__, __LINE__, this->freeBufferList);
}

// after the contructor, call this to add each dimension up to MAX_DIMENSIONS
void qSpace::addDimension(int N, int continuum, const char *label) {
	if (nDimensions >= MAX_DIMENSIONS) {
		printf("🚀 🚀 Error dimensions: %d\n", nDimensions);
		throw std::runtime_error("🚀 🚀 too many dimensions");
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

	strncpy(dims->label, label, LABEL_LEN);
	dims->label[LABEL_LEN] = 0;

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

	chooseSpectrumLength();

	if (nPoints > spectrumLength)
		freeBufferLength = nPoints;
	else
		freeBufferLength = spectrumLength;
	if (traceFreeBuffer) {
		printf("🚀 🚀 qSpace::tallyDimensions, nPoints=%d   spectrumLength=%d   freeBufferLength=%d   ",
			nPoints, spectrumLength, freeBufferLength);
	}

	//printf("🚀 🚀  got past tallyDimensions; nStates=%d  nPoints=%d\n", nStates, nPoints);
}

// call this After addDIMENSION calls to get it ready to go.
// If nPoints is still zero, initSpace hasn't been called yet; failure
void qSpace::initSpace() {
	tallyDimensions();

	// try out different formulas here.  Um, this is actually set manually in CP
	double dt = dt = 1. / (nStates * nStates);
	//double dt = dt = nStates * 0.02;  // try out different factors here

	// used only for the RKs - therefore obsolete
//	dtOverI = qCx(0., -dt);
//	halfDtOverI = qCx(0., -dt / 2.);
//	bufferNum = 0;
}


void qSpace::resetCounters(void) {
	elapsedTime = 0.;
	iterateSerial = 0;
}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dims = dimensions;

	//printf("🚀 🚀 == Potential %s, %d...%d", title, dims->start, dims->end);
	if (dims->continuum) printf("  start [O]=%lf", thePotential[0]);
	//printf("\n");

	//for (ix = dims->start; ix < dims->end; ix++) {
	//	if (0 == ix % 10) printf("\n[%d] ", ix);
	//	printf("%lf ", thePotential[ix]);
	//}
	//if (dims->continuum) printf("\n🚀 🚀 end [%d]=%lf", ix, thePotential[ix]);
	//printf("\n");
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

//static double getTimeDouble() {
//    return std::chrono::duration_cast
//    	<std::chrono::duration<float, std::milli>
//    	>(std::chrono::high_resolution_clock::now().time_since_epoch()).count() / 1000;
//
//}
//

double getTimeDouble()
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}




// does several visscher steps (eg 100 or 500)
// actually does stepsPerIteration+1 steps; half steps at start and finish
void qSpace::oneIteration() {
	int ix;

	printf("the ttime: %lf\n", getTimeDouble());

	if (traceIteration)
		printf("🚀 🚀 qSpace::oneIteration() - dt=%lf   stepsPerIteration=%d\n",
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

	// printf("qSpace::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
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
			stepsPerIteration, dimensions->N, latestQWave->innerProduct());
	}

	if (traceJustWave) {
		latestQWave->dumpWave("      at end of iteration", true);
	}
	if (traceJustInnerProduct) {
		printf("      finished one integration iteration (%d steps, N=%d), inner product: %lf\n",
			stepsPerIteration, dimensions->N, latestQWave->innerProduct());
	}

	if (pleaseFFT) {
		//analyzeWaveFFT(latestQWave);
		pleaseFFT = false;
	}
}


// user button to print it out now, or at end of the next iteration
void qSpace::askForFFT(void) {
	if (isIterating)
		pleaseFFT = true;
	else
		;//analyzeWaveFFT(latestQWave);
}


/* ********************************************************** FreeBuffer */

// this is all on the honor system.  If you borrow a buf, you either have to return it
// with returnBuffer() or you free it with freeWave().
qCx *qSpace::borrowBuffer(void) {
	FreeBuffer *rentedCache = freeBufferList;
	if (rentedCache) {
		if (traceFreeBuffer) {
			printf("🚀 🚀 qSpace::borrowBuffer() with some cached. freeBufferList: %p\n",
			(freeBufferList));
		}

		// there was one available on the free list, pop it off
		freeBufferList = rentedCache->next;
		return (qCx *) rentedCache;
	}
	else {
		// must make a new one
		if (traceFreeBuffer) {
			printf("🚀 🚀 qSpace::borrowBuffer() with none cached. freeBufferList: %p   freeBufferLength: %d\n",
				freeBufferList, freeBufferLength);
		}
		return allocateWave(freeBufferLength);
	}
}

// return the buffer to the free list.  Potentially endless but probably not.
// do not return buffers that aren't the right size - freeBufferLength
void qSpace::returnBuffer(qCx *rentedBuffer) {
	printf("rentedBuffer: %p  freeBufferList=%p",
		rentedBuffer, freeBufferList);
	FreeBuffer *rented = (FreeBuffer *) rentedBuffer;
	rented->next = freeBufferList;
	freeBufferList = rented;
}

// this is the only way they're freed; otherwise they just collect.
// shouldn't be too many, though.  Called by destructor.
void qSpace::clearFreeBuffers() {
	//printf("🚀 🚀 qSpace::clearFreeBuffers() starting. freeBufferList: %p\n",
	//freeBufferList);
	FreeBuffer *n = freeBufferList;
	for (FreeBuffer *f = freeBufferList; f; f = n) {
		n = f->next;
		printf("           🚀 🚀 about to free this one: f=%p, n=%p\n", f, n);
		freeWave((qCx *) f);
	}
	freeBufferList = NULL;
	//printf("              🚀 🚀 qSpace::clearFreeBuffers() done. freeBufferList=%p\n",
	//	freeBufferList);
}
