#include "qSpace.h"

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array,
// will be fed directly into gl.
float *viewBuffer;

float *getViewBuffer(void) {
	return (float *) viewBuffer;
}

// one row per vertex.
// each row of 4 floats looks like this:
//     real   imaginary    potential    [reservedForFuture]
// Two vertices per datapoint: bottom then top, same data.
// also converts to doubles from floats.
float updateViewBuffer() {
	int nPoints = theSpace->nPoints;
	qReal highest = 0;

	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		float *twoRowPtr = viewBuffer + pointNum * 8;
		qCx *wavePtr = theWave + pointNum;
		qReal *potPtr = thePotential + pointNum;
		qReal re = wavePtr->re;
		qReal im = wavePtr->im;

		twoRowPtr[0] = 0;
		twoRowPtr[1] = 0;
		twoRowPtr[2] = potPtr[0];  // this isn't going to be used
		twoRowPtr[3] = pointNum * 2.;  // vertexSerial: at zero

		twoRowPtr[4] = re;
		twoRowPtr[5] = im;
		twoRowPtr[6] = potPtr[0];
		twoRowPtr[7] = pointNum * 2. + 1.;  // at magnitude, top

		// while we're here, collect the highest point
		qReal height = re * re + im * im;
		if (height > highest)
			highest = height;
	}

	if (false) {
		printf("viewBuffer.cpp, as written to view buffer:\n");
		for (int i = 0; i < nPoints*2; i++) {
			printf("%6.3f  %6.3f  %6.3f  %6.3f\n",
				viewBuffer[i*4], viewBuffer[i*4+1], viewBuffer[i*4+2], viewBuffer[i*4+3]);
		}
	}

	if (true) {
		printf("viewBuffer.cpp, resulting cx number:\n");
		qReal avgProb = 1. / theSpace->nStates;
		for (int i = 0; i < nPoints*2; i++) {
			float re = viewBuffer[i*4];
			float im = viewBuffer[i*4+1];
			float prob = re * re + im * im;
			if (i & 1) {
				if (avgProb/2. > prob || prob > avgProb*2.) {
					printf("bad inner prod in position %i: %6.3f + %6.3f => %6.3f\n",
						i, viewBuffer[i*4], viewBuffer[i*4+1], prob);
				}
			}
			else {
				if (-.000001 > prob || prob > .00001) {
					printf("bad zero inner prod in position %i: %6.3f + %6.3f => %6.3f\n",
						i, viewBuffer[i*4], viewBuffer[i*4+1], prob);
				}
			}
			if (i != viewBuffer[i*4+3]) {
				printf("bad serial in position %i: %f\n", i, viewBuffer[i*4+3]);
			}
		}
	}
	return highest;
}

