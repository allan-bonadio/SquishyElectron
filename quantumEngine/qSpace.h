/*
** quantum space - C++ code for optimized ODE integration for Squishy Electron
*/
#include <emscripten.h>
#include <stdint.h>
#include <stdio.h>
#include <float.h>
#include <stdlib.h>

#include "qCx.h"

#define LABEL_LEN  16
#define MAX_DIMENSIONS  1

// we use fixed size int32_t and double here just so JS can calculate sizes more easily.
// Please keep these class layouts synched with qEngine.js's layout!

/* one for each dimension of the wave array */
class qDimension {
public:
	// possible  states, just for this  dimension.
	int32_t N;

	// number of values (=N or N+2)
	//int32_t Nv;

	// number of complex values in wave, from this dim to the end
	// = product of Nv * Nv of next dimension or 1 if none
	int32_t nStates;
	//	or maybe x2 for number of real values

	// contWELL or contCIRCULAR (has N+2 values for N possibilities)
	// contDISCRETE = (has N values for N possibilities)
	int32_t continuum;

	// 'x', 'y' or 'z' - two particles will have x1, x2 but one in 2d will have x, y.
	// Spin: Sz, or Sz1, Sz2, ...  Smax = 2S+1.  Sz= ix - S.  Orbital Ang: Lz, combined: Jz
	// variable total angular mom: L combines Lz and Ltot so: state ix = 0...Lmax^2
	// Ltot = floor(sqrt(ix))   Lz = ix - L(L+1) and you have to choose a Lmax sorry
	// Also could have Energy dimensions...
	unsigned char label[LABEL_LEN];
};

// continuum values - same as in qDimension in qEngine.js; pls synchronize them
const int contDISCRETE = 0;
const int contWELL = 1;
const int contCIRCULAR = 2;

class qSpace {
public:
	// potential energy as function of state; reals (not complex)
	// otherwise same layout as wave
	// somewhere else qReal *potential;

	// number of  dimensions actually used, always <= MAX_DIMENSIONS
	int32_t nDimensions;

	// must have at least 2 copies of wave so alg can create one from other
// 	qCx *wave0;
// 	qCx *wave1;

	// which wave we're calculating from, 0 or 1.
	int32_t calcFrom;

	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsed;

	// Dimensions are listed from outer to inner as with the resulting psi array:
	// psi[outermost-dim][dim][dim][innermost-dim]
	// always a fixed size, for simplicity.
	qDimension dimensions[MAX_DIMENSIONS];

};

