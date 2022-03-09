/*
** quantum Buffer -- basic buffer for waves or spectrums
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

/*
a long array of qCx complex numbers, plus some other info

Data structures used for these buffers:
qCx *wave  # wave: just an array of complex nums that's nPoints long
qBuffer - object, superclass of qWave and qSpectrum
qWave - object that owns a single wave, and points to its space
qSpectrum - object that owns a single qSpectrum, and points to its space
qFlick - object that owns a list of waves, and points to its space (not sure if i'll keep usin tat)
*/


#include <cmath>
#include "qSpace.h"
#include "qWave.h"

// just allocate a wave of whatever length
// buffer is initialized to zero bytes therefore 0.0 everywhere
qCx *allocateWave(int nPoints) {
	return (qCx *) malloc(nPoints * sizeof(qCx));
}

void freeWave(qCx *wave) {
	free(wave);
}

// make one, the right size for this buffer's space, or nPoints long
qCx *qBuffer::allocateWave(int nPoints) {
	if (nPoints < 0)
		nPoints = this->space->freeBufferListLength;
	return (qCx *) malloc(nPoints * sizeof(qCx));
	this->nPoints = nPoints;
}



// create one, dynamically allocated or Bring Your Own Buffer to use
qBuffer::qBuffer(void) {
}

// actually create the buffer that we need
// usually called by subclasses when they figure out how long a buffer is needed
void qBuffer::initBuffer(qCx *useThisBuffer) {
	if (useThisBuffer) {
		this->wave = useThisBuffer;
		this->dynamicallyAllocated = 0;
	}
	else {
		this->wave = this->space->borrowBuffer();
		this->dynamicallyAllocated = 1;
	}
	this->nPoints = this->start = this->end = -1;  // wave / spectrum calculates these differently
	printf("🍕 qBuffer::initBuffer this=%x  wave=%x  nPoints: %d\n",
		(uint32_t) this, (uint32_t) this->wave, nPoints);
}

qBuffer::~qBuffer() {
	printf("🍕  start the qBuffer instance destructor...\n");
	if (this->dynamicallyAllocated) {
		this->space->returnBuffer(this->wave);
		printf("   🍕  freed buffer...\n");
	}

	this->space = NULL;
	printf("   🍕  setted buffer to null; done with qBuffer destructor.\n");

}



void qBuffer::copyThatWave(qCx *dest, qCx *src, int length) {
//	printf("🍕 qWave::copyThatWave(%d <== %d)\n", (int) dest, (int) src);
	if (!dest) dest = this->wave;
	if (!src) src = this->wave;
	if (length < 0)
		length = this->nPoints;
	memcpy(dest, src, length * sizeof(qCx));
}


/* ******************************************************** diagnostic dump **/

// print one complex number, plus maybe some more calculated metrics for that point, on a line in the dump on stdout.
// if it overflows the buffer, it won't.  just dump a row for a cx datapoint.
// returns the magnitude non-visscher, but only withExtras
double qBuffer::dumpRow(char buf[200], int ix, qCx w, double *pPrevPhase, bool withExtras) {
	double re = w.re;
	double im = w.im;
	double mag = 0;
	if (withExtras) {
		mag = re * re + im * im;

		// if re and im are zero (or close) then the angle is undefined.  Use NaN.
		double phase = NAN;
		if (abs(im) + abs(re) > 1e-9)
			phase = atan2(im, re) * 180. / PI;  // pos or neg OR NAN

		double dPhase = phase - *pPrevPhase + 360.;  // so now its positive, right?
		if (dPhase >= 360.) dPhase -= 360.;

		// if this or the previous point was (0,0) then the phase and dPhase will be NAN, and they print that way
		sprintf(buf, "[%d] (%8.4lf,%8.4lf) | %8.3lf %8.3lf %8.4lf",
			ix, re, im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		sprintf(buf,"[%d] (%8.4lf,%8.4lf)", ix, re, im);
	}
	return mag;
}

// you can use this on waves or spectrums; for the latter, leave off the start and the rest
void qBuffer::dumpSegment(qCx *wave, bool withExtras, int start, int end, int continuum) {

	int ix = 0;
	char buf[200];
	double prevPhase = 0.;
	double innerProd = 0.;

	// somehow, commenting out these lines fixes the nan problem.
	// but the nan problem doesn't happen on flores?
	// i haven't seen the nan problem since like a month ago.  ab 2021-08-25
	if (continuum) {
		qBuffer::dumpRow(buf, ix, wave[0], &prevPhase, withExtras);
		printf("%s", buf);
	}

	for (ix = start; ix < end; ix++) {
		innerProd += qBuffer::dumpRow(buf, ix, wave[ix], &prevPhase, withExtras);
		printf("\n%s", buf);
	}

	if (continuum) {
		qBuffer::dumpRow(buf, ix, wave[end], &prevPhase, withExtras);
		printf("\nend %s", buf);
	}

	printf(" innerProd=%11.8lf\n", innerProd);
}


/* ************************************************************ arithmetic */
// these are operations that are useful and analogous for both Waves and Spectrums

// only does somethign for qWaves; and then only if continuum is true
void qBuffer::fixBoundaries(void) {
}



// calculate ⟨ψ | ψ⟩  'inner product'.  Non-visscher.
double qBuffer::innerProduct(void) {
	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;
	double sum = 0.;

	for (int ix = this->start; ix < this->end; ix++) {
		qCx point = wave[ix];
		double re = point.re;
		double im = point.im;
		sum += re * re + im * im;
		//sum += wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im;
// 		printf("innerProduct point %d (%lf,%lf) %lf\n", ix, wave[ix].re, wave[ix].im,
// 			wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im);
	}
	return sum;
}



// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current magnitude sum
void qBuffer::normalize(void) {
	// for visscher, we have to make it in a temp wave and copy back to our buffer
	// huh?  this is never copied back.  normalize here does nothing.
//	qCx tempWave[this->space->nPoints];
//	qWave tqWave(this->space, tempWave);
//	qWave *tempQWave = &tqWave;

	//qCx *wave = tempWave;
	//qWave *tempQWave = qWave::newQWave(this->space, tempWave);
	qCx *wave = this->wave;
	qDimension *dims = this->space->dimensions;
	double mag = this->innerProduct();
	printf("🍕 normalizing qBuffer.  magnitude=%lf\n", mag);
	//tempQWave->dumpWave("The wave,before normalize", true);

	if (mag == 0. || ! isfinite(mag)) {
		// ALL ZEROES!??! this is bogus, shouldn't be happening
		printf("🍕 ALL ZEROES ! ? ? ! not finite ! ? ? !  set them all to a constant, normalized\n");
		const double f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else {
		const double factor = pow(mag, -0.5);
		printf("🍕 normalizing qBuffer.  factor=%lf, start=%d, end=%d, N=%d\n",
			factor, dims->start, dims->end, dims->N);

		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] *= factor;
	}
	this->fixBoundaries();
	//this->dumpWave("qWave::normalize done", true);
	///this->space->visscherHalfStep(wave, this);
}


