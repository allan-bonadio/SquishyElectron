#include "../squish.h"
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"
#include "../testing/cppuMain.h"

#include "CppUTest/TestHarness.h"


TEST_GROUP(Visscher)
{
};



/* ****************************************************************** one step */

// created once and never freed
qSpace *space4 = makeBareSpace(4);
qWave *oldWave4 = new qWave(space4);
qWave *newWave4 = new qWave(space4);

qCx ex4Wave[6] = {
	qCx(-0.01, -.5),
	qCx(.5, -0.01), qCx(0.01, .5),
	qCx(-.5, 0.01), qCx(-0.01, -.5),
	qCx(.5, -0.01)
};
qWave *expectedWave4 = new qWave(space4, ex4Wave);


TEST(Visscher, VisscherOneStep)
{
	setCircularWave(oldWave4, 1.);

	space4->dt = 0.01;
	space4->oneVisscherStep(oldWave4, newWave4);

	//newWave4->dumpWave("VisscherOneStep");
	//expectedWave4->dumpHiRes("expectedWave4");
	//oldWave4->dumpHiRes("oldWave4");
	//newWave4->dumpHiRes("newWave4");
	compareWaves(expectedWave4, newWave4);
}

/* ****************************************************************** one iteration */

TEST(Visscher, VisscherOneIteration)
{
	// simulate the app starting up
	makeFullSpace(32);

	theSpace->stepsPerIteration = 100;

	setCircularWave(oldWave4, 1.);



	// simulate the app taking one iter = 100 steps
	theSpace->oneIteration();

	// simulate the app ... tearing down, although probably not done much in reality
	deleteTheSpace();

	// anhything i'm forgetting?
}
