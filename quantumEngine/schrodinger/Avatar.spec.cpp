/*
** quantum Avatar tests
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


#include "../spaceWave/qSpace.h"
#include "../schrodinger/Avatar.h"
#include "../spaceWave/qWave.h"
#include "../spaceWave/qViewBuffer.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"




TEST_GROUP(Avatar)
{
};

// just the constructor; it's not even fully created
TEST(Avatar, Avatar_ConstructorGauntlet)
{
	qSpace *space = makeBareSpace(8, contENDLESS);
	Avatar *avatar = space->avatar;

	LONGS_EQUAL(0.5, avatar->lowPassFilter);

	LONGS_EQUAL(false, avatar->pleaseFFT);
	LONGS_EQUAL(false, avatar->isIterating);


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
	Avatar *avatar = space->avatar;

	LONGS_EQUAL(0, avatar->elapsedTime);
	LONGS_EQUAL(0, avatar->iterateSerial);
	//pointless DOUBLES_EQUAL(1.0, avatar->dt, 1e-12);
	LONGS_EQUAL(100, avatar->stepsPerIteration);
	DOUBLES_EQUAL(0.5, avatar->lowPassFilter, 1e-12);
	LONGS_EQUAL(false, avatar->isIterating);


	// lets see if the buffers are all large enough
//	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(avatar->mainQWave->wave	, nPoints * sizeof(qCx));
	proveItsMine(avatar->scratchQWave->wave, nPoints * sizeof(qCx));
	proveItsMine(avatar->viewBuffer->buffer, nPoints * sizeof(float) * 8);

//	printf("🧨 🧨       we're done, deleting freeBufferList=%p\n", space->freeBufferList);
	deleteTheSpace();
//	printf("🧨 🧨       completeNewManiGauntlet() completed\n");
}

TEST(Avatar, Avatar_completeNewManiGauntlet4000) { completeNewManiGauntlet(4000, 4096, 4096); }
TEST(Avatar, Avatar_completeNewManiGauntlet254) { completeNewManiGauntlet(254, 256, 256); }
TEST(Avatar, Avatar_completeNewManiGauntlet63) { completeNewManiGauntlet(63, 64, 65); }
TEST(Avatar, Avatar_completeNewManiGauntlet48) { completeNewManiGauntlet(48, 64, 64); }
TEST(Avatar, Avatar_completeNewManiGauntlet32) { completeNewManiGauntlet(32, 32, 34); }
TEST(Avatar, Avatar_completeNewManiGauntlet32x) { completeNewManiGauntlet(32, 32, 34); }
TEST(Avatar, Avatar_completeNewManiGauntlet4) { completeNewManiGauntlet(4, 4, 6); }

