#include "qSpace.h"
#include <cmath>

class qSpace *theSpace = NULL;
class qCx *theWave = NULL, *sumWave = NULL,
	*k1Wave = NULL, *k2Wave = NULL, *k3Wave = NULL, *k4Wave = NULL,
	*egyptWave = NULL, *laosWave = NULL;
qReal *thePotential = NULL;
qReal elapsedTime = 0;


static int dimsSoFar;


// someday I need an C++ error handling layer.  See
// https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#handling-c-exceptions-from-javascript


extern "C" {

// call this to throw away existing space and wave, and start new
int32_t startNewSpace(void) {
	//printf("startNewSpace()\n");

	if (theSpace) {
		delete[] theWave;
		delete[] sumWave;
		delete[] k1Wave;
		delete[] k2Wave;
		delete[] k3Wave;
		delete[] k4Wave;
		delete[] egyptWave;
		delete[] laosWave;
		delete[] thePotential;
		delete[] viewBuffer;
		delete theSpace;
	}
	elapsedTime = 0;

	dimsSoFar = 0;
	theSpace = new qSpace(1);
	//printf("  done startNewSpace()\n");

	return true;
}

// call this from JS to add one or more dimensions
int32_t addSpaceDimension(int32_t N, int32_t continuum, const char *label) {
	//printf("addSpaceDimension(%d, %d, %s)\n", N, continuum, label);

	qDimension *dim = theSpace->dimensions + dimsSoFar;
	dim->N = N;
	dim->continuum = continuum;

	dim->continuum = continuum;
	if (continuum) {
		dim->start = 1;
		dim->end = N + 1;
	}
	else {
		dim->start = 0;
		dim->end = N;
	}

	strncpy(dim->label, label, LABEL_LEN-1);

	dimsSoFar++;
	//printf("  done addSpaceDimension() %s\n", dim->label);
	return true;
}

// call this from JS to finish the process
int32_t completeNewSpace(void) {
	//printf("completeNewSpace()\n");
	int32_t ix;
	int32_t nPoints = 1, nStates = 1;

	theSpace->nDimensions = dimsSoFar;

	// finish up all the dimensions now that we know them all
	for (ix = dimsSoFar-1; ix >= 0; ix--) {
		qDimension *dim = theSpace->dimensions + ix;

		nStates *= dim->N;
		dim->nStates = nStates;
		nPoints *= dim->start + dim->end;
		dim->nPoints = nPoints;
	}
	theSpace->nStates = nStates;
	theSpace->nPoints = nPoints;

	//  allocate the buffers
	theWave = new qCx[nPoints];
	sumWave = new qCx[nPoints];
	k1Wave = new qCx[nPoints];
	k2Wave = new qCx[nPoints];
	k3Wave = new qCx[nPoints];
	k4Wave = new qCx[nPoints];
	egyptWave = new qCx[nPoints];
	laosWave = new qCx[nPoints];

	viewBuffer = new float[nPoints * 8];  // 4 floats per vertex, two verts per point

	// a default
	theSpace->dimensions->setCircularWave(theWave, 1);
	//theSpace->dumpWave("freshly created");

	thePotential = new qReal[nPoints];
	theSpace->setValleyPotential(1., 1., 0.); // another default
	//theSpace->dumpPotential("freshly created");

	theSpace->iterationCount = 0;

	//printf("  done completeNewSpace(), nStates=%d, nPoints=%d\n", nStates, nPoints);
	//printf("  dimension N=%d  extraN=%d  continuum=%d  start=%d  end=%d  label=%s\n",
	//	theSpace->dimensions->N, theSpace->dimensions->extraN, theSpace->dimensions->continuum,
	//	theSpace->dimensions->start, theSpace->dimensions->end, theSpace->dimensions->label);
	return nPoints;
}

/* ********************************************************** glue functions */

// these are for JS only; they're all extern "C"

qCx *getWaveBuffer(void) {
	return theWave;
}
qReal *getPotentialBuffer(void) {
	return thePotential;
}

int32_t getElapsedTime(void) {
	return elapsedTime;
}

void qSpace_dumpPotential(char *title) { theSpace->dumpPotential(title); }
void qSpace_setZeroPotential(void) { theSpace->setZeroPotential(); }
void qSpace_setValleyPotential(qReal power, qReal scale, qReal offset) {
	theSpace->setValleyPotential(power, scale, offset);
}

void qSpace_dumpWave(char *title) { theSpace->dumpWave(title); }
void qSpace_setCircularWave(qReal n) { theSpace->dimensions->setCircularWave(n); }
void qSpace_setStandingWave(qReal n) { theSpace->dimensions->setStandingWave(n); }
void qSpace_setPulseWave(qReal widthFactor, qReal cycles) { theSpace->dimensions->setPulseWave(widthFactor, cycles);
}
void qSpace_oneRk2Step() { theSpace->oneRk2Step(); }
void qSpace_oneRk4Step() { theSpace->oneRk4Step(); }


}

