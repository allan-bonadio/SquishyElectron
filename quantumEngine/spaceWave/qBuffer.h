/*
** quantum buffer -- a buffer of qCx values that represents a qWave or a qSpectrum
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

// a 'wave' is a straight array of qCx, of length space->nPoints.
//    named this way even for spectrums
// a 'qBuffer' is a wrapped wave that knows how to traverse itself
// a 'qWave' is an object with cool methods for the wave it encloses,
//    plus a qSpace pointer.  Subclass of qBuffer.
// a 'qFlick' (see below) is a sequence of waves (defunct maybe)
// a 'qViewBuffer' is specifically to send coordinates to WebGL for display; very different
// a 'qSpectrum' is like a qWave designed for FFT results.  Subclass of qBuffer.

#ifndef __QBUFFER_H__
#define __QBUFFER_H__

#include "../squish.h"

struct qSpace;
struct qWave;

extern qCx *allocateWave(int nPoints = -1);
extern void freeWave(struct qCx *wave);

// a long array of qCx complex numbers, plus some other info
struct qBuffer {

	// create one, dynamically allocated or Bring Your Own Buffer to use
	qBuffer(void);
	virtual ~qBuffer();

	uint32_t magic;

	// calls solo allocateWave() but for this wave's count and stuff
	qCx *allocateWave(int nPoints = -1);

	// constructor for qWave and qSpectrum calls this to finish up & alloc buffer
	void initBuffer(int length, qCx *useThisBuffer = NULL);

	// the actual data, hopefully in the right size allocated block
	qCx *wave;

	void copyThatWave(qCx *dest, qCx *src, int length = -1);

	// spectrums don't have wraparounds boundaries so spectrums calculate different numbers from waves.
	// should be in accord with the space, sortof, depending on whether wave or spectrum.
	int nPoints; int start; int end, continuum;

	// if it used the first constructor
	// this has, among other things, the count of points and states in all qWave buffers
	// but for just a bare qBuffer, this can be null, for freelance buffers.
	qSpace *space;

	bool dynamicallyAllocated: 1;

	// print one complex number, plus maybe some more calculated metrics for that point,
	// on a line in the dump on stdout.
	static double dumpRow(char buf[200], int ix, qCx w, double *pPrevPhase, bool withExtras);

	// print any segment of any buffer
	// you can use this on waves or spectrums; for the latter, leave off the start and the rest
	static void dumpSegment(qCx *wave, bool withExtras = false,
		int start = 0, int end = -1, int continuum = 0);

	void dumpHiRes(const char *title = "a buffer");
	void rainbowDump(const char *title = "a buffer");  // calls JS to do it

	double innerProduct(void);
	void normalize(void);  // returns inner product
	void fixThoseBoundaries(qCx *targetWave);
	void fixBoundaries(void) { fixThoseBoundaries(wave); }
};

#endif
