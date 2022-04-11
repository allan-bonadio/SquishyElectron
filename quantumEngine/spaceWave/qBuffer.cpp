/*
** quantum Buffer -- basic buffer for waves or spectrums
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include <cstring>

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

#include "../squish.h"
//#include <stdexcept>
//#include <cmath>
#include "qSpace.h"
#include "qWave.h"

static bool traceNormalize = false;
static bool traceAllocate = false;

// just allocate a wave of whatever length
// buffer is (often but ? reliably) initialized to zero bytes therefore 0.0 everywhere
qCx *allocateWave(int nPoints) {
	qCx *buf = (qCx *) malloc(nPoints * sizeof(qCx));
	if (traceAllocate) {
		printf("🍕 allocateWave()  wave=%p  nPoints: %d bytelength=x%lx\n",
			buf, nPoints, nPoints * sizeof(qCx));
	}
	return buf;
}

void freeWave(qCx *wave) {
	if (traceAllocate) {
		// we don't know the length here, but you can search for the pointer value
		printf("🍕 freeWave()  wave=%p \n", wave);
	}
	free(wave);
}

// make one, the right size for this buffer's space, or nPoints long if no space
qCx *qBuffer::allocateWave(int nPoints) {
	if (((long) space) & 0xFFFFFFFe00000000) nPoints = space->nPoints;  // crash me
	if (nPoints <= 0) {
		if (space)
			nPoints = space->freeBufferLength;
		else
			throw std::runtime_error("qBuffer::allocateWave() - no nPoints and no space");
	}

	// ?? this is weird  this->nPoints = nPoints;
	if (traceAllocate)
		printf("🍕 qBuffer::allocateWave this=%p  wave=%p  nPoints: %d\n",
			this, wave, nPoints);
	qCx *buf =  (qCx *) malloc(nPoints * sizeof(qCx));
	return buf;
}



// create one
qBuffer::qBuffer(void) {
	magic = 'qBuf';
	wave = NULL;
	space = NULL;
}

// actually create the buffer that we need
// dynamically allocated or Bring Your Own Buffer to use
// usually called by subclass constructors when they figure out how long a buffer is needed
// length is in units of qComplex (16 by)
void qBuffer::initBuffer(int length, qCx *useThisBuffer) {
	if (useThisBuffer) {
		wave = useThisBuffer;
		dynamicallyAllocated = false;
	}
	else {
		// borrow will allocate if nothing in the freelist
		//wave = space->borrowBuffer();

		wave = allocateWave(length);
		dynamicallyAllocated = true;
	}
	start = end = -1;  // wave / spectrum calculates these differently
	continuum = -1;
	nPoints = length;
	space = NULL;  // subclasses will fill it in if needed

	if (traceAllocate) {
		printf("🍕 qBuffer::initBuffer this=%p  wave=%p  nPoints: %d\n",
			this, wave, nPoints);
	}
}

qBuffer::~qBuffer() {
	if (traceAllocate)
		printf("🍕  start the qBuffer instance destructor...space=%p\n", space);
//	if (space && (qSpace *) 0xcdcdcdcdcdcdcdcd != space)
//		printf("🧨 🧨    start of qBuffer::~qBuffer, %s:%d  freeBufferList=%p  qBuf=%p\n",
//			__FILE__, __LINE__, space->freeBufferList, this);
//	if (space)
//		printf("🧨 🧨    start of qBuffer::~qBuffer, %s:%d  freeBufferList=%p  qBuf=%p\n",
//			__FILE__, __LINE__, space->freeBufferList, this);
	if (dynamicallyAllocated) {
		freeWave(wave);

//		printf("🧨 🧨     qBuffer::~qBuffer just after freeWave, %s:%d  space=%p freeBufferList=%p\n",
//		__FILE__, __LINE__, space, ((space && (qSpace *) 0xcdcdcdcdcdcdcdcd != space)) ? space->freeBufferList : (FreeBuffer *) 0x99);


		//space->returnBuffer(wave);
//		printf("   🍕  freed buffer...\n");
	}

	space = NULL;
	//wave = NULL;
	if (traceAllocate) printf("   🍕  setted buffer to null; done with qBuffer destructor.\n");

	if (space) {
		// ahem we just set space to null...
		printf("🧨 🧨    end of qBuffer::~qBuffer, %s:%d  freeBufferList=%p\n",
			__FILE__, __LINE__, space->freeBufferList);
	}
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
		snprintf(buf, 200, "[%d] (%8.4lf,%8.4lf) | %8.3lf %8.3lf %8.4lf",
			ix, re, im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		snprintf(buf,200, "[%d] (%8.4lf,%8.4lf)", ix, re, im);
	}
	return mag;
}

// you can use this on waves or spectrums; for the latter, leave off the start and the rest
void qBuffer::dumpSegment(qCx *wave, bool withExtras, int start, int end, int continuum) {
	//printf("qBuffer::dumpSegment(%p, %s)\n", wave, withExtras ? "with extras" : "without extras");
	//printf("      start:%d  end:%d  continuum: %d\n", start, end, continuum);

	if (start >= end)
		throw std::runtime_error("qBuffer::dumpSegment() start >= end");

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

// this is more for visscher steps to remember the floats
void qBuffer::dumpHiRes(const char *title) {
	printf("🍕 🍕  HIRES %s: s=%d e=%d continuum:%d nPoints:%d\n", title, start, end, continuum, nPoints);
	for (int ix = 0; ix < nPoints; ix++) {
		printf("🍕 [%d]  %18.12lf, %18.12lf\n", ix, wave[ix].re, wave[ix].im);
	}
}


/* ************************************************************ arithmetic */
// these are operations that are useful and analogous for both Waves and Spectrums

