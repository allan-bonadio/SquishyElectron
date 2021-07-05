#include <stdio.h>
#include "test.h"
#include "../qSpace.h"

// construct our space & stuff
static void makeNewSpace(int32_t N, int32_t continuum, const char *label) {
	startNewSpace();
	addSpaceDimension(5, contENDLESS, "x");
	completeNewSpace();
}

qCx expected[7] = {
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
			printf("%sactual=(%lf, %lf) vs expected=(%lf, %lf) for row %d %s\n",
			redAnsiStyle, act.re, act.im, xpct.re, xpct.im, ix, offAnsiStyle);
		}
	}
}

void run_rk2_tests(void) {
	firstRK2Iteration5();
	printf("Done with RK2 tests\n");
}

