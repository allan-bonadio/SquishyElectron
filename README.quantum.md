------------------------------------------------ wish list for v3

- Any number of dimensions, eg x and s, the spin, becomes ψ[1...N][-½, ½]
or a 2d wave is ψ[1...N][1...N], either two 1D particles or 1 2D particle
whats the diff?  well, the potential V with two particles, each depends on the loc of the other.
For one particle in 2D, the potential

- UI ability to set n of dimensions, and to specify angular momentum, and any energy/potential differences therein.  Two particles in the same space should have the same X coordinates; one in 2-d space should have X  and Y coords.  The V potential would be 1-dimensional or 2 dimensional, depending.

- Emscripten engine in C
https://emscripten.org/docs/getting_started/downloads.html

- OpenGL, if possible (maybe v4?)

- ability to create two wave functions and superimpose them, with varying complex ratio between

- ability to alter speed of animation/calculation

- ability to 'stick your finger in' and measure a state variable and thereby change the state

------------------------------------------------ v3 definitions

This is aspirational, or maybe just the description of the quantum engine.  I don't know how i'll put a UI on all  of this, but the simpler variations should be  no problem.

- a 'dimension' is a description of one of the state variables input to a wave.
class Dimension {
	type: 'coordinate' (has N+2 values for N possibilities) or 'discrete' (has N values for N possibilities), maybe boolean?
	N: possible  states
	Nv: number of values (=N or N+2)
	size: number of complex values in this whole thing (product of Nv * Nv of next dimension or 1 if none)
		or maybe x2 for number of real values
	geometry: 'x', 'y' or 'z' - two particles will have x, x but one in 2d will have x, y.  Spin?  maybe s, or s1, s2, ...  Also could have Energy dimensions...
}
Each dimension's variable is an integer, either 0...N-1 or 1...N, the latter for coordinates

- a 'Space' is a list of dimensions, and a potential function of those dimension variables, known as V
	Dimensions are listed from outer to inner as with the resulting psi array:
	psi[outermost-dim][dim][dim][innermost-dim]
	Maybe one global space for the whole app?  at least at first
class Space {
	Dimension dimensions[];
	function V(array of state variables);
	coordinates = what names for dimensions
}

- a 'wave' is a multidimensional array of psi  values, each a complex number (two floats, either single or double)
	- points to space
	- iterate passes thru all psi values along all dimensions
	- wrap ends automatically wraps continuum dimensions
	- can have multiple waves per space; user can superimpose them

------------------------------------------------ equations

ih ∂ψ / ∂t  =  [V - (h^2/2m) (∂^2/∂x^2)] psi


ih ∂psi / ∂t  =  V psi - (h^2/2m) (∂^2/∂x^2) psi

where t=time, x=location (potentially scalar, 2-vec or 3-vec)
h=hbar ħ plank's constant / 2π   m=particle mass
V=potential map, function of x and t
psi