/* ********************************************************** potential */

void qSpace::dumpPotential(const char *title) {
	int ix;
	qDimension *dim = this->dimensions;

	printf("== Potential %s, %d...%d", title, dim->start, dim->end);
	if (dim->continuum) printf("  start [O]=%lf", thePotential[0]);
	printf("\n");

	for (ix = dim->start; ix < dim->end; ix++) {
		if (0 == ix % 10) printf("\n[%d] ", ix);
		printf("%lf ", thePotential[ix]);
	}
	if (dim->continuum) printf("\nend [%d]=%lf", ix, thePotential[ix]);
	printf("\n");
}

void qSpace::setZeroPotential(void) {
	qDimension *dim = theSpace->dimensions;
	for (int ix = 0; ix < dim->nPoints; ix++)
		thePotential[ix] = 0.;
}

void qSpace::setValleyPotential(qReal power = 1, qReal scale = 1, qReal offset = 0) {
	qDimension *dim = theSpace->dimensions;
	qReal mid = floor(dim->nPoints / 2);
	for (int ix = 0; ix < dim->nPoints; ix++) {
		thePotential[ix] = pow(abs(ix - mid), power) * scale + offset;
	}
}


/* ********************************************************** wave arithmetic */
// moved toqwave
//void qSpace::dumpThatWave(qCx *wave) {
//	int ix;
//	qDimension *dim = this->dimensions;
//
//	if (dim->continuum) printf(" [O]=(%lf,%lf)",
//		theWave[0].re, theWave[0].im);
//	//printf("\n");
//
//	for (ix = dim->start; ix < dim->end; ix++) {
//		printf("\n[%d] ", ix);
//		//if (0 == ix % 5) printf("\n[%d] ", ix);
//		printf("(%lf,%lf) ", theWave[ix].re, theWave[ix].im);
//	}
//	if (dim->continuum) printf("\nend [%d]=(%lf,%lf)",
//		ix, theWave[ix].re, theWave[ix].im);
//	printf("\n");
//}
//
//void qSpace::dumpWave(const char *title, qCx *aWave) {
//	int ix;
//	qDimension *dim = this->dimensions;
//
//	printf("\n== Wave %s", title);
//
//	this->dumpThatWave(aWave);
//
//// 	if (dim->continuum) printf(" [O]=(%lf,%lf)",
//// 		aWave[0].re, aWave[0].im);
//// 	//printf("\n");
////
//// 	for (ix = dim->start; ix < dim->end; ix++) {
//// 		printf("\n[%d] ", ix);
//// 		//if (0 == ix % 5) printf("\n[%d] ", ix);
//// 		printf("(%lf,%lf) ", aWave[ix].re, aWave[ix].im);
//// 	}
//// 	if (dim->continuum) printf("\nend [%d]=(%lf,%lf)",
//// 		ix, aWave[ix].re, aWave[ix].im);
//// 	printf("\n");
//}
//
//void qSpace::forEach(void callback(qCx a)) {
//
//}
//
//void qSpace::map(qCx callback(qCx* p)) {
//
//}
//
//void qDimension::fixBoundaries(qCx *wave) {
//	switch (this->continuum) {
//	case contDISCRETE:
//		break;
//
//	case contWELL:
//		// the points on the end are ∞ potential, but the arithmetic goes bonkers
//		// if I actually set the voltage to ∞
//		wave[0] = qCx(0);
//		wave[this->end] = qCx(0);
//		//printf("contWELL cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", this->continuum,
//		//wave[0].re, wave[0].im, wave[this->end].re, wave[this->end].im);
//		break;
//
//	case contCIRCULAR:
//		// the points on the end get set to the opposite side
//		wave[0] = wave[this->N];
//		wave[this->end] = wave[1];
//		//printf("contCIRCULAR cont=%d w0=(%lf, %lf) wEnd=(%lf, %lf)\n", this->continuum,
//		//	wave[0].re, wave[0].im, wave[this->end].re, wave[this->end].im);
//		break;
//	}
//}
//
//qReal cleanOneNumber(qReal u, int ix, int sense) {
//	if (!isfinite(u)) {
//		// just enough to be nonzero without affecting the balance
//		printf("had to prune [%d]= %f\n", ix, u);
//		qReal faker = sense ? 1e-9 :  -1e-9;
//		return faker;
//	}
//	return u;
//}
//
//// look for NaNs and other foul numbers, and replace them with something .. better.
//void qDimension::prune(qCx *wave) {
//	for (int ix = this->start; ix < this->end; ix++) {
//		wave[ix].re = cleanOneNumber(wave[ix].re, ix, ix & 1);
//		wave[ix].im = cleanOneNumber(wave[ix].im, ix, ix & 2);
//	}
//}
//
//// calculate ⟨ψ | ψ⟩  'inner product' isn't the right name is it?
//qReal qDimension::innerProduct(qCx *wave) {
//	qReal sum = 0.;
//
//	for (int ix = this->start; ix < this->end; ix++) {
//		sum += wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im;
//// 		printf("innerProduct point %d (%lf,%lf) %lf\n", ix, wave[ix].re, wave[ix].im,
//// 			wave[ix].re * wave[ix].re + wave[ix].im * wave[ix].im);
//	}
//	return sum;
//}
//
//// enforce ⟨ψ | ψ⟩ = 1 by dividing out the current value
//void qDimension::normalize(qCx *wave) {
//	qReal mag = this->innerProduct(wave);
//	printf("normalizing.  iprod=%lf\n", mag);
//	theSpace->dumpWave("The wave,before normalize");
//	if (mag == 0.) {
//		// ALL ZEROES!??! set them all to a constant, normalized
//		printf("ALL ZEROES ! ? ? ! set them all to a constant, normalized\n");
//		const qReal f = 1e-9;
//		for (int ix = this->start; ix < this->end; ix++)
//			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
//	}
//	else if (! isfinite(mag)) {
//		//
//		printf("not finite ! ? ? ! set them all to a constant, normalized\n");
//		const qReal f = 1e-9;
//		for (int ix = this->start; ix < this->end; ix++)
//			wave[ix] = qCx(ix & 1 ? -f : +f, ix & 2 ? -f : +f);
//	}
//	else {
//		mag = pow(mag, -0.5);
//
//		for (int ix = this->start; ix < this->end; ix++)
//			wave[ix] *= mag;
//	}
//	this->fixBoundaries(wave);
//	//printf("    normalizing.  new IP=%lf\n", this->innerProduct(wave));
//}
//
//// average the wave's points with the two closest neighbors to fix the divergence
//// along the x axis I always see.  Since the thickness of our mesh is finite,
//// you can't expect noise at or near the frequency of the mesh to be meaningful.
//void qDimension::lowPassFilter(qCx *wave) {
//	qCx avg, d2prev = wave[0];
//
//	this->prune(wave);
//
//	for (int ix = this->start; ix < this->end; ix++) {
//		if ((ix && ix < this->N - 1) || this->continuum) {
//			avg = wave[ix-1] + wave[ix] * 2. + wave[ix+1];
//			wave[ix-1] = d2prev;
//			d2prev = avg;
//		}
//	}
//	this->normalize(wave);
//}
//
//
///* ********************************************************** set wave */
//
//// n is  number of cycles all the way across N points.
//// n 'should' be an integer to make it meet up on ends if wraparound
//// pass negative to make it go backward.
//// the first point here is like x=0 as far as the trig functions, and the last like x=-1
//void qDimension::setCircularWave(qCx *wave, qReal n) {
//	qReal angle, dAngle = 2. * PI / this->N;
//	for (int ix = this->start; ix < this->end; ix++) {
//		angle = dAngle * (ix - this->start) * n;
//		wave[ix] = qCx(cos(angle), sin(angle));
//	}
//	this->normalize(wave);
//}
//
//// make a superposition of two waves in opposite directions.
//// n 'should' be an integer to make it meet up on ends if wraparound
//// oh yeah, the walls on the sides are nodes in this case so we'll split by N+2 in that case.
//// pass negative to make it upside down.
//void qDimension::setStandingWave(qCx *wave, qReal n) {
//	int start = this->start, end = this->end, N = this->N;
//	if (this->continuum == contWELL) {
//		start--;
//		end++;
//		N += 2;
//	}
//
//	qReal dAngle = PI / N;
//	for (int ix = start; ix < end; ix++) {
//		wave[ix] = qCx(sin(dAngle * (ix - start) * n));
//	}
//	this->normalize(wave);
//}
//
//// widthFactor is number of points wide it is, fraction of N.
//// Cycles is how many circles (360°) it goes thru in that width.
//void qDimension::setPulseWave(qCx *wave, qReal widthFactor, qReal cycles) {
//
//	// start with a real wave
//	this->setCircularWave(wave, cycles / widthFactor);
//
//	// modulate with a gaussian
//	int peak = lround(this->N * widthFactor) % this->N;  // ?? i dunno
//	qReal stdDev = this->N * widthFactor / 2.;  // ?? i'm making this up
//	for (int ix = this->start; ix < this->end; ix++)
//		wave[ix] *= exp(-(ix - peak) * (ix - peak) / stdDev);
//
//	this->normalize(wave);
//}
