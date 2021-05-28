#include <stdio.h>

#include "QuantumSpace.h"

// call this JS callback so JS knows we're up and ready.
// Hand it some sizes so it knows where everything is in the space buffer.  which it'll construct.
EM_JS(void, qeStarted,
	(int32_t sFLOAT, int32_t sCX, int32_t md, int32_t ml, int32_t sDim, int32_t sQS),
	{quantumEngineHasStarted(sFLOAT, sCX, md, ml, sDim, sQS)});

int main() {
	printf("bonjour le monde! sizeof qCx is %lu\n", sizeof(qCx));

// 	qCx zero(0, 0);
// 	printf("bonjour zero is %lf, %lf\n", zero.re, zero.im);
//
// 	qCx two(2, 0);
// 	printf("bonjour two is %lf, %lf\n", two.re, two.im);
//
// 	qCx three(3);
// 	printf("bonjour three is %lf, %lf\n", three.re, three.im);
//
// 	qCx five = two + three;
// 	printf("bonjour five is %lf, %lf\n", five.re, five.im);
//
// 	qCx zoot = five;
// 	zoot += qCx(-7, 7);
// 	printf("bonjour zoot is %lf, %lf\n", zoot.re, zoot.im);


	qeStarted(sizeof(FLOAT), sizeof(qCx), MAX_DIMENSIONS, LABEL_LEN, sizeof(Dimension), sizeof(QuantumSpace));


	return 0;
}

/*
extern "C" {

	// need this to set up data structures in JS
	void getQuantumSizes(int32_t sizesArray[5]) {
		sizesArray[0] = sizeof(FLOAT);
		sizesArray[1] = sizeof(qCx);
		sizesArray[2] = MAX_DIMENSIONS;
		sizesArray[3] = sizeof(Dimension);
		sizesArray[4] = sizeof(QuantumSpace);
	}

}
 */

