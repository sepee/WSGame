const txtCursorPos = document.getElementById("txtCursorPos");
canvas = document.getElementById("c")

var xpos  = 0;
var ypos = 0;

// dragging controls
function onMouseMove(event) {
	getMousePos(canvas, event);
}

var t = 0;
var gl;
var VMat;

var fontTexture = null;

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

function main() {
	gl = InitializeWebGLEnvironment();
		
	// Set background colour
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	var programs_compiled_success = createShaderPrograms(gl);
	
	squareMMat = m4.multiply(m4.translation(320, 240), m4.scaling(10, 10));
	squareMesh = new Mesh(squareVertices, squareIndices, new Transform(new vec3(320, 240, 0), new vec3(0,0,0), new vec3(10,10,10)), programDirect);

	VMat = m4.multiply(m4.translation(-1,1), m4.scaling(2/canvas.width, -2/canvas.height));

	tmTitle = new TextMesh(new Transform(new vec3(320,0,0), new vec3(0,0,0), new vec3(32,48,1)), "Centered TITLE!", 32, new vec3(1, 0.5, 0), true);
	tmSubtitle = new TextMesh(new Transform(new vec3(0,64,0), new vec3(0,0,0), new vec3(16,24,1)), "Hello World!", 16);
	tmInfo = new TextMesh(new Transform(new vec3(0,88,0), new vec3(0,0,0), new vec3(8,12,1)), "This text is 8x12 pixels... meaning any smaller text may lose ledgibility.", 8);
	tmCounter = new TextMesh(new Transform(new vec3(4,120,0), new vec3(0,0,0), new vec3(8,12,1)), "000", 8);

	fontTexture = LoadTexture("/img/font8x12.png");

	drawFrame();

function drawFrame()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	tmTitle.Render();
	tmSubtitle.Render();
	tmInfo.Render();

	tmCounter.SetContent("t : " + t);
	tmCounter.Render();

	squareMesh.Render();

	if(gameId === null)
	{
		const circleTransform = new Transform(new vec3(xpos, ypos, 0), new vec3(0,0,t*0.05), new vec3(25,25,25));
		var circleMesh = new Mesh(circleVertices, circleIndices, circleTransform, programDirect);
		circleMesh.Render();
	}else{

		for(let c in game.clients)
		{
			client = game.clients[c];
			const circleTransform = new Transform(new vec3(client.x, client.y, 0), new vec3(0,0,t*0.05), new vec3(25,25,25));
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
