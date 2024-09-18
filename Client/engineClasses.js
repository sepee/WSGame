
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
		
		// set attribute for vertex position
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
	constructor(transform, content, fontWidth = 16, color = new vec3(1,1,1), centered = false)
	{
        this.transform = transform;
        this.content = content;
		this.fontWidth = fontWidth;

		this.vertices = quadVerticesTS;
		this.indices = quadIndicesTS;  
		this.shaderProgram = programText;
		this.glPrimativeType = gl.TRIANGLE_STRIP;
		this.glDrawMode = gl.DYNAMIC_DRAW;
		this.centered = centered;

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

		const charOffsets = this.GenerateCharOffsets();
		const charOffsetBuffer = gl.createBuffer();
		this.charOffsetBuffer = charOffsetBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, charOffsetBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charOffsets), this.glDrawMode);

		const uv_offsets = this.GenerateUVOffsets();
		const uvOffsetsBuffer = gl.createBuffer();
		this.uvOffsetsBuffer = uvOffsetsBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, uvOffsetsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uv_offsets, this.glDrawMode);
	}

	GenerateCharOffsets = function()
	{
		var char_offsets = [];
		var centeringOffset = this.centered ? this.content.length / -2 : 0;

		for (let i = 0; i < this.content.length; i++) 
		{
			char_offsets[i] = i + centeringOffset;
		}

		return char_offsets;
	}

	GenerateUVOffsets = function()
	{
		var uv_offsets = [];

		const encoder = new TextEncoder();
		const encodedContent = encoder.encode(this.content);

		// TODO: Calculate UV Offsets from this.content
		for (let i = 0; i < this.content.length; i++) {
			const char = encodedContent[i];
			uv_offsets[i * 2    ] = char%16;
			uv_offsets[i * 2 + 1] = Math.floor(char/16) - 2;
		  } 

		return new Float32Array(uv_offsets);
	}

	Render()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bindTexture(gl.TEXTURE_2D, fontTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		// set attribute for vertex position
		var positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(positionAttributeLocation);	// Turn on the attribute
		gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)

		// set attributes for char offset and content buffers, to be used in instanced character drawing

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.charOffsetBuffer);
		var charOffsetLoc = gl.getAttribLocation(this.shaderProgram, "a_char_offset");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(charOffsetLoc);
		gl.vertexAttribPointer(charOffsetLoc, 1, gl.FLOAT, false, 0, 0);
		// this line says this attribute only changes for each 1 instance
		gl.vertexAttribDivisor(charOffsetLoc, 1);

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvOffsetsBuffer);
		var uvOffsetsLoc = gl.getAttribLocation(this.shaderProgram, "a_uv_offset");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(uvOffsetsLoc);
		gl.vertexAttribPointer(uvOffsetsLoc, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(uvOffsetsLoc, 1);

		gl.useProgram(this.shaderProgram);	// Tell it to use our program (pair of shaders)

		var ModelMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_MMat");
		gl.uniformMatrix4fv(ModelMatrixLoc, false, this.transform.matrix);
		var ViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_VMat");
		gl.uniformMatrix4fv(ViewMatrixLoc, false, VMat);
		var fontSizeLoc = gl.getUniformLocation(this.shaderProgram, "u_font_size");
		gl.uniform1f(fontSizeLoc, this.fontWidth);

		// draw
		gl.drawElementsInstanced(this.glPrimativeType, this.indices.length, gl.UNSIGNED_SHORT, 0, this.content.length);
	}
}