#include <stdio.h>
#include "../qSpace.h"
#include "test.h"


const char *redAnsiStyle = "\e[1;101;37m";
const char *offAnsiStyle = "\e[0m";

// this is c++ test main(), not the main main() for running squish
int main() {

	//printf("trial %sred stuff%s\n", redAnsiStyle, offAnsiStyle);


	run_qCx_tests();

	run_rk2_tests();

	run_wave_tests();

	return 0;
}
