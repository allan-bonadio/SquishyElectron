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

TEST(qSpace, qSpace_CompleteNewSpaceGauntlet)
{
	printf("🧨 🧨  starting qSpace_CompleteNewSpaceGauntlet\n");
	qSpace *space = makeFull1dSpace(16);
	//printf("🧨 🧨       created the space and all the buffers\n");
	int nPoints = space->nPoints;

	STRCMP_EQUAL(MAKEFULL1DSPACE_LABEL, space->label);

	LONGS_EQUAL(1, space->dimensions->start);
	LONGS_EQUAL(17, space->dimensions->end);
	LONGS_EQUAL(16, space->dimensions->N);
	LONGS_EQUAL(contENDLESS, space->dimensions->continuum);
	LONGS_EQUAL(18, space->dimensions->nPoints);
	LONGS_EQUAL(16, space->dimensions->nStates);
	STRCMP_EQUAL("x", space->dimensions->label);

	LONGS_EQUAL(16, space->dimensions->fourierSize);
	LONGS_EQUAL(16, space->spectrumSize);
	LONGS_EQUAL(18, space->freeBufferLength);

	LONGS_EQUAL(18, space->nPoints);
	LONGS_EQUAL(16, space->nStates);
	LONGS_EQUAL(1, space->nDimensions);

	// lets see if the buffers are all large enough
	trashABuffer(laosWave, nPoints * sizeof(qCx));
	trashABuffer(peruWave, nPoints * sizeof(qCx));
	trashABuffer(theSpace->potential, nPoints * sizeof(double));
	trashABuffer(theQViewBuffer->viewBuffer, nPoints * sizeof(float) * 8);

	deleteTheSpace();
}

