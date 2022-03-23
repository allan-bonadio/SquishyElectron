//#include <string>
//#include "../spaceWave/qCx.h"
#include <cmath>
#include "./qSpace.h"
#include "./qWave.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"

// does this do anything?  no.
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
	//printf("🧨: testing %d point buffer with %p\n", length, useThisBuffer);

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


TEST(qBuffer, BufferConstructDestruct1) { testABufferLength(1); }
TEST(qBuffer, BufferConstructDestruct4) { testABufferLength(4); }
TEST(qBuffer, BufferConstructDestruct8) { testABufferLength(8); }
TEST(qBuffer, BufferConstructDestruct16) { testABufferLength(16); }
TEST(qBuffer, BufferConstructDestruct32) { testABufferLength(32); }
TEST(qBuffer, BufferConstructDestruct34) { testABufferLength(34); }
TEST(qBuffer, BufferConstructDestruct1024) { testABufferLength(1024); }
TEST(qBuffer, BufferConstructDestruct1026) { testABufferLength(1026); }
TEST(qBuffer, BufferConstructDestruct3233) { testABufferLength(3233); }

TEST(qBuffer, BufferUseThisBufferMallocTwoAtOnce)
{
	// make sure there isn't anything shared between them.
	qCx *buf555 = (qCx *) malloc(555 * sizeof(qCx));
	qCx *buf8 = (qCx *) malloc(8 * sizeof(qCx));

	testABufferLength(8, buf8);
	testABufferLength(555, buf555);

	free(buf555);
	free(buf8);
}

TEST(qBuffer, BufferUseThisBufferAllocateTwoAtOnce)
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
	//printf("🌊🌊🌊  starting tryOutWave(N=%d)\n", N);
//	printf("🌊🌊🌊      tryOutWave:%d freeBufferList: %p\n", __LINE__, theSpace ? theSpace->freeBufferList : (void *) 0x99);
	qSpace *space = makeBareSpace(N);
//	printf("🌊🌊🌊      tryOutWave:%d freeBufferList: %p\n", __LINE__, space->freeBufferList);

	qWave *waveWave = new qWave(space);
//	printf("🌊🌊🌊      tryOutWave:%d freeBufferList: %p\n", __LINE__, space->freeBufferList);

	LONGS_EQUAL_TEXT('qWav', waveWave->magic, "qwave magic");
	CHECK_TEXT(waveWave->wave, "qwave wave");
	CHECK_TEXT(waveWave->dynamicallyAllocated, "qwave dynamicallyAllocated");

	LONGS_EQUAL_TEXT(1, waveWave->start, "qwave start");
	LONGS_EQUAL_TEXT(N+1, waveWave->end, "qwave end");
	LONGS_EQUAL_TEXT(N+2, waveWave->nPoints, "qwave nPoints");

	proveItsMine(waveWave->wave, waveWave->nPoints * sizeof(qCx));

	delete waveWave;
	delete space;
//	printf("🌊🌊🌊      tryOutWave:%d freeBufferList: %p\n", __LINE__, theSpace ? theSpace->freeBufferList : (void *) 0x99);
}

TEST(qWave, WaveConstructDestruct4) { tryOutWave(4); }
TEST(qWave, WaveConstructDestruct31) { tryOutWave(31); }
TEST(qWave, WaveConstructDestruct32) { tryOutWave(32); }
TEST(qWave, WaveConstructDestruct33) { tryOutWave(33); }
TEST(qWave, WaveConstructDestruct33x) { tryOutWave(33); }
TEST(qWave, WaveConstructDestruct600) { tryOutWave(600); }
TEST(qWave, WaveConstructDestruct1024) { tryOutWave(1024); }



/* ***************************************************************** Spectrum */

TEST_GROUP(qSpectrum)
{
};

// we use this dummy just for its nStates and a few other fields.  never freed.
// we get around the mem leak checker by doing this outside of a test.
static qSpace *spectSpace = new qSpace("testing chooseSpectrumLength");


static void testOneSpectrumLength(int N, int expLength) {
	//printf("chooseSpectrumLength -- testOneSpectrumLength(%s, N=%d, expected=%d) \n",
	//	spectSpace->label, N, expLength);
	spectSpace->nStates = N;
	spectSpace->chooseSpectrumLength();

	LONGS_EQUAL_TEXT(expLength, spectSpace->spectrumLength,
		"spectSpace->spectrumLength isn't right");
	LONGS_EQUAL_TEXT(expLength, spectSpace->dimensions->spectrumLength,
		"spectSpace->dimensions->spectrumLength isn't right");
}

// in detail, 8 thru 16
TEST(qSpectrum, chooseSpectrumLength12) { testOneSpectrumLength(12, 16); }
TEST(qSpectrum, chooseSpectrumLength13) { testOneSpectrumLength(13, 16); }
TEST(qSpectrum, chooseSpectrumLength14) { testOneSpectrumLength(14, 16); }
TEST(qSpectrum, chooseSpectrumLength15) { testOneSpectrumLength(15, 16); }
TEST(qSpectrum, chooseSpectrumLength16) { testOneSpectrumLength(16, 16); }
TEST(qSpectrum, chooseSpectrumLength17) { testOneSpectrumLength(17, 32); }

