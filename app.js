const txtCursorPos = document.getElementById("txtCursorPos");
canvas = document.getElementById("c")

const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();


var xpos  = 0;
var ypos = 0;

var xdelta = 0;
var ydelta = 0;

getMousePos = function(canvas, event)
{
	var rect = canvas.getBoundingClientRect(); // abs. size of element
	scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

	var canvasX = (event.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	var	canvasY = (event.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

	xdelta = canvasX - xpos;
	ydelta = canvasY - ypos;
	xpos = canvasX;
	ypos = canvasY;
	txtCursorPos.innerText = xpos + ", " + ypos

	if(gameId){
		const payLoad = {
			"method": "move",
			"clientId": clientId,
			"gameId" : gameId,
			"x" : xpos,
			"y" : ypos
		}
		ws.send(JSON.stringify(payLoad));
	}	
}

// dragging controls
OnDragCanvas = function(event) {
	getMousePos(canvas, event);

function moveAt(event) {
	getMousePos(canvas, event);
  }

  function onMouseMove(event) {
    moveAt(event);
  }

  document.addEventListener('mousemove', onMouseMove);

  document.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    document.onmouseup = null;
  };

};

var aspectRatio;

function InitializeWebGLEnvironment(canvas)
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

var domainToScreenMatrix;
var rangeToScreenMatrix

var t = 0;

var mainRunning = false;


function main() {
	
	mainRunning = true;
	
	var canvas = document.querySelector("#c");
	var gl = InitializeWebGLEnvironment(canvas);
		
	// Set background colour
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	var programs_compiled_success = createShaderPrograms(gl);
	

	var circleMesh = [0, 1, 0.71, 0.71,
		0.71, 0.71, 1, 0,
		1, 0, 0.71, -0.71,
		0.71, -0.71, 0, -1,
	   0, -1, -0.71, -0.71,
	  -0.71, -0.71, -1, 0,
	  -1, 0, -0.71, 0.71,
	  -0.71, 0.71, 0, 1];
	
	var circlePositionBuffer = gl.createBuffer();	// Create a buffer and put three 2d clip space points in it
	gl.bindBuffer(gl.ARRAY_BUFFER, circlePositionBuffer);	// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleMesh), gl.DYNAMIC_DRAW);


	drawFrame();

function drawFrame()
{
	gl.clear(gl.COLOR_BUFFER_BIT);

	t += 1;

	function drawPositionsWithProgram(positionBuffer, bufferLength, program, branch = 0.0)
	{		
		// Bind the position buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(positionAttributeLocation);	// Turn on the attribute
		gl.vertexAttribPointer(
		  positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)

		gl.useProgram(program);	// Tell it to use our program (pair of shaders)

		var MMatLoc = gl.getUniformLocation(program, "u_MMat");
		gl.uniformMatrix4fv(MMatLoc, false, MMat);

		// draw
		gl.drawArrays(gl.LINES, 0, bufferLength/2);
	}
	
	ScaleMat = m4.scaling(0.1, 0.1 * aspectRatio);
	RotationMat = m4.rotation(t * 0.05);

	if(gameId === null)
	{
		TranslationMat = m4.translation(xpos/320 - 1, 1-ypos/240);
		MMat = m4.multiply(TranslationMat, m4.multiply(ScaleMat, RotationMat));

		drawPositionsWithProgram(circlePositionBuffer, circleMesh.length, programDirect);
	}else{

		for(let c in game.clients)
		{
			client = game.clients[c];
			TranslationMat = m4.translation(client.x/320 - 1, 1-client.y/240);
			MMat = m4.multiply(TranslationMat, m4.multiply(ScaleMat, RotationMat));

			drawPositionsWithProgram(circlePositionBuffer, circleMesh.length, programDirect);
		}
	}
	
	if(animate)
	{
		requestAnimationFrame(drawFrame);
	}else{
		animate = true;
		main();
	}
	}
	
	mainRunning = false;
}

var animate = true;

function reloadFunction()
{
animate = false;
if(!mainRunning)
	main();
}

main();
