var canvas = document.querySelector("#c");

var aspectRatio;

function InitializeWebGLEnvironment()
{
	// Get A WebGL context
	var gl = canvas.getContext("webgl2");
	
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

var programDirect;
var programText;

function createShaderPrograms(gl)
{
	// Get the strings for our GLSL shaders
	var directVertexShaderSource = document.querySelector("#direct-vertex-shader").text;
	var directFragmentShaderSource = document.querySelector("#fragment-shader").text;
	// create GLSL shaders, upload the GLSL source, compile the shaders
	var direct_vs = createShader(gl, gl.VERTEX_SHADER, directVertexShaderSource);
	var direct_fs = createShader(gl, gl.FRAGMENT_SHADER, directFragmentShaderSource);
	
	// Link the two shaders into a program
	programDirect = createProgram(gl , direct_vs, direct_fs);


	// Get the strings for our GLSL shaders
	var textVSSource = document.querySelector("#text-vertex-shader").text;
	var textFSSource = document.querySelector("#text-fragment-shader").text;
	// create GLSL shaders, upload the GLSL source, compile the shaders
	var text_vs = createShader(gl, gl.VERTEX_SHADER, textVSSource);
	var text_fs = createShader(gl, gl.FRAGMENT_SHADER, textFSSource);
	
	// Link the two shaders into a program
	programText = createProgram(gl , text_vs, text_fs);
	
	return (programDirect != null);
}

// setup mouse movement callback
OnDragCanvas = function(event) {
	document.addEventListener('mousemove', onMouseMove);
  
	document.onmouseup = function() {
	  document.removeEventListener('mousemove', onMouseMove);
	  document.onmouseup = null;
	};
  };
  
