/*
** quantum Wave -- quantum wave buffer
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

/*
Data structures used for these buffers:
qCx *wave  # wave: just an array of complex nums that's nPoints long
qWave - object that owns a single wave, and points to its space
qFlick - object that owns a list of waves, and points to its space

Visscher has upended so much of this, splitting the real and imaginary parts of
schrodinger's.  qFlick can do visscher; you need at least 3 time inrements to
calculate an inner product.  I don't know how to make a circular wave anymore
not sure how much dt/2 is.
*/

#include <cmath>
#include "qSpace.h"
#include "qWave.h"

// a transitional kind of thing from raw wave arrays to the new qWave buffer obj
class qWave *laosQWave = NULL, *peruQWave = NULL;
class qCx *laosWave = NULL, *peruWave = NULL;

int traceLowPassFilter = false;

/* ************************************************************ birth & death & basics */

// buffer is initialized to zero bytes therefore 0.0 everywhere
qWave::qWave(qSpace *space) {
	this->space = space;
	this->wave = this->allocateWave();
	this->dynamicallyAllocated = 1;
}

qWave::qWave(qSpace *space, qCx *buffer) {
	this->space = space;
	this->wave = buffer;
	this->dynamicallyAllocated = 0;
}

qWave::~qWave() {
	//printf("start the qWave instance destructor...\n");
	this->space = NULL;
	//printf("    set space to null...\n");

	if (this->dynamicallyAllocated)
		this->freeWave(this->wave);
	//printf("    freed buffer...\n");

	//printf("setted buffer to null; done with qWave destructor.\n");
}

qCx *qWave::allocateWave(void) {
	return (qCx *) malloc(this->space->nPoints * sizeof(qCx));
}

void qWave::freeWave(qCx *wave) {
	free(wave);
}

void qWave::copyThatWave(qCx *dest, qCx *src) {
//	printf("qWave::copyThatWave(%d <== %d)\n", (int) dest, (int) src);
	if (!dest) dest = this->wave;
	if (!src) src = this->wave;
	memcpy(dest, src, this->space->nPoints * sizeof(qCx));
}

/* never tested - might never work under visscher */
void qWave::forEachPoint(void (*callback)(qCx, int) ) {
	qDimension *dims = this->space->dimensions;
	qCx *wave = this->wave;
	int end = dims->end + dims->start;
	for (int ix = 0; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) \n", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}
}

/* never tested - might never work under visscher  */
void qWave::forEachState(void (*callback)(qCx, int) ) {
	qDimension *dims = this->space->dimensions;
	int end = dims->end;
	qCx *wave = this->wave;
	for (int ix = dims->start; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) ", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}

}

/* ******************************************************** diagnostic dump **/

