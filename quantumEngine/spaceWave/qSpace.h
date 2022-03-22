/*
** quantum space - C++ code for optimized ODE integration for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


#include "qCx.h"

// do not exceed these!  they are open ended arrays.
// keep LABEL_LEN+1 a multiple of 4 or 8 for alignment.
#define LABEL_LEN  31

#define MAX_DIMENSIONS  2

extern class qSpace *theSpace;
extern class qCx *peruWave, *laosWave;

extern class qWave *peruQWave, *laosQWave;

extern double *thePotential;
//extern float *viewBuffer;

extern qCx hamiltonian(qCx *wave, int x);
extern void qeStarted(void);

/* *************************************** one for each DIMENSION of the wave array */
struct qDimension {
public:
	// possible  states, just for this  dimension.  start+end=datapoints
	int N;
	int start;
	int end;

	// accumulated number of eigenstates, from this dim to the end
	// = product of Nv * Nv of next dimension or 1 if none
	int nStates;

	// accumulated number of complex values in wave, from this dim to the end.
	// includes boundaries.
	int nPoints;

	// contWELL or contENDLESS (has N+2 values for N possibilities)
	// contDISCRETE = (has N values for N possibilities)
	int continuum;

	// size for Fourier transforms, or zero if not yet calculated.  ON THIS DIMENSION ONLY!
	// Often a power of two.
	// no boundaries.
	int spectrumLength;

	// 'x', 'y' or 'z' - two particles will have x1, x2 but one in 2d will have x, y.
	// Spin: Sz, or Sz1, Sz2, ...  Smax = 2S+1.  Sz= ix - S.  Orbital Ang: Lz, combined: Jz
	// variable total angular mom: L combines Lz and Ltot so: state ix = 0...Lmax^2
	// Ltot = floor(sqrt(ix))   Lz = ix - L(L+1) and you have to choose a Lmax sorry
	// Also could have Energy dimensions...
	char label[LABEL_LEN+1];

};

// continuum values - same as in qeBasicSpace in qeSpace.js; pls synchronize them
const int contDISCRETE = 0;
const int contWELL = 1;
const int contENDLESS = 2;

//coerce your buffers into being one of these and you link them into a list
struct FreeBuffer {
	struct FreeBuffer *next;
};

/* ************************************************************ the space */

struct qSpace {
public:
	qSpace(const char *label);
	~qSpace(void);

	// additional for space creation
	void addDimension(int N, int continuum, const char *label);
	private:
		void tallyDimensions(void);
	public:
	void initSpace(void);

	int magic;

	char label[LABEL_LEN+1];

	// Dimensions are listed from outer to inner as with the resulting ψ array:
	// ψ[outermost-dim][dim][dim][innermost-dim]
	// always a fixed size, for simplicity.
	qDimension dimensions[MAX_DIMENSIONS];

	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsedTime;

	// total number of times thru the number cruncher. (should always be an integer;
	// it's a double cuz I don't know how big it'll get)
	double iterateSerial;

	// set the elapsedTime and iterateSerial to zero
	void resetCounters(void);

	// number of  dimensions actually used, always <= MAX_DIMENSIONS
	// do not confuse with nStates or nPoints
	int nDimensions;

	// totals for all dimensions.  These numbers dominate lots of areas in the code.
	int nStates;
	int nPoints;

	// our main qWave housing our main wave, doing iterations and being displayed.
	// Technically, the one that got the most recent integration iteration
	struct qWave *latestQWave;

	struct qViewBuffer *qViewBuffer;
	double *potential;

	// params that the user can set
	double dt;
	int stepsPerIteration;
	double lowPassDilution;



	/* *********************************************** buffers */
	void chooseSpectrumSize(void);
	int spectrumLength;

	// will dump any wave that uses this space.  same as in qWave:: or qSpectrum::
	void dumpThatWave(qCx *wave, bool withExtras = false);
	void dumpThatSpectrum(qCx *wave, bool withExtras = false);

	void fixThoseBoundaries(qCx *wave);  // like for qWave but on any wave

	// the linked list of blocks available for rental.
	// All contain (freeBufferLength) complex number slots.
	FreeBuffer *freeBufferList;

	// number of qCx-s that'll be enough for both spectrums and waves
	// so waves that are cache-able have exactly this length.
	int freeBufferLength;

	// if you take one, return it.  If it isn't the right length,
	// returning might lead to it being used as if it was.
	qCx *borrowBuffer(void);
	void returnBuffer(qCx *abuffer);
	void clearFreeBuffers(void);

	/* *********************************************** potential */
	void dumpPotential(const char *title);
	void setZeroPotential(void);
	void setValleyPotential(double power, double scale, double offset);

	/* *********************************************** iteration */
	void oneIteration(void);
	void oneRk2Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneRk4Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneVisscherStep(qWave *oldQWave, qWave *newQWave);  // obsolete

	// visscher
	void stepReal(qCx *oldW, qCx *newW, double dt);
	void stepImaginary(qCx *oldW, qCx *newW, double dt);
	void visscherHalfStep(qWave *oldQWave, qWave *newQWave);

	char pleaseFFT;
	char isIterating;
	void askForFFT(void);
};

/* ************************************************************ JS interface */

// for JS to call
extern "C" {
	qSpace *startNewSpace(const char *name = "a space");
	qSpace *addSpaceDimension(int N, int continuum, const char *label);
	qSpace *completeNewSpace(void);
	void deleteTheSpace(void);


	qCx *qSpace_getWaveBuffer(void);
	double *qSpace_getPotentialBuffer(void);
	float *qViewBuffer_getViewBuffer();
	double qSpace_getElapsedTime(void);
	double qSpace_getIterateSerial(void);

	void qSpace_oneIteration(void);


	int manyRk2Steps(void);

}

