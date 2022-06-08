/*
** quantum incarnation tests
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


#include "../spaceWave/qSpace.h"
#include "../schrodinger/Incarnation.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"




TEST_GROUP(Incarnation)
{
};

// just the constructor; it's not even fully created
TEST(Incarnation, Incarnation_ConstructorGauntlet)
{
	qSpace *space = makeBareSpace(8, contENDLESS);
	Incarnation *incarn = space->incarn;

	LONGS_EQUAL(0.5, incarn->lowPassFilter);

	LONGS_EQUAL(false, incarn->pleaseFFT);
	LONGS_EQUAL(false, incarn->isIterating);


	delete space;
}



// boring, just copied from the space test script

// this tests the whole shebang, as created from JS
void completeNewManiGauntlet(int N, int expectedSpectrumLength, int expectedFreeBufferLength) {
//	printf("🧨 🧨 starting completeNewManiGauntlet(N=%d, sl=%d, fbl=%d)\n",
//		N, expectedSpectrumLength, expectedFreeBufferLength);
	qSpace *space = makeFullSpace(N);
//	printf("🧨 🧨       created the space and all the buffers; freeBufferList=%p\n", space->freeBufferList);
	int nPoints = space->nPoints;
	Incarnation *incarn = space->incarn;

	LONGS_EQUAL(0, incarn->elapsedTime);
	LONGS_EQUAL(0, incarn->iterateSerial);
	//pointless DOUBLES_EQUAL(1.0, incarn->dt, 1e-12);
	LONGS_EQUAL(100, incarn->stepsPerIteration);
	DOUBLES_EQUAL(0.5, incarn->lowPassFilter, 1e-12);
	LONGS_EQUAL(false, incarn->isIterating);


	// lets see if the buffers are all large enough
//	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(incarn->mainQWave->wave	, nPoints * sizeof(qCx));
	proveItsMine(incarn->scratchQWave->wave, nPoints * sizeof(qCx));
	proveItsMine(incarn->viewBuffer->buffer, nPoints * sizeof(float) * 8);

//	printf("🧨 🧨       we're done, deleting freeBufferList=%p\n", space->freeBufferList);
	deleteTheSpace();
//	printf("🧨 🧨       completeNewManiGauntlet() completed\n");
}

TEST(Incarnation, Incarnation_completeNewManiGauntlet4000) { completeNewManiGauntlet(4000, 4096, 4096); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet254) { completeNewManiGauntlet(254, 256, 256); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet63) { completeNewManiGauntlet(63, 64, 65); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet48) { completeNewManiGauntlet(48, 64, 64); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet32) { completeNewManiGauntlet(32, 32, 34); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet32x) { completeNewManiGauntlet(32, 32, 34); }
TEST(Incarnation, Incarnation_completeNewManiGauntlet4) { completeNewManiGauntlet(4, 4, 6); }

