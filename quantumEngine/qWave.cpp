/*
** q Wave -- quantum wave buffer
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

#include "qSpace.h"
#include <cmath>

// a transitional kind of thing from raw wave arrays to the new qWave buffer obj
class qWave *theQWave = NULL,
	*k1QWave = NULL, *k2QWave = NULL, *k3QWave = NULL, *k4QWave = NULL,
	*egyptQWave = NULL, *laosQWave = NULL, *peruQWave = NULL;
class qCx *theWave = NULL,
	*k1Wave = NULL, *k2Wave = NULL, *k3Wave = NULL, *k4Wave = NULL,
	*egyptWave = NULL, *laosWave = NULL, *peruWave = NULL;

/* ************************************************************ birth & death & basics */

// buffer is initialized to zero bytes therefore 0.0 everywhere
qWave::qWave(qSpace *space) {
	this->space = space;
	this->buffer = this->allocateWave();
	this->dynamicallyAllocated = 1;
}

qWave::qWave(qSpace *space, qCx *buffer) {
	this->space = space;
	this->buffer = buffer;
	this->dynamicallyAllocated = 0;
}

qWave::~qWave() {
	printf("start the qWave instance destructor...\n");
	this->space = NULL;
	printf("    set space to null...\n");

	if (this->dynamicallyAllocated)
		this->freeWave(this->buffer);
	printf("    freed buffer...\n");

	printf("setted buffer to null; done with qWave destructor.\n");
}

qCx *qWave::allocateWave(void) {
	return (qCx *) malloc(this->space->nPoints * sizeof(qCx));
}

void qWave::freeWave(qCx *wave) {
	free(wave);
}

void qWave::copyWave(qCx *dest, qCx *src) {
	if (!dest) dest = this->buffer;
	if (!src) src = this->buffer;
	memcpy(dest, src, this->space->nPoints * sizeof(qCx));
}

/* never tested - might never work under visscher */
void qWave::forEachPoint(void (*callback)(qCx, int) ) {
	qDimension *dims = this->space->dimensions;
	qCx *wave = this->buffer;
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
	qCx *wave = this->buffer;
	for (int ix = dims->start; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) ", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}

}

/* ******************************************************** diagnostic dump **/

