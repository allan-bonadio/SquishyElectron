/*
** quantum manifestation tests
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


#include "../spaceWave/qSpace.h"
#include "../schrodinger/Manifestation.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"




TEST_GROUP(Manifestation)
{
};

// just the constructor; it's not even fully created
TEST(Manifestation, Manifestation_ConstructorGauntlet)
{
	qSpace *space = makeBareSpace(8, contENDLESS);
	Manifestation *mani = space->mani;

	LONGS_EQUAL(0.5, mani->lowPassDilution);

	LONGS_EQUAL(false, mani->pleaseFFT);
	LONGS_EQUAL(false, mani->isIterating);


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
	Manifestation *mani = space->mani;

	LONGS_EQUAL(0, mani->elapsedTime);
	LONGS_EQUAL(0, mani->iterateSerial);
	//pointless DOUBLES_EQUAL(1.0, mani->dt, 1e-12);
	LONGS_EQUAL(100, mani->stepsPerIteration);
	DOUBLES_EQUAL(0.5, mani->lowPassDilution, 1e-12);
	LONGS_EQUAL(false, mani->isIterating);


	// lets see if the buffers are all large enough
//	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(mani->mainQWave->wave	, nPoints * sizeof(qCx));
	proveItsMine(mani->scratchQWave->wave, nPoints * sizeof(qCx));
	proveItsMine(mani->viewBuffer->buffer, nPoints * sizeof(float) * 8);

//	printf("🧨 🧨       we're done, deleting freeBufferList=%p\n", space->freeBufferList);
	deleteTheSpace();
//	printf("🧨 🧨       completeNewManiGauntlet() completed\n");
}

TEST(Manifestation, Manifestation_completeNewManiGauntlet4000) { completeNewManiGauntlet(4000, 4096, 4096); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet254) { completeNewManiGauntlet(254, 256, 256); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet63) { completeNewManiGauntlet(63, 64, 65); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet48) { completeNewManiGauntlet(48, 64, 64); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet32) { completeNewManiGauntlet(32, 32, 34); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet32x) { completeNewManiGauntlet(32, 32, 34); }
TEST(Manifestation, Manifestation_completeNewManiGauntlet4) { completeNewManiGauntlet(4, 4, 6); }

