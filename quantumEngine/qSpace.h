/*
** quantum space - C++ code for optimized ODE integration for Squishy Electron
*/

#include "qCx.h"

#define LABEL_LEN  16
#define MAX_DIMENSIONS  1

// we use fixed size int32_t and double here just so JS can calculate sizes more easily.
// Please keep these class layouts synched with qEngine.js's estimate!

extern class qSpace *theSpace;
extern class qCx *theWave, *sumWave, *egyptWave, *laosWave;
extern class qCx *k1Wave, *k2Wave, *k3Wave, *k4Wave;
extern qReal *thePotential;
extern float *viewBuffer;
extern qReal elapsedTime;

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

	void fixBoundaries(qCx *wave);

	void prune(qCx *wave);
	qReal innerProduct(qCx *wave);
	void normalize(qCx *wave);
	void lowPassFilter(qCx *wave);

	void setCircularWave(qReal n);
	void setStandingWave(qReal n);
	void setPulseWave(qReal widthFactor, qReal cycles);

	int iterationCount = 0;
};

// continuum values - same as in qDimension in qEngine.js; pls synchronize them
const int contDISCRETE = 0;
const int contWELL = 1;
const int contENDLESS = 2;

/* ************************************************************ the space */

struct qSpace {
public:
	qSpace(int nDims) {
		this->nDimensions = nDims;
		this->iterationCount = 0;
		this->elapsedTime = 0.;
	}

	// potential energy as function of state; reals (not complex)
	// otherwise same layout as wave
	// somewhere else qReal *potential;

	// number of  dimensions actually used, always <= MAX_DIMENSIONS
	int32_t nDimensions;

	// must have at least 2 copies of wave so alg can create one from other
// 	qCx *wave0;
// 	qCx *wave1;

	// totals for all dimensions
	int nStates;
	int nPoints;

	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsedTime;

	// total number of times thru the number cruncher.
	int iterationCount;

	// Dimensions are listed from outer to inner as with the resulting psi array:
	// psi[outermost-dim][dim][dim][innermost-dim]
	// always a fixed size, for simplicity.
	qDimension dimensions[MAX_DIMENSIONS];

	void dumpPotential(const char *title);
	void setZeroPotential(void);
	void setValleyPotential(qReal power, qReal scale, qReal offset);

	void dumpThatWave(qCx *wave);
	void dumpWave(const char *title, qCx *aWave = theWave);
	void forEach(void callback(qCx));
	void map(qCx callback(qCx*));

	void oneRk2Step(void);
	void oneRk4Step(void);
};

/* ************************************************************ a wave buffer */

struct qWave {

	// create a qWave
	qWave(qSpace *space);
	~qWave();

	qSpace *space;

	// the actual data, hopefully in the right size allocated block
	qCx *buffer;

	void dumpWave(const char *title);
	void fixBoundaries(void);
	void prune(void);
	qReal innerProduct(void);
	void normalize(void);
	void lowPassFilter(void);

	void setCircularWave(qReal n);
	void setStandingWave(qReal n);
	void setPulseWave(qReal widthFactor, qReal cycles);

	void forEachPoint(void (*callback)(qCx, int));
	void forEachState(void (*callback)(qCx, int));
};

/* ************************************************************ the space */

// for JS to call
extern "C" {
	int32_t startNewSpace(void);
	int32_t addSpaceDimension(int32_t N, int32_t continuum, const char *label);
	int32_t completeNewSpace(void);

	qCx *getWaveBuffer(void);
	qReal *getPotentialBuffer(void);
	float *getViewBuffer();
	int32_t getElapsedTime(void);

	int manyRk2Steps(void);

	// refills the view  buffer; returns highest magnitude
	float updateViewBuffer();
}

// internal
extern void oneRk2Step(void);



//extern void oneRk4Step(void);
extern qCx hamiltonian(qCx *wave, int x);

extern class qSpace *theSpace;
extern class qCx *theWave, *egyptWave, *laosWave, *sumWave;
extern qReal *thePotential;
extern float *viewBuffer;
extern qReal elapsedTime;

extern void qeStarted(void);
