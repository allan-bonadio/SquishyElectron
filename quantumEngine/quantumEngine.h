/*
** quantum engine - C++ code for optimized ODE integration for Squishy Electron
*/

#define LABEL_LEN  15
#define MAX_DIMENSIONS  5

/* one for each dimension of the wave array */
class Dimension {
	// possible  states, just for this  dimension.  0=end of list.
	int N;

	// number of values (=N or N+2)
	int Nv;

	// start = 0 or 1; end = N or N+1
	int start, end;

	// number of complex values in this whole thing
	// = product of Nv * Nv of next dimension or 1 if none)
	int size;
	//	or maybe x2 for number of real values

	// coordinate (has N+2 values for N possibilities)
	// false = 'discrete' (has N values for N possibilities)
	bool isCoorinate;

	// 'x', 'y' or 'z' - two particles will have x1, x2 but one in 2d will have x, y.
	// Spin: Sz, or Sz1, Sz2, ...  Smax = 2S+1.  Sz= ix - S.  Orbital Ang: Lz, combined: Jz
	// variable total angular mom: L combines Lz and Ltot so: state ix = 0...Lmax^2
	// Ltot = floor(sqrt(ix))   Lz = ix - L(L+1) and you have to choose a Lmax sorry
	// Also could have Energy dimensions...
	char label[LABEL_LEN];
};



