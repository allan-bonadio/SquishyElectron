/*
** quantum Buffer -- basic buffer for waves or spectrums
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

/*
a long array of qCx complex numbers, plus some other info

Data structures used for these buffers:
qCx *wave  # wave: just an array of complex nums that's nPoints long
	In JS, it turns into a Float64Array with 2nPoints numbers
qBuffer - object, superclass of qWave and qSpectrum
qWave - object that owns a single wave, and points to its space
qSpectrum - object that owns a single qSpectrum, and points to its space
qFlick - object that owns a list of waves, and points to its space
	(not sure if i'll keep using qFlick)
*/


#include <cmath>
#include "qSpace.h"
#include "qWave.h"

static bool debugNormalize = false;
static bool debugAllocate = true;

// just allocate a wave of whatever length
// buffer is initialized to zero bytes therefore 0.0 everywhere
qCx *allocateWave(int nPoints) {
	qCx *buf = (qCx *) malloc(nPoints * sizeof(qCx));
	if (debugAllocate) {
		printf("🍕 allocateWave()  wave=x%p  nPoints: %d bytelength=x%lx\n",
			buf, nPoints, nPoints * sizeof(qCx));
	}
	return buf;
}

void freeWave(qCx *wave) {
	free(wave);
}

// make one, the right size for this buffer's space, or nPoints long
qCx *qBuffer::allocateWave(int nPoints) {
	if (nPoints < 0)
		nPoints = space->freeBufferLength;

	this->nPoints = nPoints;
	if (debugAllocate)
		printf("🍕 qBuffer::allocateWave this=x%p  wave=x%p  nPoints: %d   freeBufferLength: x%x\n",
			this, wave, nPoints, space->freeBufferLength);
	qCx *buf =  (qCx *) malloc(nPoints * sizeof(qCx));
	return buf;
}



// create one, dynamically allocated or Bring Your Own Buffer to use
qBuffer::qBuffer(void) {
	magic = 'qBuf';
}

// actually create the buffer that we need
// usually called by subclass constructors when they figure out how long a buffer is needed
void qBuffer::initBuffer(qCx *useThisBuffer) {
	if (useThisBuffer) {
		wave = useThisBuffer;
		dynamicallyAllocated = false;
	}
	else {
		// borrow will allocate if nothing in the freelist
		//wave = space->borrowBuffer();

		wave = allocateWave(space->freeBufferLength);
		dynamicallyAllocated = true;
	}
	start = end = -1;  // wave / spectrum calculates these differently
	nPoints = space->freeBufferLength;  // wave / spectrum calculates these differently
	if (debugAllocate) {
		printf("🍕 qBuffer::initBuffer this=x%p  wave=x%p  nPoints: %d\n",
			this, wave, nPoints);
	}
}

qBuffer::~qBuffer() {
	if (debugAllocate)
		printf("🍕  start the qBuffer instance destructor...\n");
	if (dynamicallyAllocated) {
		freeWave(wave);

		//space->returnBuffer(wave);
		if (debugAllocate) printf("   🍕  freed buffer...\n");
	}

	space = NULL;
	if (debugAllocate) printf("   🍕  setted buffer to null; done with qBuffer destructor.\n");

}



void qBuffer::copyThatWave(qCx *dest, qCx *src, int length) {
//	printf("🍕 qWave::copyThatWave(%d <== %d)\n", (int) dest, (int) src);
	if (!dest) dest = wave;
	if (!src) src = wave;
	if (length < 0)
		length = nPoints;
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
	printf("qBuffer::dumpSegment(x%p, %s)\n", wave, withExtras ? "with extras" : "without extras");
	printf("      start:%d  end:%d  continuum: %d\n", start, end, continuum);

	if (start >= end)
		throw "qBuffer::dumpSegment() start >= end";

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

	printf("    inner product=%11.8lf\n", innerProd);
}


/* ************************************************************ arithmetic */
// these are operations that are useful and analogous for both Waves and Spectrums

// only does somethign for qWaves; and then only if continuum is true
void qBuffer::fixBoundaries(void) {
}



// calculate ⟨ψ | ψ⟩  'inner product'.  Non-visscher.
double qBuffer::innerProduct(void) {
	qCx *wave = this->wave;
	qDimension *dims = space->dimensions;
	double sum = 0.;

	for (int ix = start; ix < end; ix++) {
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



// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current magnitude sum.
// BUffer must be installed as well as nPoints, start and end
void qBuffer::normalize(void) {
	// for visscher, we have to make it in a temp wave and copy back to our buffer
	// huh?  this is never copied back.  normalize here does nothing.
//	qCx tempWave[space->nPoints];
//	qWave tqWave(space, tempWave);
//	qWave *tempQWave = &tqWave;

	//qCx *wave = tempWave;
	//qWave *tempQWave = qWave::newQWave(space, tempWave);
	qCx *wave = this->wave;
	qDimension *dims = space->dimensions;
	double mag = innerProduct();
	if (debugNormalize)
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
		if (debugNormalize)
			printf("🍕 normalizing qBuffer.  factor=%lf, start=%d, end=%d, N=%d\n",
			factor, dims->start, dims->end, dims->N);

		for (int ix = dims->start; ix < dims->end; ix++) {
			wave[ix] *= factor;
			if (((uintptr_t) qViewBuffer_getViewBuffer()) & 3) {
				printf("🍕 getViewBuffer() is odd: x%p at ix=%d\n",
					qViewBuffer_getViewBuffer(), ix);
			}
		}
	}
	fixBoundaries();
	//dumpWave("qWave::normalize done", true);
	///space->visscherHalfStep(wave, this);
}


