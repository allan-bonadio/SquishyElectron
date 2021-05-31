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
		free(theWave);
		free(nextWave);
		free(thePotential);
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
	strncpy(dim->label, label, LABEL_LEN-1);

	dimsSoFar++;
	printf("  done startNewSpace() %s\n", dim->label);
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
		dim->boundaries = dim->continuum ? 2 : 0;

		nStates *= dim->N;
		dim->nStates = nStates;
		nPoints *= dim->N + dim->boundaries;
		dim->nPoints = nPoints;
	}

	//  allocate the buffers
	theWave = (qCx *) malloc(sizeof(qCx) * nPoints);
	nextWave = (qCx *) malloc(sizeof(qCx) * nPoints);
	thePotential = (qReal *) malloc(sizeof(qReal) * nPoints);

	printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
	return nPoints;
}

qCx *getTheWave(void) {return theWave;}
qReal *getThePotential(void) {return thePotential;}

/* ********************************************************** elapsed time */

int32_t getElapsedTime(void) {return elapsedTime;}

}
