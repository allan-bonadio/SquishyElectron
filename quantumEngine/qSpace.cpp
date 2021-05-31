#include <string.h>
#include "qSpace.h"

class qSpace *theSpace = NULL;
class qCx *theWave = NULL, *nextWave = NULL;
qReal *thePotential = NULL;
qReal elapsedTime = 0;


static int dimsSoFar;

extern "C" {

// call this to throw away existing space and wave, and start new
int32_t startNewSpace(void) {
	printf("startNewSpace()\n");

	if (theSpace) {
		delete theSpace;
		delete[] theWave;
		delete[] nextWave;
		delete[] thePotential;
	}
	elapsedTime = 0;

	dimsSoFar = 0;
	theSpace = new qSpace();
	printf("  done startNewSpace()\n");

	return true;
}

// call this from JS to add one or more dimensions
int32_t addSpaceDimension(int32_t N, int32_t continuum, const char *label) {
	printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);

	qDimension *dim = theSpace->dimensions + dimsSoFar;
	dim->N = N;
	dim->continuum = continuum;

	dim->continuum = continuum;
	if (continuum) {
		dim->extraN = 2;
		dim->start = 1;
		dim->end = N - 1;
	}
	else {
		dim->extraN = dim->start = 0;
		dim->end = N;
	}

	strncpy(dim->label, label, LABEL_LEN-1);

	dimsSoFar++;
	printf("  done addSpaceDimension() %s\n", dim->label);
	return true;
}

// call this from JS to finish the process
int32_t completeNewSpace(void) {
	printf("completeNewSpace()\n");
	int32_t ix;
	int32_t nPoints = 1, nStates = 1;

	theSpace->nDimensions = dimsSoFar;

	// finish up all the dimensions now that we know them all
	for (ix = dimsSoFar-1; ix >= 0; ix--) {
		qDimension *dim = theSpace->dimensions + ix;

		nStates *= dim->N;
		dim->nStates = nStates;
		nPoints *= dim->N + dim->extraN;
		dim->nPoints = nPoints;
	}

	//  allocate the buffers
	theWave = new qCx[nPoints];
	nextWave = new qCx[nPoints];

	thePotential = new qReal[nPoints];
	theSpace->dumpPotential("freshly created");
// 	theWave = (qCx *) malloc(sizeof(qCx) * nPoints);
// 	nextWave = (qCx *) malloc(sizeof(qCx) * nPoints);
// 	thePotential = (qReal *) malloc(sizeof(qReal) * nPoints);

	printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
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


/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("potential %s, %d...%d", title, dim->start, dim->end);
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

void qSpace::dumpWave(char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("Wave %s", title);
	if (dim->continuum) printf("  start [O]=(%lf,%lf)",
		theWave[0].re, theWave[0].im);
	printf("\n");

	for (ix = dim->start; ix < dim->end; ix++) {
		if (!(ix % 5)) printf("\n[%d] ", ix);
		printf("(%lf,%lf) ", theWave[ix].re, theWave[ix].im);
	}
	if (dim->continuum) printf("\nend [%d]=%lf", ix, theWave[ix].re, theWave[ix].im);
	printf("\n");
}

void qSpace::forEach(void callback(qCx a)) {

}

void qSpace::map(qCx callback(qCx* p)) {

}

void qSpace::fixBoundaries(void) {
	qDimension *dim = this->dimensions;
	switch (dim->continuum) {
	case contDISCRETE:
		// ain't no points on the end
		break;

	case contWELL:
		// the points on the end are ∞ potential, but the arithmetic goes bonkers
		// if I actually set the voltage to ∞
		theWave[0] = qCx();
		theWave[dim->end] = qCx();
		break;

	case contCIRCULAR:
		// the points on the end get set to the opposite side
		theWave[0] = theWave[dim->N];
		theWave[dim->end] = theWave[1];
		break;
	}
}

qReal qSpace::innerProduct(void) {
	qReal sum;
	for (ix = dim->start; ix < dim->end; ix++) {
		sum += theWave[ix].re * theWave[ix].re + theWave[ix].im * theWave[ix].im;
		printf("(%lf,%lf) ", theWave[ix].re, theWave[ix].im);
	}
}

void qSpace::normalize(void) {

}

void qSpace::lowPassFilter(void) {

}


/* ********************************************************** set wave */

void qSpace::setCircularWave(int n) {

}

void qSpace::setStandingWave(int n) {

}

void qSpace::setWavePacket(int width, qReal cycles) {

}
