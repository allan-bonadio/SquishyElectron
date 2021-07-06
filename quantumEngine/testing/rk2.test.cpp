#include <stdio.h>
#include "test.h"
#include "../qSpace.h"

// construct our space & stuff
static void makeNewSpace(int32_t N, int32_t continuum, const char *label) {
	startNewSpace();
	addSpaceDimension(5, contENDLESS, "x");
	completeNewSpace();
}

// july 5 2021
qCx expected[7] = {
	qCx(0.045880726689574651, -0.182224849951211909),
	qCx(0.487437594505842064, -0.031982253127852210),
	qCx(0.171718916258377263, 0.453359376678800163),
	qCx(-0.388379208686506772, 0.301853831893821090),
	qCx(-0.417227244385288243, -0.273890416546646753),
	qCx(0.045880726689574651, -0.182224849951211909),
	qCx(0.487437594505842064, -0.031982253127852210),
};

// an older version
qCx jun4Expected[7] = {
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949),
	qCx( 0.19565546624175678,  0.40216560741060337),
	qCx(-0.32202135744659610,  0.31035541336098899),
	qCx(-0.39467561024713227, -0.21035541336098890),
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949)
};



static void firstRK2Iteration5(void) {
	makeNewSpace(5, contENDLESS, "x");

	theSpace->oneRk2Step();

	for (int ix = 0; ix < 7; ix++) {
		qCx act = theWave[ix];
		qCx xpct = expected[ix];
		if (act.re != xpct.re || act.im != xpct.im) {
			printf("rk2: %sactual=(%lf, %lf) vs expected=(%lf, %lf) for row %d %s\n",
			redAnsiStyle, act.re, act.im, xpct.re, xpct.im, ix, offAnsiStyle);
		}
	}

	// in case you need to regenerate Expected from Actual
	for (int ix = 0; ix < 7; ix++) printf("\tqCx(%20.18lf, %20.18lf),\n",
		theWave[ix].re, theWave[ix].im);
}

void run_rk2_tests(void) {
	firstRK2Iteration5();
	printf("Done with RK2 tests\n");
}

