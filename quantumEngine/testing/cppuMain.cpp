/*
** cppu main -- cppu Unit Test main source, top level
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include "../spaceWave/qCx.h"

#include "CppUTest/TestHarness.h"
#include "CppUTest/CommandLineTestRunner.h"
#include "CppUTest/SimpleString.h"

#include "./cppuMain.h"

int main(int ac, char** av)
{
    return CommandLineTestRunner::RunAllTests(ac, av);
}

//TEST_GROUP(FirstTestGroup)
//{
//};
//
//TEST(FirstTestGroup, FirstTest)
//{
//   FAIL("Fail me!");
//}
//
//TEST(FirstTestGroup, StringTest)
//{
//    STRCMP_EQUAL("till you decide", "till you decide");
//}

/* ******************************************************** helpers */

// this is how it figures complex equality - this turns it all into a string and they compare strings.
SimpleString StringFrom(const qCx value) {
	char buffer[50];
	sprintf(buffer, "%lf%+lfi", value.re, value.im);
	SimpleString buf = SimpleString(buffer);
	return buf;
}


