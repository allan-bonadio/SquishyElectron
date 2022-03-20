/*
** quantum Wave -- quantum wave buffer
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


#include <cmath>
#include "qSpace.h"
#include "qWave.h"

// a transitional kind of thing from raw wave arrays to the new qWave buffer obj
class qWave *laosQWave = NULL, *peruQWave = NULL;
class qCx *laosWave = NULL, *peruWave = NULL;

int traceLowPassFilter = false;
int traceConstDeconst = false;

/* ************************************************************ birth & death & basics */

// This produces a wave ready to hold an electron
qWave::qWave(qSpace *space, qCx *useThisBuffer) {
	qBuffer();

	magic = 'qWav';

	if (traceConstDeconst) {
		printf("🌊🌊 qWave::qWave(%s)  utb=x%p => this=x%p\n", space->label,
			useThisBuffer, this);
		printf("🌊🌊 qWave::qWave() wave's Space: x%p  nPoints:%d\n", (space), space->nPoints);
		printf("      🌊🌊        qWave: x%p\n", (this));
	}

	this->space = space;
	initBuffer(space->freeBufferLength, useThisBuffer);

	if (traceConstDeconst)
		printf("      🌊🌊  allocated wave: x%p\n", (wave));
	qDimension *dim = space->dimensions;
	nPoints = dim->nPoints;
	start = dim->start;
	end = dim->end;

	if (traceConstDeconst) {
		printf("🌊🌊 allocated qWave::qWave resulting qWave obj: x%p   sizeof qWave = x%lx\n",
			this, (long) sizeof(qWave));
		printf("        sizeof(int):%ld   sizeof(void *):%ld\n", sizeof(int), sizeof(void *));
	}
}

qWave::~qWave(void) {
	// the qBuffer superclass frees the wave

	if (traceConstDeconst) {
		printf("🌊🌊 qWave::~qWave resulting qWave obj: x%p \n",
			this);
		printf("        sizeof(int):%ld   sizeof(void *):%ld\n", sizeof(int), sizeof(void *));
	}
}




/* never tested - might never work  */
void qWave::forEachPoint(void (*callback)(qCx, int) ) {
	qDimension *dims = space->dimensions;
	qCx *wave = wave;
	int end = dims->end + dims->start;
	for (int ix = 0; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) \n", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}
}

/* never tested - might never work   */
void qWave::forEachState(void (*callback)(qCx, int) ) {
	qDimension *dims = space->dimensions;
	int end = dims->end;
	qCx *wave = wave;
	for (int ix = dims->start; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) ", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}

}

/* ******************************************************** diagnostic dump **/
// only a wave knows how to traverse its states

// this is wave-independent.  This prints N+2 lines:
// one for the 0 element if it's a continuum
// the complete set of states
// one for the N+1 if continuum
void qSpace::dumpThatWave(qCx *wave, bool withExtras) {
	if (nPoints <= 0) throw "🌊🌊 qSpace::dumpThatWave() with zero points";

	const qDimension *dims = dimensions;
	qBuffer::dumpSegment(wave, withExtras, dims->start, dims->end, dims->continuum);
}

// any wave, probably shouldn't call this
void qWave::dumpThatWave(qCx *wave, bool withExtras) {
	//printf("🌊🌊 any wave, probably shouldn't call this\n");
	space->dumpThatWave(wave, withExtras);
}

// this is the member function that dumps its own wave and space
void qWave::dumpWave(const char *title, bool withExtras) {
	printf("\n🌊🌊 ==== Wave | %s ", title);
	space->dumpThatWave(wave, withExtras);
	printf("\n🌊🌊 ==== end of Wave ====\n\n");
}




/* ************************************************************ arithmetic */

// refresh the wraparound points for ANY WAVE subscribing to this space
// 'those' or 'that' means some wave other than this->wave
void qSpace::fixThoseBoundaries(qCx *wave) {
	if (nPoints <= 0) throw "🌊🌊 qSpace::fixThoseBoundaries() with zero points";

	qDimension *dims = dimensions;
	switch (dims->continuum) {
	case contDISCRETE:
		break;

	case contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		wave[0] = qCx();
		wave[dims->end] = qCx();
		//printf("🌊🌊 contWELL cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", dims->continuum,
		//wave[0].re, wave[0].im, wave[dims->end].re, wave[dims->end].im);
		break;

	case contENDLESS:
		//printf("🌊🌊 Endless ye said: on the endless case, %d = %d, %d = %d\n", 0, dims->N, dims->end, 1 );
		// the points on the end get set to the opposite side
		wave[0] = wave[dims->N];
		wave[dims->end] = wave[1];
		//printf("🌊🌊 contENDLESS cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", dims->continuum,
		//	wave[0].re, wave[0].im, wave[dims->end].re, wave[dims->end].im);
		break;
	}
}

