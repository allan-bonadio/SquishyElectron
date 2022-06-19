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
TEST(Avatar, CheckConstructor)
{
	qSpace *space = makeBareSpace(8, contENDLESS);
	Avatar *avatar = new Avatar(space);

	LONGS_EQUAL(0.5, avatar->lowPassFilter);

	LONGS_EQUAL(false, avatar->pleaseFFT);
	LONGS_EQUAL(false, avatar->isIterating);

	delete avatar;
	delete space;
}



// boring, just copied from the space test script

// this tests the whole shebang, as created from JS
void completeNewAvatarGauntlet(int N, int expectedSpectrumLength, int expectedFreeBufferLength) {
//	printf("🧨 🧨 starting completeNewAvatarGauntlet(N=%d, sl=%d, fbl=%d)\n",
//		N, expectedSpectrumLength, expectedFreeBufferLength);
	qSpace *space = makeFullSpace(N);
//	printf("🧨 🧨       created the space and all the buffers; freeBufferList=%p\n", space->freeBufferList);
	int nPoints = space->nPoints;

	LONGS_EQUAL(0, theAvatar->elapsedTime);
	LONGS_EQUAL(0, theAvatar->iterateSerial);
	//pointless DOUBLES_EQUAL(1.0, theAvatar->dt, 1e-12);
	LONGS_EQUAL(100, theAvatar->stepsPerIteration);
	DOUBLES_EQUAL(0.125, theAvatar->lowPassFilter, 1e-12);
	LONGS_EQUAL(false, theAvatar->isIterating);


	// lets see if the buffers are all large enough
//	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(theAvatar->mainQWave->wave	, nPoints * sizeof(qCx));

	theAvatar->getScratchWave();
	proveItsMine(theAvatar->scratchQWave->wave, nPoints * sizeof(qCx));

	theAvatar->getSpect();
	proveItsMine(theAvatar->qvBuffer->vBuffer, nPoints * sizeof(float) * 8);

	// will also delete the avatar and other buffers
	deleteTheSpace();
}

TEST(Avatar, Avatar_completeNewAvatarGauntlet4000) { completeNewAvatarGauntlet(4096, 4096, 4098); }
TEST(Avatar, Avatar_completeNewAvatarGauntlet254) { completeNewAvatarGauntlet(256, 256, 258); }
TEST(Avatar, Avatar_completeNewAvatarGauntlet63) { completeNewAvatarGauntlet(64, 64, 66); }
TEST(Avatar, Avatar_completeNewAvatarGauntlet32) { completeNewAvatarGauntlet(32, 32, 34); }
TEST(Avatar, Avatar_completeNewAvatarGauntlet32x) { completeNewAvatarGauntlet(32, 32, 34); }
TEST(Avatar, Avatar_completeNewAvatarGauntlet4) { completeNewAvatarGauntlet(4, 4, 6); }

