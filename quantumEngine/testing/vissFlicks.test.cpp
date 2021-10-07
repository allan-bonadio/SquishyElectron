/*
** vischer / flicks -- testing for the data structures of the Visscher algorithm
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "../qSpace.h"
#include "../qWave.h"
#include "test.h"


static void makeASpaceAndIterate(void) {

	qSpace *space = makeBare1dSpace(8);
	//qSpace *space = make1dSpace(8);


	qFlick *flick = new qFlick(space, 4);

	flick->setCircularWave(1.);
	flick->dumpAllWaves("    after circular: should be normalized and duplicated");
	flick->dumpWave("    vissFlicks test circular: should be clean circular wave\n", true);

	printf("======================== Step Generations:\n");
	const int dumpCycle = 10;
	for (int k = 0; k < 100; k++) {
		flick->pushWave();

		qCx *newWave = flick->waves[0];
		qCx *oldWave = flick->waves[1];

		space->stepReal(oldWave, newWave, .01);
		//flick->dumpAllWaves("    after stepReal()");

		space->stepImaginary(oldWave, newWave, .01);

		//flick->dumpAllWaves("    after stepImaginary()");

		if (k % dumpCycle == 0) {
			printf("\n________ generation %d   ", k);
			flick->dumpThatWave(newWave, true);
		}

	}


//	flick->buffer = flick->waves[1];
//	flick->setCircularWave(1.);
//	flick->buffer = flick->waves[1];
//
//
//	flick->dumpAllWaves("full qFlick dump");

	delete flick;
	delete space;
}


/* ********************************************************* top level */

void run_vissFlicks_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::: viss flicks tests\n");

	makeASpaceAndIterate();
	printf("Done with viss flicks tests\n");
}

