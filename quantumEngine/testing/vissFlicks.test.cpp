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
	qFlick *flick = new qFlick(space, 4);



}


/* ********************************************************* top level */

void run_vissFlicks_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::: viss flicks tests\n");

	someTestz();
	printf("Done with viss flicks tests\n");
}

