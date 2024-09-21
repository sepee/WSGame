const txtCursorPos = document.getElementById("txtCursorPos");
canvas = document.getElementById("c")

var t = 0;
var gl;
var ScreenToClipMat;

var fontTexture = null;

function main() {		

	Start();
	Update();
}

function Start()
{
	// Set background colour
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	gl.enable(gl.CULL_FACE);	
	gl.cullFace(gl.BACK);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.enable(gl.DEPTH_TEST);

	createShaderPrograms(gl);

	camTransform = new Transform([0,2,-5]);
	
	ScreenToClipMat = m4.multiply(m4.translation(-1,1,0), m4.scaling(2/canvas.width, -2/canvas.height, 1));
	viewMatrix = m4.translation(0,0,-5);
	PMat = m4.perspective(degToRad(90), aspectRatio, 0.1, 1000);

	squareMesh = new Mesh(squareVertices, squareIndices, new Transform([canvas.width/2, canvas.height/2, 0], [0,0,0], [4,4,4]), programDirect, attribs_pos2, gl.LINES);

	tmTitle = new TextMesh(new Transform([canvas.width/2,0,0], [0,0,0], [32, 48,1]), "Centered TITLE!", 32, [1,0.5,0], true);
	tmSubtitle = new TextMesh(new Transform([0,64,0], [0,0,0], [16,24,1]), "Hello World!", 16);
	tmInfo = new TextMesh(new Transform([0,88,0], [0,0,0], [8,12,1]), "This text is 8x12 pixels... meaning any smaller text may lose ledgibility.", 8);
	tmCounter = new TextMesh(new Transform([4,120,0], [0,0,0], [8,12,1]), "000", 8);

	terrainMesh = new Mesh(TerrainMeshData[0], TerrainMeshData[1], new Transform(), programLit, attribs_pos_norm);

	fontTexture = LoadTexture("/img/font8x12.png");
}

function Update()
{
	HandlePlayerInput();

	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.depthMask(true); // draw opaques here

	squareMesh.Render();

	terrainMesh.Render();

	cubeMesh = new Mesh(cubeVertices, cubeIndices, new Transform([0,0,0], [0,t*0.01,0], [1,1,1]), programLit);
	cubeMesh.Render();

	cubeMesh = new Mesh(cubeVertices, cubeIndices, new Transform([10,10,-20], [0,t*0.05,0], [10,1,1]), programLit);
	cubeMesh.Render();

	if(gameId === null)
	{
		cubeMesh = new Mesh(cubeVertices, cubeIndices,  new Transform([(mousex/canvas.width*10 - 5)*3/2, 5 - mousey/canvas.height*10], [0,0,0], [0.5,0.5,0.5]), programLit);
	    cubeMesh.Render();
		const circleTransform = new Transform([mousex, mousey, 0], [0,0,t*0.05], [25,25,25]);
		var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect, attribs_pos2, gl.LINES);
		circleMesh.Render();
	}else{

		for(let c in game.clients)
		{
			client = game.clients[c];
			cubeMesh = new Mesh(cubeVertices, cubeIndices,  new Transform([(client.x/canvas.width*10 - 5)*3/2, 5 - client.y/canvas.height*10], [0,0,0], [0.5,0.5,0.5]), programLit);
	    	cubeMesh.Render();
			const circleTransform = new Transform([client.x, client.y, 0], [0,0,t*0.05], [25,25,25]);
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

	mousedx = mousex - mousexLast;
	mousedy = mousey - mouseyLast;

	mousexLast = mousex;
	mouseyLast = mousey;
	
	requestAnimationFrame(Update);
	}


HandlePlayerInput = function()
{
	speed = 0.1;
	if(is_key_down('w'))
		camTransform.Translate(0,0,speed, true);

	if(is_key_down('s'))
		camTransform.Translate(0,0,-speed, true);

	if(is_key_down('d'))
		camTransform.Translate(speed,0,0, true);

	if(is_key_down('a'))
		camTransform.Translate(-speed,0,0, true);

	if(is_key_down('e'))
		camTransform.Translate(0,speed,0);

	if(is_key_down('q'))
		camTransform.Translate(0,-speed,0);

	camTransform.Rotate(mousedy * 0.01, mousedx * 0.01, 0);
	//viewMatrix = m4.xRotate(viewMatrix, mousedy * 0.01);
	//viewMatrix = m4.multiply(viewMatrix, m4.axisRotation(axis, mousedx * 0.01));
}

var animate = true;

main();
