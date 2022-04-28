/*
** quantum Space -- where an electron (or whatever) lives and moves around
**		and the forces that impact it's motion and time evolution
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


//#include <ctime>
#include <cstring>
#include "qSpace.h"
#include "../schrodinger/Manifestation.h"
#include "qWave.h"
#include "qViewBuffer.h"
//#include "../fourier/fftMain.h"

//extern void analyzeWaveFFT(qWave *qw);
class qSpace *theSpace = NULL;
double *thePotential = NULL;



static bool traceFreeBuffer = false;

// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

/* ********************************************************** qSpace construction */

// note if you just use the constructor and these functions,
// NO waves or buffers will be allocated for you
qSpace::qSpace(const char *lab) {
	magic = 'qSpa';
	mani = new Manifestation(this);

	//printf("🚀 🚀 qSpace::qSpace() constructor starts label:'%s'  this= %p\n", lab, (this));
	nDimensions = 0;

	mani->resetCounters();

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

	delete mani;

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
	mani->dt = 1. / (nStates * nStates);
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
