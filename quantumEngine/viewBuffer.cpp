#include "qSpace.h"

// prep wave & potential  data for GL.
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

	for (int rowNum = 0; rowNum < nPoints; rowNum++) {
		float *twoRowPtr = viewBuffer + rowNum * 8;
		qCx *wavePtr = theWave + rowNum;
		qReal *potPtr = thePotential + rowNum;
		qReal re = wavePtr->re;
		qReal im = wavePtr->im;

		twoRowPtr[0] = twoRowPtr[4] = re;
		twoRowPtr[1] = twoRowPtr[5] = im;
		twoRowPtr[2] = twoRowPtr[6] = potPtr[0];
		//twoRowPtr[3] = twoRowPtr[7] = ?

		// while we're here, collect the highest point
		qReal height = re * re + im * im;
		if (height > highest)
			highest = height;
	}

	return highest;
}

