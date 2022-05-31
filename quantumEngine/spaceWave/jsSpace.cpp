/*
** js space -- interface to JS for qSpaces
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


#include "qSpace.h"
#include "../schrodinger/Timeline.h"
#include "qWave.h"
#include "qViewBuffer.h"



static bool traceSpaceCreation = false;

/* ********************************************************** wave stuff */

// after the initSpace() call, allocate the buffers.
void allocWaves(void) {

//printf(" got past new qFlick\n");
	// the other buffers...
//	printf("🚀 🚀 🚀  %s:%d freeBufferList: %p\n", __FILE__, __LINE__, theSpace->freeBufferList);

//	peruWave = peruQWave->wave;
//	laosWave = laosQWave->wave;

//	printf("🚀 🚀 🚀  %s:%d freeBufferList: %p\n", __FILE__, __LINE__, theSpace->freeBufferList);
	//printf("        🚀 🚀 🚀       peruQWave=%p   peruWave=%p   mainQWave=%p   laosWave=%p  \n",
	//	peruQWave, peruWave, mainQWave, laosWave);

	/* *********************************** allocate other buffers */

	// we make our own potential
	theSpace->potential = thePotential = new double[theSpace->nPoints];
//	printf("🚀 🚀 🚀  %s:%d freeBufferList: %p\n", __FILE__, __LINE__, theSpace->freeBufferList);


	// our own view buffer - needs potential to be in place
	theSpace->tline->viewBuffer = theQViewBuffer = new qViewBuffer(theSpace);
//	printf("🚀 🚀 🚀  %s:%d freeBufferList: %p\n", __FILE__, __LINE__, theSpace->freeBufferList);
	//dumpViewBuffer("newly created");

	//printf("   🚀 🚀 🚀 completeNewSpace BEFORE creation  theQViewBuffer=%p  "
	//	"theQViewBuffer->viewBuffer=%p\n",
	//		theQViewBuffer,
	//		theQViewBuffer ? theQViewBuffer->viewBuffer : NULL);
}

// call to destroy them
static void freeWaves(void) {
	//printf("🚀 🚀 🚀 about to delete qWaves:peruQWave\n");
//	delete peruQWave;
//	peruQWave = NULL;
	//printf("🚀 🚀 🚀 about to delete qWaves:mainQWave\n");
//	delete laosQWave;
//	laosQWave = NULL;


	//printf("       delete thePotential:\n");
	if (thePotential)
		delete[] thePotential;
	thePotential = NULL;

	//printf("       delete theQViewBuffer:\n");
	if (theQViewBuffer)
		delete theQViewBuffer;
	theQViewBuffer = NULL;

	//printf("🚀 🚀 🚀 done deleting.\n");
}

/* ********************************************************** glue functions for js */

