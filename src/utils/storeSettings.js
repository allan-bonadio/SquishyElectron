/*
** store settings -- storing control panel settings in localStorage for the next session
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


// what a disaster.   I made this whole subsystem,
// but somehow the compiler fucks it up,
// so I fell back to some lame functions.


// group, groupName = which component of storeSettings this is
// criterion: validator, see constructor
//     The criterion are fixed and more broad than some other parts of the code,
//     eg if 1/N is one of the limits, some other part of the code will enforce that, not here.
//		um... except for lowPassFilter
// The general interaction between component states and storeSettings is this:
// component states are initially set from storeSettings.
// When changed, both the state and storeSettings, and sending
// to C++ if applicable, are changed in parallel in same code.
// With a function that's general over the particular params group,
// in the component that holds the state.
// (maybe I should integrate these better...)
// upon load of this file, it'll retrieve all this stuff from localStore.
// Upon setting each var, group will be stored in localStorage.

/* ************************************************** All Settings */
//debugger;

// these'll be filled in below, dynamically created.  but none of them work.
export const storeSettings =  {};

if (typeof storeSettings == 'undefined') debugger;  // webpack fuckups

// this is such a pile of shit
let alternateStoreDefaults = {};
let alternateStoreVerifiers = {};

// somehow webpack fumbles this if it's extern, in SquishPanel
// no doesn't seem to make a diff
window.storeSettings = storeSettings;

export const surrogateCuzWebPackAlwaysFucksUp = {};


let alwaysSave = false;  // maybe don't need this anymore?

// save in the localSettings
function saveGroup(groupName) {
	localStorage.setItem(groupName, JSON.stringify(storeSettings[groupName]));
}

// figure out a function that can validate this param quickly
function makeCriterionFunction(criterion) {
	switch (typeof criterion) {
	// always or never
	case 'boolean':
		return value => criterion;

	// any function that takes the value as the only param
	case 'function':
		return criterion;

	case 'object':
		switch (criterion.constructor.name) {

		// string matching
		case 'RegExp':
			return value => criterion.test(value);

		// must be one of the values in this array
		case 'Array':
			return value => criterion.includes(value);

		default:
			throw new Error(`bad criterion class ${criterion.constructor.name}`);
		}

	default:
		throw new Error(`bad criterion type ${typeof criterion})`);
	}
}

// make a parameter storeSettings.base.name, part of storeSettings[base]
// one value that knows what's valid for it, and that's stored in localStore.
// Undefined is an illegal value; also the default default value if never set.
function makeParam(varName, groupName, defaultValue, criterion) {
	// this is where it's really stored, in the closure
	// not
	let value;

	// retrieve from localStorage and set this var, or set to default if not there yet.
	storeSettings[groupName] = storeSettings[groupName] || {};
	let group = storeSettings[groupName];
	let savedGroup = localStorage.getItem(groupName) || '{}';
	savedGroup = JSON.parse(savedGroup);
	value = (savedGroup[varName] === undefined) ? defaultValue : savedGroup[varName];

	surrogateCuzWebPackAlwaysFucksUp[groupName] = surrogateCuzWebPackAlwaysFucksUp[groupName] || {};
	surrogateCuzWebPackAlwaysFucksUp[groupName][varName] = value;



	const criterionFunction = makeCriterionFunction(criterion);

	alternateStoreDefaults[groupName] = alternateStoreDefaults[groupName] || {};
	alternateStoreDefaults[groupName][varName] = defaultValue;
	alternateStoreVerifiers[groupName] = alternateStoreVerifiers[groupName] || {};
	alternateStoreVerifiers[groupName][varName] = criterionFunction;

	// now for the shit that doesn't work
	Object.defineProperty(group, varName, {
		get: function() {
			return value
		},

		set: function(newVal) {
			if (newVal === undefined || ! criterionFunction(newVal))
				value = defaultValue;
			else
				value = newVal;

			if (alwaysSave)
				saveGroup(group);
		},

		configurable: true,
		//configurable: false,
		enumerable: true,
	});
}

