/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include <cmath>

class qSpace *theSpace = NULL;

// a transitional kind of thing from raw wave arrays to the new qWave buffer obj
class qWave *theQWave = NULL, *sumQWave = NULL,
	*k1QWave = NULL, *k2QWave = NULL, *k3QWave = NULL, *k4QWave = NULL,
	*egyptQWave = NULL, *laosQWave = NULL;
class qCx *theWave = NULL, *sumWave = NULL,
	*k1Wave = NULL, *k2Wave = NULL, *k3Wave = NULL, *k4Wave = NULL,
	*egyptWave = NULL, *laosWave = NULL;


qReal *thePotential = NULL;


static int dimsSoFar;


// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript


extern "C" {

// call this to throw away existing space and wave, and start new
// it's hard to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		delete theQWave;
		delete sumQWave;
		delete k1QWave;
		delete k2QWave;
		delete k3QWave;
		delete k4QWave;
		delete egyptQWave;
		delete laosQWave;

		delete[] thePotential;
		delete[] viewBuffer;
		delete theSpace;
	}
	dimsSoFar = 0;
	theSpace = new qSpace(1);
	//printf("  done startNewSpace()\n");

	return theSpace;
}

// call this from JS to add one or more dimensions
qSpace *addSpaceDimension(int32_t N, int32_t continuum, const char *label) {
	//printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);

	qDimension *dim = theSpace->dimensions + dimsSoFar;
	dim->N = N;
	dim->continuum = continuum;

	dim->continuum = continuum;
	if (continuum) {
		dim->start = 1;
		dim->end = N + 1;
	}
	else {
		dim->start = 0;
		dim->end = N;
	}

	strncpy(dim->label, label, LABEL_LEN-1);

	dimsSoFar++;
	//printf("  done addSpaceDimension() %s\n", dim->label);
	return theSpace;
}

// call this from JS to finish the process
qSpace *completeNewSpace(void) {
	//printf("completeNewSpace()\n");
	int32_t ix;
	int32_t nPoints = 1, nStates = 1;

	theSpace->nDimensions = dimsSoFar;

	// finish up all the dimensions now that we know them all
	for (ix = dimsSoFar-1; ix >= 0; ix--) {
		qDimension *dim = theSpace->dimensions + ix;

		nStates *= dim->N;
		dim->nStates = nStates;
		nPoints *= dim->start + dim->end;
		dim->nPoints = nPoints;
	}
	theSpace->nStates = nStates;
	theSpace->nPoints = nPoints;

	//  allocate the buffers
	theQWave = new qWave(theSpace);
	sumQWave = new qWave(theSpace);
	k1QWave = new qWave(theSpace);
	k2QWave = new qWave(theSpace);
	k3QWave = new qWave(theSpace);
	k4QWave = new qWave(theSpace);
	egyptQWave = new qWave(theSpace);
	laosQWave = new qWave(theSpace);

	theWave = theQWave->buffer;
	sumWave = sumQWave->buffer;
	k1Wave = k1QWave->buffer;
	k2Wave = k2QWave->buffer;
	k3Wave = k3QWave->buffer;
	k4Wave = k4QWave->buffer;
	egyptWave = egyptQWave->buffer;
	laosWave = laosQWave->buffer;

	viewBuffer = new float[nPoints * 8];  // 4 floats per vertex, two verts per point

	// a default
//	theQWave->setCircularWave(1);  // you'll have to do this yourself
	//theQWave->dumpWave("freshly created");

	thePotential = new qReal[nPoints];
	//theSpace->setValleyPotential(1., 1., 0.); // another default

	theSpace->elapsedTime = 0.;
	theSpace->iterateSerial = 0;
	theSpace->filterCount = nStates;


	qReal dt = theSpace->dt = nStates * 0.02;  // try out different factors here
	theSpace->dtOverI = qCx(0., -dt);
	theSpace->halfDtOverI = qCx(0., -dt / 2.);


	//printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
	//printf("  dimension N=%d  extraN=%d  continuum=%d  start=%d  end=%d  label=%s\n",
	//	theSpace->dimensions->N, theSpace->dimensions->extraN, theSpace->dimensions->continuum,
	//	theSpace->dimensions->start, theSpace->dimensions->end, theSpace->dimensions->label);
	return theSpace;
}

/* ********************************************************** glue functions for js */

// these are for JS only; they're all extern "C"

qCx *getWaveBuffer(void) {
	return theWave;
}

qReal *getPotentialBuffer(void) {
	return thePotential;
}

qReal qSpace_getElapsedTime(void) {
	return theSpace->elapsedTime;
}

qReal qSpace_getIterateSerial(void) {
	return theSpace->iterateSerial;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(qReal power, qReal scale, qReal offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void qSpace_oneRk2Step() { theSpace->oneRk2Step(); }
void qSpace_oneRk4Step() { theSpace->oneRk4Step(); }


}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("== Potential %s, %d...%d", title, dim->start, dim->end);
	if (dim->continuum) printf("  start [O]=%lf", thePotential[0]);
	printf("\n");

	for (ix = dim->start; ix < dim->end; ix++) {
		if (0 == ix % 10) printf("\n[%d] ", ix);
		printf("%lf ", thePotential[ix]);
	}
	if (dim->continuum) printf("\nend [%d]=%lf", ix, thePotential[ix]);
	printf("\n");
}

void qSpace::setZeroPotential(void) {
	qDimension *dim = theSpace->dimensions;
	for (int ix = 0; ix < dim->nPoints; ix++)
		thePotential[ix] = 0.;
}

void qSpace::setValleyPotential(qReal power = 1, qReal scale = 1, qReal offset = 0) {
	qDimension *dim = theSpace->dimensions;
	qReal mid = floor(dim->nPoints / 2);
	for (int ix = 0; ix < dim->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}
}

