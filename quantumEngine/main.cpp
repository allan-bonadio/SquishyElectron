#include <stdio.h>

#include "qSpace.h"

// call this JS callback so JS knows we're up and ready.
// Hand it some sizes so it knows where everything is in the space buffer.  which it'll construct.
EM_JS(void, qeStarted,
	(int32_t sFLOAT, int32_t sCX, int32_t md, int32_t ml, int32_t sDim, int32_t sQS),
	{quantumEngineHasStarted(sFLOAT, sCX, md, ml, sDim, sQS)});

int main() {
	printf("bonjour le monde! sizeof(qDimension) = %lu, sizeof(qSpace) = %lu\n",
		sizeof(qDimension), sizeof(qSpace));

	qeStarted(sizeof(qReal), sizeof(qCx), MAX_DIMENSIONS, LABEL_LEN, sizeof(qDimension), sizeof(qSpace));


	return 0;
}

/*
extern "C" {

	// need this to set up data structures in JS
	void getQuantumSizes(int32_t sizesArray[5]) {
		sizesArray[0] = sizeof(qReal);
		sizesArray[1] = sizeof(qCx);
		sizesArray[2] = MAX_DIMENSIONS;
		sizesArray[3] = sizeof(qDimension);
		sizesArray[4] = sizeof(qSpace);
	}

}
 */