// print one complex number, plus maybe some more, on a line in the dump on stdout.
// if it overflows the buffer, it won't.  just dump a row for a cx datapoint.
// returns the magnitude non-visscher, but only withExtras
static qReal dumpRow(char *buf, int ix, qCx w, double *pPrevPhase, bool withExtras) {
	qReal re = w.re;
	qReal im = w.im;
	qReal mag = 0;
	if (withExtras) {
		mag = re * re + im * im;
		qReal phase = 0.;
		if (im || re) phase = atan2(im, re) * 180. / PI;  // pos or neg
		qReal dPhase = phase - *pPrevPhase + 360.;  // so now its positive, right?
		while (dPhase >= 360.) dPhase -= 360.;

		sprintf(buf, "[%d] (%8.4lf,%8.4lf) | %8.3lf %8.3lf %8.4lf",
			ix, re, im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		sprintf(buf,"[%d] (%8.4lf,%8.4lf)", ix, re, im);
	}
	return mag;
}

void dumpWaveSegment(qCx *wave, int start, int end, int continuum, bool withExtras) {

	int ix = 0;
	char buf[200];
	double prevPhase = 0.;
	double innerProd = 0.;

	// somehow, commenting out these lines fixes the nan problem.
	// but the nan problem doesn't happen on flores?
	// i haven't seen the nan problem since like a month ago.  ab 2021-08-25
	if (continuum) {
		dumpRow(buf, ix, wave[0], &prevPhase, withExtras);
		printf("%s", buf);
	}

	for (ix = start; ix < end; ix++) {
		innerProd += dumpRow(buf, ix, wave[ix], &prevPhase, withExtras);
		printf("\n%s", buf);
	}

	if (continuum) {
		dumpRow(buf, ix, wave[end], &prevPhase, withExtras);
		printf("\nend %s", buf);
	}

	printf(" innerProd=%11.8lf\n", innerProd);
}

// this is wave-independent.  This prints N+2 lines:
// one for the 0 element if it's a continuum
// the complete set of states
// one for the N+1 if continuum
void qSpace::dumpThatWave(qCx *wave, bool withExtras) {
	if (this->nPoints <= 0) throw "qSpace::dumpThatWave() with zero points";

	const qDimension *dims = this->dimensions;
	dumpWaveSegment(wave, dims->start, dims->end, dims->continuum, withExtras);
}

// any wave, probably shouldn't call this
void qWave::dumpThatWave(qCx *wave, bool withExtras) {
	printf("any wave, probably shouldn't call this\n");
	this->space->dumpThatWave(wave, withExtras);
}

// this is the member function that dumps its own wave and space
void qWave::dumpWave(const char *title, bool withExtras) {
	printf("\n==== Wave | %s ", title);
	this->space->dumpThatWave(this->wave, withExtras);
	printf("\n==== end of Wave ====\n\n");
}

/* ************************************************************ arithmetic */

// refresh the wraparound points for ANY WAVE subscribing to this space
// 'those' or 'that' means some wave other than this->wave
void qSpace::fixThoseBoundaries(qCx *wave) {
	if (this->nPoints <= 0) throw "qSpace::fixThoseBoundaries() with zero points";

	qDimension *dims = this->dimensions;
	switch (dims->continuum) {
	case contDISCRETE:
		break;

	case contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		wave[0] = qCx();
		wave[dims->end] = qCx();
		//printf("contWELL cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", dims->continuum,
		//wave[0].re, wave[0].im, wave[dims->end].re, wave[dims->end].im);
		break;

	case contENDLESS:
		//printf("Endless ye said: on the endless case, %d = %d, %d = %d\n", 0, dims->N, dims->end, 1 );
		// the points on the end get set to the opposite side
		wave[0] = wave[dims->N];
		wave[dims->end] = wave[1];
		//printf("contENDLESS cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", dims->continuum,
		//	wave[0].re, wave[0].im, wave[dims->end].re, wave[dims->end].im);
		break;
	}
}

// refresh the wraparound points on the ends of continuum dimensions
// from their counterpoints or zerro or whatever they get set to.
// 'those' or 'that' means some wave other than this->wave
void qWave::fixBoundaries(void) {
	this->space->fixThoseBoundaries(this->wave);
}

// calculate ⟨ψ | ψ⟩  'inner product'.  Non-visscher.
qReal qWave::innerProduct(void) {
	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;
	qReal sum = 0.;

	for (int ix = dims->start; ix < dims->end; ix++) {
		qCx point = wave[ix];
		qReal re = point.re;
		qReal im = point.im;
		sum += re * re + im * im;
		//sum += wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im;
// 		printf("innerProduct point %d (%lf,%lf) %lf\n", ix, wave[ix].re, wave[ix].im,
// 			wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im);
	}
	return sum;
}

// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current magnitude sum
void qWave::normalize(void) {
	// for visscher, we have to make it in a temp wave and copy back to our buffer
	// huh?  this is never copied back.  normalize here does nothing.
//	qCx tempWave[this->space->nPoints];
//	qWave tqWave(this->space, tempWave);
//	qWave *tempQWave = &tqWave;

	//qCx *wave = tempWave;
	//qWave *tempQWave = new qWave(this->space, tempWave);
	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;
	qReal mag = this->innerProduct();
	//printf("normalizing qWave.  magnitude=%lf", mag);
	//tempQWave->dumpWave("The wave,before normalize", true);

	if (mag == 0. || ! isfinite(mag)) {
		// ALL ZEROES!??! this is bogus, shouldn't be happening
		printf("ALL ZEROES ! ? ? ! not finite ! ? ? !  set them all to a constant, normalized\n");
		const qReal f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else {
		const qReal factor = pow(mag, -0.5);

		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] *= factor;
	}
	this->fixBoundaries();
	//this->dumpWave("qWave::normalize done", true);
	///this->space->visscherHalfStep(wave, this);
}

/* ************************************************* bad ideas I might revisit?  */

qReal cleanOneNumber(qReal u, int ix, int sense) {
	if (!isfinite(u)) {
		// just enough to be nonzero without affecting the balance
		printf("had to prune [%d]= %f\n", ix, u);
		qReal faker = sense ? 1e-9 :  -1e-9;
		return faker;
	}
	return u;
}

// look for NaNs and other foul numbers, and replace them with something .. better.
void qWave::prune() {
	printf("Do we really have to do this?  let's stop.\n");

	qDimension *dims = this->space->dimensions;
	qCx *wave = this->wave;
	for (int ix = dims->start; ix < dims->end; ix++) {
		wave[ix].re = cleanOneNumber(wave[ix].re, ix, ix & 1);
		wave[ix].im = cleanOneNumber(wave[ix].im, ix, ix & 2);
	}
}

#define LOW_PASS_WARMUP	20

// these have to be in C++ cuz they're called during iteration

// average the wave's points with the closest neighbors to fix the divergence
// along the x axis I always see.  Since the density of our mesh is finite,
// you can't expect noise at or near the nyquist frequency to be meaningful.
// dilution works like this: formerly 1/2, it's the fraction of the next point
// that comes from the avg of prevous points
// Changes the wave in-place
void qWave::lowPassFilter(double dilution) {
	double concentration = 1. - dilution;
	if (traceLowPassFilter) printf("qWave::lowPassFilter(%2.6lf)\n", dilution);


	if (!this->scratchBuffer)
		this->scratchBuffer = allocateWave();
	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;

	// not sure we need this this->prune();
	//this->fixBoundaries();

	qCx average;
	qCx temp;

	// warm it up, get the average like the end if wraps around
	average = qCx(0);
	if (dims->continuum) {
		for (int ix = dims->end - LOW_PASS_WARMUP; ix < dims->end; ix++)
			average = wave[ix] * dilution + average * concentration;
		if (traceLowPassFilter) printf("    quick prep for forward average: %lf %lf\n", average.re, average.im);

		////average /= concentration;  // do I need this?  not if normalized after this
	}

	// the length proper
	for (int ix = dims->start; ix < dims->end; ix++) {
		temp = wave[ix] * concentration + average * dilution;
		average = wave[ix] * dilution + average * concentration;

		if (traceLowPassFilter) printf("    lowPassBuffer %d forward run: %lf %lf\n", ix, temp.re, temp.im);
		this->scratchBuffer[ix] = temp;
	}

	// now in the other direction - reversed
	average = 0;
	// the first few points at the start
	if (dims->continuum) {
		for (int ix = dims->start + LOW_PASS_WARMUP; ix >= dims->start; ix--)
			average = wave[ix] * dilution + average * concentration;
		if (traceLowPassFilter) printf("    quick prep for reverse average: %lf %lf\n", average.re, average.im);

		////average /= concentration;  // do I need this?
	}

	// the length proper - remove the /2 if we normalize after this
	for (int ix = dims->end-1; ix >= dims->start; ix--) {
		temp = wave[ix] * concentration + average * dilution;
		average = wave[ix] * dilution + average * concentration;
		wave[ix] = (this->scratchBuffer[ix] + temp) / 2;
		if (traceLowPassFilter) printf("    lowPassBuffer %d reverse run: (%lf %lf)\n", ix, temp.re, temp.im);
	}

}

// this is kindof a notch filter for frequency N/2
void qWave::nyquistFilter(void) {
	if (traceLowPassFilter) printf("qWave::nyquistFilter()\n");

	if (!this->scratchBuffer)
		this->scratchBuffer = allocateWave();

	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;

	// not sure we need this this->prune();
	this->fixBoundaries();

	// this should zero out the nyquist frequency exactly
	for (int ix = dims->start; ix < dims->end; ix++) {
		this->scratchBuffer[ix] = (wave[ix] + wave[ix] - wave[ix-1] - wave[ix+1]) / 4.;
//		printf("%d scratchBuf=(%lf %lf) wave-1=(%lf %lf) wave0=(%lf %lf) wave+1=(%lf %lf)\n",
//		ix,
//		this->scratchBuffer[ix].re, this->scratchBuffer[ix].im,
//		wave[ix-1].re, wave[ix-1].im, wave[ix].re, wave[ix].im, wave[ix+1].re, wave[ix+1].im);
	}


	this->copyThatWave(this->wave, this->scratchBuffer);

//	this->dumpWave("after nyquist filter");
}

