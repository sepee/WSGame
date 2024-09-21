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

LoadTexture = function(path){
	// Create a texture.
	var texture = gl.createTexture();

	// use texture unit 0
	gl.activeTexture(gl.TEXTURE0 + 0);

	// bind to the TEXTURE_2D bind point of texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Fill the texture with a 1x1 magenta pixel.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					new Uint8Array([255, 0, 255, 255]));

	// Asynchronously load an image
	var image = new Image();
	image.src = path;
	image.addEventListener('load', function() {
		// Now that the image has loaded make copy it to the texture.
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
	});

	return texture;
}
  
OnInit();