// refresh the wraparound points for ANY WAVE subscribing to this space
// 'those' or 'that' means some wave other than this->wave
static void fixSomeBoundaries(qCx *wave, int continuum, int start, int end) {
	if (end <= 0) throw std::runtime_error("🌊🌊 fixSomeBoundaries() with zero points");

	switch (continuum) {
	case contDISCRETE:
		break;

	case contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		wave[0] = qCx();
		wave[end] = qCx();
		//printf("🌊🌊 contWELL cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", continuum,
		//wave[0].re, wave[0].im, wave[end].re, wave[end].im);
		break;

	case contENDLESS:
		//printf("🌊🌊 Endless ye said: on the endless case, %d = %d, %d = %d\n", 0, N, end, 1 );
		// the points on the end get set to the opposite side
		wave[0] = wave[end-1];
		wave[end] = wave[1];
		//printf("🌊🌊 contENDLESS cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", continuum,
		//	wave[0].re, wave[0].im, wave[end].re, wave[end].im);
		break;
	}
}

void qBuffer::fixThoseBoundaries(qCx *targetWave) {
	if (!targetWave)
		targetWave = wave;
	fixSomeBoundaries(targetWave, continuum, start, end);
}

void qSpace::fixThoseBoundaries(qCx *targetWave) {
	qDimension *dims = dimensions;
	fixSomeBoundaries(targetWave, dims->continuum, dims->start, dims->end);
}


// calculate ⟨𝜓 | 𝜓⟩  'inner product'.  Non-visscher.
double qBuffer::innerProduct(void) {
	qCx *wave = this->wave;
	double sum = 0.;

	for (int ix = start; ix < end; ix++) {
		qCx point = wave[ix];
		sum += point.norm();

//		double re = point.re;
//		double im = point.im;
//		sum += re * re + im * im;

		//sum += wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im;
// 		printf("innerProduct point %d (%lf,%lf) %lf\n", ix, wave[ix].re, wave[ix].im,
// 			wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im);
	}
	return sum;
}



// enforce ⟨𝜓 | 𝜓⟩ = 1 by dividing out the current magnitude sum.
// BUffer must be installed as well as nPoints, start and end
void qBuffer::normalize(void) {
	// for visscher, we have to make it in a temp wave and copy back to our buffer
	// huh?  this is never copied back.  normalize here does nothing.
//	qCx tempWave[space->nPoints];
//	qWave tqWave(space, tempWave);
//	qWave *tempQWave = &tqWave;

	//qCx *wave = tempWave;
	//qWave *tempQWave = qWave::newQWave(space, tempWave);
	//qCx *wave = this->wave;
	//qDimension *dims = space->dimensions;
	double mag = innerProduct();
	if (traceNormalize)
		printf("🍕 normalizing qBuffer.  magnitude=%lf\n", mag);
	//tempQWave->dumpWave("The wave,before normalize", true);

	if (mag == 0. || ! isfinite(mag)) {
		// ALL ZEROES!??! this is bogus, shouldn't be happening
		const double factor = pow(end - start, -0.5);
		printf("🍕 🍕 🍕 🍕 🍕 🍕 ALL ZEROES ! ? ? ! not finite ! ? ? !  set them all to a constant, normalized\n");
		for (int ix = start; ix < end; ix++)
			wave[ix] = factor;
	}
	else {
		const double factor = pow(mag, -0.5);
		if (traceNormalize) {
			printf("🍕 normalizing qBuffer.  factor=%lf, start=%d, end=%d, N=%d\n",
			factor, start, end, end - start);
		}

		for (int ix = start; ix < end; ix++)
			wave[ix] *= factor;
	}
	fixBoundaries();
	//dumpWave("qWave::normalize done", true);
	///space->visscherHalfStep(wave, this);
}


