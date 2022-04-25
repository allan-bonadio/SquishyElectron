/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

// found on programmerall.com but I can't find it again.
// All I remember was some chinese writing as I was downloading it.

this file is no longer used


/* *************************************************** only powers of 2 */

//#include <cmath>
#include <string>
#include <vector>
#include <iostream>
#include "../spaceWave/qSpace.h"
#include "../spaceWave/qWave.h"
#include "fftMain.h"

using namespace std;

//Define a plural structure - switched over to qCx
//struct Complex
//{
//    double imaginary;
//    double real;
//};


//Multiple multiplication function
//qCx ComplexMulti(qCx One, qCx Two);

//Fill any array of inputs to meet fast Fourier transform
void Data_Expand(double *input, vector<double> &output, const int length);

//Convert the entered real array to multiple arrays
void Real_Complex(vector<double> &input, qCx *output, const int length);

//Fast Fourier transform function
void FFT_Forword(qCx *input, qCx *StoreResult, const int length);

//Fast Fourier anti-transformation
void FFT_Inverse(qCx *arrayinput, qCx *arrayoutput, const int length);

//int testChinese()
//{
//    //Get the filled DATA;
//    vector<double> Data;
//    Data_Expand(Datapre, Data, 10);
//
//    //Print the sequence after printing
//    for (auto data : Data)
//    {
//        cout << data << endl;
//    }
//
//    //Since the following complex structure does not use a dynamic array structure, the size of the array is required according to the actual situation.
//    //Transform the input array into a plural array
//    qCx array1D[16];
//
//    //Store Fourier transform results
//    qCx Result[16];
//
//    //Store the result of the anti-Yibo transformation
//    qCx Result_Inverse[16];
//
//    Real_Complex(Data, array1D, 16);
//    FFT(array1D, Result, 16);
//    FFT_Inverse(Result, Result_Inverse, 16);
//    //Scope-based cycle, using Auto automatically judges the data type of the elements within the array
//    for (auto data : Result_Inverse)
//    {
//        //The amplitude after the output of Fourier transform
//        cout << data.re << "\t" << data.im << endl;
//    }
//
//    return 0;
//}

//qCx ComplexMulti(qCx One, qCx Two)
//{
//    //TEMP is used to store the result of multiplication
//    qCx Temp;
//    Temp.imaginary = One.imaginary * Two.real + One.real * Two.imaginary;
//    Temp.real = One.real * Two.real - One.imaginary * Two.imaginary;
//    return Temp;
//}

// pad the input if it's not a power of 2
//Length here is the length of the original sequence
void Data_Expand(double *input, vector<double> &output, const int length)
{
    int i = 1, flag = 1;
    while (i < length)
    {
        i = i * 2;
    }

    //Get the length of the fast Fourier transformation
    int length_Best = i;

    if (length_Best != length)
    {
        flag = 0;
    }

    if (flag)
    {
        //Fill the original sequence into the Vector
        for (int j = 0; j < length; ++j)
        {
            output.push_back(input[j]);
        }
    }

    else
    {
        //Fill the original sequence into the Vector
        for (int j = 0; j < length; ++j)
        {
            output.push_back(input[j]);
        }
        //Fill parts needed to expand
        for (int j = 0; j < length_Best - length; j++)
        {
            output.push_back(0);
        }
    }
}

//The length here is the length of the post-filled sequence
void Real_Complex(vector<double> &input, qCx *output, const int length)
{
    for (int i = 0; i < length; i++)
    {
        output[i].re = input[i];
        output[i].im = 0;
    }
}

// temp buffers; only good for one length, picked up on fft call
static int Bit[32];
int allocLength = 0;
static qCx* tempWave;
static qCx* fourier;

