//#include <string>
//#include "../spaceWave/qCx.h"
#include "./qSpace.h"
#include "./qWave.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"

// does this do anything?
//using namespace std;


/* ***************************************************************** Buffer */

TEST_GROUP(qBuffer)
{
};

// create and destroy a buffer of length complex nums.
// in the middle, check several values that should be right
// and make sure we own the bytes we think we do.
static void testABufferLength(int length, qCx *useThisBuffer = NULL) {
	// uncomment this if you want to see which one failed
	printf("🧨: testing %d point buffer with x%p\n", length, useThisBuffer);

	qBuffer *qBuf = new qBuffer();
	LONGS_EQUAL_TEXT('qBuf', qBuf->magic, "qbuffer magic");
	POINTERS_EQUAL_TEXT(NULL, qBuf->wave, "qbuffer wave null");

	qBuf->initBuffer(length, useThisBuffer);
	LONGS_EQUAL_TEXT(length, qBuf->nPoints, "qbuffer nPoints");

	if (useThisBuffer){
		CHECK_TEXT(! qBuf->dynamicallyAllocated, "qbuffer !dynamicallyAllocated");
	}
	else {
		CHECK_TEXT(qBuf->dynamicallyAllocated, "qbuffer dynamicallyAllocated");
	}

	CHECK_TEXT(qBuf->wave, "qbuffer wave nonnull");

	proveItsMine(qBuf->wave, length * sizeof(qCx));

	delete qBuf;
}


TEST(qBuffer, BufferConstructDestruct)
{
	testABufferLength(1);
	testABufferLength(4);
	testABufferLength(8);
	testABufferLength(16);
	testABufferLength(18);
	testABufferLength(32);
	testABufferLength(34);
	testABufferLength(1024);
	testABufferLength(1026);
	testABufferLength(3233);
}

TEST(qBuffer, BufferUseThisBufferTwoAtOnce)
{
	// make sure there isn't anything shared between them.
	qCx *buf555 = (qCx *) malloc(555 * sizeof(qCx));
	qCx *buf8 = (qCx *) malloc(8 * sizeof(qCx));

	testABufferLength(8, buf8);
	testABufferLength(555, buf555);

	free(buf555);
	free(buf8);
}

TEST(qBuffer, BufferAllocateFreeTwoAtOnce)
{
	// make sure there isn't anything shared between them.
	qCx *buf27 = allocateWave(27);
	qCx *buf999 = allocateWave(999);

	testABufferLength(999, buf999);
	testABufferLength(27, buf27);

	freeWave(buf27);
	freeWave(buf999);
}


/* ***************************************************************** Wave */

TEST_GROUP(qWave)
{
};


static void tryOutWave(int N) {
	printf("🧨 🧨  starting tryOutWave(N=%d)\n", N);
	qSpace *space = makeFull1dSpace(N);
	printf("🚀 🚀      tryOutWave: freeBufferList: x%p\n", space->freeBufferList);

//	qWave *qWav = new qWave(space);

//	LONGS_EQUAL_TEXT('qWav', qWav->magic, "qwave magic");
//	CHECK_TEXT(qWav->wave, "qwave wave");
//	CHECK_TEXT(qWav->dynamicallyAllocated, "qwave dynamicallyAllocated");
//
//	LONGS_EQUAL_TEXT(1, qWav->start, "qwave start");
//	LONGS_EQUAL_TEXT(N+1, qWav->end, "qwave end");
//	LONGS_EQUAL_TEXT(N+2, qWav->nPoints, "qwave nPoints");

//	proveItsMine(qWav->wave, qWav->nPoints * sizeof(qCx));

//	delete qWav;
	delete space;
}

TEST(qWave, WaveConstructDestruct)
{
//	tryOutWave(4);
//	tryOutWave(31);
	tryOutWave(32);
	tryOutWave(33);
	tryOutWave(33);
	tryOutWave(600);
	tryOutWave(1024);
}



/* ***************************************************************** Spectrum */

TEST_GROUP(qSpectrum)
{
};

static void tryOutSpectrum(int N, int expectedSpLength, int expectedFBLength) {
	printf("🧨 🧨  starting tryOutSpectrum(N=%d, sl=%d, fbl=%d)\n",
		N, expectedSpLength, expectedFBLength);
	qSpace *space = makeFull1dSpace(N);
	printf("🧨 🧨    made it this far, %s:%d\n", __FILE__, __LINE__);
	qSpectrum *qSpe = new qSpectrum(space);
	printf("🧨 🧨    made it this far, %s:%d\n", __FILE__, __LINE__);

	// whatsi sposed to be?  Find next powerof 2.  Try to do it differently
	// from the software; not nec elegant
	int po2 = 1;
	for (int j = 1; j < 4096; j *= 2) {
		if (j & (N-1))
			po2 = j * 2;
	}
	printf("🧨 🧨    the po2 is %d, from N=%d\n", po2, N);

	LONGS_EQUAL_TEXT('qSpe', qSpe->magic, "qspectrum magic");
	CHECK_TEXT(qSpe->wave, "qspectrum wave");
	CHECK_TEXT(qSpe->dynamicallyAllocated, "qspectrum dynamicallyAllocated");

	// nPoints == spectrumLength
	LONGS_EQUAL_TEXT(po2, qSpe->nPoints, "qspectrum nPoints");
	LONGS_EQUAL_TEXT(expectedFBLength, space->freeBufferLength, "qspectrum freeBufferLength");

	//proveItsMine(qSpe->wave, qSpe->nPoints * sizeof(qCx));

	delete qSpe;
	delete space;
}

IGNORE_TEST(qSpectrum, qSpectrumConstructDestruct)
{
	//tryOutSpectrum(4, 4, 6);
	tryOutSpectrum(31, 32, 33);
	//tryOutSpectrum(32, 32, 34);
	//tryOutSpectrum(33, 64, 64);
	tryOutSpectrum(101, 128, 128);
	tryOutSpectrum(600, 1024, 1026);
	tryOutSpectrum(2048, 2048, 2050);
}



