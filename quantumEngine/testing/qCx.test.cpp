#include <stdio.h>
#include "test.h"
#include "../qCx.h"

void verify(qCx actual, qCx expected, const char *msg) {
	printf("testing %s\n", msg);
	if (actual.re != expected.re)
		printf("%s*** qCx re err:%s %s actual.re=%f ≠ expected.re=%f\n",
			redAnsiStyle, offAnsiStyle, msg, actual.re, expected.re);
	if (actual.im != expected.im)
		printf("%s*** qCx im err:%s %s actual.im=%f ≠ expected.im=%f\n",
			redAnsiStyle, offAnsiStyle, msg, actual.im, expected.im);
}

#define VERIFY(actual, expected)  verify(actual, expected, #actual)

void run_qCx_tests(void) {
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
	qCx dividendBuuu(30, 40);
	qCx plus2 = qCx(2);
	printf("starting Buu... dividendBuuu=%lf %lf; plus2= %lf %lf\n",
		dividendBuuu.re, dividendBuuu.im, plus2.re, plus2.im);
	qCx retuu = (dividendB /= plus2);
	printf("dividendBuuu is %lf %lf, but the return value is %lf, %lf\n",
		dividendBuuu.re, dividendBuuu.im, retuu.re, retuu.im);
	VERIFY(dividendBuuu, qCx(15, 20));

	qCx dividendBuu(30, 40);
	qCx minus2 = -qCx(2);
	printf("starting Buu... dividendBuu=%lf %lf; minus2= %lf %lf\n",
		dividendBuu.re, dividendBuu.im, minus2.re, minus2.im);
	qCx retu = (dividendB /= minus2);
	printf("dividendBuu is %lf %lf, but the return value is %lf, %lf\n",
		dividendBuu.re, dividendBuu.im, retu.re, retu.im);
	VERIFY(dividendBuu, qCx(-15, -20));

	qCx dividendBu(30, 40);
	qCx minus10 = -qCx(10);
	printf("starting Bu... dividendBu=%lf %lf; minus10= %lf %lf\n",
		dividendBu.re, dividendBu.im, minus10.re, minus10.im);
	qCx ret = (dividendB /= minus10);
	printf("dividendBu is %lf %lf, but the return value is %lf, %lf\n",
		dividendBu.re, dividendBu.im, ret.re, ret.im);
	VERIFY(dividendBu, qCx(-3, -4));

	/* ********************************************* norm */
	VERIFY(qCx(12, 5).norm(), qCx(169));


	/* ********************************************* abs */
	VERIFY(qCx(12, 5).abs(), qCx(13));


	/* ********************************************* phase */
	// i know testing for equality here is kindof stupid, but it passes
	VERIFY(qCx(+1,+1).phase(), qCx(45));
	VERIFY(qCx(+1,-1).phase(), qCx(-45));
	VERIFY(qCx(-1,-1).phase(), qCx(-135));
	VERIFY(qCx(-1,+1).phase(), qCx(135));


	/* **********************************************/
	printf("Done with qCx tests\n");
}


