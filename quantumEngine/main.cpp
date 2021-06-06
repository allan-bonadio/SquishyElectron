#include <stdio.h>

#include "qSpace.h"

#include <cmath>


void forMe(void) {
	// for me
// 	qReal aReal;
// 	int anInt;
//
// 	printf("--------- for me -----------\n");
// 	printf("size of ints: short %ld, int %ld, long %ld, , size_t %ld\n",
// 		sizeof(short), sizeof(int), sizeof(long), sizeof(size_t));
// 	printf("align of ints: short %ld, int %ld, long %ld, , size_t %ld\n",
// 		alignof(short), alignof(int), alignof(long), alignof(size_t));
//
// 	printf("size of misc: int * %ld, bool %ld, long double %ld, , int32_t %ld\n",
// 		sizeof(int *), sizeof(bool), sizeof(long double), sizeof(int32_t));
//
// 	aReal = frexp (17., &anInt);
// 	printf("floats: logb %lf, ilogb %d, scalbn %lf, nextafter(1,2) %32lf,  frexp(17,&i) %lf %d\n",
// 		logb(1000.), ilogb(1000.), scalbn(7,3), nextafter(1.,2.), aReal, anInt);
//
// 	aReal = frexp (17., &anInt);
// 	printf("floats: ldexp(5,3) %lf,  frexp(17,&i) %lf %d, INFINITY %lf, -INFINITY %lf, NAN %lf\n",
// 		ldexp(5.,3.), aReal, anInt, INFINITY, -INFINITY, NAN);
//
// 	double* p = new double[]{1,2,3};
// 	printf("double* p = new double[]{1,2,3}; %lf %lf %lf %lf\n",
// 		p[0], p[1], p[2], p[3]);
//
//
// 	printf("char size: char %ld %d, wchar_t %ld %d, char16_t %ld %d\n",
// 		sizeof(char), (char) -1, sizeof(wchar_t), (wchar_t) -1, sizeof(char16_t), (char16_t) -1);
//
// 	printf("char lits: 'a' %x, 'ab' %x, u'a' %x, u'ж' %x, u'ℏ' %x\n",
// 		'a', 'ab', u'a', u'ж', u'ℏ');
//
// 	printf("str lits: \"a\" %x, \"ж\" %x %x,  \"ℏ\" %x %x %x, \"ab\" %x %x, "
// 			"u\"a\" %x, u\"ж\" %x %x, u\"ℏ\" %x %x %x, u\"ab\" %x %x, "
// 			"u\"😀\" %x %x %x %x\n",
// 		"a"[0], "ж"[0], "ж"[1], "ℏ"[0], "ℏ"[1], "ℏ"[2], "ab"[0], "ab"[1],
// 		u"a"[0], u"ж"[0], u"ж"[1], u"ℏ"[0], u"ℏ"[1], u"ℏ"[2], u"ab"[0], u"ab"[1],
// 		u"😀"[0], u"😀"[1], u"😀"[2], u"😀"[3]);
//
// 	printf("--------- done for me -----------\n");

}


// call this JS callback so JS knows we're up and ready.
// Hand it some sizes so it knows where everything is in the space buffer.
// which it'll construct.
// somehow there's a race condition where this isn't set soon enough... sometimes
EM_JS(void, qeStarted,
	(int32_t mDimensions, int32_t mLabel),
	{
		setTimeout(() => quantumEngineHasStarted(mDimensions, mLabel), 200);
	});

int main() {
	printf("bonjour le monde! sizeof(qDimension) = %lu, sizeof(qSpace) = %lu\n",
		sizeof(qDimension), sizeof(qSpace));

	qeStarted(MAX_DIMENSIONS, LABEL_LEN);

	//forMe();

	return 0;
}

/* ************************************************* error handling */

// wasm-ld: error: /var/folders/th/9674h0fx4hx2d7y751ln3g1r0000gn/T/emscripten_temp_nx3ony_i/main_0.o: undefined symbol: _embind_register_function

//#include "/dvl/emscripten/emsdk-main/upstream/emscripten/system/include/emscripten/bind.h"
//
//std::string getExceptionMessage(intptr_t exceptionPtr) {
//  return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what());
//}
//
//EMSCRIPTEN_BINDINGS(Bindings) {
//  emscripten::function("getExceptionMessage", &getExceptionMessage);
//};



/*
extern "C" {

	// need this to set up data structures in JS
	// no not really
	void getQuantumSizes(int32_t sizesArray[5]) {
		sizesArray[0] = sizeof(qReal);
		sizesArray[1] = sizeof(qCx);
		sizesArray[2] = MAX_DIMENSIONS;
		sizesArray[3] = sizeof(qDimension);
		sizesArray[4] = sizeof(qSpace);
	}

}
 */


