/*
** quantum Space -- where an electron (or whatever) lives and moves around
**		and the forces that impact it's motion and time evolution
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include <chrono>
#include "qSpace.h"
#include "qWave.h"

class qSpace *theSpace = NULL;


qReal *thePotential = NULL;

static bool debugIteration = false;
static bool debugJustWave = true;
static bool debugJustInnerProduct = false;

// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

/* ********************************************************** qSpace construction */

// resetCounters
void qSpace::resetCounters(void) {
	this->elapsedTime = 0.;
	this->iterateSerial = 0;
}
// note if you just use the constructor and these functions,
// NO waves or buffers will be allocated for you
qSpace::qSpace(int nDims) {
	this->resetCounters();
	this->nDimensions = 0;
}

qSpace::~qSpace(void) {
	// nothing yet but stay tuned
}

// after the contructor, call this to add each dimension up to MAX_DIMENSIONS
void qSpace::addDimension(int N, int continuum, const char *label) {
	if (this->nDimensions >= MAX_DIMENSIONS) {
		printf("Error dimensions: %d\n", this->nDimensions);
		throw "too many dimensions";
	}

	qDimension *dims = this->dimensions + this->nDimensions;
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

	this->nDimensions++;
}

// after all the addDimension calls, what have we got?  calculate, not alloc.
void qSpace::tallyDimensions(void) {
	int nPoints = 1, nStates = 1;

	int ix;
	// finish up all the dimensions now that we know them all
	for (ix = this->nDimensions-1; ix >= 0; ix--) {
		qDimension *dims = this->dimensions + ix;

		nStates *= dims->N;
		dims->nStates = nStates;
		nPoints *= dims->start + dims->end;
		dims->nPoints = nPoints;
	}
	this->nStates = nStates;
	this->nPoints = nPoints;
	//printf(" got past tallyDimensions; nStates=%d  nPoints=%d\n", nStates, nPoints);
}

// call this After addDIMENSION calls to get it ready to go.
// If this->nPoints is still zero, initSpace hasn't been called yet; failure
void qSpace::initSpace() {
	this->tallyDimensions();

	// try out different formulas here.  Um, this is actually reset based on slider in CPToolbar
	qReal dt = this->dt = 1. / (this->nStates * this->nStates);
	//qReal dt = this->dt = nStates * 0.02;  // try out different factors here

	// used only for the RKs - therefore obsolete
	this->dtOverI = qCx(0., -dt);
	this->halfDtOverI = qCx(0., -dt / 2.);
	this->bufferNum = 0;
}

// call this from JS to create/allocate the
//void qSpace::allocViewBuffer(void) {
//NYET!
//	float *viewBuffer = new float[this->nPoints * 8];  // 4 floats per vertex, two verts per point
//	printf("viewBuffer(): viewBuffer %ld \n",
//		(long) theQViewBuffer->viewBuffer);
//}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dims = this->dimensions;

	printf("== Potential %s, %d...%d", title, dims->start, dims->end);
	if (dims->continuum) printf("  start [O]=%lf", thePotential[0]);
	printf("\n");

	for (ix = dims->start; ix < dims->end; ix++) {
		if (0 == ix % 10) printf("\n[%d] ", ix);
		printf("%lf ", thePotential[ix]);
	}
	if (dims->continuum) printf("\nend [%d]=%lf", ix, thePotential[ix]);
	printf("\n");
}

void qSpace::setZeroPotential(void) {
	qDimension *dims = this->dimensions;
	for (int ix = 0; ix < dims->nPoints; ix++)
		thePotential[ix] = 0.;

	//theQViewBuffer->loadViewBuffer(this->latestQWave);
}

void qSpace::setValleyPotential(qReal power = 1, qReal scale = 1, qReal offset = 0) {
	qDimension *dims = this->dimensions;
	qReal mid = floor(dims->nPoints / 2);
	for (int ix = 0; ix < dims->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}

	// this is overkill but gotta update the Potential column in the view buffer
	//theQViewBuffer->loadViewBuffer(this->latestQWave);
}


/* ********************************************************** integration */

// does several visscher steps, we'll call that one 'iteration'
void qSpace::oneIteration() {
	int ix;

	if (this->stepsPerIteration < 1 || this->stepsPerIteration > 1e8) {
		char buf[100];
		sprintf(buf, "this->stepsPerIteration, %d, is unreasonable size, in space %d",
			this->stepsPerIteration, (int) this);
		printf("Error: %s\n", buf);
		throw buf;
	}
	if (debugIteration)
		printf("qSpace::oneIteration() - dt=%lf   stepsPerIteration=%d\n", this->dt, this->stepsPerIteration);

	int steps = this->stepsPerIteration / 2;
	if (debugIteration)
		printf("qSpace::oneIteration() - steps=%d   stepsPerIteration=%d\n", steps, this->stepsPerIteration);
	for (ix = 0; ix < steps; ix++) {
		// this seems to have a resolution of 100µs on Panama
		//auto start = std::chrono::steady_clock::now();////

		this->oneVisscherStep(laosQWave, peruQWave);
		this->oneVisscherStep(peruQWave, laosQWave);
		if (debugIteration && 0 == ix % 100)
			printf("200 step, step %d\n", ix * 2);

		//auto end = std::chrono::steady_clock::now();////
		//std::chrono::duration<double> elapsed_seconds = end-start;////
		//printf("elapsed time: %lf \n", elapsed_seconds.count());////
	}

	this->iterateSerial++;

	// printf("qSpace::oneIteration(): viewBuffer %ld and latestWave=%ld\n",
	// 	(long) viewBuffer, (long) latestWave);
	this->latestQWave = laosQWave;

	// ok this algorithm tends to diverge after thousands of iterations.  Hose it down.
	this->latestQWave->normalize();


	// need it; somehow? not done in JS
	theQViewBuffer->loadViewBuffer();

	if (debugJustWave) {
		char buf[100];
		sprintf(buf, "finished one iteration (%d steps, N=%d), inner product: %lf",
			this->stepsPerIteration, this->dimensions->N, this->latestQWave->innerProduct());
		this->latestQWave->dumpWave(buf, true);
	}
	if (debugJustInnerProduct) {
		printf("finished one iteration (%d steps, N=%d), inner product: %lf\n",
			this->stepsPerIteration, this->dimensions->N, this->latestQWave->innerProduct());
	}
}

