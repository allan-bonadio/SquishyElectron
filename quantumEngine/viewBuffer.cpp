#include "qSpace.h"

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array will be fed directly into gl.
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

		twoRowPtr[0] = twoRowPtr[4] = re;
		twoRowPtr[1] = twoRowPtr[5] = im;
		twoRowPtr[2] = twoRowPtr[6] = potPtr[0];
		twoRowPtr[3] = pointNum * 2.;  // vertexSerial: at zero
		twoRowPtr[7] = pointNum * 2. + 1.;  // at magnitude, top

		// while we're here, collect the highest point
		qReal height = re * re + im * im;
		if (height > highest)
			highest = height;
	}

	//printf("viewBuffer.cpp, latest:\n");
	//for (int i = 0; i < nPoints*2; i++)
	//	printf("%6.3f  %6.3f  %6.3f  %6.3f\n",
	//		viewBuffer[i*4], viewBuffer[i*4+1], viewBuffer[i*4+2], viewBuffer[i*4+3]);

	return highest;
}

