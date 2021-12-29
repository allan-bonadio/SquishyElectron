/*
** view Buffer -- interface to webGL
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include "qSpace.h"
#include "qWave.h"

static const bool debugViewBuffer = false;


// 'the' being the only one sometimes
qViewBuffer *theQViewBuffer;

qViewBuffer::qViewBuffer(qSpace *space) {
	// 4 floats per vertex, two verts per point
	this->space = space;
	this->viewBuffer = new float[space->nPoints * 8];
	if (debugViewBuffer) printf("viewBuffer(): viewBuffer %ld \n",
		(long) viewBuffer);
}

qViewBuffer::~qViewBuffer() {
	delete this->viewBuffer;
}

// copy the numbers in our space's qWave into this->viewBuffer
// one row per vertex, two rows per wave datapoint.
// each row of 4 floats looks like this:
//     real   imaginary    potential    serial
// Two vertices per datapoint: bottom then top, same data.
// also converts from doubles to floats for GL.
float qViewBuffer::loadViewBuffer(void) {
	qCx *latestWave = this->space->latestQWave->wave;

	int nPoints = this->space->nPoints;
	qReal highest = 0;
	qReal tiny = 1e-8;

	if (debugViewBuffer) {
		printf("loadViewBuffer(P): thePotential=%ld\n",
			(long) thePotential);
		printf("loadViewBuffer(B): this->space->latestQWave->wave=%ld->%ld->%ld->%ld\n",
			(long) this,
			(long) this->space,
			(long) this->space->latestQWave,
			(long) this->space->latestQWave->wave);
		printf("loadViewBuffer(vb,lqw): viewBuffer %ld and latestQWave->wave=%ld\n",
			(long) viewBuffer, (long) latestWave);
	}
	//latestQWave->dumpWave("at start of loadViewBuffer()");

	// this is index into the complex point, which translates to 2 GL points
	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		float *twoRowPtr = this->viewBuffer + pointNum * 8;
		qCx *wavePtr = latestWave + pointNum;

		if (debugViewBuffer) printf("loadViewBuffer(p %d): twoRowPtr %ld and wavePtr=%ld\n",
		pointNum, (long) twoRowPtr, (long) wavePtr);

		qReal *potPtr = thePotential + pointNum;
		qReal re = wavePtr->re;
		qReal im = wavePtr->im;

		if (debugViewBuffer) printf("loadViewBuffer(raw:%d): %lf %lf %lf\n",
			pointNum, re, im, tiny);

		twoRowPtr[0] = re * tiny;
		twoRowPtr[1] = im * tiny;

		twoRowPtr[2] = potPtr[0];  // this isn't going to be used yet
		twoRowPtr[3] = pointNum * 2.;  // vertexSerial: at zero

		twoRowPtr[4] = re;
		twoRowPtr[5] = im;
		twoRowPtr[6] = potPtr[0];
		twoRowPtr[7] = pointNum * 2. + 1.;  // at magnitude, top

		if (debugViewBuffer) printf("loadViewBuffer(8:%d): %lf %lf %lf %lf %lf %lf %lf %lf\n",
		pointNum, twoRowPtr[0], twoRowPtr[1], twoRowPtr[2], twoRowPtr[3],
				twoRowPtr[4], twoRowPtr[5], twoRowPtr[6], twoRowPtr[7]);

		// while we're here, collect the highest point (obsolete i think)
		qReal height = re * re + im * im;
		if (height > highest)
			highest = height;
	}

	if (debugViewBuffer) {
		printf("viewBuffer.cpp, as written to view buffer:\n");
		dumpViewBuffer(nPoints);
	}

	return highest;
}

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array,
// will be fed directly into gl.  This is allocated in qSpace.cpp & depends on nPoints
//float *viewBuffer;

// for the JS side
float *getViewBuffer(void) {
	return (float *) theQViewBuffer->viewBuffer;
}

int refreshViewBuffer(void) {
	if (debugViewBuffer)
		printf("refreshViewBuffer... theQViewBuffer=%ld\n", (long) theQViewBuffer);
	theQViewBuffer->loadViewBuffer();
	return 0;
}

// dump the view buffer just before it heads off to webgl.
int dumpViewBuffer(int nPoints) {
	float *viewBuffer = theQViewBuffer->viewBuffer;
	qReal prevRe = viewBuffer[0];
	qReal prevIm = viewBuffer[1];

	printf("==== dump ViewBuffer | \n");
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
