#include <cmath>
#include <stdio.h>
#include "test.h"
#include "../qSpace.h"

// construct our space & stuff
static void makeNewSpace(int32_t N, int32_t continuum, const char *label) {
	startNewSpace();
	addSpaceDimension(5, contENDLESS, "x");
	completeNewSpace();
	theQWave->setCircularWave(1.);
}

// how to check these: calculate the phase and the magnitude of each.  Magnitudes
// should be about .2 for a 5-state wave.  Phases should be separated by 72° (=360/5)

// july 5 2021
qCx july5Expected[7] = {
	qCx(0.045880726689574651, -0.182224849951211909),
	qCx(0.487437594505842064, -0.031982253127852210),
	qCx(0.171718916258377263, 0.453359376678800163),
	qCx(-0.388379208686506772, 0.301853831893821090),
	qCx(-0.417227244385288243, -0.273890416546646753),
	qCx(0.045880726689574651, -0.182224849951211909),
	qCx(0.487437594505842064, -0.031982253127852210),
};

// an older version; dt = 0.1
qCx jun4Expected[7] = {
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949),
	qCx( 0.19565546624175678,  0.40216560741060337),
	qCx(-0.32202135744659610,  0.31035541336098899),
	qCx(-0.39467561024713227, -0.21035541336098890),
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949)
};

qCx *expected = jun4Expected;

static void firstRK2Iteration5(void) {
	// lemme seee this first
	for (int i = 0; i < 7; i++) {
		qCx expe = jun4Expected[i];
		qReal phase = atan2(expe.im, expe.re) * 180. / PI;
		qReal magn = expe.re * expe.re + expe.im * expe.im;
		printf("jun4Expected %d: %lf %lf | %lf %lf\n",
			i, expe.re, expe.im, phase, magn);
	}

	for (int i = 0; i < 7; i++) {
		qCx expe = july5Expected[i];
		qReal phase = atan2(expe.im, expe.re) * 180. / PI;
		qReal magn = expe.re * expe.re + expe.im * expe.im;
		printf("july5Expected %d: %lf %lf | %lf %lf\n",
			i, expe.re, expe.im, phase, magn);
	}

	makeNewSpace(5, contENDLESS, "x");
	theQWave->dumpWave("before rk2 test", true);

	theSpace->oneRk2Step();
	theQWave->dumpWave("after rk2 test", true);

	for (int ix = 0; ix < 7; ix++) {
		qCx act = theWave[ix];
		qCx xpct = expected[ix];
		if (act.re != xpct.re || act.im != xpct.im) {
			printf("%srk2 %d:actual=(%lf, %lf) vs expected=(%lf, %lf) %s\n",
			redAnsiStyle, ix, act.re, act.im, xpct.re, xpct.im, offAnsiStyle);
		}
	}

	// in case you need to regenerate Expected from Actual
	for (int ix = 0; ix < 7; ix++) printf("\tqCx(%20.18lf, %20.18lf),\n",
		theWave[ix].re, theWave[ix].im);
}

void run_rk2_tests(void) {
	printf("::::::::::::::::::::::::::::::::::::::: rk2 tests\n");

	firstRK2Iteration5();
	printf("Done with RK2 tests\n");
}

