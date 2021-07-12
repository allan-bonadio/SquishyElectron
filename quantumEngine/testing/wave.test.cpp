#include "../qSpace.h"
#include "test.h"


void handleEachPt(qCx psi, int ix) {
	printf("each pt:  %d: %lf %lf   norm: %lf\n", ix, psi.re, psi.im,
		psi.re*psi.re + psi.im * psi.im);
}

void run_wave_tests(void) {
	printf("::::::::::::::::::::::::::::::::::::::: wave tests\n");

	//  creating/
	startNewSpace();
	addSpaceDimension(3, contWELL, "p");
	completeNewSpace();

	qWave  *qw = new qWave(theSpace);
	qw->setCircularWave(1.);

	// dumpWave
	qw->dumpWave("unit test");

	// forEachPoint() & forEachState
	printf("forEachPoint() demo\n");
	qw->forEachPoint(handleEachPt);

	// fixBoundaries

	// prune

	// innerProduct

	// normalize

	// low pass

	// populate

	// destroying
	delete qw;
	//delete theSpace;
	printf("done with wave tests\n");
}

