/*
** js space -- interface to JS for qSpaces
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include "qWave.h"

/* ********************************************************** wave stuff */

// after the initSpace() call, allocate the buffers.
void allocWaves(void) {

//printf(" got past new qFlick\n");
	// the other buffers...
	peruQWave = new qWave(theSpace);
	laosQWave = new qWave(theSpace);

	peruWave = peruQWave->wave;
	laosWave = laosQWave->wave;
printf("        🚀 🚀 🚀       peruQWave=x%x   peruWave=x%x   laosQWave=x%x   laosWave=x%x  \n",
(uint32_t) peruQWave, (uint32_t) peruWave, (uint32_t) laosQWave, (uint32_t) laosWave);
}

static void freeWaves(void) {
	printf("🚀 🚀 🚀 about to delete qWaves:\n");
	delete peruQWave;
	delete laosQWave;

	delete[] thePotential;
	delete theQViewBuffer;
	printf("🚀 🚀 🚀 done deleting.\n");
}

/* ********************************************************** glue functions for js */

// these are for JS only; they're all extern "C"
extern "C" {

// return a pointer to just the main wave for theSpace
qCx *qSpace_getWaveBuffer(void) {
	printf("🚀 🚀 🚀 qSpace_getWaveBuffer() theSpace: x%x\n", (uint32_t) (theSpace));
	printf("        🚀 🚀 🚀        the qWave x%x\n", (uint32_t) (theSpace->latestQWave));
	printf("        🚀 🚀 🚀        the wave x%x\n", (uint32_t) (theSpace->latestQWave->wave));
	printf("        🚀 🚀 🚀     q=w %d   s=w %d   q=s x%x\n",
		(uint32_t) (theSpace->latestQWave) == (uint32_t) (theSpace->latestQWave->wave),
		(uint32_t) (theSpace) == (uint32_t) (theSpace->latestQWave->wave),
		(uint32_t) (theSpace->latestQWave) == (uint32_t) (theSpace)
	);

	return theSpace->latestQWave->wave;
}

double *qSpace_getPotentialBuffer(void) {
	return thePotential;
}

double qSpace_getElapsedTime(void) {
	if (!theSpace) throw "🚀 🚀 🚀 null space in getElapsedTime()";
	return theSpace->elapsedTime;
}

double qSpace_getIterateSerial(void) {
	if (!theSpace) throw "🚀 🚀 🚀 null space in getIterateSerial()";
	return theSpace->iterateSerial;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(double power, double scale, double offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void qSpace_setDt(double dt) {
	theSpace->dt = dt;
}

// iterations are what the user sees.  steps are what Visscher does repeatedly.
void qSpace_setStepsPerIteration(int stepsPerIteration) {
	printf("🚀 🚀 🚀 qSpace_setStepsPerIteration(%d)\n", stepsPerIteration);
	if (stepsPerIteration < 1 || stepsPerIteration > 1e8) {
		char buf[100];
		sprintf(buf, "qSpace_setStepsPerIteration, %d, is <1 or too big\n", stepsPerIteration);
		throw buf;
	}
	theSpace->stepsPerIteration = stepsPerIteration;
	printf("🚀 🚀 🚀 qSpace_setStepsPerIteration result %d in theSpace=x%x\n",
		theSpace->stepsPerIteration, (uint32_t) theSpace);
}

// low pass filter.
void qSpace_setLowPassDilution(double dilution) {
	printf("🚀 🚀 🚀 qSpace_setLowPassDilution(%lf)\n", dilution);
	if (dilution >= 1. || dilution <= 0.) {
		char buf[100];
		sprintf(buf, "🚀 🚀 🚀qSpace_setLowPassDilution, %lf, must be between 0 and 1\n", dilution);
		throw buf;
	}
	theSpace->lowPassDilution = dilution;
	printf("🚀 🚀 🚀 qSpace_setLowPassDilution result %lf in theSpace=x%x\n",
		theSpace->lowPassDilution, (uint32_t) theSpace);
}

void qSpace_oneIteration(void) { theSpace->oneIteration(); }
void qSpace_resetCounters(void) { theSpace->resetCounters(); }

void qSpace_askForFFT(void) { theSpace->askForFFT(); }


/* ******************************************************** space creation from JS */

// call this to throw away existing theSpace and waves, and start new
// it's tedious to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(const char *label) {
	printf("🚀 🚀 🚀  startNewSpace(%s)\n", label);

	if (theSpace) {
		freeWaves();

		printf("🚀 🚀 🚀  JSstartNewSpace   about to delete theSpace (%s => %s)\n", theSpace->label, label);
		delete theSpace;
		printf("🚀 🚀 🚀  JSstartNewSpace   done deleting theSpace (%s => %s)\n", theSpace->label, label);
	}
	printf("🚀 🚀 🚀  JSstartNewSpace   about to create new theSpace (%s => %s)\n", theSpace->label, label);
	theSpace = new qSpace(label);
	printf("🚀 🚀 🚀  JSstartNewSpace   done startNewSpace()\n");

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
	//printf("🚀 🚀 🚀  done addSpaceDimension() %s\n", dims->label);
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

	printf("🚀 🚀 🚀 newly created wave, before norm:\n");
	theSpace->dumpThatWave(wave, true);

	theSpace->latestQWave->normalize();
	printf("🚀 🚀 🚀 newly created wave, AFTER norm:\n");
	theSpace->dumpThatWave(wave, true);

	/* *********************************** allocate other buffers */

	// we make our own potential
	theSpace->potential = thePotential = new double[theSpace->nPoints];

		printf("   🚀 🚀 🚀 completeNewSpace BEFORE creation  theQViewBuffer=x%x  "
			"theQViewBuffer->viewBuffer=x%x\n",
				(uint32_t) theQViewBuffer,
				theQViewBuffer ? (uint32_t) theQViewBuffer->viewBuffer : -1);


	// our own view buffer - needs potential to be in place
	theSpace->qViewBuffer = theQViewBuffer = new qViewBuffer(theSpace);
	//dumpViewBuffer("newly created");

		printf("   🚀 🚀 🚀 completeNewSpace After Creation but BEFORE loadViewBuffer  theQViewBuffer=x%x  "
			"theQViewBuffer->viewBuffer=x%x\n",
				(uint32_t) theQViewBuffer, theQViewBuffer ?  (uint32_t) theQViewBuffer->viewBuffer : -1);


	theQViewBuffer->loadViewBuffer();  // just so i can see the default if needed

		printf("   🚀 🚀 🚀 completeNewSpace AFTER loadViewBuffer  theQViewBuffer=x%x  "
			"theQViewBuffer->viewBuffer=x%x\n",
				(uint32_t) theQViewBuffer, theQViewBuffer ?  (uint32_t) theQViewBuffer->viewBuffer : -1);



	printf("   🚀 🚀 🚀 qSpace::completeNewSpace(): done\n");
	return theSpace;
}


// end of extern "C"
}

