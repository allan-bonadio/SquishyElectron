#include "qSpace.h"
#include <cmath>

class qSpace *theSpace = NULL;
class qCx *theWave = NULL, *tempWave = NULL, *nextWave = NULL;
qReal *thePotential = NULL;
qReal elapsedTime = 0;


static int dimsSoFar;

extern "C" {

// call this to throw away existing space and wave, and start new
int32_t startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		delete theSpace;
		delete[] theWave;
		delete[] tempWave;
		delete[] nextWave;
		delete[] thePotential;
	}
	elapsedTime = 0;

	dimsSoFar = 0;
	theSpace = new qSpace();
	//printf("  done startNewSpace()\n");

	return true;
}

// call this from JS to add one or more dimensions
int32_t addSpaceDimension(int32_t N, int32_t continuum, const char *label) {
	//printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);

	qDimension *dim = theSpace->dimensions + dimsSoFar;
	dim->N = N;
	dim->continuum = continuum;

	dim->continuum = continuum;
	if (continuum) {
		dim->start = 1;
		dim->end = N + 1;
	}
	else {
		dim->start = 0;
		dim->end = N;
	}

	strncpy(dim->label, label, LABEL_LEN-1);

	dimsSoFar++;
	//printf("  done addSpaceDimension() %s\n", dim->label);
	return true;
}

// call this from JS to finish the process
int32_t completeNewSpace(void) {
	//printf("completeNewSpace()\n");
	int32_t ix;
	int32_t nPoints = 1, nStates = 1;

	theSpace->nDimensions = dimsSoFar;

	// finish up all the dimensions now that we know them all
	for (ix = dimsSoFar-1; ix >= 0; ix--) {
		qDimension *dim = theSpace->dimensions + ix;

		nStates *= dim->N;
		dim->nStates = nStates;
		nPoints *= dim->start + dim->end;
		dim->nPoints = nPoints;
	}

	//  allocate the buffers
	theWave = new qCx[nPoints];
	tempWave = new qCx[nPoints];
	nextWave = new qCx[nPoints];
	theSpace->dimensions->setCircularWave(theWave, 1);
	//theSpace->dumpWave("freshly created");

	thePotential = new qReal[nPoints];
	//theSpace->dumpPotential("freshly created");

	//printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
	//printf("  dimension N=%d  extraN=%d  continuum=%d  start=%d  end=%d  label=%s\n",
	//	theSpace->dimensions->N, theSpace->dimensions->extraN, theSpace->dimensions->continuum,
	//	theSpace->dimensions->start, theSpace->dimensions->end, theSpace->dimensions->label);
	return nPoints;
}

/* ********************************************************** glue functions */

// these are for JS only; they're both extern
qCx *getTheWave(void) {
	return theWave;
}
qReal *getThePotential(void) {
	return thePotential;
}

int32_t getElapsedTime(void) {
	return theSpace->elapsedTime;
}


void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }

void qSpace_dumpWave(char *title) { theSpace->dumpWave(title); }
void qSpace_setCircularWave(qReal n) { theSpace->dimensions->setCircularWave(theWave, n); }
void qSpace_setStandingWave(qReal n) { theSpace->dimensions->setStandingWave(theWave, n); }
void qSpace_setWavePacket(qReal widthFactor, qReal cycles) { theSpace->dimensions->setPulseWave(theWave, widthFactor, cycles); }
void qSpace_oneRk2Step() { theSpace->oneRk2Step(); }


}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("== Potential %s, %d...%d", title, dim->start, dim->end);
	if (dim->continuum) printf("  start [O]=%lf", thePotential[0]);
	printf("\n");

	for (ix = dim->start; ix < dim->end; ix++) {
		if (0 == ix % 10) printf("\n[%d] ", ix);
		printf("%lf ", thePotential[ix]);
	}
	if (dim->continuum) printf("\nend [%d]=%lf", ix, thePotential[ix]);
	printf("\n");
}

void qSpace::setZeroPotential(void) {
	qDimension *dim = theSpace->dimensions;
	for (int ix = 0; ix < dim->nPoints; ix++)
		thePotential[ix] = 0.;
}


/* ********************************************************** wave arithmetic */

void qSpace::dumpWave(const char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("== Wave %s iprod=%lf", title, this->dimensions->innerProduct(theWave));
	if (dim->continuum) printf("  start [O]=(%lf,%lf)",
		theWave[0].re, theWave[0].im);
	printf("\n");

	for (ix = dim->start; ix < dim->end; ix++) {
		printf("\n[%d] ", ix);
		//if (0 == ix % 5) printf("\n[%d] ", ix);
		printf("(%lf,%lf) ", theWave[ix].re, theWave[ix].im);
	}
	if (dim->continuum) printf("\nend [%d]=(%lf,%lf)",
		ix, theWave[ix].re, theWave[ix].im);
	printf("\n");
}

