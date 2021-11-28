/*
** js space -- interface to JS for qSpaces
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

// right now, the JS can only access theSpace, theQWave, and the like - all 'the'
// variables.  Other than that, you can have other qSpaces and other qWaves etc,
// in C++, just no JS interface to them.

#include "qSpace.h"
#include "qWave.h"

/* ********************************************************** wave stuff */

// after the initSpace() call, allocate the buffers.
// i'm not really using most of these...
void allocWaves(void) {
//printf(" got past sites & points\n");
	//  allocate the buffers.  theQWave's special
	theQWave = new qFlick(theSpace, 4);

//printf(" got past new qFlick\n");
	// the other buffers...
	peruQWave = new qWave(theSpace);
	egyptQWave = new qWave(theSpace);
	laosQWave = new qWave(theSpace);
	k1QWave = new qWave(theSpace);
	k2QWave = new qWave(theSpace);
	k3QWave = new qWave(theSpace);
	k4QWave = new qWave(theSpace);

//printf(" got past k4QWave\n");
	theWave = theQWave->buffer;
	peruWave = peruQWave->buffer;
	k1Wave = k1QWave->buffer;
	k2Wave = k2QWave->buffer;
	k3Wave = k3QWave->buffer;
	k4Wave = k4QWave->buffer;
	egyptWave = egyptQWave->buffer;
	laosWave = laosQWave->buffer;
//printf(" got past egypt & laos\n");
}

static void freeWaves(void) {
	printf("about to delete qWaves:\n");
	delete theQWave;
	delete peruQWave;
	delete egyptQWave;
	delete laosQWave;
	delete k1QWave;
	delete k2QWave;
	delete k3QWave;
	delete k4QWave;

	delete[] thePotential;
	delete theQViewBuffer;
	delete theSpace;
	printf("done deleting.\n");
}

/* ********************************************************** glue functions for js */

// these are for JS only; they're all extern "C"
extern "C" {

qCx *getWaveBuffer(void) {
	return theWave;
}

qReal *getPotentialBuffer(void) {
	return thePotential;
}

qReal qSpace_getElapsedTime(void) {
	if (!theSpace) throw "null space in getElapsedTime()";
	return theSpace->elapsedTime;
}

qReal qSpace_getIterateSerial(void) {
	if (!theSpace) throw "null space in getIterateSerial()";
	return theSpace->iterateSerial;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(qReal power, qReal scale, qReal offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void qSpace_oneIntegrationStep(void) { theSpace->oneIntegrationStep(); }

// heh not so simple
void qSpace_setAlgorithm(int newAlg) { theSpace->algorithm = newAlg; }


/* ******************************************************** space creation from JS */

// call this to throw away existing theSpace and waves, and start new
// it's tedious to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		freeWaves();
//		printf("about to delete theQWave:\n");
//		delete theQWave;
//		printf("about to delete peruQWave:\n");
//		delete peruQWave;
//		printf("about to delete egyptQWave:\n");
//		delete egyptQWave;
//		printf("about to delete laosQWave:\n");
//		delete laosQWave;
//		printf("about to delete k1QWave:\n");
//		delete k1QWave;
//		printf("about to delete k2QWave:\n");
//		delete k2QWave;
//		printf("about to delete k3QWave:\n");
//		delete k3QWave;
//		printf("about to delete k4QWave:\n");
//		delete k4QWave;
//
//		printf("about to delete thePotential:\n");
//		delete[] thePotential;
//		printf("about to delete viewBuffer:\n");
//		delete theQViewBuffer;
//		printf("about to delete theSpace:\n");
//		delete theSpace;
//		printf("done deleting.\n");
	}
	theSpace = new qSpace(1);
	//printf("  done startNewSpace()\n");

	return theSpace;
}

// call this from JS to add one or more dimensions
qSpace *addSpaceDimension(int N, int continuum, const char *label) {
	//printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);
	theSpace->addDimension(N, continuum, label);
//	qDimension *dims = theSpace->dimensions + theSpace->nDimensions;
//	dims->N = N;
//	dims->continuum = continuum;
//	if (continuum) {
//		dims->start = 1;
//		dims->end = N + 1;
//	}
//	else {
//		dims->start = 0;
//		dims->end = N;
//	}
//
//	strncpy(dims->label, label, LABEL_LEN-1);
//	dims->label[LABEL_LEN-1] = 0;
//
//	theSpace->nDimensions++;
	//printf("  done addSpaceDimension() %s\n", dims->label);
	return theSpace;
}

// call this from JS to finish the process
qSpace *completeNewSpace(void) {
	printf("completeNewSpace() starts\n");

	// finish up all the dimensions now that we know them all
	theSpace->initSpace();


	allocWaves();

//printf(" got past allocWaves()\n");
	theQViewBuffer = new qViewBuffer(theSpace);
	//theSpace->allocViewBuffer();
	//theQWave->dumpWave("freshly created");

	thePotential = new qReal[theSpace->nPoints];  // slow down, we just made this wave, don't blow it
	//theSpace->setValleyPotential(1., 1., 0.); // another default

	theSpace->filterCount = theSpace->nStates;  // bad idea


//printf(" got past algorithm = algVISSCHER\n");
	// a default.  must be done After viewBuffer and thePotential are in place.
	theQWave->setCircularWave(1);
//printf(" got past setCircularWave\n");

	//printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", theSpace->nStates, theSpace->nPoints);
	//printf("  dimension N=%d  continuum=%d  start=%d  end=%d  label=%s\n",
//		theSpace->dimensions->N, theSpace->dimensions->continuum,
//		theSpace->dimensions->start, theSpace->dimensions->end, theSpace->dimensions->label);
	return theSpace;
}

}