/* ************************************ spaceParams */
// somewhere you have to record the defaults and criterion for each setting, so here they are

function isPowerOf2(n) {
	console.info(`isPowerOf2(${n}) `);
	while (n > 1 ){
		// if it's got more than 1 bit on
		if (n & 1) return false;
		n = n >> 1;
	}
	return true;
}

makeParam('N', 'spaceParams', 64,  N => isPowerOf2(N) );

// how to do this correctly with the defined constants???
makeParam('continuum', 'spaceParams', 2, [0, 1, 2]);
// makeParam('continuum', 'spaceParams', qeBasicSpace.contENDLESS,
// 	[qeBasicSpace.contDISCRETE, qeBasicSpace.contWELL, qeBasicSpace.contENDLESS]);

/* ************************************ waveParams */

// this keeps many settings that don't immediately affect running iteration.
// So 'Set Wave' button actually sets the wave, but meanwhile the setting sliders
// need to be remembered; this does it.  Potential and space too; not active until user does something.

makeParam('waveBreed', 'waveParams', 'chord', ['circular', 'standing', 'gaussian', 'chord']);
makeParam('waveFrequency', 'waveParams', 16, freq =>
	freq >= 1 && freq <= 1000 && 0 === freq % .5 );
makeParam('pulseWidth', 'waveParams', 1/16, width => width >= .001 && width <= 1);
makeParam('pulseOffset', 'waveParams', 30, offset => offset >= 0 && offset <= 100);

/* ************************************ potentialParams */
makeParam('potentialBreed', 'potentialParams', 'flat', ['flat', 'valley']);
makeParam('valleyPower', 'potentialParams', 1, power => power >= -20 && power <= 20);
makeParam('valleyScale', 'potentialParams', 1, scale => scale >= -1e4 && scale <= 1e4);
makeParam('valleyOffset', 'potentialParams', 50, offset => offset >= 0 && offset <= 100);

/* ************************************ iterationParams */
makeParam('isTimeAdvancing', 'iterationParams', false,  [false, true]);
makeParam('iteratePeriod', 'iterationParams', 50,  per => per >= 16 && per <= 100);
makeParam('dt', 'iterationParams', 0.002,  dt => dt > 0 && dt < 1);
makeParam('stepsPerIteration', 'iterationParams', 200,  spi => spi > 100 && spi < 1e6);
makeParam('lowPassFilter', 'iterationParams', 50, lpf => lpf > 0 && lpf < 75);

/* ************************************miscParams */
makeParam('showingTab', 'miscParams', 'wave', ['wave', 'potential', 'space', 'iteration']);
makeParam('viewHeight', 'miscParams', 400,  viewHeight => viewHeight >= 50 && viewHeight <= 1e4);

debugger;

// cuz of some magical bad ju-ju, this shit just doesn't owrk and i have to do it by hand.
export function storeASetting(groupName, varName, newValue) {
debugger;////
	// if bad value, just set to default
	if (newValue === undefined || !alternateStoreVerifiers[groupName][varName](newValue))
		newValue = alternateStoreDefaults[groupName][varName];

	let savedGroup = localStorage.getItem(groupName) || '{}';
	savedGroup = JSON.parse(savedGroup);

	savedGroup[varName] = newValue;
	localStorage.setItem(groupName,  JSON.stringify(savedGroup));
}

// might as well do this by hand, too

export function getAGroup(groupName) {
	let savedGroup = localStorage.getItem(groupName) || '{}';
	return JSON.parse(savedGroup);
}

export function getASetting(groupName, varName) {
	let setting = getAGroup(groupName)[varName];
	if (setting === undefined || !alternateStoreVerifiers[groupName][varName](setting))
		return alternateStoreDefaults[groupName][varName];
	return setting;
}


// useless
export default storeSettings;


