#include "../qSpace.h"
#include "test.h"


void handleEachPt(qCx psi, int ix) {
	printf("I feel good!  %d: %lf %lf\n", ix, psi.re, psi.im);
}

void run_wave_tests(void) {
	//  creating/
	startNewSpace();
	addSpaceDimension(3, contWELL, "p");

	qWave  *wave = new qWave(theSpace);

	// dumpWave
	wave->dumpWave("unit test");

	// forEachPoint() & forEachState
	printf("forEachPoint() demo\n");
	wave->forEachPoint(handleEachPt);

	// fixBoundaries

	// prune

	// innerProduct

	// normalize

	// low pass

	// populate

	// destroying
	delete wave;
	//delete theSpace;
}

