/*
** space test -- testing a 	qSpace, basic stuff
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "test.h"
#include "../qSpace.h"

// test the JS calls to create a space

static void justStart(void) {
	// can be constructed and deleted if incomplete ... without crashing
	qSpace *sp = startNewSpace();
	delete sp;
}

static void verifySpace(qSpace *space) {
	qtVERIFY(space->nDimensions, 1, "dimensions wrong");
	//qtVerify(space->nDimensions, 1;)
}

static void twentyStates(void) {
	qSpace *sp = startNewSpace();
	addSpaceDimension(20, contENDLESS, "pink");
	qtVerify(sp->nDimensions, 1, "twentyStates, bad nDimensions");

	qSpace *space5 = completeNewSpace();
	qtVERIFY(space5, sp, "space starter and completer pointers not equal");

	printf("where it breaks: %d %d %d\n", sp->nStates, sp->nPoints, sp->algorithm);
	qtVerify(sp->nStates, 20, "bad nStates");
	qtVerify(sp->nPoints, 22, "bad Points");
	delete sp;
}

static void twoByThree(void) {
	qSpace *sp = startNewSpace();
	addSpaceDimension(2, contDISCRETE, "lavender");
	addSpaceDimension(3, contDISCRETE, "chartreuce");
	qtVerify(sp->nDimensions, 2, "bad nDimensions23");
	qtVerify(sp->nStates, 6, "bad nStates23");
	qtVerify(sp->nPoints, 6, "bad Points23");
	delete sp;

}

static void vis(void) {

}

static void jsConstructor(void) {
	justStart();
	twentyStates();
	twoByThree();

	printf("Done with space tests\n");
}


/* ********************************************************* top level */

void run_space_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: space tests\n");
	jsConstructor();

	printf("::::::::::::::::::::::::::::::::: Done with space tests\n");
}

