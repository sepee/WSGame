//const { client } = require("websocket");

const txtCursorPos = document.getElementById("txtCursorPos");
canvas = document.getElementById("c")

var xpos  = 0;
var ypos = 0;

const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();

getMousePos = function(canvas, event)
{
	var rect = canvas.getBoundingClientRect(); // abs. size of element
	scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

	xpos = (event.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	ypos = (event.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

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

class vec3{
	constructor(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

class Transform
{
	constructor(pos, rot = vec3(0,0,0), scale = vec3(0,0,0)){
		this.pos = pos;
		this.rot = rot;
		this.scale = scale;
		this.CalculateMatrix();
	}
	CalculateMatrix(){
		this.matrix = m4.multiply(m4.translation(this.pos.x, this.pos.y, this.pos.z),m4.multiply(m4.scaling(this.scale.x, this.scale.y, this.scale.z), m4.rotation(this.rot.x)));
	}
}

class Mesh{
	constructor(vertices, indices, transform, shaderProgram, glPrimativeType = gl.LINES, glDrawMode = gl.DYNAMIC_DRAW)
	{
		this.vertices = vertices;
		this.indices = indices;
		this.transform = transform;
		this.shaderProgram = shaderProgram;
		this.glPrimativeType = glPrimativeType;
		this.glDrawMode = glDrawMode;

		this.buildGPUBuffers();
	}

	buildGPUBuffers()
	{
		this.vertexBuffer = gl.createBuffer();	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.glDrawMode);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.glDrawMode);
	}

	Render()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		
		var positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(positionAttributeLocation);	// Turn on the attribute
		gl.vertexAttribPointer(
		  positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)

		gl.useProgram(this.shaderProgram);	// Tell it to use our program (pair of shaders)

		var ModelMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_MMat");
		gl.uniformMatrix4fv(ModelMatrixLoc, false, this.transform.matrix);
		var ViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_VMat");
		gl.uniformMatrix4fv(ViewMatrixLoc, false, VMat);

		// draw
		gl.drawElements(this.glPrimativeType, this.indices.length, gl.UNSIGNED_SHORT, 0);
	}
}

var t = 0;
var gl;
var VMat;

function main() {
	gl = InitializeWebGLEnvironment();
		
	// Set background colour
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	var programs_compiled_success = createShaderPrograms(gl);
	
	squareMMat = m4.multiply(m4.translation(320, -240), m4.scaling(10, 10));
	squareMesh = new Mesh(squareVertices, squareIndices, new Transform(new vec3(320, -240, 0), new vec3(0,0,0), new vec3(10,10,10)), programDirect);

	VMat = m4.multiply(m4.translation(-1,1), m4.scaling(2/canvas.width, 2/canvas.height));

	drawFrame();

function drawFrame()
{
	gl.clear(gl.COLOR_BUFFER_BIT);

	squareMesh.Render();

	if(gameId === null)
	{
		const circleTransform = new Transform(new vec3(xpos, -ypos, 0), new vec3(t*0.05,0,0), new vec3(25,25,25));
		var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect);
		circleMesh.Render();
	}else{

		for(let c in game.clients)
		{
			client = game.clients[c];
			const circleTransform = new Transform(new vec3(client.x, -client.y, 0), new vec3(t*0.05,0,0), new vec3(25,25,25));
			var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect);
			circleMesh.Render();
		}
	}

	t += 1;
	
	if(animate)
	{
		requestAnimationFrame(drawFrame);
	}else{
		animate = true;
		main();
	}
	}
}

var animate = true;

main();
