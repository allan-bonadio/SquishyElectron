/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include <stdio.h>
#include "test.h"
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"


// how to check these: for 5 states, calculate the phase and the magnitude of each.
//  Magnitudes should average 1/N or about .2 for a 5-state wave. Phases should be
// separated by 72° (=360/5)

/* ********************************************************* first test */
// five states, 1 iteration, no lowPass or normalize, faked dt

//  version; dt = 0.1
qCx firstExpected[7] = {
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949),
	qCx( 0.19565546624175678,  0.40216560741060337),
	qCx(-0.32202135744659610,  0.31035541336098899),
	qCx(-0.39467561024713227, -0.21035541336098890),
	qCx( 0.07809841578326204, -0.44036220853561392),
	qCx( 0.44294308566870949, -0.06180339887498949)
};



static void firstRK2(void) {
	qWave *otherQWave = new qWave(theSpace);

	// lemme seee this first
	// for (int i = 0; i < 7; i++) {
	// 	qCx expe = firstExpected[i];
	// 	double phase = atan2(expe.im, expe.re) * 180. / PI;
	// 	double magn = expe.re * expe.re + expe.im * expe.im;
	// 	printf("firstExpected %d: %lf %lf | %lf %lf\n",
	// 		i, expe.re, expe.im, phase, magn);
	// }

//makeNewSpace(5, contENDLESS, "x");
	theSpace->dt = 0.1;  // to make the numbers come out right
	setCircularWave(laosQWave);

	//theSpace->doLowPass = false;  // to make the numbers come out right
	printf("First Test - &&&&& dt is %lf\n", theSpace->dt);
	laosQWave->dumpWave("before rk2 test", true);

	theSpace->oneRk2Step(laosQWave, otherQWave);

	otherQWave->dumpWave("after rk2 test", true);

	for (int ix = 0; ix < 7; ix++) {
		qCx act = otherQWave->wave[ix];
		qCx xpct = firstExpected[ix];
		if (act.re != xpct.re || act.im != xpct.im) {
			printf("%srk2 %d:actual=(%lf, %lf) vs firstExpected=(%lf, %lf) %s\n",
			redAnsiStyle, ix, act.re, act.im, xpct.re, xpct.im, offAnsiStyle);
		}
	}

	// in case you need to regenerate firstExpected from Actual
	for (int ix = 0; ix < 7; ix++) printf("\tqCx(%20.18lf, %20.18lf),\n",
		otherQWave->wave[ix].re, otherQWave->wave[ix].im);


	delete otherQWave;
}

/* ********************************************************* second test */
// five states, 5 iterations, lowPass & normalize on fifth iteration

//  version; dt = 0.1
qCx secondExpected[7] = {
	qCx(-0.165469639483600328, -0.415475388451791827),
	qCx(0.344007644893808584, -0.285759934656024339),
	qCx(0.378078056417778141, 0.238866036211419941),
	qCx(-0.110342555627121364, 0.433387263792644972),
	qCx(-0.446273506200865144, 0.028982023103751399),
	qCx(-0.165469639483600328, -0.415475388451791827),
	qCx(0.344007644893808584, -0.285759934656024339),
};

// five states, 1 iteration, no lowPass or normalize, faked dt
static void secondRK2(void) {
	qWave *otherQWave = new qWave(theSpace);

	// lemme seee this second
	// for (int i = 0; i < 7; i++) {
	// 	qCx expe = secondExpected[i];
	// 	double phase = atan2(expe.im, expe.re) * 180. / PI;
	// 	double magn = expe.re * expe.re + expe.im * expe.im;
	// 	printf("secondExpected %d: %lf %lf | %lf %lf\n",
	// 		i, expe.re, expe.im, phase, magn);
	// }

//makeNewSpace(5, contENDLESS, "x");
	printf("Second Test - &&&&& dt is %lf\n", theSpace->dt);
	laosQWave->dumpWave("before rk2 second test", true);

	theSpace->oneRk2Step(laosQWave, otherQWave);
	theSpace->oneRk2Step(otherQWave, laosQWave);
	theSpace->oneRk2Step(laosQWave, otherQWave);
	theSpace->oneRk2Step(otherQWave, laosQWave);
	theSpace->oneRk2Step(laosQWave, otherQWave);
	theSpace->oneRk2Step(otherQWave, laosQWave);  // i added this does it mess up the test?

	laosQWave->dumpWave("after rk2 second test", true);

	for (int ix = 0; ix < 7; ix++) {
		qCx act = laosWave[ix];
		qCx xpct = secondExpected[ix];
		if (act.re != xpct.re || act.im != xpct.im) {
			printf("%srk2 %d:actual=(%lf, %lf) vs secondExpected=(%lf, %lf) %s\n",
			redAnsiStyle, ix, act.re, act.im, xpct.re, xpct.im, offAnsiStyle);
		}
	}

	// in case you need to regenerate secondExpected from Actual
	for (int ix = 0; ix < 7; ix++) printf("\tqCx(%20.18lf, %20.18lf),\n",
		laosWave[ix].re, laosWave[ix].im);

	delete otherQWave;
}

/* ********************************************************* top level */

void run_rk2_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: rk2 tests\n");

	firstRK2();
	secondRK2();

	secondRK2();
	printf("::::: Done with RK2 tests\n");
}

