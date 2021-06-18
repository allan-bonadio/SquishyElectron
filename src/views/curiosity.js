function raceThruAll(gl, funcName, arg, kList) {
	kList.forEach(k => console.log(`gl.${funcName}(${k.code}) = `,
		gl[funcName](arg, gl[k.code])
	));
}

export function curioShader(gl, shader) {

	const keywords = [
	{code: 'DELETE_STATUS',
		desc: "Returns a GLboolean indicating whether or not the shader is flagged for deletion."},
	{code: 'COMPILE_STATUS',
		desc: "Returns a GLboolean indicating whether or not the last shader compilation was successful."},
	{code: 'SHADER_TYPE',
		desc: "Returns a GLenum indicating whether the shader is a vertex shader (gl.VERTEX_SHADER) or fragment shader (gl.FRAGMENT_SHADER) object."},
	];

	console.log(`======================= getShaderParameter`);
	raceThruAll(gl, 'getShaderParameter', shader, keywords);
}

export function curioProgram(gl, program) {

	const keywords = [
	{code: 'DELETE_STATUS',
		desc: "Returns a GLboolean indicating whether or not the program is flagged for deletion."},
	{code: 'LINK_STATUS',
		desc: "Returns a GLboolean indicating whether or not the last link operation was successful."},
	{code: 'VALIDATE_STATUS',
		desc: "Returns a GLboolean indicating whether or not the last validation operation was successful."},
	{code: 'ATTACHED_SHADERS',
		desc: "Returns a GLint indicating the number of attached shaders to a program."},
	{code: 'ACTIVE_ATTRIBUTES',
		desc: "Returns a GLint indicating the number of active attribute variables to a program."},
	{code: 'ACTIVE_UNIFORMS',
		desc: "Returns a GLint indicating the number of active uniform variables to a program."},

	// When using a WebGL 2 context, the following values are available additionally:
//	{code: 'TRANSFORM_FEEDBACK_BUFFER_MODE',
//		desc: "Returns a GLenum indicating the buffer mode when transform feedback is active. May be gl.SEPARATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS."},
//	{code: 'TRANSFORM_FEEDBACK_VARYINGS',
//		desc: "Returns a GLint indicating the number of varying variables to capture in transform feedback mode."},
//	{code: 'ACTIVE_UNIFORM_BLOCKS',
//		desc: "Returns a GLint indicating the number of uniform blocks containing active uniforms."},
	];

	console.log(`======================= getProgramParameter`);
	raceThruAll(gl, 'getProgramParameter', program, keywords);

}

export function curioParameter(gl, vShader, fShader, program, ) {

}

export function curioAUB(gl, vShader, fShader, program, ) {

const keywords = [
{code: 'UNIFORM_BLOCK_BINDING',
	desc: "Returns a GLuint indicating the uniform buffer binding point."},
{code: 'UNIFORM_BLOCK_DATA_SIZE',
	desc: "Returns a GLuint indicating the minimum total buffer object size."},
{code: 'UNIFORM_BLOCK_ACTIVE_UNIFORMS',
	desc: "Returns a GLuint indicating the number of active uniforms in the uniform block."},
{code: 'UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES',
	desc: "Returns a Uint32Array indicating the list of active uniforms in the uniform block."},
{code: 'UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER',
	desc: "Returns a GLboolean indicating whether the uniform block is referenced by the vertex shader."},
{code: 'UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER',
	desc: "Returns a GLboolean indicating whether the uniform block is referenced by the fragment shader."},
];


}




/*
"getBufferParameter",
    "getFramebufferAttachmentParameter",
    "getParameter",
    "getProgramParameter",
    "getRenderbufferParameter",
    "getShaderParameter",
    "getTexParameter",






any gl.getActiveUniformBlockParameter(program, uniformBlockIndex, pname);
Copy to Clipboard
Parameters
program
A WebGLProgram containing the active uniform block.
uniformBlockIndex
A GLuint specifying the index of the active uniform block within the program.
pname
A GLenum specifying which information to query. Possible values:


const keywords = [
{code: 'UNIFORM_BLOCK_BINDING',
	desc: "Returns a GLuint indicating the uniform buffer binding point."},
{code: 'UNIFORM_BLOCK_DATA_SIZE',
	desc: "Returns a GLuint indicating the minimum total buffer object size."},
{code: 'UNIFORM_BLOCK_ACTIVE_UNIFORMS',
	desc: "Returns a GLuint indicating the number of active uniforms in the uniform block."},
{code: 'UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES',
	desc: "Returns a Uint32Array indicating the list of active uniforms in the uniform block."},
{code: 'UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER',
	desc: "Returns a GLboolean indicating whether the uniform block is referenced by the vertex shader."},
{code: 'UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER',
	desc: "Returns a GLboolean indicating whether the uniform block is referenced by the fragment shader."},
];




any gl.getParameter(pname);
Copy to Clipboard
Parameters
pname
A GLenum specifying which parameter value to return. See below for possible values.

https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter






any gl.getProgramParameter(program, pname);
Copy to Clipboard
Parameters
program
A WebGLProgram to get parameter information from.
pname
A Glenum specifying the information to query. Possible values:



const keywords = [
{code: 'DELETE_STATUS',
	desc: "Returns a GLboolean indicating whether or not the program is flagged for deletion."},
{code: 'LINK_STATUS',
	desc: "Returns a GLboolean indicating whether or not the last link operation was successful."},
{code: 'VALIDATE_STATUS',
	desc: "Returns a GLboolean indicating whether or not the last validation operation was successful."},
{code: 'ATTACHED_SHADERS',
	desc: "Returns a GLint indicating the number of attached shaders to a program."},
{code: 'ACTIVE_ATTRIBUTES',
	desc: "Returns a GLint indicating the number of active attribute variables to a program."},
{code: 'ACTIVE_UNIFORMS',
	desc: "Returns a GLint indicating the number of active uniform variables to a program."},
When using a WebGL 2 context, the following values are available additionally:
{code: 'TRANSFORM_FEEDBACK_BUFFER_MODE',
	desc: "Returns a GLenum indicating the buffer mode when transform feedback is active. May be gl.SEPARATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS."},
{code: 'TRANSFORM_FEEDBACK_VARYINGS',
	desc: "Returns a GLint indicating the number of varying variables to capture in transform feedback mode."},
{code: 'ACTIVE_UNIFORM_BLOCKS',
	desc: "Returns a GLint indicating the number of uniform blocks containing active uniforms."},
];








any gl.getShaderParameter(shader, pname);
Copy to Clipboard
Parameters
shader
A WebGLShader to get parameter information from.
pname
A GLenum specifying the information to query. Possible values:

const keywords = [
{code: 'DELETE_STATUS',
	desc: "Returns a GLboolean indicating whether or not the shader is flagged for deletion."},
{code: 'COMPILE_STATUS',
	desc: "Returns a GLboolean indicating whether or not the last shader compilation was successful."},
{code: 'SHADER_TYPE',
	desc: "Returns a GLenum indicating whether the shader is a vertex shader (gl.VERTEX_SHADER) or fragment shader (gl.FRAGMENT_SHADER) object."},
];



gl.getShaderInfoLog(shader);
Copy to Clipboard
Parameters
shader
A WebGLShader to query.
Return value
A DOMString that contains diagnostic messages, warning messages, and other information about the last compile operation. When a WebGLShader object is initially created, its information log will be a string of length 0.








*/


