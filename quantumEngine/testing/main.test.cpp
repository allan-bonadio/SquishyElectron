#include <stdio.h>
#include "../qSpace.h"
#include "test.h"
//#include "../qCx.h"


const char *redAnsiStyle = "\e[1;101;30m";
const char *offAnsiStyle = "\e[0m";

int main() {

	printf("trial %sred stuff%s\n", redAnsiStyle, offAnsiStyle);


	run_qCx_tests();

	run_rk2_tests();


/*
	qCx zero(0, 0);
	printf("bonjour zero is %lf, %lf\n", zero.re, zero.im);

	qCx two(2, 0);
	printf("bonjour two is %lf, %lf\n", two.re, two.im);

	qCx three(3);
	printf("bonjour three is %lf, %lf\n", three.re, three.im);

	qCx five = two + three;
	printf("bonjour five is %lf, %lf\n", five.re, five.im);

	qCx zoot = five;
	zoot += qCx(-7, 7);
	printf("bonjour zoot is %lf, %lf\n", zoot.re, zoot.im);
 */

	return 0;
}
