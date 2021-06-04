#include "qSpace.h"

qReal DEFAULT_DT = 0.1;

// this is only for continuum dimension
qCx hamiltonian(qCx *wave, int x) {
	// so at location x, if dx = 1,
	// the derivative would be (psi[x+1] - psi[x])
	//                      or (psi[x] - psi[x-1])
	// so second deriv would be psi[x+1] + psi[x-1] - 2* psi[x]
	qCx d2 = wave[x-1] + wave[x+1] - wave[x] * 2;
	qCheck(d2);

printf("c++ d2= %lf %lf\n", d2.re, d2.im);

	qCx pot = wave[x] * thePotential[x];
	qCheck(pot);
	qCx rate = pot - d2;
	// shouldnt this be right!??! qCx rate = pot - d2;

//printf("c++ hamiltonian= %lf %lf\n", rate.re, rate.im);

	return rate;
}

