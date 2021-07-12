#include <stdio.h>
#include "../qSpace.h"
#include "test.h"


const char *redAnsiStyle = "\e[1;101;37m";
const char *offAnsiStyle = "\e[0m";

// this is c++ test main(), not the main main() for running squish
// do not include both in the same build.  This just runs tests.
int main() {

	//printf("trial %sred stuff%s\n", redAnsiStyle, offAnsiStyle);


	run_qCx_tests();

	run_rk2_tests();

	run_wave_tests();

	return 0;
}


// let's standardize on tests with numbers that are accurate to ppm, 10**-6
// this is an absolute 1/million, not relative to anything.  Just easier.
bool isClose(double a, double b) {
	double d = a - b;
	return (d > -1e-6 && d < 1e-6);
}


