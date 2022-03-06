/*
** view Buffer -- interface to webGL
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include "qSpace.h"
#include "qWave.h"

static const bool debugViewBuffer = true;
static const bool debugInDetail = false;


// 'the' being the only one sometimes.  set in jsSpace completeNewSpace
qViewBuffer *theQViewBuffer;

qViewBuffer::qViewBuffer(qSpace *space) {
	// 4 floats per vertex, two verts per point
	this->space = space;
	this->viewBuffer = new float[space->nPoints * 8];
	if (debugViewBuffer) printf("📺 viewBuffer(): this->viewBuffer ptr %x \n",
		(unsigned int) this->viewBuffer);
	//printf("📺 qViewBuffer constructor done: this=%x   this->viewBuffer=%x\n",
	//(unsigned int) this, (unsigned int) this->viewBuffer);
	// done in completeNewSpace    theQViewBuffer = this;
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
	if (debugViewBuffer) printf("📺 loadViewBuffer() starts: this->viewBuffer = %x \n",
		(unsigned int) this->viewBuffer);
//	printf("qViewBuffer::loadViewBuffer space ptr %x\n", (unsigned int) this->space);
//	printf("qViewBuffer::loadViewBuffer latestQWave ptr %x\n", (unsigned int) this->space->latestQWave);
	qWave *latestQWave = this->space->latestQWave;
//	printf("qViewBuffer::loadViewBuffer latestWave ptr %x\n", (unsigned int) latestQWave->wave);
	qCx *latestWave = latestQWave->wave;

//	printf("qViewBuffer::loadViewBuffer this->space->nPoints %x\n", (unsigned int) this->space->nPoints);
	int nPoints = this->space->nPoints;
	double highest = 0;
	double tiny = 1e-8;

	if (debugInDetail) {
//		printf("loadViewBuffer(P): thePotential=%x\n",
//			(unsigned int) thePotential);
//		printf("loadViewBuffer(B): this->space->latestQWave->wave=%x->%x->%x->%x\n",
//			(unsigned int) this,
//			(unsigned int) this->space,
//			(unsigned int) this->space->latestQWave,
//			(unsigned int) this->space->latestQWave->wave);
//		printf("loadViewBuffer(vb,lqw): viewBuffer %x and latestQWave->wave=%x\n",
//			(unsigned int) viewBuffer, (unsigned int) latestWave);
		latestQWave->dumpWave("📺 at start of loadViewBuffer()");
	}

	// this is index into the complex point, which translates to 2 GL points
//	printf("qViewBuffer::loadViewBuffer about to do all the pts\n");
	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		if (debugInDetail) {
			printf("📺 qViewBuffer::loadViewBuffer this->viewBuffer %x\n",
				(unsigned int) this->viewBuffer);
			printf("📺 qViewBuffer::loadViewBuffer this->viewBuffer + pointNum * 8=%x\n",
				(unsigned int) this->viewBuffer + pointNum * 8);
		}
		float *twoRowPtr = this->viewBuffer + pointNum * 8;
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer twoRowPtr =%x\n", (unsigned int) twoRowPtr);
		qCx *wavePtr = latestWave + pointNum;
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer wavePtr =%x\n", (unsigned int) wavePtr);

		if (debugInDetail) printf("📺 loadViewBuffer(pointNum=%x): twoRowPtr =%x and wavePtr=%x\n",
			pointNum, (unsigned int) twoRowPtr, (unsigned int) wavePtr);

		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer thePotential=%x\n", (unsigned int) theSpace->potential);
		double *potPtr = theSpace->potential + pointNum;
		if (!potPtr) throw "📺 qViewBuffer::loadViewBuffer potPtr is null";
		if (debugInDetail)
			printf("📺 qViewBuffer::loadViewBuffer potPtr=%x\n", (unsigned int) potPtr);
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
		printf("    qViewBuffer::at end of loadViewBuffer this=%x  this->viewBuffer=%x\n",
				(unsigned int) this, (unsigned int) this->viewBuffer);
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
//	printf("dumpViewBuffer theSpace %x\n", (unsigned int) theSpace);
//	printf("dumpViewBuffer qViewBuffer ptr %x\n", (unsigned int) theSpace->qViewBuffer);
//	printf("dumpViewBuffer viewBuffer %x\n", (unsigned int) theSpace->qViewBuffer->viewBuffer);
	float *viewBuffer = theSpace->qViewBuffer->viewBuffer;
	printf("📺 The viewBuffer = %x\n", (unsigned int) viewBuffer);
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
	printf("    qViewBuffer::at end of dumpViewBuffer qViewBuffer=%x  qViewBuffer->viewBuffer=%x  local viewBuffer=%x\n",
			(unsigned int) theSpace->qViewBuffer, (unsigned int) theSpace->qViewBuffer->viewBuffer, (unsigned int) viewBuffer);
}


// for the JS side
extern "C" {
	void qViewBuffer_dumpViewBuffer(const char *title) {
		dumpViewBuffer(title);
	}

	float *qViewBuffer_getViewBuffer(void) {
//		printf("📺 qViewBuffer_getViewBuffer: theQViewBuffer=%x \n",
//			(unsigned int) theQViewBuffer);
//		printf("📺                    theQViewBuffer->viewBuffer=%x\n",
//			theQViewBuffer ? (unsigned int) theQViewBuffer->viewBuffer : 0);
		if (! theQViewBuffer) return NULL;
		return theQViewBuffer->viewBuffer;
	}

	void qViewBuffer_loadViewBuffer(void) {
		if (debugViewBuffer)
			printf("📺 qViewBuffer_getViewBuffer... theQViewBuffer=%x\n", (unsigned int) theQViewBuffer);
		theQViewBuffer->loadViewBuffer();
	}
}
