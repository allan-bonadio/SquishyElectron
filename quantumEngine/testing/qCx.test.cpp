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

	VERIFY(qCx(3, -4), qCx(3, -4));
	VERIFY(qCx(-3), qCx(-3, 0));
	VERIFY(qCx(), qCx(0, 0));


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

	/* ********************************************* mult */

	VERIFY(qCx(3, 4) * qCx(2, 3), qCx(-6, 17));

	qCx factor(5, 6);
	factor *= qCx(12, 15);
	VERIFY(factor, qCx(-30, 147));

	/* ********************************************* div */

	VERIFY(qCx(0, 2) / qCx(1, 1), qCx(1, 1));
	VERIFY(qCx(30, 40) / qCx(0, 10), qCx(4, -3));

	qCx dividendA(0, 2);
	dividendA /= qCx(1, 1);
	VERIFY(dividendA, qCx(1, 1));

	qCx dividendB(30, 40);
	dividendB /= qCx(0, 10);
	VERIFY(dividendB, qCx(4, -3));

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


