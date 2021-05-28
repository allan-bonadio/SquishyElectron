#include <stdio.h>

#include "QuantumSpace.h"

// call this JS callback so JS knows we're up and ready.
// Hand it some sizes so it knows where everything is in the space buffer.  which it'll construct.
EM_JS(void, qeStarted,
	(int32_t sFLOAT, int32_t sCX, int32_t md, int32_t ml, int32_t sDim, int32_t sQS),
	{quantumEngineHasStarted(sFLOAT, sCX, md, ml, sDim, sQS)});

int main() {
	printf("bonjour le monde! sizeof cx is %lu\n", sizeof(cx));

// 	cx zero(0, 0);
// 	printf("bonjour zero is %lf, %lf\n", zero.re, zero.im);
//
// 	cx two(2, 0);
// 	printf("bonjour two is %lf, %lf\n", two.re, two.im);
//
// 	cx three(3);
// 	printf("bonjour three is %lf, %lf\n", three.re, three.im);
//
// 	cx five = two + three;
// 	printf("bonjour five is %lf, %lf\n", five.re, five.im);
//
// 	cx zoot = five;
// 	zoot += cx(-7, 7);
// 	printf("bonjour zoot is %lf, %lf\n", zoot.re, zoot.im);


	qeStarted(sizeof(FLOAT), sizeof(cx), MAX_DIMENSIONS, LABEL_LEN, sizeof(Dimension), sizeof(QuantumSpace));


	return 0;
}

/*
extern "C" {

	// need this to set up data structures in JS
	void getQuantumSizes(int32_t sizesArray[5]) {
		sizesArray[0] = sizeof(FLOAT);
		sizesArray[1] = sizeof(cx);
		sizesArray[2] = MAX_DIMENSIONS;
		sizesArray[3] = sizeof(Dimension);
		sizesArray[4] = sizeof(QuantumSpace);
	}

}
 */

