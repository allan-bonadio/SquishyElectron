/*
** js space -- interface to JS for qSpaces
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include "qWave.h"

/* ********************************************************** wave stuff */

// after the initSpace() call, allocate the buffers.
// i'm not really using most of these...
void allocWaves(void) {

//printf(" got past new qFlick\n");
	// the other buffers...
	peruQWave = new qWave(theSpace);
	laosQWave = new qWave(theSpace);

	peruWave = peruQWave->wave;
	laosWave = laosQWave->wave;
}

static void freeWaves(void) {
	printf("about to delete qWaves:\n");
	delete peruQWave;
	delete laosQWave;

	delete[] thePotential;
	delete theQViewBuffer;
	printf("done deleting.\n");
}

/* ********************************************************** glue functions for js */

// these are for JS only; they're all extern "C"
extern "C" {

// return a pointer to just the main wave for theSpace
qCx *qSpace_getWaveBuffer(void) {
	return theSpace->latestQWave->wave;
}

qReal *qSpace_getPotentialBuffer(void) {
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

void qSpace_setDt(double dt) {
	theSpace->dt = dt;
}

// iterations are what the user sees.  steps are what Visscher does repeatedly.
void qSpace_setStepsPerIteration(int stepsPerIteration) {
	printf("qSpace_setStepsPerIteration(%d)\n", stepsPerIteration);
	if (stepsPerIteration < 1 || stepsPerIteration > 1e8) {
		char buf[100];
		sprintf(buf, "qSpace_setStepsPerIteration, %d, is <1 or too big\n", stepsPerIteration);
		throw buf;
	}
	theSpace->stepsPerIteration = stepsPerIteration;
	printf("qSpace_setStepsPerIteration result %d in theSpace=%d\n",
		theSpace->stepsPerIteration, (int) theSpace);
}

void qSpace_oneIteration(void) { theSpace->oneIteration(); }
void qSpace_resetCounters(void) { theSpace->resetCounters(); }




/* ******************************************************** space creation from JS */

// call this to throw away existing theSpace and waves, and start new
// it's tedious to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		freeWaves();
		delete theSpace;
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
	//printf("completeNewSpace() starts\n");

	// finish up all the dimensions now that we know them all
	theSpace->initSpace();
	//printf("did initSpace\n");


	/* *********************************** allocate waves */
	allocWaves();

	// we make our own wave - static
	theSpace->latestQWave = laosQWave;
	qCx *wave = theSpace->latestQWave->wave;

	// a dopey default.  JS fills in the actual default.
	qDimension *dims = theSpace->dimensions;
	for (int ix = 0; ix < dims->start + dims->end; ix++)
		wave[ix] = qCx(1., 0.);

	printf(" newly created wave, before norm:\n");
	theSpace->dumpThatWave(wave, true);

	theSpace->latestQWave->normalize();
	printf(" newly created wave, AFTER norm:\n");
	theSpace->dumpThatWave(wave, true);

	/* *********************************** allocate other buffers */

	// we make our own potential
	theSpace->potential = thePotential = new qReal[theSpace->nPoints];

	// we make our own view buffer - needs potential to be in place
	theSpace->qViewBuffer = theQViewBuffer = new qViewBuffer(theSpace);
	dumpViewBuffer();

	theQViewBuffer->loadViewBuffer();  // just so i can see the default if needed



	// obsolete: a default.  must be done After viewBuffer and thePotential are in place.
//	theSpace->latestQWave->setCircularWave(1);
//	theQViewBuffer->loadViewBuffer();


	printf("qSpace::completeNewSpace(): done\n");
	return theSpace;
}


}
