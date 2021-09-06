/*
** Top level C++ file for unit tests
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <stdio.h>
#include "../qSpace.h"
#include "test.h"


const char *redAnsiStyle = "\e[1;101;37m";
const char *offAnsiStyle = "\e[0m";

// this is c++ test main(), not the main main() for running squish
// do not include both in the same build.  This just runs tests.
int main() {

	//printf("trial %sred stuff%s\n", redAnsiStyle, offAnsiStyle);


	//run_vissFlicks_tests();

	//run_space_tests();

	run_qCx_tests();

	//run_rk2_tests();

	run_wave_tests();

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

// for ints
bool qtVerify(int actual, int expected, const char *msg) {
	if (actual != expected) {
		printf("*** fail %d≠%d: %s\n", actual, expected, msg);
		return true;
	}
	return false;
}

// for double floats
bool qtVerify(double actual, double expected, const char *msg) {
	if (actual != expected) {
		printf("*** fail %lf≠%lf: %s\n", actual, expected, msg);
		return true;
	}
	return false;
}

// for Space*s
bool qtVerify(qSpace * actual, qSpace * expected, const char *msg) {
	if (actual != expected) {
		printf("*** fail %x≠%x: %s\n", (int) actual, (int) expected, msg);
		return true;
	}
	return false;
}

//void qtVerify(qCx actual, qCx expected, char *msg) {
//	if (actual != expected)
//		printf("*** fail %lf,%lf  ≠  %lf,%lf: %s\n",
//			actual.re, actual.im, expected.re, expected.im, msg);
//
//}

// make a new 1d space with N state locations along x
qSpace *make1dSpace(int N) {
	startNewSpace();
	addSpaceDimension(N, contENDLESS, "x");
	qSpace *space = completeNewSpace();
	return space;
}
