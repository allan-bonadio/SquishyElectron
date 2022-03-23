/*
** view Buffer -- interface to webGL
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include "qSpace.h"
#include "qWave.h"

static const bool debugViewBuffer = false;
static const bool debugInDetail = false;


// 'the' being the only one sometimes.  set in jsSpace completeNewSpace
qViewBuffer *theQViewBuffer;

qViewBuffer::qViewBuffer(qSpace *space) {
	// 4 floats per vertex, two verts per point
	this->space = space;
	viewBuffer = new float[space->nPoints * 8];
	if (debugViewBuffer) printf("📺 viewBuffer(): viewBuffer ptr %p \n",
		viewBuffer);
	//printf("📺 qViewBuffer constructor done: this=%p   viewBuffer=%p\n",
	//this, viewBuffer);
	// done in completeNewSpace    theQViewBuffer = this;
}

qViewBuffer::~qViewBuffer() {
	delete[] viewBuffer;
}

// copy the numbers in our space's qWave into viewBuffer
// one row per vertex, two rows per wave datapoint.
// each row of 4 floats looks like this:
//     real   imaginary    potential    serial
// Two vertices per datapoint: bottom then top, same data.
// also converts from doubles to floats for GL.
float qViewBuffer::loadViewBuffer(void) {
	if (debugViewBuffer) printf("📺 loadViewBuffer() starts: viewBuffer = %p \n",
		viewBuffer);
//	printf("qViewBuffer::loadViewBuffer space ptr %p\n", space);
//	printf("qViewBuffer::loadViewBuffer latestQWave ptr %p\n", space->latestQWave);
	qWave *latestQWave = space->latestQWave;
//	printf("qViewBuffer::loadViewBuffer latestWave ptr %p\n", latestQWave->wave);
	qCx *latestWave = latestQWave->wave;

//	printf("qViewBuffer::loadViewBuffer space->nPoints %d\n", space->nPoints);
	int nPoints = space->nPoints;
	double highest = 0;
	double tiny = 1e-8;

	if (debugInDetail) {
		printf("loadViewBuffer(P): thePotential=%p\n",
			thePotential);
		printf("loadViewBuffer(B): space->latestQWave->wave=%p->%p->%p->%p\n",
			this,
			space,
			space->latestQWave,
			space->latestQWave->wave);
		printf("loadViewBuffer(vb,lqw): viewBuffer %p and latestQWave->wave=%p\n",
			viewBuffer, latestWave);
		latestQWave->dumpWave("📺 at start of loadViewBuffer()");
	}

	// this is index into the complex point, which translates to 2 GL points
//	printf("qViewBuffer::loadViewBuffer about to do all the pts\n");
	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		if (debugInDetail) {
			printf("📺 qViewBuffer::loadViewBuffer viewBuffer %p\n",
				viewBuffer);
			printf("📺 qViewBuffer::loadViewBuffer viewBuffer + pointNum * 8=%p\n",
				viewBuffer + pointNum * 8);
		}
		float *twoRowPtr = viewBuffer + pointNum * 8;
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer twoRowPtr =%p\n", twoRowPtr);
		qCx *wavePtr = latestWave + pointNum;
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer wavePtr =%p\n", wavePtr);

		if (debugInDetail) printf("📺 loadViewBuffer(pointNum=%d): twoRowPtr =%p and wavePtr=%p\n",
			pointNum, twoRowPtr, wavePtr);

		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer thePotential=%p\n", theSpace->potential);
		double *potPtr = theSpace->potential + pointNum;
		if (!potPtr) throw "📺 qViewBuffer::loadViewBuffer potPtr is null";
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer potPtr=%p\n", potPtr);
		double re = wavePtr->re;
		double im = wavePtr->im;

		if (debugInDetail) printf("📺 loadViewBuffer(pointNum:%d): re=%lf im=%lf tiny=%lf\n",
			pointNum, re, im, tiny);

		twoRowPtr[0] = re * tiny;
		twoRowPtr[1] = im * tiny;

		twoRowPtr[2] = potPtr[0];  // this isn't going to be used yet
		twoRowPtr[3] = pointNum * 2.;  // vertexSerial: at zero

		twoRowPtr[4] = re;
		twoRowPtr[5] = im;
		twoRowPtr[6] = potPtr[0];
		twoRowPtr[7] = pointNum * 2. + 1.;  // at magnitude, top

		if (debugInDetail) printf("📺 loadViewBuffer(8:%d): %lf %lf %lf %lf %lf %lf %lf %lf\n",
			pointNum, twoRowPtr[0], twoRowPtr[1], twoRowPtr[2], twoRowPtr[3],
				twoRowPtr[4], twoRowPtr[5], twoRowPtr[6], twoRowPtr[7]);

		// while we're here, collect the highest point (obsolete i think)
		double height = re * re + im * im;
		if (height > highest)
			highest = height;
	}

	if (debugViewBuffer) {
		printf("    qViewBuffer::at end of loadViewBuffer this=%p  viewBuffer=%p\n",
				this, viewBuffer);
		//printf("  ===  📺  viewBuffer.cpp done, as written to view buffer:\n");
		//dumpViewBuffer("loadViewBuffer done");
	}

	return highest;
}

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array,
// will be fed directly into gl.  This is allocated in qSpace.cpp & depends on nPoints
//float *viewBuffer;

// dump the view buffer just before it heads off to webgl.
void dumpViewBuffer(const char *title) {
//	printf("dumpViewBuffer theSpace %p\n", theSpace);
//	printf("dumpViewBuffer qViewBuffer ptr %p\n", theSpace->qViewBuffer);
//	printf("dumpViewBuffer viewBuffer %p\n", theSpace->qViewBuffer->viewBuffer);
	float *viewBuffer = theSpace->qViewBuffer->viewBuffer;
	printf("📺 The viewBuffer = %p\n", viewBuffer);
	double prevRe = viewBuffer[0];
	double prevIm = viewBuffer[1];

	if (!title) title = "";
	printf("==== 📺 dump ViewBuffer | %s\n", title);
	printf("   ix  |    re      im     pot    serial  |   phase    magn\n");
	for (int i = 0; i < theSpace->nPoints*2; i++) {
		double re = viewBuffer[i*4];
		double im = viewBuffer[i*4+1];
		if (i & 1) {
			double dRe = re - prevRe;
			double dIm = im - prevIm;
			double phase = 0.;
			double magn = 0.;
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
	printf("    qViewBuffer::at end of dumpViewBuffer qViewBuffer=%p  qViewBuffer->viewBuffer=%p  local viewBuffer=%p\n",
			theSpace->qViewBuffer, theSpace->qViewBuffer->viewBuffer, viewBuffer);
}


// for the JS side
extern "C" {
	void qViewBuffer_dumpViewBuffer(const char *title) {
		dumpViewBuffer(title);
	}

	float *qViewBuffer_getViewBuffer(void) {
//		printf("📺 qViewBuffer_getViewBuffer: theQViewBuffer=%p \n",
//			theQViewBuffer);
//		printf("📺                    theQViewBuffer->viewBuffer=%p\n",
//			theQViewBuffer ? theQViewBuffer->viewBuffer : 0);
		if (! theQViewBuffer) return NULL;
		return theQViewBuffer->viewBuffer;
	}

	void qViewBuffer_loadViewBuffer(void) {
		if (debugViewBuffer)
			printf("📺 qViewBuffer_getViewBuffer... theQViewBuffer=%p\n", theQViewBuffer);
		theQViewBuffer->loadViewBuffer();
	}
}

