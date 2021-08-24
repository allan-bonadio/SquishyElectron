/*
** Hamiltonian -- calculate the energy of the wave, H | ψ >
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "qSpace.h"


// this is the slope, not the increment, so dt is irrelevant
//qReal DEFAULT_DT = 0.1;

// this is only for continuum dimension.  Ultimately, these should be per-dimension,
// and each dimension should have a function that does the honors.
// or, per-view or per-space.
// btw, this is really Hψ not just H.  Isn't H supposed to be real?
qCx hamiltonian(qCx *wave, int x) {
	// so at location x, if dx = 1,
	// the derivative would be (ψ[x+1] - ψ[x])
	//                      or (ψ[x] - ψ[x-1])
	// so second deriv would be ψ[x+1] + ψ[x-1] - 2* ψ[x]
	qCx d2 = wave[x-1] + wave[x+1] - wave[x] * 2;
	qCheck(d2);

	//printf("c++ d2= %lf %lf\n", d2.re, d2.im);

	qCx pot = wave[x] * thePotential[x];
	qCheck(pot);
	qCx rate = pot - d2;

	//printf("c++ hamiltonian= %lf %lf\n", rate.re, rate.im);

	return rate;
}

