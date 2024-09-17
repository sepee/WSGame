
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


class TextMesh{
	constructor(transform, content)
	{
        this.transform = transform;
        this.content = content;

		this.vertices = quadVerticesTS;
		this.indices = quadIndicesTS;  
		this.shaderProgram = programText;
		this.glPrimativeType = gl.TRIANGLE_STRIP;
		this.glDrawMode = gl.DYNAMIC_DRAW;

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
		gl.bindTexture(gl.TEXTURE_2D, fontTexture);
		
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