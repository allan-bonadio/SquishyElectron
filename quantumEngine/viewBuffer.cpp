#include "qSpace.h"
#include <cmath>

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array,
// will be fed directly into gl.
float *viewBuffer;

// for the JS side
float *getViewBuffer(void) {
	return (float *) viewBuffer;
}

// one row per vertex.
// each row of 4 floats looks like this:
//     real   imaginary    potential    serial
// Two vertices per datapoint: bottom then top, same data.
// also converts to doubles from floats.
float updateViewBuffer() {
	int nPoints = theSpace->nPoints;
	qReal highest = 0;
	qReal tiny = 1e-8;

	//theQWave->dumpWave("at start of updateViewBuffer()");

	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		float *twoRowPtr = viewBuffer + pointNum * 8;
		qCx *wavePtr = theWave + pointNum;
		qReal *potPtr = thePotential + pointNum;
		qReal re = wavePtr->re;
		qReal im = wavePtr->im;

		twoRowPtr[0] = re * tiny;
		twoRowPtr[1] = im * tiny;
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

	// dump of viewbuffer.  Was good until I realized theWave itself was what to pay attention to.
	if (false) {
		printf("viewBuffer.cpp, as written to view buffer:\n");
		dumpViewBuffer(nPoints);
	}

	return highest;
}


// dump the view buffer just before it heads off to webgl.
int dumpViewBuffer(int nPoints) {
	qReal prevRe = viewBuffer[0];
	qReal prevIm = viewBuffer[1];
	printf("   ix  |    re      im     pot    serial  |   phase    magn\n");
	for (int i = 0; i < nPoints*2; i++) {
		qReal re = viewBuffer[i*4];
		qReal im = viewBuffer[i*4+1];
		if (i & 1) {
			qReal dRe = re - prevRe;
			qReal dIm = im - prevIm;
			qReal phase = 0.;
			qReal magn = 0.;
			phase = atan2(im, re) * 180 / PI;
			magn = im * im + re * re;
			printf("%6d |  %6.3f  %6.3f  %6.3f  %6.3f  |  %6.3f  %6.3f\n",
				i,
				re, im, viewBuffer[i*4+2], viewBuffer[i*4+3],
				phase, magn);

			prevRe = re;
			prevIm = im;
		}
		else {
			printf("%6d |  %6.3f  %6.3f  %6.3f  %6.3f \n",
				i,
				re, im, viewBuffer[i*4+2], viewBuffer[i*4+3]);
		}
	}
	return nPoints;
}
