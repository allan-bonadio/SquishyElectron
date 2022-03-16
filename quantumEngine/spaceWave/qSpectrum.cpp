/*
** quantum Spectrum -- quantum Spectrum buffer
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


#include <cmath>
#include "qSpace.h"
#include "qWave.h"

/* ************************************************************ birth & death & basics */

// This produces a spectrum ready to hold an FFT transformed wave
qSpectrum::qSpectrum(qSpace *space, qCx *useThisBuffer) {
	qBuffer();
	printf("🌈 🌈 qSpectrum::qSpectrum(%s)  utb=x%x => this x%x", space->label,
		(uint32_t) useThisBuffer, (uint32_t) this);
	this->space = space;
	initBuffer(useThisBuffer);

	this->nPoints = space->spectrumSize;
	this->start = 0;
	this->end = space->spectrumSize;
}

qSpectrum::~qSpectrum(void) {
}


/* ******************************************************** diagnostic dump **/
// only a wave knows how to traverse its states

// this is spectrum-independent.  This prints nPoints lines.
void qSpace::dumpThatSpectrum(qCx *wave, bool withExtras) {
	if (this->spectrumSize <= 0) throw "qSpace::dumpThatSpectrum() with zero points";

	qBuffer::dumpSegment(wave, withExtras, 0, this->spectrumSize, 0);
}

// this is the member function that dumps its own Spectrum and space
void qSpectrum::dumpSpectrum(const char *title, bool withExtras) {
	printf("\n🌈 🌈 ==== Spectrum | %s ", title);
	this->space->dumpThatSpectrum(this->wave, withExtras);
	printf("\n🌈 🌈 ==== end of Spectrum ====\n\n");
}



