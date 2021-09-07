/*
** vischer / flicks -- testing for the data structures of the Visscher algorithm
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "../qSpace.h"
#include "../qWave.h"
#include "test.h"


static void someTestz(void) {
	qSpace *space = make1dSpace(8);
	// default is algVisscher;

	qFlick *flick = new qFlick(space, 4);
	// default contains 2 waves
	flick->dumpWave("vissFlicks test zeroes\n", true);
	flick->setCircularWave(1.);
	flick->dumpWave("vissFlicks test circular\n", true);
	flick->buffer = flick->waves[1];
	flick->setCircularWave(1.);
	flick->buffer = flick->waves[1];


	flick->dumpAllWaves("full qFlick dump");

	delete flick;
	delete space;
}


/* ********************************************************* top level */

void run_vissFlicks_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::: viss flicks tests\n");

	someTestz();
	printf("Done with viss flicks tests\n");
}

