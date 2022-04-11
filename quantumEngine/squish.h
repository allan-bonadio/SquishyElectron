/*
** squish.h -- common defines for the C++ part of squishyelectron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

//include this in almost all C++ sources

#include <cmath>
#include <stdio.h>
#include <stdexcept>

//?#include <string>
//?

#include "spaceWave/qCx.h"

// continuum values - same as in qeBasicSpace in qeSpace.js; pls synchronize them
// wanted this to be in qSpace.h but the testing software ... ugh
const int contDISCRETE = 0;
const int contWELL = 1;
const int contENDLESS = 2;

extern double getTimeDouble();
