/*
** Flick -- like a video, a sequence of waves
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include <cmath>
#include <string>
#include "qSpace.h"
#include "qWave.h"


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

/* ************************************************************ plumbing */

// create a new wave copy, push this copy onto this flick
void qFlick::pushCopy(qCx *wave) {
	qCx *w = allocateWave();  // starts out zeroed
	if (wave)
		this->copyThatWave(w, wave);
	this->pushWave(w);
}

// initialize this flick by pushing this wave twice (two allocated),
// so you can take the inner product at .5 and 1.0 .
void qFlick::installWave(qCx *wave) {
	this->pushCopy(wave);
	this->pushCopy(wave);
}

// push a new, zeroed or filled, wave onto the beginning of this flick, item zero.
// We also recycle blocks that roll off the end here.
void qFlick::pushWave(qCx *newWave) {
	this->dumpLatest("pushWave() Start", true);

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

	this->dumpLatest("pushWave() done", true);
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

// calculate the complex value, re + i im, at this point and doubleAge
// always interpolate the missing component as an average of the two nearest
qCx qFlick::value(int doubleAge, int ix) {
	const int it = doubleAge / 2;
	qCx newPoint = this->waves[it][ix];
	qCx oldPoint = this->waves[it + 1][ix];

	if (ix & 1) {
		// odd imaginaries. im is direct, real is interpolated.  latest doubleAge = 1
		return qCx((newPoint.re + oldPoint.re)/2, oldPoint.im);
	}
	// even reals. real is direct, im is interpolated.  latest doubleAge = 2
	return qCx(newPoint.re, (newPoint.im + oldPoint.im)/2);
}

// calculate the magnitude, re**2 + im**2 kindof, at this point and time
// pretty clumsy but accurate, we'll figure out something
qReal qFlick::magnitude(int doubleAge, int ix) {
printf("qFlick::magnitude: [%d][%d] \n", doubleAge, ix);
	const int it = doubleAge / 2;
	if (! this->waves[it]) printf("no wave[it] in qf:magnitude!\n");
	if (! this->waves[it+1]) printf("no wave[it+1] in qf:magnitude!\n");
printf("qFlick::magnitude:got past the throwing \n");

	qCx newPoint = this->waves[it][ix];
printf("qFlick::magnitude:made new point \n");
	qCx oldPoint = this->waves[it + 1][ix];
printf("qFlick::magnitude:made old pont \n");

	if (ix & 1) {
		printf("qFlick::magnitude - odd imaginaries. im is squared, real is interpolated.%lf  %lf  %lf \n",  newPoint.re , oldPoint.re , oldPoint.im);
		// odd imaginaries. im is squared, real is interpolated.  latest doubleAge = 1
		return newPoint.re * oldPoint.re + oldPoint.im * oldPoint.im;
	}
	printf("qFlick::magnitude - even reals. real is squared, im is interpolated.%lf  %lf  %lf \n",
			 newPoint.re , newPoint.im , oldPoint.im);
	// even reals. real is squared, im is interpolated.  latest doubleAge = 2
	return newPoint.re * newPoint.re + newPoint.im * oldPoint.im;
}

// do an inner product the way Visscher described.
// doubleAge = integer time in the past, in units of dt/2; must be >= 0 & 0 is most recent
// if doubleAge is even, it takes a Re value at doubleAge/2 and mean between
// 		two Im values at doubleAge - dt/2 and doubleAge + dt/2
// if doubleAge is a odd integer, it takes an Im value at doubleAge and mean
// 		between the reals from doubleAge and doubleAge+1
// you can't take it at zero cuz there's no Im before that.
qReal qFlick::innerProduct(int doubleAge) {
	printf("qFlick::innerProduct starting at %d\n", doubleAge);
	qDimension *dims = this->space->dimensions;
	qReal sum = 0.;
	int end = dims->end;
	if (doubleAge <= 0)
		throw "Error in qFlick::innerProduct: doubleAge is negative";
//	const int t = doubleAge / 2;
//	const bool even = (doubleAge & 1) == 0;
//	qCx *newWave = this->waves[t];
//	qCx *oldWave = this->waves[t + 1];

	printf("qFlick::innerProduct got to loop\n");
	for (int ix = dims->start; ix < end; ix++) {
		double mag = this->magnitude(doubleAge, ix);
		sum += mag;
		printf("qFlick::innerProduct: [%d][%d]  mag=%lf  sum=%lf\n",
			doubleAge, ix, mag, sum);
//		qCx newPoint = newWave[ix];
//		qCx oldPoint = oldWave[ix];
//
//		if (even) {
//			// even - real is squared, im is interpolated.  visualize doubleAge = 2
//			sum += newPoint.re * newPoint.re + newPoint.im * oldPoint.im;
//		}
//		else {
//			// odd - im is squared, real is interpolated.  visualize doubleAge = 1
//			sum += newPoint.re * oldPoint.re + newPoint.im * newPoint.im;
//		}
	}
	return sum;
}

// normalize the top of the stack of waves; needs at least two waves in the flick
// Normalize (should be) always idempotent;
// anything else you wana do, make your own function
void qFlick::normalize(void) {
	this->dumpWave("qFlick::normalize starting", true);

	qDimension *dims = this->space->dimensions;
	qReal innerProduct = this->innerProduct(1);
	qCx *wave = this->waves[0];
	qReal factor = sqrt(1/innerProduct);
	printf("qFlick::normalize innerProduct is %lf factor=%lf\r", innerProduct, factor);
	for (int ix = dims->start; ix < dims->end; ix++)
		wave[ix] *= factor;

	this->fixBoundaries();
	this->dumpWave("qFlick::normalize done", true);
}


/* ******************************************************** diagnostic dump **/

// print one complex number, from a flick at time doubleAge, on a line in the dump on stdout.
// if it overflows the buffer, it won't.  just dump a row for a cx datapoint.
void qFlick::dumpRow(char *buf, int doubleAge, int ix, double *pPrevPhase, bool withExtras) {
	qCx w = this->value(ix, doubleAge);  // interpolates
	int it = doubleAge / 2;
	char i = (doubleAge & 1) ? 'i' : ' ';
	if (withExtras) {
		qReal mag = this->magnitude(ix, doubleAge);  // interpolates
		qReal phase = atan2(w.im, w.re) * 180 / PI;  // pos or neg
		qReal dPhase = phase - *pPrevPhase + 360.;  // so now its positive, right?
		while (dPhase >= 360.) dPhase -= 360.;

		sprintf(buf, "[%d]%c (%8.4lf,%8.4lf) | %8.2lf %8.2lf %8.4lf",
			ix, i, w.re, w.im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		sprintf(buf, "[%d]%c (%8.4lf,%8.4lf)", ix, i, w.re, w.im);
	}
}


// dump the effective wave on this flick at doubleAge
// title is the title of the particular call to dumpFlick() like func name
void qFlick::dumpOneAge(const char *title, int doubleAge, bool withExtras) {
	printf("==== Flick @%d | %s:\n", doubleAge, title);
	const qDimension *dims = this->space->dimensions;
	char buf[200];
	double prevPhase = 0.;

	int ix = 0;
	if (dims->continuum) {
		this->dumpRow(buf, ix, doubleAge, &prevPhase, withExtras);
		printf("%s", buf);
	}

	for (ix = dims->start; ix < dims->end; ix++) {
		dumpRow(buf, ix, doubleAge, &prevPhase, withExtras);
		printf("\n%s", buf);
	}

	if (dims->continuum) {
		dumpRow(buf, ix, doubleAge, &prevPhase, withExtras);
		printf("\nend %s", buf);
	}


//	if (this->waves[0]) {
//		this->space->dumpThatWave(this->waves[0], true);
//		if (this->waves[1])
//			this->space->dumpThatWave(this->waves[1], true);
//	}
//
//	for (int i = 0; i < this->nWaves; i++)
//		printf("<%d>: %d\n", i, (int) this->waves[i]);
}


void qFlick::dumpLatest(const char *titleIn, bool withExtras) {
	char tBuf[200];
	sprintf(tBuf, "%s 1", titleIn);
	this->dumpOneAge(tBuf, 1, withExtras);
	sprintf(tBuf, "%s 2", titleIn);
	this->dumpOneAge(tBuf, 2, withExtras);
}


/* ************************************************************ visscher */

// 	this->pushWave();

