//#include <string>
//#include "../spaceWave/qCx.h"
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"

// does this do anything?
//using namespace std;


TEST_GROUP(qWave)
{
};

// create and destroy a buffer of length complex nums.
// in the middle, check several values that should be right
// and make sure we own the bytes we think we do.
static void testABufferLength(int length, qCx *useThisBuffer = NULL) {
	printf(": testing %d long buffer with x%p\n", length, useThisBuffer);

	qBuffer *qBuf = new qBuffer();
	LONGS_EQUAL('qBuf', qBuf->magic);
	POINTERS_EQUAL(NULL, qBuf->wave);

	qBuf->initBuffer(length, useThisBuffer);
	LONGS_EQUAL(length, qBuf->nPoints);

	if (useThisBuffer){
		CHECK(! qBuf->dynamicallyAllocated);
	}else{
		CHECK(qBuf->dynamicallyAllocated);
}
	CHECK(qBuf->wave);

	claimItsMine(qBuf->wave, length * sizeof(qCx));

	delete qBuf;
}


TEST(qWave, BufferConstructDestruct)
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

TEST(qWave, BufferUseThisBuffer)
{
	qCx *buf;

	buf = (qCx *) malloc(8 * sizeof(qCx));
	testABufferLength(8, buf);
	free(buf);

	buf = (qCx *) malloc(555 * sizeof(qCx));
	testABufferLength(555, buf);
	free(buf);
}

TEST(qWave, allocateFree)
{
	qCx *buf;

	buf = allocateWave(27);
	testABufferLength(27, buf);
	freeWave(buf);

	buf = allocateWave(999);
	testABufferLength(999, buf);
	freeWave(buf);
}


TEST(qWave, WaveConstructDestruct)
{
//	LONGS_EQUAL(5, qBuf->nPoints);
//	LONGS_EQUAL(5, qBuf->nPoints);
}


TEST(qWave, SpectrumConstructDestruct)
{
//	LONGS_EQUAL(5, qBuf->nPoints);
//	LONGS_EQUAL(5, qBuf->nPoints);
}


//TEST(qWave, BufferConstructDestruct)
//{
//}
//
//
//TEST(qWave, BufferConstructDestruct)
//{
//}
//
//
//TEST(qWave, BufferConstructDestruct)
//{
//}
//
//
//TEST(qWave, BufferConstructDestruct)
//{
//}
//


