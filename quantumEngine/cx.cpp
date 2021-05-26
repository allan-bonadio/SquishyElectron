
#include <math.h>
#include "cx.h"


FLOAT cx::abs() {
	return sqrt(this->norm());
}

FLOAT cx::phase() {
	return atan2(im, re) * 180 / PI;
}