TEST(qSpectrum, chooseSpectrumLength7) { testOneSpectrumLength(7, 8); }
TEST(qSpectrum, chooseSpectrumLength11) { testOneSpectrumLength(11, 16); }
TEST(qSpectrum, chooseSpectrumLength9) { testOneSpectrumLength(9, 16); }
TEST(qSpectrum, chooseSpectrumLength10) { testOneSpectrumLength(10, 16); }
TEST(qSpectrum, chooseSpectrumLength8) { testOneSpectrumLength(8, 8); }

// an interesting series similar to powers of 2
TEST(qSpectrum, chooseSpectrumLength20) { testOneSpectrumLength(20, 32); }
TEST(qSpectrum, chooseSpectrumLength50) { testOneSpectrumLength(50, 64); }
TEST(qSpectrum, chooseSpectrumLength100) { testOneSpectrumLength(100, 128); }
TEST(qSpectrum, chooseSpectrumLength200) { testOneSpectrumLength(200, 256); }
TEST(qSpectrum, chooseSpectrumLength500) { testOneSpectrumLength(500, 512); }
TEST(qSpectrum, chooseSpectrumLength1000) { testOneSpectrumLength(1000, 1024); }
TEST(qSpectrum, chooseSpectrumLength2000) { testOneSpectrumLength(2000, 2048); }
TEST(qSpectrum, chooseSpectrumLength5000) { testOneSpectrumLength(5000, 8192); }
TEST(qSpectrum, chooseSpectrumLength10000) { testOneSpectrumLength(10000, 16384); }
TEST(qSpectrum, chooseSpectrumLength20000) { testOneSpectrumLength(20000, 32768); }
TEST(qSpectrum, chooseSpectrumLength50000) { testOneSpectrumLength(50000, 65536); }

// all the exact powers of 2 have to map to the same
TEST(qSpectrum, chooseSpectrumLength4) { testOneSpectrumLength(4, 4); }
TEST(qSpectrum, chooseSpectrumLength32) { testOneSpectrumLength(32, 32); }
TEST(qSpectrum, chooseSpectrumLength128) { testOneSpectrumLength(128, 128); }
TEST(qSpectrum, chooseSpectrumLength256) { testOneSpectrumLength(256, 256); }
TEST(qSpectrum, chooseSpectrumLength1024) { testOneSpectrumLength(1024, 1024); }
TEST(qSpectrum, chooseSpectrumLength65536) { testOneSpectrumLength(65536, 65536); }
TEST(qSpectrum, chooseSpectrumLength131072) { testOneSpectrumLength(131072, 131072); }
TEST(qSpectrum, chooseSpectrumLength524288) { testOneSpectrumLength(524288, 524288); }


static void tryOutSpectrum(int N, int expectedSpLength, int expectedFBLength) {
	//printf("🌊🌊🌊  starting tryOutSpectrum(N=%d, sl=%d, fbl=%d)\n",
	//	N, expectedSpLength, expectedFBLength);
	qSpace *space = makeFullSpace(N);
	//printf("🌊🌊🌊    made it this far, %s:%d\n", __FILE__, __LINE__);
	qSpectrum *spectrum = new qSpectrum(space);
	//printf("🌊🌊🌊    made it this far, %s:%d\n", __FILE__, __LINE__);

	// whatsi sposed to be?  Find next powerof 2.  Try to do it differently
	// from the software; not nec elegant
	int po2 = pow(2., ceil(log2(N)) );
//	int po2 = 1;
//	for (int j = 1; j < 4096; j *= 2) {
//		if (j & (N-1))
//			po2 = j * 2;
//	}
	//printf("🌊🌊🌊    the po2 is %d, from N=%d\n", po2, N);

	LONGS_EQUAL_TEXT('qSpe', spectrum->magic, "qspectrum magic");
	CHECK_TEXT(spectrum->wave, "qspectrum wave");
	CHECK_TEXT(spectrum->dynamicallyAllocated, "qspectrum dynamicallyAllocated");

	// nPoints == spectrumLength
	LONGS_EQUAL_TEXT(po2, spectrum->nPoints, "qspectrum nPoints");
	LONGS_EQUAL_TEXT(expectedFBLength, space->freeBufferLength, "qspectrum freeBufferLength");

	proveItsMine(spectrum->wave, spectrum->nPoints * sizeof(qCx));

	delete spectrum;
	deleteTheSpace();
}

// test out multiple cases.  For waves the bufsize is +2; for spectra, the next power of 2
TEST(qSpectrum, qSpectrumConstructDestruct29) { tryOutSpectrum(29, 32, 32); }
TEST(qSpectrum, qSpectrumConstructDestruct30) { tryOutSpectrum(30, 32, 32); }
TEST(qSpectrum, qSpectrumConstructDestruct31) { tryOutSpectrum(31, 32, 33); }
TEST(qSpectrum, qSpectrumConstructDestruct32) { tryOutSpectrum(32, 32, 34); }
TEST(qSpectrum, qSpectrumConstructDestruct33) { tryOutSpectrum(33, 64, 64); }

TEST(qSpectrum, qSpectrumConstructDestruct4) { tryOutSpectrum(4, 4, 6); }
TEST(qSpectrum, qSpectrumConstructDestruct101) { tryOutSpectrum(101, 128, 128); }
TEST(qSpectrum, qSpectrumConstructDestruct600) { tryOutSpectrum(600, 1024, 1024); }
TEST(qSpectrum, qSpectrumConstructDestruct2048) { tryOutSpectrum(2048, 2048, 2050); }