void qSpace::forEach(void callback(qCx a)) {

}

void qSpace::map(qCx callback(qCx* p)) {

}

void qDimension::fixBoundaries(qCx *wave) {
	switch (this->continuum) {
	case contDISCRETE:
		// ain't no points on the end
		//printf("contDISCRETE cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", this->continuum,
		//	wave[0].re, wave[0].im, wave[this->end].re, wave[this->end].im);
		break;

	case contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		wave[0] = qCx();
		wave[this->end] = qCx();
		//printf("contWELL cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", this->continuum,
		//wave[0].re, wave[0].im, wave[this->end].re, wave[this->end].im);
		break;

	case contCIRCULAR:
		// the points on the end get set to the opposite side
		wave[0] = wave[this->N];
		wave[this->end] = wave[1];
		//printf("contCIRCULAR cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", this->continuum,
		//	wave[0].re, wave[0].im, wave[this->end].re, wave[this->end].im);
		break;
	}
}

// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
qReal qDimension::innerProduct(qCx *wave) {
	qReal sum;

	for (int ix = this->start; ix < this->end; ix++) {
		sum += wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im;
// 		printf("innerProduct point %d (%lf,%lf) %lf\n", ix, wave[ix].re, wave[ix].im,
// 			wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im);
	}
	return sum;
}

// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
void qDimension::normalize(qCx *wave) {
	qReal mag = this->innerProduct(wave);
	//printf("normalizing.  iprod=%lf\n", mag);
	if (mag == 0.) {
		// ALL ZEROES!??! set them all to a constant, normalized
		qCx each = qCx(pow(this->N, -0.5));
		for (int ix = this->start; ix < this->end; ix++)
			wave[ix] = each;
	}
	else {
		mag = pow(mag, -0.5);

		for (int ix = this->start; ix < this->end; ix++)
			wave[ix] *= mag;
	}
	this->fixBoundaries(wave);
	//printf("    normalizing.  new IP=%lf\n", this->innerProduct(wave));
}

// average the wave's points with the two closest neighbors to fix the divergence
// along the x axis I always see
void qDimension::lowPassFilter(qCx *wave) {
	qCx avg, d2prev = wave[0];

	for (int ix = this->start; ix < this->end; ix++) {
		if ((ix && ix < this->N - 1) || this->continuum) {
			avg = wave[ix-1] + wave[ix] * 2. + wave[ix+1];
			wave[ix-1] = d2prev;
			d2prev = avg;
		}
	}
	this->normalize(wave);
}


/* ********************************************************** set wave */

// n is  number of cycles all the way across N points.
// n 'should' be an integer to make it meet up on ends if wraparound
// pass negative to make it go backward.
// the first point here is like x=0 as far as the trig functions, and the last like x=-1
void qDimension::setCircularWave(qCx *wave, qReal n) {
	qReal angle, dAngle = 2. * PI / this->N;
	for (int ix = this->start; ix < this->end; ix++) {
		angle = dAngle * (ix - this->start) * n;
		wave[ix] = qCx(cos(angle), sin(angle));
	}
	this->normalize(wave);
}

// make a superposition of two waves in opposite directions.
// n 'should' be an integer to make it meet up on ends if wraparound
// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
// pass negative to make it upside down.
void qDimension::setStandingWave(qCx *wave, qReal n) {
	int start = this->start, end = this->end, N = this->N;
	if (this->continuum == contWELL) {
		start--;
		end++;
		N += 2;
	}

	qReal dAngle = PI / N;
	for (int ix = start; ix < end; ix++) {
		wave[ix] = qCx(sin(dAngle * (ix - start) * n));
	}
	this->normalize(wave);
}

// widthFactor is number of points wide it is, fraction of N.
// Cycles is how many circles (360°) it goes thru in that width.
void qDimension::setPulseWave(qCx *wave, qReal widthFactor, qReal cycles) {

	// start with a real wave
	this->setCircularWave(wave, cycles / widthFactor);

	// modulate with a gaussian
	int peak = lround(this->N * widthFactor) % this->N;  // ?? i dunno
	qReal stdDev = this->N * widthFactor / 2.;  // ?? i'm making this up
	for (int ix = this->start; ix < this->end; ix++)
		wave[ix] *= exp(-(ix - peak) * (ix - peak) / stdDev);

	this->normalize(wave);
}
