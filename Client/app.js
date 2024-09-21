const txtCursorPos = document.getElementById("txtCursorPos");
canvas = document.getElementById("c")

// dragging controls
function onMouseMove(event) {
	getMousePos(canvas, event);
}

var t = 0;
var gl;
var ScreenToClipMat;

var fontTexture = null;

function main() {		
	// Set background colour
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	gl.enable(gl.CULL_FACE);	
	gl.cullFace(gl.BACK);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.enable(gl.DEPTH_TEST);

	createShaderPrograms(gl);
	
	ScreenToClipMat = m4.multiply(m4.translation(-1,1,0), m4.scaling(2/canvas.width, -2/canvas.height, 1));
	eyeTransform = new Transform(new vec3(0, 0, -5), new vec3(0,0,0), new vec3(1,1,1));
	PMat = m4.perspective(degToRad(90), 3/2, 0.1, 100);

	squareMesh = new Mesh(squareVertices, squareIndices, new Transform(new vec3(320, 240, 0), new vec3(0,0,0), new vec3(10,10,10)), programDirect, attribs_pos2, gl.LINES);

	tmTitle = new TextMesh(new Transform(new vec3(320,0,0), new vec3(0,0,0), new vec3(32,48,1)), "Centered TITLE!", 32, new vec3(1, 0.5, 0), true);
	tmSubtitle = new TextMesh(new Transform(new vec3(0,64,0), new vec3(0,0,0), new vec3(16,24,1)), "Hello World!", 16);
	tmInfo = new TextMesh(new Transform(new vec3(0,88,0), new vec3(0,0,0), new vec3(8,12,1)), "This text is 8x12 pixels... meaning any smaller text may lose ledgibility.", 8);
	tmCounter = new TextMesh(new Transform(new vec3(4,120,0), new vec3(0,0,0), new vec3(8,12,1)), "000", 8);

	fontTexture = LoadTexture("/img/font8x12.png");

	drawFrame();

function drawFrame()
{
	HandleKeyboardInput();

	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.depthMask(true); // draw opaques here

	squareMesh.Render();

	cubeMesh = new Mesh(cubeVertices, cubeIndices, new Transform(new vec3(0,0,0), new vec3(0,t*0.01,0), new vec3(1,1,1)), programLit);
	cubeMesh.Render();

	cubeMesh = new Mesh(cubeVertices, cubeIndices, new Transform(new vec3(10,10,-20), new vec3(0,t*0.05,0), new vec3(5,1,1)), programLit);
	cubeMesh.Render();

	if(gameId === null)
	{
		cubeMesh = new Mesh(cubeVertices, cubeIndices,  new Transform(new vec3((mousex/canvas.width*10 - 5)*3/2, 5 - mousey/canvas.height*10,), new vec3(0,0,0), new vec3(0.5,0.5,0.5)), programLit);
	    cubeMesh.Render();
		const circleTransform = new Transform(new vec3(mousex, mousey, 0), new vec3(0,0,t*0.05), new vec3(25,25,25));
		var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect, attribs_pos2, gl.LINES);
		circleMesh.Render();
	}else{

		for(let c in game.clients)
		{
			client = game.clients[c];
			cubeMesh = new Mesh(cubeVertices, cubeIndices,  new Transform(new vec3((client.x/canvas.width*10 - 5)*3/2, 5 - client.y/canvas.height*10,), new vec3(0,0,0), new vec3(0.5,0.5,0.5)), programLit);
	    	cubeMesh.Render();
			const circleTransform = new Transform(new vec3(client.x, client.y, 0), new vec3(0,0,t*0.05), new vec3(25,25,25));
			var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect, attribs_pos2, gl.LINES);
			circleMesh.Render();
		}
	}

	gl.depthMask(false); // draw transparents here

	tmTitle.Render();
	tmSubtitle.Render();
	tmInfo.Render();
	tmCounter.SetContent("t : " + t);
	tmCounter.Render();

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

HandleKeyboardInput = function()
{
	speed = 0.1;
	if(is_key_down('w'))
		eyeTransform.Translate(new vec3(0,0,speed));

	if(is_key_down('s'))
		eyeTransform.Translate(new vec3(0,0,-speed));

	if(is_key_down('d'))
		eyeTransform.Translate(new vec3(speed,0,0));

	if(is_key_down('a'))
		eyeTransform.Translate(new vec3(-speed,0,0));

	if(is_key_down('e'))
		eyeTransform.Translate(new vec3(0,speed,0));

	if(is_key_down('q'))
		eyeTransform.Translate(new vec3(0,-speed,0));
}

var animate = true;

main();
