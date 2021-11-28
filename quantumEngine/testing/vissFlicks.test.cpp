/*
** vischer / flicks -- testing for the data structures of the Visscher algorithm
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "../qSpace.h"
#include "../qWave.h"
#include "test.h"


static void makeASpaceAndIterate(void) {

	qSpace *space = makeBare1dSpace(64);
	//qSpace *space = make1dSpace(8);
	double dt = 0.001;
	const int dumpCycle = 100;
	const int nIterations = 1000;
	printf("space space.nStates: %d, dt=%lf, nIterations=%d, dumpCycle=d\n",
		space->nStates, dt, nIterations, dumpCycle);

	qFlick *flick = new qFlick(space, 4);

	flick->setCircularWave(1.);
	flick->dumpAllWaves("    after circular: should be normalized and duplicated");
	flick->dumpWave("    vissFlicks test circular: should be clean circular wave\n", true);


	printf("======================== Step Generations:\n");
	for (int k = 0; k < nIterations; k++) {
		flick->pushWave();

		qCx *newWave = flick->waves[0];
		qCx *oldWave = flick->waves[1];

		space->stepReal(oldWave, newWave, dt);
		//flick->dumpAllWaves("    after stepReal()");

		space->stepImaginary(oldWave, newWave, dt);

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

