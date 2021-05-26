#include <stdio.h>
#include "test.h"
#include "../cx.h"

void verify(cx actual, cx expected, const char *msg) {
	printf("testing %s\n", msg);
	if (actual.re != expected.re)
		printf("*** re err: %s actual.re=%f ≠ expected.re=%f\n", msg, actual.re, expected.re);
	if (actual.im != expected.im)
		printf("*** im err: %s actual.im=%f ≠ expected.im=%f\n", msg, actual.im, expected.im);
}

#define VERIFY(actual, expected)  verify(actual, expected, #actual)

void runCxTests() {
	/* ********************************************* constructor */

	VERIFY(cx(3, -4), cx(3, -4));
	VERIFY(cx(-3), cx(-3, 0));
	VERIFY(cx(), cx(0, 0));


	/* ********************************************* addition */

	VERIFY(cx(3, 4) + cx(2, 3), cx(5, 7));

	cx addend(5, 6);
	addend += cx(12, 15);
	VERIFY(addend, cx(17, 21));

	/* ********************************************* subtraction */

	VERIFY(cx(3, 4) - cx(2, 3), cx(1, 1));

	cx subtrahend(5, 6);
	subtrahend -= cx(12, 15);
	VERIFY(subtrahend, cx(-7, -9));

	/* ********************************************* mult */

	VERIFY(cx(3, 4) * cx(2, 3), cx(-6, 17));

	cx factor(5, 6);
	factor *= cx(12, 15);
	VERIFY(factor, cx(-30, 147));

	/* ********************************************* div */

	VERIFY(cx(0, 2) / cx(1, 1), cx(1, 1));
	VERIFY(cx(30, 40) / cx(0, 10), cx(4, -3));

	cx dividendA(0, 2);
	dividendA /= cx(1, 1);
	VERIFY(dividendA, cx(1, 1));

	cx dividendB(30, 40);
	dividendB /= cx(0, 10);
	VERIFY(dividendB, cx(4, -3));

	/* ********************************************* norm */
	VERIFY(cx(12, 5).norm(), cx(169));


	/* ********************************************* abs */
	VERIFY(cx(12, 5).abs(), cx(13));


	/* ********************************************* phase */
	// i know testing for equality here is kindof stupid, but it passes
	VERIFY(cx(+1,+1).phase(), cx(45));
	VERIFY(cx(+1,-1).phase(), cx(-45));
	VERIFY(cx(-1,-1).phase(), cx(-135));
	VERIFY(cx(-1,+1).phase(), cx(135));

}


