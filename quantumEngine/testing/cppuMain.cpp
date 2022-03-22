/*
** cppu main -- cppu Unit Test main source, top level
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include <cmath>
//#include "../spaceWave/qCx.h"
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"

#include "CppUTest/TestHarness.h"
#include "CppUTest/CommandLineTestRunner.h"
#include "CppUTest/SimpleString.h"

#include "./cppuMain.h"

int main(int ac, char** av)
{
    return CommandLineTestRunner::RunAllTests(ac, av);
}

//TEST_GROUP(FirstTestGroup)
//{
//};
//
//TEST(FirstTestGroup, FirstTest)
//{
//   FAIL("Fail me!");
//}
//
//TEST(FirstTestGroup, StringTest)
//{
//    STRCMP_EQUAL("till you decide", "till you decide");
//}

/* ******************************************************** helpers - cppu */

// this is how it figures complex equality - this turns it all into a string and they compare strings.
SimpleString StringFrom(const qCx value) {
	char buffer[50];
	sprintf(buffer, "%lf + %lf•i", value.re, value.im);
	SimpleString buf = SimpleString(buffer);
	return buf;
}

/* ******************************************************** helpers */

// make a new 1d space with N state locations along x
// the way JS does it.  Needed for lots of tests.
// Space generated in theSpace.  Old theSpace deleted.
// frees and reallocates laos, peru, thePotential and the ViewBuffer
qSpace *makeFull1dSpace(int N) {
	//printf("🧨 🧨  starting makeFull1dSpace(%d)\n", N);
	startNewSpace(MAKEFULL1DSPACE_LABEL);
	//printf("🧨 🧨     finished makeFull1dSpace(%d)\n", N);
	addSpaceDimension(N, contENDLESS, "x");
	qSpace *space = completeNewSpace();
	return space;
}

// 1d space, not with all the crud from above.
// qSpace returned; you are responsible for deleting it and allocating buffers.
// this space, you should be able to delete it directly.
qSpace *makeBare1dSpace(int N) {
	qSpace *space = new qSpace(MAKEBARE1DSPACE_LABEL);
	//printf("🧨 🧨 makeBare1dSpace: sizeof(qSpace) = %ld    space* = 0x%p\n",
	//	sizeof(qSpace), space);
	space->addDimension(N, contENDLESS, MAKEBARE1DDIM_LABEL);
	space->initSpace();
	return space;
}

// just for C++ testing; should be same as in JS
void setCircularWave(qWave *target, double n) {
	qSpace *space = target->space;
	int start = space->dimensions->start;
	int end = space->dimensions->end;
	int N = space->dimensions->N;

	double dAngle = PI / N * n * 2;
	qCx *wave = laosWave;

	for (int ix = start; ix < end; ix++) {
		double angle = dAngle * (ix - start) / 2;
		wave[ix] = qCx(cos(angle), sin(angle));
	}

	theSpace->fixThoseBoundaries(wave);
	laosQWave->normalize();
}

// fill up this buffer with some byte values just to prove that we can do it
// oh yeah read from each location, too.  Size is number of BYTES.
// If I end up stomping on something I shouldn't, it'll crash soon enough.
// and cpputest might even detect that
void proveItsMine(void *buf, size_t size) {
	if (size == 0)
		throw "proveItsMine()- size is zero";
	if (!buf)
		throw "proveItsMine()- buf is NULL";

	uint8_t *buffer = (uint8_t *) buf;
	for (int i = 0; i < size; i++)
		buffer[i] = 0xab ^ buffer[i];
}

