/*
** space test -- testing a 	qSpace, basic stuff
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "../test.h"
#include "../../spaceWave/qSpace.h"

// test the JS calls to create a space

static void justStart(void) {
	theSpace = NULL;  //leftover crap from previous tests
	// i shouldn't have to do this

	// can be constructed and deleted if incomplete ... without crashing
	qSpace *sp = startNewSpace("justStart");
	delete sp;
}

static void twentyStates(void) {
	theSpace = NULL;  //leftover crap from previous tests
	// i shouldn't have to do this

	printf("   ::: twentyStates\n");
	qSpace *sp = startNewSpace("twentyStates");
	addSpaceDimension(20, contENDLESS, "pink");
	qtVerify(sp->nDimensions, 1, "twentyStates, bad nDimensions");

	qSpace *space5 = completeNewSpace();
	qtVERIFY(space5, sp, "space starter and completer pointers not equal");

	printf("where it breaks: %d %d\n", sp->nStates, sp->nPoints);
	qtVerify(sp->nStates, 20, "bad nStates");
	qtVerify(sp->nPoints, 22, "bad Points");
	delete sp;
}

// tests a 2-D space where each is discrete.
static void twoByThree(void) {
	theSpace = NULL;  //leftover crap from previous tests
	// i shouldn't have to do this

	printf("   ::: twoByThree\n");
	qSpace *sp = startNewSpace("twoByThree");
	addSpaceDimension(2, contDISCRETE, "lavender");
	addSpaceDimension(3, contDISCRETE, "chartreuce");
	qtVerify(sp->nDimensions, 2, "bad nDimensions23");
	qtVerify(sp->nStates, 6, "bad nStates23");
	qtVerify(sp->nPoints, 6, "bad Points23");
	delete sp;

}

static void jsConstructor(void) {
	printf(":::::::: starting space constructor tests\n");
	justStart();
	twentyStates();
	twoByThree();

	printf(":::::::: Done with space constructor tests\n");
}


/* ********************************************************* free buffer list */

// prints out where all the dead bodies are.
static void dumpBufferList(qSpace *space) {
	printf("space->nStates=%d space->nPoints=%d \n",
		space->nStates, space->nPoints);
}

static void freeBuffListTest(void) {
	printf("🧨 :::: starting FreeBuffer list  tests\n");

	qSpace *sp = startNewSpace("freeBuffListTest");

	// a new space with nothing in the cache.
	qtVerify(sp->freeBufferList, (FreeBuffer *) NULL, "non-null freeBufferList on first creation of space");

	// ok, now allocate a new one:
	qCx *buf = sp->borrowBuffer();
	sp->returnBuffer(buf);
	qtVerify(sp->freeBufferList, buf, "latest returned freeBufferList not rite");

	// ok so now if I borrow wone, I should get the same one I just freed.
	qCx *wone = sp->borrowBuffer();
	qtVerify(wone, buf, "latest borrowed buffer isn't same as latest return");

	// ok, now allocate a new one:
	qCx *trading = sp->borrowBuffer();
	sp->returnBuffer(trading);
	qtVerify(sp->freeBufferList, trading, "non-null freeBufferList on first creation of space");

//	qCx *Nave =
//	qCx *wave =

	delete sp;

	printf("🧨 :::: Done with free buffer list  tests\n");
}




/* ********************************************************* top level */

void run_space_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: space tests\n");
	jsConstructor();
	freeBuffListTest();

	printf("::::::::::::::::::::::::::::::::: Done with space tests\n");
}