// these are for JS only; they're all extern "C"
extern "C" {

// return a pointer to just the main wave for theSpace
qCx *Timeline_getWaveBuffer(void) {
	//printf("🚀 🚀 🚀 Timeline_getWaveBuffer() theSpace: %p\n", (theSpace));
	//printf("        🚀 🚀 🚀        the qWave %p\n", (theSpace->tline->mainQWave));
	//printf("        🚀 🚀 🚀        the wave %p\n", (theSpace->tline->mainQWave->wave));
//	printf("        🚀 🚀 🚀     q=w %d   s=w %d   q=s %d\n",
//		(uintptr_t) (theSpace->tline->mainQWave) == (uintptr_t)  (theSpace->tline->mainQWave->wave),
//		(uintptr_t) (theSpace) == (uintptr_t) (theSpace->tline->mainQWave->wave),
//		(uintptr_t) (theSpace->tline->mainQWave) == (uintptr_t) (theSpace)
//	);

	return theSpace->tline->mainQWave->wave;
}

double *qSpace_getPotentialBuffer(void) {
	return thePotential;
}

double Timeline_getElapsedTime(void) {
	if (!theSpace) throw std::runtime_error("🚀 🚀 🚀 null space in getElapsedTime()");
	return theSpace->tline->elapsedTime;
}

double Timeline_getIterateSerial(void) {
	if (!theSpace) throw std::runtime_error("🚀 🚀 🚀 null space in getIterateSerial()");
	return theSpace->tline->iterateSerial;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(double power, double scale, double offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void Timeline_setDt(double dt) {
	theSpace->tline->dt = dt;
}

// iterations are what the user sees.  steps are what Visscher does repeatedly.
void Timeline_setStepsPerIteration(int stepsPerIteration) {
	//printf("🚀 🚀 🚀 Timeline_setStepsPerIteration(%d)\n", stepsPerIteration);
	if (stepsPerIteration < 1 || stepsPerIteration > 1e8) {
		char buf[100];
		snprintf(buf, 100, "Timeline_setStepsPerIteration, %d, is <1 or too big\n", stepsPerIteration);
		throw std::runtime_error(buf);
	}
	theSpace->tline->stepsPerIteration = stepsPerIteration;
	//printf("🚀 🚀 🚀 Timeline_setStepsPerIteration result %d in theSpace=%p\n",
	//	theSpace->tline->stepsPerIteration, theSpace);
}

// low pass filter.
void Timeline_setLowPassDilution(double dilution) {
	//printf("🚀 🚀 🚀 Timeline_setLowPassDilution(%lf)\n", dilution);
	if (dilution >= 1. || dilution <= 0.) {
		char buf[100];
		snprintf(buf, 100, "🚀 🚀 🚀 Timeline_setLowPassDilution, %lf, must be between 0 and 1\n", dilution);
		throw std::runtime_error(buf);
	}
	theSpace->tline->lowPassDilution = dilution;
	//printf("🚀 🚀 🚀 Timeline_setLowPassDilution result %lf in theSpace=%p\n",
	//	theSpace->tline->lowPassDilution, theSpace);
}

void Timeline_oneIteration(void) { theSpace->tline->oneIteration(); }
void Timeline_resetCounters(void) { theSpace->tline->resetCounters(); }

void Timeline_askForFFT(void) { theSpace->tline->askForFFT(); }


/* ******************************************************** space creation from JS */

// call this to throw away existing theSpace and waves, and start new
// it's tedious to send a real data structure thru the emscripten interface, so the JS
// constructs the dimensions by repeated calls to addSpaceDimension()
qSpace *startNewSpace(const char *label) {
	if (traceSpaceCreation)
		printf("🚀 🚀 🚀  startNewSpace(%s), theSpace=%p (should be zero)\n", label, theSpace);

	// use theSpace as a way of detecting if they were freed before.
	if (theSpace) {
		//printf("🚀 🚀 🚀  theSpace(%s): about to freeWaves()\n", label);
		freeWaves();
		//printf("🚀 🚀 🚀  theSpace: did freeWaves()\n");

		//printf("🚀 🚀 🚀  JSstartNewSpace   about to delete theSpace (%s)\n", label);
		delete theSpace;
		theSpace = NULL;
		//printf("🚀 🚀 🚀  JSstartNewSpace   done deleting theSpace (%s)\n", label);
	}
	//printf("🚀 🚀 🚀  startNewSpace: about to construct new space  itself '%s'\n", label);
	theSpace = new qSpace(label);

	if (traceSpaceCreation) {
		printf("🚀 🚀 🚀  JS startNewSpace   done (%s == %s)   theSpace=%p, freeBufferList: %p\n",
			theSpace->label, label, theSpace, theSpace->freeBufferList);
	}

	return theSpace;
}

// call this from JS to add one or more dimensions
qSpace *addSpaceDimension(int N, int continuum, const char *label) {
	if (traceSpaceCreation) printf("addSpaceDimension(%d, %d, %s)   %p\n", N, continuum, label, theSpace->freeBufferList);
	theSpace->addDimension(N, continuum, label);
	if (traceSpaceCreation) printf("🚀 🚀 🚀  addSpaceDimension(): freeBufferList: %p\n", theSpace->freeBufferList);
	return theSpace;
}

// call this from JS to finish the process
qSpace *completeNewSpace(void) {
	//printf("jsSpace starts\n");
	if (traceSpaceCreation) printf("🚀 🚀 🚀  JS completeNewSpace starts(%s)   theSpace=%p, freeBufferList: %p\n",
		theSpace->label, theSpace, theSpace->freeBufferList);

	// finish up all the dimensions now that we know them all
	theSpace->initSpace();
	//printf("did initSpace\n");

	/* *********************************** allocate waves */
	allocWaves();

	if (traceSpaceCreation) printf("   🚀 🚀 🚀 completeNewSpace After Creation but BEFORE loadViewBuffer  "
		"theQViewBuffer=%p  theQViewBuffer->viewBuffer=%p  freeBufferList=%p\n",
		theQViewBuffer, theQViewBuffer ?  theQViewBuffer->buffer : NULL,
		theSpace->freeBufferList);


	// we make our own wave - static
	//theSpace->tline->mainQWave = laosQWave;
	qCx *wave = theSpace->tline->mainQWave->wave;

	if (traceSpaceCreation) printf("🚀 🚀 🚀  jsSpace:%d freeBufferList: %p\n", __LINE__, theSpace->freeBufferList);

	// a dopey default.  JS fills in the actual default.
	qDimension *dims = theSpace->dimensions;
	for (int ix = 0; ix < dims->start + dims->end; ix++)
		wave[ix] = qCx(1., 0.);
	if (traceSpaceCreation) printf("🚀 🚀 🚀  jsSpace:%d freeBufferList: %p\n", __LINE__, theSpace->freeBufferList);

	//printf("🚀 🚀 🚀 newly created wave, before norm:\n");
	//theSpace->dumpThatWave(wave, true);

	if (traceSpaceCreation) printf("🚀 🚀 🚀  jsSpace:%d freeBufferList: %p\n", __LINE__, theSpace->freeBufferList);
	theSpace->tline->mainQWave->normalize();
	if (traceSpaceCreation) printf("🚀 🚀 🚀  jsSpace:%d freeBufferList: %p\n", __LINE__, theSpace->freeBufferList);
	//printf("🚀 🚀 🚀 newly created wave, AFTER norm:\n");
	//theSpace->dumpThatWave(wave, true);



	if (traceSpaceCreation) printf("🚀 🚀 🚀  jsSpace:%d freeBufferList: %p\n", __LINE__, theSpace->freeBufferList);
	theQViewBuffer->loadViewBuffer();  // just so i can see the default if needed

//	printf("   🚀 🚀 🚀 completeNewSpace AFTER loadViewBuffer  theQViewBuffer=%p  "
//		"theQViewBuffer->viewBuffer=%p\n",
//			theQViewBuffer, theQViewBuffer ?  theQViewBuffer->viewBuffer : NULL);



	if (traceSpaceCreation) printf("   🚀 🚀 🚀 qSpace::jsSpace: done\n");
	return theSpace;
}

// dispose of ALL of that
void deleteTheSpace() {
	//printf("   🚀 🚀 🚀 deleteTheSpace(): starts\n");
	freeWaves();
	//printf("    deleteTheSpace(): finished freeWaves\n");

	delete theSpace;
	theSpace = NULL;
	//printf("    deleteTheSpace(): done\n");
}

// end of extern "C"
}

