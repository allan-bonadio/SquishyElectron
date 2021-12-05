/*
** quantum space - C++ code for optimized ODE integration for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


#include "qCx.h"

// do not exceed these!  they are open ended arrays.
#define LABEL_LEN  16
#define MAX_DIMENSIONS  2

extern class qSpace *theSpace;
extern class qCx *theWave, *peruWave, *egyptWave, *laosWave;
extern class qCx *k1Wave, *k2Wave, *k3Wave, *k4Wave;

extern class qFlick *theQWave;
extern class qWave *peruQWave, *egyptQWave, *laosQWave;
extern class qWave *k1QWave, *k2QWave, *k3QWave, *k4QWave;

extern qReal *thePotential;
//extern float *viewBuffer;
extern qReal elapsedTime;

extern qCx hamiltonian(qCx *wave, int x);
extern void qeStarted(void);

/* *************************************** one for each DIMENSION of the wave array */
struct qDimension {
public:
	// possible  states, just for this  dimension.  start+end=datapoints
	int32_t N;
	int32_t start;
	int32_t end;

	// accumulated number of eigenstates, from this dim to the end
	// = product of Nv * Nv of next dimension or 1 if none
	int32_t nStates;

	// accumulated number of complex values in wave, from this dim to the end.
	// includes boundaries.
	int32_t nPoints;

	// contWELL or contENDLESS (has N+2 values for N possibilities)
	// contDISCRETE = (has N values for N possibilities)
	int32_t continuum;

	// 'x', 'y' or 'z' - two particles will have x1, x2 but one in 2d will have x, y.
	// Spin: Sz, or Sz1, Sz2, ...  Smax = 2S+1.  Sz= ix - S.  Orbital Ang: Lz, combined: Jz
	// variable total angular mom: L combines Lz and Ltot so: state ix = 0...Lmax^2
	// Ltot = floor(sqrt(ix))   Lz = ix - L(L+1) and you have to choose a Lmax sorry
	// Also could have Energy dimensions...
	char label[LABEL_LEN];

};

// continuum values - same as in qDimension in qEngine.js; pls synchronize them
const int contDISCRETE = 0;
const int contWELL = 1;
const int contENDLESS = 2;

/* ************************************************************ the space */

struct qSpace {
public:
	qSpace(int nDims);
	~qSpace(void);

	// additional for space creation
	void addDimension(int N, int continuum, const char *label);
	private:
		void tallyDimensions(void);
	public:
	void initSpace(void);

	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsedTime;

	// total number of times thru the number cruncher. (should always be an integer;
	// it's a double cuz I don't know how big it'll get)
	double iterateSerial;

	// number of  dimensions actually used, always <= MAX_DIMENSIONS
	int32_t nDimensions;

	// totals for all dimensions.  These numbers dominate lots of areas in the code.
	int nStates;
	int nPoints;

	// the one that got the most recent integration step
	struct qWave *latestQWave;

	// time increment used in schrodinger's, plus constants handy in intgration
	qReal dt;
	qCx dtOverI;
	qCx halfDtOverI;

	int bufferNum;

	/* ****************************************** hacks that might go away */
	// set to N or whatever, count down, when you hhit zero, lowPass (sometimes)
	//int filterCount;

	// true if you want rk to go through periodic lowpass or whatever filter
	//int doLowPass;

	// zero = off.  true to do it every iteration a little and use value as dilution factor
	//qReal continuousLowPass;

	char label[LABEL_LEN];

	/* *********************************************** Dimensions & other serious stuff */
	// Dimensions are listed from outer to inner as with the resulting ψ array:
	// ψ[outermost-dim][dim][dim][innermost-dim]
	// always a fixed size, for simplicity.
	qDimension dimensions[MAX_DIMENSIONS];

	// will dump any wave that uses this space.  same as in qWave::
	void dumpThatWave(qCx *wave, bool withExtras = false);

	void dumpPotential(const char *title);
	void setZeroPotential(void);
	void setValleyPotential(qReal power, qReal scale, qReal offset);

	void oneIntegrationStep(void);
	void oneRk2Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneRk4Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneVisscherStep(qWave *oldQWave, qWave *newQWave);  // obsolete

	void visscherHalfStep(qWave *oldQWave, qWave *newQWave);

	void fixThoseBoundaries(qCx *wave);  // like for qWave but on any wave

	void stepReal(qCx *oldW, qCx *newW, double dt);
	void stepImaginary(qCx *oldW, qCx *newW, double dt);
};

/* ************************************************************ JS interface */

// for JS to call
extern "C" {
	qSpace *startNewSpace(void);
	qSpace *addSpaceDimension(int32_t N, int32_t continuum, const char *label);
	qSpace *completeNewSpace(void);

	qCx *getWaveBuffer(void);
	qReal *getPotentialBuffer(void);
	float *getViewBuffer();
	qReal qSpace_getElapsedTime(void);
	qReal qSpace_getIterateSerial(void);

	void qSpace_oneIntegrationStep(void);


	int manyRk2Steps(void);

	int dumpViewBuffer(int nPoints);

	void qWave_dumpWave(char *title);
	void qWave_setCircularWave(qReal n);
	void qWave_setStandingWave(qReal n);
	void qWave_setPulseWave(qReal widthFactor, qReal cycles);
}

