var canvas = document.querySelector("#c");

var aspectRatio;

function OnInit(){
	gl = InitializeWebGLEnvironment();
}

function InitializeWebGLEnvironment()
{
	// Get A WebGL context
	var gl = canvas.getContext("webgl2", {alpha: false});
	
	if (!gl) {
		return;
	}
	
	aspectRatio = canvas.width / canvas.height;
	console.log("aspectRatio", aspectRatio)
		
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

function CreateShaderProgramFromQS(vsqs, fsqs)
{
	// Get the strings for our GLSL shaders
	var vs_source = document.querySelector(vsqs).text;
	var fs_source = document.querySelector(fsqs).text;
	// create GLSL shaders, upload the GLSL source, compile the shaders
	var vs = createShader(gl, gl.VERTEX_SHADER, vs_source);
	var fs = createShader(gl, gl.FRAGMENT_SHADER, fs_source);
	
	// Link the two shaders into a program
	return createProgram(gl, vs, fs);
}

var programDirect;
var programText;
var programLit;

function createShaderPrograms(gl)
{
	programDirect = CreateShaderProgramFromQS("#direct-vertex-shader", "#fragment-shader")
	programText = CreateShaderProgramFromQS("#text-vertex-shader", "#text-fragment-shader")
	programLit = CreateShaderProgramFromQS("#mvp-vertex-shader", "#lit-fragment-shader")
}

// setup mouse movement callback
OnDragCanvas = function(event) {
	document.addEventListener('mousemove', onMouseMove);
  
	document.onmouseup = function() {
	  document.removeEventListener('mousemove', onMouseMove);
	  document.onmouseup = null;
	};
  };
  
OnInit();
