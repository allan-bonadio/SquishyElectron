/*
** Flick -- like a video, a sequence of waves
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include <cmath>
#include <string>


/* ************************************************************ birth & death & basics */

// buffer is initialized to zero bytes therefore 0.0 everywhere
qFlick::qFlick(qSpace *space, int maxWaves) :
	qWave(space), maxWaves(maxWaves), nWaves(1), currentIx(0)
{
	//qWave(space);  // always dynamically allcoated

	// array of array of complex: array of waves
	this->waves = (qCx **) malloc(maxWaves * sizeof(int *));
	this->waves[0] = this->buffer;
	this->nWaves = 0;
}

qFlick::~qFlick() {
	printf("start the qFlick instance destructor...\n");
	this->setCurrent(0);

	// note how this starts at 1 so item zero can be freed by superclass
	for (int i = 1; i < this->nWaves; i++) {
		this->freeWave(waves[i]);
		waves[i] = NULL;
	}
	printf("    freed most of the buffers...\n");

	free(this->waves);
	printf("    freed waves...\n");

	this->waves = NULL;
	printf("setted waves to null; done with qFlick destructor.\n");

}

/* ******************************************************** diagnostic dump **/

// title is the title of the particular call to dumpFlickPointers() like func name
void qFlick::dumpFlickPointers(const char *title) {
	printf("==== Flick | %s:\n", title);
	for (int i = 0; i < this->nWaves; i++)
		printf("<%d>: %d\n", i, (int) this->waves[i]);
}


/* ************************************************************ plumbing */

// push a new, clean, wave onto the beginning of this flick, item zero.
// We recycle blocks here.
void qFlick::unshiftWave(void) {
	qCx *newWave;
	this->dumpFlickPointers("unshiftWave() Start");

	if (nWaves >= maxWaves) {
		// sorry charlie, gotta free the oldest one...
		// but stick around we'll recycle you for the new one
		newWave = this->waves[this->maxWaves - 1];

		// zap it to zeros, like new!
		std::memset(newWave, 0, this->space->nPoints * sizeof(qCx));
	}
	else {
		// waves[] grows like this till it's full, then it frees the
		// ones that roll off the end
		newWave = this->allocateWave();
		this->nWaves++;
	}

	// shove over, note waves[0] can be overwritten after this
	for (int i = this->nWaves - 1; i >= 1; i--)
		waves[i] = waves[i-1];

	// and here we are
	waves[0] = newWave;

	// somebody will set this back to zero?
	this->currentIx++;

	this->dumpFlickPointers("unshiftWave() done");
}

// set which one is 'current', so if osmeone uses this as a qWave,
// that's what they see, that's what gets 'normalized' or whatever
// to 'getCurrent' wave, just get qfk->buffer;
void qFlick::setCurrent(int newIx) {
	if (newIx < 0 || newIx >= this->nWaves)
		printf("qFlick::setCurrent() bad index: %d\n", newIx);
	this->currentIx = newIx;
	this->buffer = this->waves[newIx];
}

// do an inner product the way Visscher described.
// doubleT = integer time in the past, in units of dt/2; must be >= 0 & 0 is most recent
// if doubleT is even, it takes a Re value at doubleT/2 and mean between two Ims
// if doubleT is a odd integer, it takes an Im value at (doubleT+1)/2 and mean between two Res
// you can't take it at zero cuz there's no Im before that.
qReal qFlick::innerProduct(int doubleT) {
	qDimension *dims = this->space->dimensions;
	qReal sum = 0.;
	int end = dims->end;
	if (doubleT <= 0) printf("Error in qFlick::innerProduct, doubleT is negative");
	const int t = doubleT / 2;
	const bool even = (doubleT & 1) == 0;
	qCx *newWave = this->waves[t];
	qCx *oldWave = this->waves[t + 1];

	for (int ix = dims->start; ix < end; ix++) {
		qCx newPoint = newWave[ix];
		qCx oldPoint = oldWave[ix];

		if (even) {
			// even - real is squared, im is interpolated.  visualize doubleT = 2
			sum += newPoint.re * newPoint.re + newPoint.im * oldPoint.im;
		}
		else {
			// odd - im is squared, real is interpolated.  visualize doubleT = 1
			sum += newPoint.re * oldPoint.re + newPoint.im * newPoint.im;
		}
	}
	return sum;
}

// normalize the most recent of the waves; needs at least two waves in the flick
// Normalize is always idempotent; anything else you wana do, make your own function
void qFlick::normalize(void) {
	qDimension *dims = this->space->dimensions;
	qReal innerProduct = this->innerProduct(1);
	qCx *wave = this->waves[0];
	qReal factor = sqrt(1/innerProduct);
	printf("qFlick::normalize innerProduct is %lf\r", innerProduct);
	for (int ix = dims->start; ix < dims->end; ix++)
		wave[ix] *= factor;

	this->dumpWave("qFlick::normalize done", true);
}



/* ************************************************************ visscher */

// push this wave onto the flick twice.
void qFlick::installWave(qSpace *space, qCx *wave, int depth) {



	this->unshiftWave();



}
