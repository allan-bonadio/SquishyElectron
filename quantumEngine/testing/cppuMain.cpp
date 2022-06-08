/*
** cppu main -- cppu Unit Test main source, top level
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/



//#include <cmath>
//#include "../spaceWave/qCx.h"
#include "../spaceWave/qSpace.h"
#include "../schrodinger/Avatar.h"
#include "../spaceWave/qWave.h"

#include "CppUTest/TestHarness.h"
#include "CppUTest/CommandLineTestRunner.h"
#include "CppUTest/SimpleString.h"

#include "./cppuMain.h"


void initExperiments(void) {
	int n0{};
	int n1{1};

	int nn0 = {0};
	int nn1 = {1};
//	int nn2 = {1, 2};

	qCx zombie[2] = {qCx(1.0, 2.0)};
	printf("n0:%d n1:%d nn0: %d   nn1: %d   zombie: %lf, %lf  ... %lf, %lf\n",
		n0, n1, nn0, nn1, zombie[0].re, zombie[0].im, zombie[1].re, zombie[1].im);
}



int main(int ac, char** av)
{
	initExperiments();

    return CommandLineTestRunner::RunAllTests(ac, av);
}

/* ******************************************************** helpers - cppu */

// CHECK_EQUAL() figures complex equality using our == operator.
// this only displays complex if a failure, for the message.
SimpleString StringFrom(const qCx value) {
	char buffer[100];
	snprintf(buffer, 100, "%15.12lf %+15.12lf•i", value.re, value.im);
	SimpleString buf = SimpleString(buffer);
	return buf;
}


/* ******************************************************** helpers - spaces */

static bool traceMakeSpace = false;

// make a new 1d space with N state locations along x, in theSpace, along with lots of buffers.
// the way JS does it.  Needed for lots of tests.
// You are (usually) responsible for deleting it with deleteTheSpace().
// Space generated in theSpace.  Old theSpace deleted automatically if you don't deleteTheSpace().
// frees and reallocates laos, peru, thePotential and the ViewBuffer
qSpace *makeFullSpace(int N) {
	if (traceMakeSpace) printf("🧨 🧨  starting makeFullSpace(%d), about to startNewSpace\n", N);

	startNewSpace(MAKEFULLSPACE_LABEL);
	if (traceMakeSpace) printf("        finished startNewSpace(), on to add\n");
	addSpaceDimension(N, contENDLESS, "x");
	if (traceMakeSpace) printf("        finished addSpaceDimension(), on to complete\n");
	qSpace *space = completeNewSpace();

	if (traceMakeSpace) printf("        finished makeFullSpace(%d)\n", N);
	return theSpace;
}

// 1d space, not with all the crud from above.
// qSpace returned; you are responsible for deleting it and allocating buffers.
// this space, you should be able to delete it directly with: delete space;
qSpace *makeBareSpace(int N, int continuum) {
	if (traceMakeSpace) printf("🧨 🧨 makeBareSpace(%d)\n", N);

	qSpace *space = new qSpace(MAKEBARESPACE_LABEL);
	if (traceMakeSpace) printf("    makeBareSpace: sizeof(qSpace) = %ld    space* = %p\n", sizeof(qSpace), space);
	space->addDimension(N, continuum, MAKEBARE1DDIM_LABEL);
	if (traceMakeSpace) printf("    makeBareSpace: did Add, about to Init\n");
	space->initSpace();

	if (traceMakeSpace) printf("    makeBareSpace: done\n");
	return space;
}

/* ******************************************************** helpers - waves */

// just for C++ testing; should be same as in JS
// previous contents of target gone.  Must be the size you want.
void setCircularWave(qWave *target, double frequency) {
	int start = target->start;
	int end = target->end;
	int N = end - start;

	// the pie-slice for each point
	double dAngle = 2 * PI / N * frequency;
	// ????!?!?!?! qCx *wave = laosWave;

	qCx *wave = target->wave;
	for (int ix = start; ix < end; ix++) {
		double angle = dAngle * (ix - start);
		wave[ix] = qCx(cos(angle), sin(angle));
	}

	target->normalize();
}


// turn this on to see if a bug goes away when we avoid stomping on memory
static bool avoidProving = false;

// fill up this buffer with some byte values just to prove that we can do it.
// Any kind of buffer/wave/array.  Size is number of BYTES.
// oh yeah read from each location, too.
// If I end up stomping on something I shouldn't, it'll crash soon enough.
// and cpputest might even detect that
void proveItsMine(void *buf, size_t size) {
	if (avoidProving) return;

	if (size == 0)
		throw std::runtime_error("proveItsMine()- size is zero");
	if (!buf)
		throw std::runtime_error("proveItsMine()- buf is NULL");

	uint8_t *buffer = (uint8_t *) buf;
	for (int i = 0; i < size; i++)
		buffer[i] = 0xab ^ buffer[i];
}

void compareWaves(qBuffer *qexpected, qBuffer *qactual) {
	qCx *expected = qexpected->wave;
	qCx *actual = qactual -> wave;

	// these should not be way way out
	LONGS_EQUAL_TEXT(qexpected->nPoints, qactual->nPoints, "Waves have different nPoints");
	LONGS_EQUAL_TEXT(qexpected->start, qactual->start, "Waves have different starts");
	LONGS_EQUAL_TEXT(qexpected->end, qactual->end, "Waves have different ends");

	// do the WHOLE THING including boundaries
	for (int ix = 0; ix < qexpected->nPoints; ix++) {
		CHECK_EQUAL(expected[ix], actual[ix]);
	}
}

