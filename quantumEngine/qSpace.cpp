#include "qSpace.h"
#include <cmath>

class qSpace *theSpace = NULL;
class qCx *theWave = NULL, *egyptWave = NULL, *laosWave = NULL, *sumWave = NULL;
qReal *thePotential = NULL;
qReal elapsedTime = 0;


static int dimsSoFar;


// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript


extern "C" {

// call this to throw away existing space and wave, and start new
int32_t startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		delete[] theWave;
		delete[] egyptWave;
		delete[] laosWave;
		delete[] sumWave;
		delete[] thePotential;
		delete[] viewBuffer;
		delete theSpace;
	}
	elapsedTime = 0;

	dimsSoFar = 0;
	theSpace = new qSpace(1);
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
	theSpace->nStates = nStates;
	theSpace->nPoints = nPoints;

	//  allocate the buffers
	theWave = new qCx[nPoints];
	egyptWave = new qCx[nPoints];
	laosWave = new qCx[nPoints];
	sumWave = new qCx[nPoints];
	viewBuffer = new float[nPoints * 8];  // 4 floats per row, two verts per point
	theSpace->dimensions->setCircularWave(1);
	//theSpace->dumpWave("freshly created");

	thePotential = new qReal[nPoints];
	theSpace->setValleyPotential(1., 1., 0.);
	//theSpace->dumpPotential("freshly created");

	theSpace->iterationCount = 0;

	//printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
	//printf("  dimension N=%d  extraN=%d  continuum=%d  start=%d  end=%d  label=%s\n",
	//	theSpace->dimensions->N, theSpace->dimensions->extraN, theSpace->dimensions->continuum,
	//	theSpace->dimensions->start, theSpace->dimensions->end, theSpace->dimensions->label);
	return nPoints;
}

/* ********************************************************** glue functions */

// these are for JS only; they're all extern "C"

qCx *getWaveBuffer(void) {
	return theWave;
}
qReal *getPotentialBuffer(void) {
	return thePotential;
}

int32_t getElapsedTime(void) {
	return elapsedTime;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(qReal power, qReal scale, qReal offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void qSpace_dumpWave(char *title) { theSpace->dumpWave(title); }
void qSpace_setCircularWave(qReal n) { theSpace->dimensions->setCircularWave(n); }
void qSpace_setStandingWave(qReal n) { theSpace->dimensions->setStandingWave(n); }
void qSpace_setPulseWave(qReal widthFactor, qReal cycles) { theSpace->dimensions->setPulseWave(widthFactor, cycles);
}
void qSpace_oneRk2Step() { theSpace->oneRk2Step(); }
void qSpace_oneRk4Step() { theSpace->oneRk4Step(); }


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

void qSpace::setValleyPotential(qReal power = 1, qReal scale = 1, qReal offset = 0) {
	qDimension *dim = theSpace->dimensions;
	qReal mid = floor(dim->nPoints / 2);
	for (int ix = 0; ix < dim->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}
}


/* ********************************************************** wave arithmetic */

