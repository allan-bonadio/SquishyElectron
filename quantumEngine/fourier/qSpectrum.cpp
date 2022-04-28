/*
** quantum Spectrum -- quantum Spectrum buffer
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


//#include <cmath>
#include "../spaceWave/qSpace.h"
#include "../schrodinger/Manifestation.h"
#include "qSpectrum.h"

/* ************************************************************ birth & death & basics */

// This produces a spectrum ready to hold an FFT transformed wave
qSpectrum::qSpectrum(qSpace *space, qCx *useThisBuffer) {
	qBuffer();
	magic = 'qSpe';

	//printf("🌈 🌈 qSpectrum::qSpectrum(%s)  utb=%p => this %p\n", space->label,
	//	useThisBuffer, this);
	this->space = space;
	initBuffer(space->freeBufferLength, useThisBuffer);

	nPoints = space->spectrumLength;
	start = 0;
	end = space->spectrumLength;
	continuum = 0;
}

qSpectrum::~qSpectrum(void) {
}


/* ******************************************************** diagnostic dump **/
// only a wave knows how to traverse its states

// this is spectrum-independent.  This prints nPoints lines.
void qSpace::dumpThatSpectrum(qCx *wave, bool withExtras) {
	if (spectrumLength <= 0) throw std::runtime_error("qSpace::dumpThatSpectrum() with zero points");

	qBuffer::dumpSegment(wave, withExtras, 0, spectrumLength, 0);
}

// this is the member function that dumps its own Spectrum and space
void qSpectrum::dumpSpectrum(const char *title, bool withExtras) {
	printf("\n🌈 🌈 ==== Spectrum | %s ", title);
	space->dumpThatSpectrum(wave, withExtras);
	printf("\n🌈 🌈 ==== end of Spectrum ====\n\n");
}



