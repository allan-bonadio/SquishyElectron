/*
** quantum timeline tests
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


#include "../spaceWave/qSpace.h"
#include "../schrodinger/Timeline.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"




TEST_GROUP(Timeline)
{
};

// just the constructor; it's not even fully created
TEST(Timeline, Timeline_ConstructorGauntlet)
{
	qSpace *space = makeBareSpace(8, contENDLESS);
	Timeline *tline = space->tline;

	LONGS_EQUAL(0.5, tline->lowPassDilution);

	LONGS_EQUAL(false, tline->pleaseFFT);
	LONGS_EQUAL(false, tline->isIterating);


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
	Timeline *tline = space->tline;

	LONGS_EQUAL(0, tline->elapsedTime);
	LONGS_EQUAL(0, tline->iterateSerial);
	//pointless DOUBLES_EQUAL(1.0, tline->dt, 1e-12);
	LONGS_EQUAL(100, tline->stepsPerIteration);
	DOUBLES_EQUAL(0.5, tline->lowPassDilution, 1e-12);
	LONGS_EQUAL(false, tline->isIterating);


	// lets see if the buffers are all large enough
//	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(tline->mainQWave->wave	, nPoints * sizeof(qCx));
	proveItsMine(tline->scratchQWave->wave, nPoints * sizeof(qCx));
	proveItsMine(tline->viewBuffer->buffer, nPoints * sizeof(float) * 8);

//	printf("🧨 🧨       we're done, deleting freeBufferList=%p\n", space->freeBufferList);
	deleteTheSpace();
//	printf("🧨 🧨       completeNewManiGauntlet() completed\n");
}

TEST(Timeline, Timeline_completeNewManiGauntlet4000) { completeNewManiGauntlet(4000, 4096, 4096); }
TEST(Timeline, Timeline_completeNewManiGauntlet254) { completeNewManiGauntlet(254, 256, 256); }
TEST(Timeline, Timeline_completeNewManiGauntlet63) { completeNewManiGauntlet(63, 64, 65); }
TEST(Timeline, Timeline_completeNewManiGauntlet48) { completeNewManiGauntlet(48, 64, 64); }
TEST(Timeline, Timeline_completeNewManiGauntlet32) { completeNewManiGauntlet(32, 32, 34); }
TEST(Timeline, Timeline_completeNewManiGauntlet32x) { completeNewManiGauntlet(32, 32, 34); }
TEST(Timeline, Timeline_completeNewManiGauntlet4) { completeNewManiGauntlet(4, 4, 6); }