//FFT transformation function
//input: input array
//StoreResult: qCx array of output
//length: the length of input array
// should be qCx *dest, qCx *src, int N
void paChineseFFT(qCx *StoreResult, qCx *input, const int length)
{
	if (! allocLength) {
		allocLength = length;
		tempWave = laosQWave->allocateWave();
		fourier = laosQWave->allocateWave();
	}
	if (allocLength != length) throw std::runtime_error("allocLength !== length");

    //Get the number of sequence lengths in binary
    int nBits = log2(length);

    //Store the binary number of each index, reuse it, and clear each time you use it.
    int Bit[32];
    //list<int> Bit;

    //Temporarily store rearranged input sequences
//    tempWave;
//    template<> vector<double> tempReals;
//    template<> vector<double> tempImaginaries;

    //Each index of the sequence of sequences
    for (int i = 0; i < length; ++i)
    {
        //Flag is used to convert index into binary
        //INDEX is used to store the narrative
        //Flag2 is used to reverse binarization indexes
        int flag = 1, index = 0, flag2 = 0;

		// turn indices inside out.  This could probably be done better.
        //Traverse each of the index binary
        for (int j = 0; j < nBits; ++j)
        {
            //Decimal transformation into two-way numbers, & bit operators acting in bits, and perform operations
            //Start from the lowest position (right side)
            //example:
            //a = 011, b1 = 001, b2 = 010 ,b3 = 100
            //a & b1 = 001, a & b2 = 010, a & b3 = 000
            int x = (i & flag) > 0 ? 1 : 0;

            //Push X from the front of Bit
            Bit[j] = x;  // this isn't right, should go on front?

            //Equivalent to Flag = flag << 1, to mark the value of Flag left to Flag
            flag <<= 1;
        }

        //Reverse the index of the original array, accessing each bit of Bit through IT
        for (auto it : Bit)
        {
            //EXAMPLE: It is equivalent to set the binary number from left to right to 2 ^ 0, 2 ^ 1, 2 ^ 2
            //Bit = 011
            //1: index = 0 + 0 * pow(2, 0) = 0
            //2: index = 0 + 1 * pow(2, 1) = 2
            //3: index = 2 + 1 * pow(2, 2) = 6 = 110
            index += it * pow(2, flag2++);
        }

        //Press Data [index] from the rear end of DATATEMP, which realizes the location of the data of the original sequence.
        //Before transformation: f (0), f (1), f (2), f (3), f (4), f (5), f (6), f (7)
        //After transform: f (0), f (4), f (2), f (6), f (1), f (5), f (3), f (7)
        tempWave[i] = input[index];
//        tempReals.push_back(input[index].re);
//        tempImaginaries.push_back(input[index].im);

        //Empty bit
        for (int q = 0; q < nBits; q++) Bit[q] = 0;
        //Bit.clear();
    }

    for (int i = 0; i < length; i++)
    {
        //Transferring data to multiple structures, the index of StoreResult [i] is different from the index of the original sequence, must pay attention to
        StoreResult[i] = tempWave[i];
		//StoreResult[i].re = tempReals[i];
		//StoreResult[i].im = tempImaginaries[i];
    }

    //Requires the number of calculations
    int Level = log2(length);

    qCx Temp, up, down;

    //Dragonfly operation
    for (int i = 1; i <= Level; i++)
    {
        //Define rotary factor
        qCx Factor;

        //Distance from the butterfly knot without the crossed (don't want to index)
        //Its distance indicates the distance between the two butterfly junctions that do not cross each other.
        int BowknotDis = 2 << (i - 1);

        //Distance of two numbers in the same fans (number of rotation factors)
        //The distance here also indicates the distance between the two data in the array (don't want to index)
        int CalDis = BowknotDis / 2;

        for (int j = 0; j < CalDis; j++)
        {
            //Different rotation factors with Caldis in the butterfly calculation per level
            //Calculate the rotation factor required for each stage (i)
            Factor.re = cos(2 * PI / pow(2, i) * j);
            Factor.im = -sin(2 * PI / pow(2, i) * j);

            //Traverse each of each level
            for (int k = j; k < length - 1; k += BowknotDis)
            {
                //Storeresult [k] indicates the element on the left of the butterfly calculation
                //StoreResult [K + Caldis] indicates the element of the lower left of the butterfly arithmetic
                //Temp indicates the second half of the output structure of the butterfly arithmetic
                Temp = Factor * StoreResult[k + CalDis];

                //Up represents the elements of the butterfly calculation
                up.im = StoreResult[k].im + Temp.im;
                up.re = StoreResult[k].re + Temp.re;

                //Down indicates the element of the butterfly calculation.
                down.im = StoreResult[k].im - Temp.im;
                down.re = StoreResult[k].re - Temp.re;

                //Mount the result of the butterfly arithmetic output into Storeresult
                StoreResult[k] = up;
                StoreResult[k + CalDis] = down;
            }
        }
    }
}

void paChineseIFFT(qCx *arrayoutput, qCx *arrayinput, const int length)
{
    //Composition of complex numbers after Fourier transform
    for (int i = 0; i < length; i++)
    {
        arrayinput[i].im = -arrayinput[i].im;
    }

    //One-dimensional fast Fourier transform
    paChineseFFT(arrayinput, arrayoutput, length);

    //Time domain signal to conjugate, and normalize
    for (int i = 0; i < length; i++)
    {
        arrayoutput[i].re = arrayoutput[i].re / length;
        arrayoutput[i].im = -arrayoutput[i].im / length;
    }
}

