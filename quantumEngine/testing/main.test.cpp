/*
** Top level C++ file for unit tests
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include <cmath>
#include <stdarg.h>
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"
#include "test.h"


const char *redAnsiStyle = "\e[1;101;97m";
const char *offAnsiStyle = "\e[0m";

// this is c++ test main(), not the main main() for running squish
// do not include both in the same build.  This just runs tests.
int main() {

	printf(":::::::::::::::::::::::::::::::::::::::::::::: %s Start of Tests %s\n",
		redAnsiStyle, offAnsiStyle);

	run_qCx_tests();

	run_space_tests();

	//run_rk2_tests();

	run_wave_tests();

	//run_vissFlicks_tests();

	return 0;
}


/* ********************************************************* test helpers */

// let's standardize on tests with numbers that are accurate to ppm, 10**-6
// this is an absolute 1/million, not relative to anything.  Just easier.
bool isClose(double a, double b) {
	double d = a - b;
	return (d > -1e-6 && d < 1e-6);
}

// don't use this
//void signalError(char *msg) {
//	printf("Error in testing: %s\n", msg);
//}

extern bool qqttMessage(const char *fmt...);

void qtMessage(const char *format, ...) {

	printf(" %s 🧨 🧨 *** ", redAnsiStyle);

    va_list args;
    va_start(args, format);
	vprintf(format, args);
	va_end(args);

	printf(" %s \n", offAnsiStyle);
}

// these all return false for Passing and true for Failure.
// Besides printing out the message

// for ints
bool qtVerify(int actual, int expected, const char *msg) {
	if (actual != expected) {
		qtMessage("fail int %d ≠ %d: %s\n", actual, expected, msg);
		return true;
	}
	return false;
}

// for double floats
bool qtVerify(double actual, double expected, const char *msg) {
	if (actual != expected) {
		qtMessage("fail double %lf ≠ %lf: %s\n", actual, expected, msg);
		return true;
	}
	return false;
}

// for Space*s, qSpace qCx pointers
bool qtVerify(qCx actual, qCx expected, const char *msg) {
	if (actual != expected) {
		qtMessage(" wasn't same qCx number... %lf+%lf i ≠ %l+%lf i: %s\n",
			actual.re, actual.im, expected.re, expected.im, msg);
		return true;
	}
	return false;
}

// wave pointers, compare qCx pointers, not the values
//bool qtVerify(qCx *actual, qCx *expected, const char *msg) {
//	if (actual != expected) {
//		qtMessage("*** fail %lf,%lf  ≠  %lf,%lf: %s\n",
//			actual->re, actual->im, expected->re, expected->im, msg);
//		return true;
//	}
//	return false;
//}

//// for Space*s, qSpace qCx pointers
//bool qtVerify(qSpace *actual, qSpace *expected, const char *msg) {
//	if (actual != expected) {
//		qtMessage(" wasn't same object... x%p ≠ x%p: %s\n", actual, expected, msg);
//		return true;
//	}
//	return false;
//}
//

// all pointers, just compare the pointers
bool qtVerify(void *actual, void *expected, const char *msg) {
	if (actual != expected) {
		printf("*** fail x%p  ≠  x%p: %s\n",
			actual, expected, msg);
		return true;
	}
	return false;
}

// make a new 1d space with N state locations along x
// using the JS interfaces.  Needed for most stuff.
qSpace *make1dSpace(int N) {
	startNewSpace("a 1d Test space");
	addSpaceDimension(N, contENDLESS, "x");
	qSpace *space = completeNewSpace();
	return space;
}

// 1d space, not with all the crud from above
qSpace *makeBare1dSpace(int N) {
	qSpace *space = new qSpace("a makeBare1dSpace test space");
	printf("🧨 🧨 sizeof(qSpace) = %ld   alignof(qSpace) = %ld  qSpace* = 0x%p\n",
		sizeof(qSpace), alignof(qSpace), space);
	space->addDimension(N, contENDLESS, "x");
	space->initSpace();
	return space;
}

// just for C++ testing
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
