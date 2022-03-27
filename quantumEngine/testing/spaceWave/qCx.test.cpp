/*
** complex tests -- for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include "../squish.h"
//#include <stdio.h>
#include "../../spaceWave/qCx.h"
#include "../test.h"

static void cxVerify(qCx actual, qCx expected, const char *msg) {
	printf("testing %s\n", msg);
	if (actual.re != expected.re)
		printf("%s*** qCx re err:%s %s actual.re=%f ≠ expected.re=%f\n",
			redAnsiStyle, offAnsiStyle, msg, actual.re, expected.re);
	if (actual.im != expected.im)
		printf("%s*** qCx im err:%s %s actual.im=%f ≠ expected.im=%f\n",
			redAnsiStyle, offAnsiStyle, msg, actual.im, expected.im);
}

#define VERIFY(actual, expected)  cxVerify(actual, expected, #actual)

void run_qCx_tests(void) {
	printf(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: qCx tests\n");

	/* ********************************************* constructor */

	VERIFY(qCx(3), qCx(3, 0));
	VERIFY(qCx(-35), qCx(-35, 0));

	VERIFY(qCx(3, 4), qCx(3, 4));
	VERIFY(qCx(3, -4), qCx(3, -4));
	VERIFY(qCx(-3, -4), qCx(-3, -4));
	VERIFY(qCx(-3, 4), qCx(-3, 4));

	VERIFY(qCx(0), qCx(0));
	VERIFY(qCx(0), qCx(0, 0));
	VERIFY(qCx(0, 0), qCx(0));
	VERIFY(qCx(), qCx(0));


	/* ********************************************* addition */

	VERIFY(qCx(3, 4) + qCx(2, 3), qCx(5, 7));

	qCx addend(5, 6);
	addend += qCx(12, 15);
	VERIFY(addend, qCx(17, 21));

	/* ********************************************* subtraction */

	VERIFY(qCx(3, 4) - qCx(2, 3), qCx(1, 1));

	qCx subtrahend(5, 6);
	subtrahend -= qCx(12, 15);
	VERIFY(subtrahend, qCx(-7, -9));

	VERIFY(-qCx(-17), qCx(17, 0));
	VERIFY(-qCx(-3, 4), qCx(3, -4));

	/* ********************************************* mult */

	VERIFY(qCx(3, 4) * qCx(2, 3), qCx(-6, 17));

	qCx factor(5, 6);
	factor *= qCx(12, 15);
	VERIFY(factor, qCx(-30, 147));

	/* ********************************************* div */

	VERIFY(qCx(0, 2) / qCx(1, 1), qCx(1, 1));
	VERIFY(qCx(0, -2) / qCx(1, 1), qCx(-1, -1));
	VERIFY(qCx(-2, 0) / qCx(-1, 1), qCx(1, 1));
	VERIFY(qCx(2, 0) / qCx(1, -1), qCx(1, 1));

	VERIFY(qCx(30, 40) / qCx(0, 10), qCx(4, -3));
	VERIFY(qCx(30, 40) / -qCx(10), qCx(-3, -4));

	VERIFY(qCx(0, 2) /= qCx(1, 1), qCx(1, 1));
	VERIFY(qCx(0, -2) /= qCx(1, 1), qCx(-1, -1));
	VERIFY(qCx(-2, 0) /= qCx(-1, 1), qCx(1, 1));
	VERIFY(qCx(2, 0) /= qCx(1, -1), qCx(1, 1));

	qCx dividendA(0, 2);
	dividendA /= qCx(1, 1);
	VERIFY(dividendA, qCx(1, 1));

	qCx dividendB(30, 40);
	dividendB /= qCx(0, 10);
	VERIFY(dividendB, qCx(4, -3));

	// i am completely mystified as to why these don't work.
	// seems like arthemetic inside the method is bananas
	qCx horse(30, 40);
	qCx plus2 = qCx(2);
	printf("starting horse... horse=%lf %lf shdbe 30 40; plus2= %lf %lf shbe 2 0\n",
		horse.re, horse.im, plus2.re, plus2.im);
	qCx halfHorse = (horse /= plus2);
	printf("horse is %lf %lf, but the return value is %lf, %lf shdbe half\n",
		horse.re, horse.im, halfHorse.re, halfHorse.im);
	VERIFY(horse, qCx(15, 20));

	qCx whale(30, 40);
	qCx minus2 = -qCx(2);
	printf("starting whale=%lf %lf shbe 30 40; minus2= %lf %lf shbe -2\n",
		whale.re, whale.im, minus2.re, minus2.im);
	qCx halfMinusWhale = (whale /= minus2);
	printf("whale is %lf %lf, but the return value is %lf, %lf\n",
		whale.re, whale.im, halfMinusWhale.re, halfMinusWhale.im);
	VERIFY(whale, qCx(-15, -20));

	qCx giraffe(30, 40);
	qCx minus10 = -qCx(10);
	printf("starting giraffe=%lf %lf; minus10= %lf %lf\n",
		giraffe.re, giraffe.im, minus10.re, minus10.im);
	qCx tenthMinusGiraffe = (giraffe /= minus10);
	printf("giraffe is %lf %lf, but the return value is %lf, %lf\n",
		giraffe.re, giraffe.im, tenthMinusGiraffe.re, tenthMinusGiraffe.im);
	VERIFY(giraffe, qCx(-3, -4));

	/* ********************************************* norm */
	VERIFY(qCx(12, 5).norm(), 169);


	/* ********************************************* abs */
	VERIFY(qCx(12, 5).abs(), 13);


	/* ********************************************* phase */
	// i know testing for equality here is kindof stupid, but it passes
	VERIFY(qCx(+1,+1).phase(), qCx(45));
	VERIFY(qCx(+1,-1).phase(), qCx(-45));
	VERIFY(qCx(-1,-1).phase(), qCx(-135));
	VERIFY(qCx(-1,+1).phase(), qCx(135));


	/* **********************************************/
	printf("::::: Done with qCx tests\n");
}