// refresh the wraparound points on the ends of continuum dimensions
// from their counterpoints or zerro or whatever they get set to.
// 'those' or 'that' means some wave other than this->wave
void qWave::fixBoundaries(void) {
	space->fixThoseBoundaries(wave);
}

/* ************************************************* bad ideas I might revisit?  */

double cleanOneNumber(double u, int ix, int sense) {
	if (!isfinite(u)) {
		// just enough to be nonzero without affecting the balance
		printf("🌊🌊 had to prune [%d]= %f\n", ix, u);
		double faker = sense ? 1e-9 :  -1e-9;
		return faker;
	}
	return u;
}

// look for NaNs and other foul numbers, and replace them with something .. better.
void qWave::prune() {
	printf("🌊🌊 Do we really have to do this?  let's stop.\n");

	qDimension *dims = space->dimensions;
	qCx *wave = wave;
	for (int ix = dims->start; ix < dims->end; ix++) {
		wave[ix].re = cleanOneNumber(wave[ix].re, ix, ix & 1);
		wave[ix].im = cleanOneNumber(wave[ix].im, ix, ix & 2);
	}
}

#define LOW_PASS_WARMUP	20

// these have to be in C++ cuz they're called during iteration

// average the wave's points (by x) with the closest neighbors to fix the divergence
// along the x axis I always see.  Since the density of our mesh is finite,
// you can't expect noise at or near the nyquist frequency to be meaningful.
// dilution works like this: formerly 1/2, it's the fraction of the next point
// that comes from the avg of prevous points
// Changes the wave in-place
void qWave::lowPassFilter(double dilution) {
	double concentration = 1. - dilution;
	if (traceLowPassFilter) printf("🌊🌊 qWave::lowPassFilter(%2.6lf)\n", dilution);


	if (!scratchBuffer)
		scratchBuffer = allocateWave();
	qCx *wave = wave;
	qDimension *dims = space->dimensions;

	// not sure we need this prune();
	//fixBoundaries();

	qCx average;
	qCx temp;

	// warm it up, get the average like the end if wraps around
	average = qCx(0);
	if (dims->continuum) {
		for (int ix = dims->end - LOW_PASS_WARMUP; ix < dims->end; ix++)
			average = wave[ix] * dilution + average * concentration;
		if (traceLowPassFilter) printf("   🌊🌊  quick prep for forward average: %lf %lf\n", average.re, average.im);

		////average /= concentration;  // do I need this?  not if normalized after this
	}

	// the length proper
	for (int ix = dims->start; ix < dims->end; ix++) {
		temp = wave[ix] * concentration + average * dilution;
		average = wave[ix] * dilution + average * concentration;

		if (traceLowPassFilter) printf("   🌊🌊  lowPassBuffer %d forward run: %lf %lf\n", ix, temp.re, temp.im);
		scratchBuffer[ix] = temp;
	}

	// now in the other direction - reversed
	average = 0;
	// the first few points at the start
	if (dims->continuum) {
		for (int ix = dims->start + LOW_PASS_WARMUP; ix >= dims->start; ix--)
			average = wave[ix] * dilution + average * concentration;
		if (traceLowPassFilter) printf("   🌊🌊  quick prep for reverse average: %lf %lf\n", average.re, average.im);

		////average /= concentration;  // do I need this?
	}

	// the length proper - remove the /2 if we normalize after this
	for (int ix = dims->end-1; ix >= dims->start; ix--) {
		temp = wave[ix] * concentration + average * dilution;
		average = wave[ix] * dilution + average * concentration;
		wave[ix] = (scratchBuffer[ix] + temp) / 2;
		if (traceLowPassFilter) printf("    🌊🌊 lowPassBuffer %d reverse run: (%lf %lf)\n", ix, temp.re, temp.im);
	}

}

// this is kindof a notch filter for frequency N/2
void qWave::nyquistFilter(void) {
	if (traceLowPassFilter) printf("🌊🌊 qWave::nyquistFilter()\n");

	if (!scratchBuffer)
		scratchBuffer = allocateWave();  // this won't work if space changes resolution!

	qCx *wave = wave;
	qDimension *dims = space->dimensions;

	// not sure we need this prune();
	fixBoundaries();

	// this should zero out the nyquist frequency exactly
	for (int ix = dims->start; ix < dims->end; ix++) {
		scratchBuffer[ix] = (wave[ix] + wave[ix] - wave[ix-1] - wave[ix+1]) / 4.;

//		printf("🌊🌊 %d scratchBuf=(%lf %lf) wave-1=(%lf %lf) wave0=(%lf %lf) wave+1=(%lf %lf)\n",
//		ix,
//		scratchBuffer[ix].re, scratchBuffer[ix].im,
//		wave[ix-1].re, wave[ix-1].im, wave[ix].re, wave[ix].im, wave[ix+1].re, wave[ix+1].im);
	}


	copyThatWave(wave, scratchBuffer, nPoints);

//	dumpWave("after nyquist filter");
}

