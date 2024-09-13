var canvas = document.querySelector("#c");

var aspectRatio;

function InitializeWebGLEnvironment()
{
	// Get A WebGL context
	var gl = canvas.getContext("webgl");
	
	if (!gl) {
		return;
	}
	
	aspectRatio = canvas.width / canvas.height;
		
	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	return gl;
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
	  return program;
	}
  
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
  }

var programFuncEval;
var programDirect;

function createShaderPrograms(gl)
{
	// Get the strings for our GLSL shaders
	var directVertexShaderSource = document.querySelector("#direct-vertex-shader").text;
	var fragmentShaderSource = document.querySelector("#fragment-shader").text;

	// create GLSL shaders, upload the GLSL source, compile the shaders
	var func_eval_vs = createShader(gl, gl.VERTEX_SHADER, directVertexShaderSource);
	var direct_vs = createShader(gl, gl.VERTEX_SHADER, directVertexShaderSource);

	var fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	
	// Link the two shaders into a program
	programFuncEval = createProgram(gl, func_eval_vs, fs);
	programDirect = createProgram(gl , direct_vs, fs);
	
	return (programFuncEval != null);
}
