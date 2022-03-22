//#include <string>
//#include "../spaceWave/qCx.h"
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"

// does this do anything?
//using namespace std;


TEST_GROUP(qSpace)
{
};

TEST(qSpace, qSpace_BareGauntlet)
{
	printf("🧨 🧨  starting qSpace_BareGauntlet\n");
	qSpace *space = makeBare1dSpace(4);
	STRCMP_EQUAL(MAKEBARE1DSPACE_LABEL, space->label);

	LONGS_EQUAL(1, space->dimensions->start);
	LONGS_EQUAL(5, space->dimensions->end);
	LONGS_EQUAL(4, space->dimensions->N);
	LONGS_EQUAL(contENDLESS, space->dimensions->continuum);
	LONGS_EQUAL(6, space->dimensions->nPoints);
	LONGS_EQUAL(4, space->dimensions->nStates);
	STRCMP_EQUAL(MAKEBARE1DDIM_LABEL, space->dimensions->label);

	LONGS_EQUAL(1, space->nDimensions);

	// overall for whole space
	LONGS_EQUAL(6, space->nPoints);
	LONGS_EQUAL(4, space->nStates);

	delete space;

}


// just the constructor; it's not even fully created
TEST(qSpace, qSpace_ConstructorGauntlet)
{
	printf("🧨 🧨  starting qSpace_ConstructorGauntlet\n");
	qSpace *space = new qSpace("ShowRoomDummies");
	STRCMP_EQUAL("ShowRoomDummies", space->label);

	LONGS_EQUAL(0, space->nDimensions);
	LONGS_EQUAL(0.5, space->lowPassDilution);

	LONGS_EQUAL(false, space->pleaseFFT);
	LONGS_EQUAL(false, space->isIterating);


	delete space;
}

// this tests the whole shebang, as created from JS
void tryOneSpaceLength(int N, int expectedSpectrumLength, int expectedFreeBufferLength) {
	printf("🧨 🧨 starting tryOneSpaceLength(N=%d, sl=%d, fbl=%d)\n",
		N, expectedSpectrumLength, expectedFreeBufferLength);
	qSpace *space = makeFull1dSpace(N);
	printf("🧨 🧨       created the space and all the buffers; freeBufferList=%p\n", space->freeBufferList);
	int nPoints = space->nPoints;

	STRCMP_EQUAL_TEXT(MAKEFULL1DSPACE_LABEL, space->label, "space label");

	// these are for the dimension, of which there's only one
	LONGS_EQUAL_TEXT(1, space->dimensions->start, "space start");
	LONGS_EQUAL_TEXT(N+1, space->dimensions->end, "space end");
	LONGS_EQUAL_TEXT(N, space->dimensions->N, "space N");
	LONGS_EQUAL_TEXT(contENDLESS, space->dimensions->continuum, "space continuum");
	LONGS_EQUAL_TEXT(N+2, space->dimensions->nPoints, "space nPoints");
	LONGS_EQUAL_TEXT(N, space->dimensions->nStates, "space nStates");
	STRCMP_EQUAL_TEXT("x", space->dimensions->label, "space label");
	LONGS_EQUAL_TEXT(expectedSpectrumLength, space->dimensions->spectrumLength, "space spectrumLength");

	LONGS_EQUAL_TEXT(expectedSpectrumLength, space->spectrumLength, "space spectrumLength");
	LONGS_EQUAL_TEXT(expectedFreeBufferLength, space->freeBufferLength, "space freeBufferLength");

	LONGS_EQUAL_TEXT(1, space->nDimensions, "space nDimensions");

	// lets see if the buffers are all large enough
	printf("🧨 🧨       lets see if the buffers are all large enough freeBufferList=%p\n", space->freeBufferList);
	proveItsMine(laosWave, nPoints * sizeof(qCx));
	proveItsMine(peruWave, nPoints * sizeof(qCx));
	proveItsMine(theSpace->potential, nPoints * sizeof(double));
	proveItsMine(theQViewBuffer->viewBuffer, nPoints * sizeof(float) * 8);

	printf("🧨 🧨       we're done, deleting freeBufferList=%p\n", space->freeBufferList);
	deleteTheSpace();
	printf("🧨 🧨       tryOneSpaceLength() completed\n");
}

TEST(qSpace, qSpace_CompleteNewSpaceGauntlet)
{
	printf("🧨 🧨  starting qSpace_CompleteNewSpaceGauntlet\n");

	tryOneSpaceLength(4000, 4096, 4096);
	tryOneSpaceLength(254, 256, 256);
	tryOneSpaceLength(63, 64, 65);
	tryOneSpaceLength(48, 64, 64);
	tryOneSpaceLength(32, 32, 34);
	tryOneSpaceLength(32, 32, 34);
	tryOneSpaceLength(4, 4, 6);
}

