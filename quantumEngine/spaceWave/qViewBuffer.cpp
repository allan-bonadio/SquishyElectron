/*
** view Buffer -- interface buffer to webGL
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


#include "qSpace.h"
#include "../schrodinger/Incarnation.h"
#include "qWave.h"
#include "qViewBuffer.h"

static const bool debugViewBuffer = false;
static const bool debugInDetail = false;

// August Ferdinand Möbius invented homogenous coordinates

// 'the' being the only one sometimes.  set in jsSpace completeNewSpace
qViewBuffer *theQViewBuffer;

qViewBuffer::qViewBuffer(qSpace *space)
	: space(space){
	if (! space)
		throw std::runtime_error("qViewBuffer::qViewBuffer null space");
	// 4 floats per vertex, two verts per point
	buffer = new float[space->nPoints * 8];
	if (debugViewBuffer) printf("📺 buffer(): buffer ptr %p \n",
		buffer);
	//printf("📺 qViewBuffer constructor done: this=%p   buffer=%p\n",
	//this, buffer);
	// done in completeNewSpace    theQViewBuffer = this;
}

qViewBuffer::~qViewBuffer() {
	delete[] buffer;
}

// copy the numbers in our space's qWave into buffer
// one row per vertex, two rows per wave datapoint.
// each row of 4 floats looks like this:
//     real   imaginary    potential    serial
// Two vertices per datapoint: bottom then top, same data.
// also converts from doubles to floats for GL.
float qViewBuffer::loadViewBuffer(void) {
	if (debugViewBuffer) printf("📺 loadViewBuffer() starts: buffer = %p \n",
		buffer);
//	printf("qViewBuffer::loadViewBuffer space ptr %p\n", space);
//	printf("qViewBuffer::loadViewBuffer mainQWave ptr %p\n", space->incarn->mainQWave);
	qWave *mainQWave = space->incarn->mainQWave;
//	printf("qViewBuffer::loadViewBuffer latestWave ptr %p\n", incarn->mainQWave->wave);
	qCx *latestWave = mainQWave->wave;

//	printf("qViewBuffer::loadViewBuffer space->nPoints %d\n", space->nPoints);
	int nPoints = space->nPoints;
	double highest = 0;
	double tiny = 1e-8;

	if (debugInDetail) {
		printf("loadViewBuffer(P): thePotential=%p\n",
			thePotential);
		printf("loadViewBuffer(B): space->incarn->mainQWave->wave=%p->%p->%p->%p\n",
			this,
			space,
			space->incarn->mainQWave,
			space->incarn->mainQWave->wave);
		printf("loadViewBuffer(vb,lqw): buffer %p and incarn->mainQWave->wave=%p\n",
			buffer, latestWave);
		mainQWave->dumpWave("📺 at start of loadViewBuffer()");
	}

	// this is index into the complex point, which translates to 2 GL points
//	printf("qViewBuffer::loadViewBuffer about to do all the pts\n");
	for (int pointNum = 0; pointNum < nPoints; pointNum++) {
		if (debugInDetail) {
			printf("📺 qViewBuffer::loadViewBuffer buffer %p\n",
				buffer);
			printf("📺 qViewBuffer::loadViewBuffer buffer + pointNum * 8=%p\n",
				buffer + pointNum * 8);
		}
		float *twoRowPtr = buffer + pointNum * 8;
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
		if (!potPtr) throw std::runtime_error("📺 qViewBuffer::loadViewBuffer potPtr is null");
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
		printf("    qViewBuffer::at end of loadViewBuffer this=%p  buffer=%p\n",
				this, buffer);
		//printf("  ===  📺  buffer.cpp done, as written to view buffer:\n");
		//dumpViewBuffer("loadViewBuffer done");
	}

	return highest;
}

// prep wave & potential  data for GL.  For rows of floats in a big Float32Array,
// will be fed directly into gl.  This is allocated in qSpace.cpp & depends on nPoints
//float *buffer;

// dump the view buffer just before it heads off to webgl.
void dumpViewBuffer(const char *title) {
//	printf("dumpViewBuffer theSpace %p\n", theSpace);
//	printf("dumpViewBuffer qViewBuffer ptr %p\n", theSpace->qViewBuffer);
//	printf("dumpViewBuffer buffer %p\n", theSpace->qViewBuffer->buffer);
	float *buffer = theSpace->incarn->viewBuffer->buffer;
	printf("📺 The buffer = %p\n", buffer);
	double prevRe = buffer[0];
	double prevIm = buffer[1];

	if (!title) title = "";
	printf("==== 📺 dump buffer | %s\n", title);
	printf("   ix  |    re      im     pot    serial  |   phase    magn\n");
	for (int i = 0; i < theSpace->nPoints*2; i++) {
		double re = buffer[i*4];
		double im = buffer[i*4+1];
		if (i & 1) {
			double dRe = re - prevRe;
			double dIm = im - prevIm;
			double phase = 0.;
			double magn = 0.;
			phase = atan2(im, re) * 180 / PI;
			magn = im * im + re * re;
			printf("%6d |  %6.3f  %6.3f  %6.3f  %6.3f  |  %6.3f  %6.3f\n",
				i,
				re, im, buffer[i*4+2], buffer[i*4+3],
				phase, magn);

			prevRe = re;
			prevIm = im;
		}
		else {
			printf("%6d |  %6.3f  %6.3f  %6.3f  %6.3f \n",
				i,
				re, im, buffer[i*4+2], buffer[i*4+3]);
		}
	}
	printf("    qViewBuffer::at end of dumpViewBuffer qViewBuffer=%p  qViewBuffer->buffer=%p  local buffer=%p\n",
			theSpace->incarn->viewBuffer, theSpace->incarn->viewBuffer->buffer, buffer);
}


// for the JS side
extern "C" {
	void qViewBuffer_dumpViewBuffer(const char *title) {
		dumpViewBuffer(title);
	}

	float *qViewBuffer_getViewBuffer(void) {
//		printf("📺 qViewBuffer_getViewBuffer: theQViewBuffer=%p \n",
//			theQViewBuffer);
//		printf("📺                    theQViewBuffer->buffer=%p\n",
//			theQViewBuffer ? theQViewBuffer->buffer : 0);
		if (! theQViewBuffer) return NULL;
		return theQViewBuffer->buffer;
	}

	void qViewBuffer_loadViewBuffer(void) {
		if (debugViewBuffer)
			printf("📺 qViewBuffer_getViewBuffer... theQViewBuffer=%p\n", theQViewBuffer);
		theQViewBuffer->loadViewBuffer();
	}
}

