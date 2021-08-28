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

// create a new wave copy, push this copy onto this flick
void qFlick::pushCopy(qCx *wave) {
	qCx *w = allocateWave();  // starts out zeroed
	if (wave)
		this->copyWave(w, wave);
	this->pushWave(w);
}

// initialize this flick by pushing this wave twice (two allocated),
// so you can take the inner product at .5 and 1.0 .
void qFlick::installWave(qCx *wave) {
	this->pushCopy(wave);
	this->pushCopy(wave);
}

// push a new, zeroed, wave onto the beginning of this flick, item zero.
// We also recycle blocks that roll off the end here.
// i guess it's not really Push if you can't fill it in?
void qFlick::pushWave(qCx *newWave) {
	this->dumpFlickPointers("pushWave() Start");

	// first we need a buffer.
	if (nWaves >= maxWaves) {
		// sorry charlie, gotta get rid of the oldest one...
		// but stick around we'll recycle you for the new one
		newWave = this->waves[this->maxWaves - 1];

		// zap it to zeros, like new!
		std::memset(newWave, 0, this->space->nPoints * sizeof(qCx));
	}
	else {
		// waves[] grows like this till it's full, then it recycles the
		// ones that roll off the end
		newWave = this->allocateWave();
		this->nWaves++;
	}

	// shove over
	for (int i = this->nWaves - 1; i >= 1; i--)
		waves[i] = waves[i-1];

	// and here we are.  Good luck with it!
	waves[0] = newWave;

	// somebody will set this back to zero?
	this->currentIx++;

	this->dumpFlickPointers("pushWave() done");
}

// set which one is 'current', so if someone uses this as a qWave,
// that's what they see, that's what gets 'normalized' or whatever
// to 'getCurrent' wave, just get qfk->buffer;
void qFlick::setCurrent(int newIx) {
	if (newIx < 0 || newIx >= this->nWaves)
		printf("qFlick::setCurrent() bad index: %d\n", newIx);
	this->currentIx = newIx;
	this->buffer = this->waves[newIx];
}

// do an inner product the way Visscher described.
// doubleTime = integer time in the past, in units of dt/2; must be >= 0 & 0 is most recent
// if doubleTime is even, it takes a Re value at doubleTime/2 and mean between
// 		two Im values at doubleTime - dt/2 and doubleTime + dt/2
// if doubleTime is a odd integer, it takes an Im value at doubleTime and mean
// 		between the reals from doubleTime and doubleTime+1
// you can't take it at zero cuz there's no Im before that.
qReal qFlick::innerProduct(int doubleTime) {
	qDimension *dims = this->space->dimensions;
	qReal sum = 0.;
	int end = dims->end;
	if (doubleTime <= 0) printf("Error in qFlick::innerProduct, doubleTime is negative");
	const int t = doubleTime / 2;
	const bool even = (doubleTime & 1) == 0;
	qCx *newWave = this->waves[t];
	qCx *oldWave = this->waves[t + 1];

	for (int ix = dims->start; ix < end; ix++) {
		qCx newPoint = newWave[ix];
		qCx oldPoint = oldWave[ix];

		if (even) {
			// even - real is squared, im is interpolated.  visualize doubleTime = 2
			sum += newPoint.re * newPoint.re + newPoint.im * oldPoint.im;
		}
		else {
			// odd - im is squared, real is interpolated.  visualize doubleTime = 1
			sum += newPoint.re * oldPoint.re + newPoint.im * newPoint.im;
		}
	}
	return sum;
}

// normalize the top of the stack of waves; needs at least two waves in the flick
// Normalize (should be) always idempotent;
// anything else you wana do, make your own function
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

// 	this->pushWave();