// print one complex number, plus maybe some more, on a line in the dump on stdout.
// if it overflows the buffer, it won't.  just dump a row for a cx datapoint.
static void dumpRow(char *buf, int ix, qCx w, double *pPrevPhase, bool withExtras) {
	qReal re = w.re;
	qReal im = w.im;
	if (withExtras) {
		qReal mag = re * re + im * im;
		qReal phase = atan2(im, re) * 180 / PI;  // pos or neg
		qReal dPhase = phase - *pPrevPhase + 360.;  // so now its positive, right?
		while (dPhase >= 360.) dPhase -= 360.;

		sprintf(buf, "[%d] (%8.4lf,%8.4lf) | %8.2lf %8.2lf %8.4lf",
			ix, re, im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		sprintf(buf,"[%d] (%8.4lf,%8.4lf)", ix, re, im);
	}
}

// this is wave-independent.  This prints N+2 lines:
// one for the 0 element if it's a continuum
// the complete set of states
// one for the N+1 if continuum
void qSpace::dumpThatWave(qCx *wave, bool withExtras) {
	const qDimension *dims = this->dimensions;
	int ix = 0;
	char buf[200];
	double prevPhase = 0.;

	// somehow, commenting out these lines fixes the nan problem.
	// but the nan problem doesn't happen on flores?
	// i haven't seen the nan problem since like a month ago.  ab 2021-08-25
	if (dims->continuum) {
		dumpRow(buf, ix, wave[0], &prevPhase, withExtras);
		printf("%s", buf);
	}

	for (ix = dims->start; ix < dims->end; ix++) {
		dumpRow(buf, ix, wave[ix], &prevPhase, withExtras);
		printf("\n%s", buf);
	}

	if (dims->continuum) {
		dumpRow(buf, ix, wave[dims->end], &prevPhase, withExtras);
		printf("\nend %s", buf);
	}

	printf("\n");
}

// any wave
void qWave::dumpThatWave(qCx *wave, bool withExtras) {
	this->space->dumpThatWave(wave, withExtras);
}

// this is the member function that dumps its own wave and space
void qWave::dumpWave(const char *title, bool withExtras) {
	printf("\n== Wave | %s", title);
	this->space->dumpThatWave(this->buffer, withExtras);
}

/* ************************************************************ arithmetic */

// refresh the wraparound points for ANY WAVE subscribing to this space
void qSpace::fixThoseBoundaries(qCx *wave) {
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
void qWave::fixBoundaries(void) {
	this->space->fixThoseBoundaries(this->buffer);
}

// calculate ⟨ψ | ψ⟩  'inner product'
qReal qWave::innerProduct(void) {
	qCx *wave = this->buffer;
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
	qCx tempWave[this->space->nPoints];
	qWave tqWave(this->space, tempWave);
	qWave *tempQWave = &tqWave;
	//qCx *wave = tempWave;
	//qWave *tempQWave = new qWave(this->space, tempWave);
	//qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;
	qReal mag = this->innerProduct();
	printf("normalizing.  magnitude=%lf", mag);
	tempQWave->dumpWave("The wave,before normalize", true);

	if (mag == 0.) {
		// ALL ZEROES!??! this is bogus, shouldn't be happening
		printf("ALL ZEROES ! ? ? ! set them all to a constant, normalized\n");
		const qReal f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			tempWave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else if (! isfinite(mag)) {
		//
		printf("not finite ! ? ? ! set them all to a constant, normalized\n");
		const qReal f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			tempWave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else {
		const qReal factor = pow(mag, -0.5);

		for (int ix = dims->start; ix < dims->end; ix++)
			tempWave[ix] *= factor;
	}
	tempQWave->fixBoundaries();
	tempQWave->dumpWave("qWave::normalize done", true);
	///tempQWave->space->visscherHalfStep(tempQWave, this);
	//this->dumpWave("this wave,after visscher ½", true);
	//this->fixBoundaries();
	//printf("    normalizing.  new IP=%lf\n", this->space->innerProduct(wave));
	//this->dumpWave("The wave,after normalize", true);
}

/* ********************************************************** bad ideas */

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
	qCx *wave = this->buffer;
	for (int ix = dims->start; ix < dims->end; ix++) {
		wave[ix].re = cleanOneNumber(wave[ix].re, ix, ix & 1);
		wave[ix].im = cleanOneNumber(wave[ix].im, ix, ix & 2);
	}
}

// possibly obsolete if we use visscher
// average the wave's points with the two closest neighbors to fix the divergence
// along the x axis I always see.  Since the density of our mesh is finite,
// you can't expect noise at or near the frequency of the mesh to be meaningful.
// dilution works like this: formerly 1/2, it's the fraction of the next point
// that comes from the avg of the two neighboring points.
// Changes the wave in-place
void qWave::lowPassFilter(double dilution) {
	printf("qWave::lowPassFilter(%5.3lf)\n", dilution);
	qCx *wave = this->buffer;
	qCx avg, d2prev = wave[0];
	qDimension *dims = this->space->dimensions;

	// not sure we need this this->prune();
	this->fixBoundaries();

	// average each point with the neighbors; ¼ for each neightbor, ½ for the point itself
	// drag your feet on setting the new value in so it doesn't interfere
	double concentration = 1. - dilution;
	for (int ix = dims->start; ix < dims->end; ix++) {
		avg = (wave[ix-1] + wave[ix+1]) * dilution +  wave[ix] * concentration;
		// printf("filtering %d  d2prev=(%lf,%lf)  avg=(%lf,%lf)",
		// 	ix, d2prev.re, d2prev.im, avg.re, avg.im);

		// put new number back, etcept one point behind so you don't need a separate buffer
		wave[ix-1] = d2prev;
		d2prev = avg;
		//this->dumpWave("low pass filtering", true);
	}
	wave[dims->N] = d2prev;
}


/* ********************************************************** populate wave */

// n is  number of cycles all the way across N points.
// n 'should' be an integer to make it meet up on ends if wraparound
// pass negative to make it go backward.
// the first point here is like x=0 as far as the trig functions, and the last like x=-1
void qWave::setCircularWave(qReal n) {
	qCx tempWave[this->space->nPoints];
	qWave tqWave(this->space, tempWave);
	qWave *tempQWave = &tqWave;

	this->dumpWave("before set sircular & normalize", true);
	qCx *wave = tempWave;
	//qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;
	int start = dims->start;
	int end = dims->end;
	qReal angle, dAngle = 2. * PI / dims->N * n;

	// visscher gap.How much angle would the Im component go in dt/2?
	// I have no idea.
	qReal vGap = this->space->algorithm == algVISSCHER ? dAngle / 4 : 0;

	for (int ix = start; ix < end; ix++) {
		angle = dAngle * (ix - start);
		wave[ix] = qCx(cos(angle), sin(angle + vGap));
	}
	printf("wave, freshly generated, before halfstep");
	this->fixBoundaries();
	this->dumpThatWave(wave, true);

	// ?????!?!??!
	if (this->space->algorithm == algVISSCHER) {
		tempQWave->copyWave(this->buffer, tempQWave->buffer);
		//this->space->visscherHalfStep(tempQWave, this);
		this->dumpWave("after set sircular & normalize", true);
		this->normalize();
	}
	else {
		tempQWave->copyWave(this->buffer, tempQWave->buffer);
		this->normalize();
	}
	this->dumpWave("after set sircular & normalize", true);

	updateViewBuffer(this);
}

// make a superposition of two waves in opposite directions.
// n 'should' be an integer to make it meet up on ends if wraparound
// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
// pass negative to make it upside down.
void qWave::setStandingWave(qReal n) {
	qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;

	int start = dims->start, end = dims->end, N = dims->N;
	if (dims->continuum == contWELL) {
		start--;
		end++;
		N += 2;
	}

	qReal dAngle = PI / N * n;
	for (int ix = start; ix < end; ix++) {
		wave[ix] = qCx(sin(dAngle * (ix - start)));
	}
	this->normalize();
	this->dumpWave("after set standing & normalize", true);

	updateViewBuffer(this);
}

// widthFactor is fraction of total width the packet it is, 0.0-1.0, for a fraction of N.
// Cycles is how many circles (360°) it goes thru in that width.
void qWave::setPulseWave(qReal widthFactor, qReal cycles) {
	qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;

	// start with a real wave
	this->setCircularWave(cycles / widthFactor);

	// modulate with a gaussian, centered at the peak, with stdDev
	// like the real one within some factor
	int peak = lround(dims->N * widthFactor) % dims->N;  // ?? i dunno
	qReal stdDev = dims->N * widthFactor / 2.;  // ?? i'm making this up
	for (int ix = dims->start; ix < dims->end; ix++) {
		int del = ix - peak;
		wave[ix] *= exp(-del * del / stdDev);
	}

	theQWave->dumpWave("just did PulseWave", true);
	this->normalize();
	theQWave->dumpWave("normalized PulseWave", true);

	updateViewBuffer(this);
}


/* ************************************************** exports to JS */
void qWave_dumpWave(char *title) { theQWave->dumpWave(title); }
void qWave_setCircularWave(qReal n) { theQWave->setCircularWave(n); }
void qWave_setStandingWave(qReal n) { theQWave->setStandingWave(n); }
void qWave_setPulseWave(qReal widthFactor, qReal cycles) { theQWave->setPulseWave(widthFactor, cycles);}

