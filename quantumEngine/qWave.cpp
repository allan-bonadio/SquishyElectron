/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"
#include <cmath>

/* ************************************************************ birth & death & basics */

// buffer is initialized to zero bytes therefore 0.0 everywhere
qWave::qWave(qSpace *space) {
	this->space = space;
	this->buffer = (qCx *) malloc(space->nPoints * sizeof(qCx));
}

qWave::~qWave() {
	printf("start the qWave instance destructor...\n");
	this->space = NULL;
	printf("    set space to null...\n");
	free(this->buffer);
	printf("    freed buffer...\n");
	this->buffer = NULL;
	printf("set buffer to null; done with qWave destructor...\n");
}

void qWave::forEachPoint(void (*callback)(qCx, int) ) {
	qDimension *dim = this->space->dimensions;
	qCx *wave = this->buffer;
	int end = dim->end + dim->start;
	for (int ix = 0; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) \n", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}
}

void qWave::forEachState(void (*callback)(qCx, int) ) {
	qDimension *dim = this->space->dimensions;
	qCx *wave = this->buffer;
	int end = dim->end;
	for (int ix = dim->start; ix < end; ix++) {
		//printf("\n[%d] ", ix);
		//printf("(%lf,%lf) ", wave[ix].re, wave[ix].im);
		callback(wave[ix], ix);
	}

}

// if it overflows the buffer, screw it.  just dump a row for a cx datapoint.
static void dumpRow(char *buf, int ix, qCx w, double *pPrevPhase, bool withExtras) {
	qReal re = w.re;
	qReal im = w.im;
	if (withExtras) {
		qReal mag = re * re + im * im;
		qReal phase = atan2(im, re) * 180 / PI;
		qReal dPhase = phase - *pPrevPhase + 360.;
		while (dPhase > 360.) dPhase -= 360.;

		sprintf(buf, "[%d] (%8.4lf,%8.4lf) | %8.2lf %8.2lf %8.4lf",
			ix, re, im, phase, dPhase, mag);
		*pPrevPhase = phase;
	}
	else {
		sprintf(buf,"[%d] (%8.4lf,%8.4lf)", ix, re, im);
	}
}

// NOT a member function; this is wave and space independent
static void dumpThatWave(qDimension *dim, qCx *wave, bool withExtras) {
	int ix;
	char buf[100];
	double prevPhase = 0.;

	// somehow, commenting out these lines fixes the nan problem.
	// but the nan problem doesn't happen on flores?
	if (dim->continuum) {
		dumpRow(buf, ix, wave[0], &prevPhase, withExtras);
		printf("%s", buf);
	}

	for (ix = dim->start; ix < dim->end; ix++) {
		dumpRow(buf, ix, wave[ix], &prevPhase, withExtras);
		printf("\n%s", buf);
	}

	if (dim->continuum) {
		dumpRow(buf, ix, wave[dim->end], &prevPhase, withExtras);
		printf("\nend %s", buf);
	}

	printf("\n");
}

// this is the member function that dumps its own wave and space
void qWave::dumpWave(const char *title, bool withExtras) {
	printf("\n== Wave | %s", title);
	dumpThatWave(this->space->dimensions, this->buffer, withExtras);
}

/* ************************************************************ arithmetic */

// refresh the wraparound points on the ends of continuum dimensions from their counterpoints
void qWave::fixBoundaries(void) {
	qDimension *dims = this->space->dimensions;
	qCx *wave = this->buffer;
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
	qDimension *dims = this->space->dimensions;
	qCx *wave = this->buffer;
	for (int ix = dims->start; ix < dims->end; ix++) {
		wave[ix].re = cleanOneNumber(wave[ix].re, ix, ix & 1);
		wave[ix].im = cleanOneNumber(wave[ix].im, ix, ix & 2);
	}
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

// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
void qWave::normalize(void) {
	qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;
	qReal mag = this->innerProduct();
	printf("normalizing.  iprod=%lf", mag);
	//this->dumpWave("The wave,before normalize", true);

	if (mag == 0.) {
		// ALL ZEROES!??! set them all to a constant, normalized
		printf("ALL ZEROES ! ? ? ! set them all to a constant, normalized\n");
		const qReal f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else if (! isfinite(mag)) {
		//
		printf("not finite ! ? ? ! set them all to a constant, normalized\n");
		const qReal f = 1e-9;
		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
	}
	else {
		mag = pow(mag, -0.5);

		for (int ix = dims->start; ix < dims->end; ix++)
			wave[ix] *= mag;
	}
	this->fixBoundaries();
	//printf("    normalizing.  new IP=%lf\n", this->space->innerProduct(wave));
	//this->dumpWave("The wave,after normalize", true);
}

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
	qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;
	int start = dims->start;
	int end = dims->end;
	qReal angle, dAngle = 2. * PI / dims->N * n;

	for (int ix = start; ix < end; ix++) {
		angle = dAngle * (ix - start);
		wave[ix] = qCx(cos(angle), sin(angle));

		// why do I have to do this to keep the numbers from being NAN?
		// either of these will fix it
//		printf("the circular wave: angle, magn, re, im: %lf %lf %lf %lf\n",
//			angle, wave[ix].re*wave[ix].re + wave[ix].im*wave[ix].im, wave[ix].re, wave[ix].im);
		//printf("setCircularWave: %lf %lf %lf\n", angle * 180./PI, cos(angle), sin(angle));
	}
	//dumpThatWave(dims, wave, true);
	this->normalize();
	this->dumpWave("after set sircular & normalize", true);
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
}

// widthFactor is fraction of total width the packet it is, 0.0-1.0, for a fraction of N.
// Cycles is how many circles (360°) it goes thru in that width.
void qWave::setPulseWave(qReal widthFactor, qReal cycles) {
	qCx *wave = this->buffer;
	qDimension *dims = this->space->dimensions;

	// start with a real wave
	this->setCircularWave(cycles / widthFactor);

	// modulate with a gaussian, centered at the peak, with stdDev like the real one within some factor
	int peak = lround(dims->N * widthFactor) % dims->N;  // ?? i dunno
	qReal stdDev = dims->N * widthFactor / 2.;  // ?? i'm making this up
	for (int ix = dims->start; ix < dims->end; ix++) {
		int del = ix - peak;
		wave[ix] *= exp(-del * del / stdDev);
	}

	theQWave->dumpWave("just did PulseWave", true);
	this->normalize();
	theQWave->dumpWave("normalized PulseWave", true);
}


/* ************************************************** exports to JS */
void qWave_dumpWave(char *title) { theQWave->dumpWave(title); }
void qWave_setCircularWave(qReal n) { theQWave->setCircularWave(n); }
void qWave_setStandingWave(qReal n) { theQWave->setStandingWave(n); }
void qWave_setPulseWave(qReal widthFactor, qReal cycles) { theQWave->setPulseWave(widthFactor, cycles);}

