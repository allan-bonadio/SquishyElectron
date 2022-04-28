/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include "../../spaceWave/qSpace.h"
#include "../../schrodinger/Manifestation.h"
#include "../../spaceWave/qWave.h"
#include "../test.h"


this is not used anymore


void handleEachPt(qCx psi, int ix) {
	printf("each pt:  %d: %lf %lf   norm: %lf\n", ix, psi.re, psi.im, psi.norm());
}

void run_wave_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: wave tests\n");

	//  creating/
	startNewSpace("run_wave_tests");
	addSpaceDimension(3, contWELL, "p");
	completeNewSpace();

	qWave  *qw = new qWave(theSpace);
	//qw->setCircularWave(1.);

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
	printf("::::: done with wave tests\n");
}

