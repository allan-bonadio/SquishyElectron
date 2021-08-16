/*
** quantum Space -- where an electron (or whatever) lives and moves around
**        and the forces that impact it's motion and time evolution
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include <cmath>

class qSpace *theSpace = NULL;


qReal *thePotential = NULL;


static int dimsSoFar;


// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript

/* ********************************************************** qSpace construction */

qSpace::qSpace(int nDims) {
	this->nDimensions = nDims;
	this->iterateSerial = 0;
	this->elapsedTime = 0.;

	// magic flags
	this->doLowPass = true;
	this->continuousLowPass = 0;
}


extern "C" {

// call this to throw away existing space and wave, and start new
// it's hard to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		printf("about to delete theQWave:\n");
		delete theQWave;
		printf("about to delete peruQWave:\n");
		delete peruQWave;
		printf("about to delete egyptQWave:\n");
		delete egyptQWave;
		printf("about to delete laosQWave:\n");
		delete laosQWave;
		printf("about to delete k1QWave:\n");
		delete k1QWave;
		printf("about to delete k2QWave:\n");
		delete k2QWave;
		printf("about to delete k3QWave:\n");
		delete k3QWave;
		printf("about to delete k4QWave:\n");
		delete k4QWave;

		printf("about to delete thePotential:\n");
		delete[] thePotential;
		printf("about to delete viewBuffer:\n");
		delete[] viewBuffer;
		printf("about to delete theSpace:\n");
		delete theSpace;
		printf("done deleting.\n");
	}
	dimsSoFar = 0;
	theSpace = new qSpace(1);
	//printf("  done startNewSpace()\n");

	return theSpace;
}

// call this from JS to add one or more dimensions
qSpace *addSpaceDimension(int32_t N, int32_t continuum, const char *label) {
	//printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);

	qDimension *dims = theSpace->dimensions + dimsSoFar;
	dims->N = N;
	dims->continuum = continuum;

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

	dimsSoFar++;
	//printf("  done addSpaceDimension() %s\n", dims->label);
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
		qDimension *dims = theSpace->dimensions + ix;

		nStates *= dims->N;
		dims->nStates = nStates;
		nPoints *= dims->start + dims->end;
		dims->nPoints = nPoints;
	}
	theSpace->nStates = nStates;
	theSpace->nPoints = nPoints;

	//  allocate the buffers.  theQWave's special
	theQWave = new qFlick(theSpace, 4);
	theQWave->setCircularWave(1);

	// the other buffers...
	peruQWave = new qWave(theSpace);
	egyptQWave = new qWave(theSpace);
	laosQWave = new qWave(theSpace);
	k1QWave = new qWave(theSpace);
	k2QWave = new qWave(theSpace);
	k3QWave = new qWave(theSpace);
	k4QWave = new qWave(theSpace);

	theWave = theQWave->buffer;
	peruWave = peruQWave->buffer;
	k1Wave = k1QWave->buffer;
	k2Wave = k2QWave->buffer;
	k3Wave = k3QWave->buffer;
	k4Wave = k4QWave->buffer;
	egyptWave = egyptQWave->buffer;
	laosWave = laosQWave->buffer;

	viewBuffer = new float[nPoints * 8];  // 4 floats per vertex, two verts per point

	// a default
//	theQWave->setCircularWave(1);  // see above

	//theQWave->dumpWave("freshly created");

	thePotential = new qReal[nPoints];
	//theSpace->setValleyPotential(1., 1., 0.); // another default

	theSpace->elapsedTime = 0.;
	theSpace->iterateSerial = 0;
	theSpace->filterCount = nStates;


	qReal dt = theSpace->dt = nStates * 0.02;  // try out different factors here
	theSpace->dtOverI = qCx(0., -dt);
	theSpace->halfDtOverI = qCx(0., -dt / 2.);

	theSpace->algorithm = algVISSCHER;
	//theSpace->algorithm = algRK2;
	theSpace->bufferNum = 0;

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

void qSpace_oneIntegrationStep(void) { theSpace->oneIntegrationStep(); }

void qSpace_setAlgorithm(int newAlg) { theSpace->algorithm = newAlg; }

}

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
	qDimension *dims = theSpace->dimensions;
	for (int ix = 0; ix < dims->nPoints; ix++)
		thePotential[ix] = 0.;

	updateViewBuffer(this->latestQWave);
}

void qSpace::setValleyPotential(qReal power = 1, qReal scale = 1, qReal offset = 0) {
	qDimension *dims = theSpace->dimensions;
	qReal mid = floor(dims->nPoints / 2);
	for (int ix = 0; ix < dims->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}

	// this is overkill but gotta update the Potential column in the view buffer
	updateViewBuffer(this->latestQWave);
}


/* ********************************************************** integration */

// does one visscher step, or an rk2 or rk4 iteration step
void qSpace::oneIntegrationStep() {
	qWave *oldQWave, *newQWave;

	// each calculates the new wave into the opposite buffer
	if (this->bufferNum) {
		newQWave = theQWave;
		oldQWave = peruQWave;
		this->bufferNum = 0;
	}
	else {
		oldQWave = theQWave;
		newQWave = peruQWave;
		this->bufferNum = 1;
	}

	switch (this->algorithm) {
	case algRK2:
		this->oneRk2Step(oldQWave, newQWave);
		break;

	case algRK4:
		break;
		this->oneRk4Step(oldQWave, newQWave);

	case algVISSCHER:
		this->oneVisscherStep(oldQWave, newQWave);
		break;

	default:
		printf("*** unknown algorithm %d\n", this->algorithm);
		return;
	}

	this->latestQWave = newQWave;
	updateViewBuffer(newQWave);
}


