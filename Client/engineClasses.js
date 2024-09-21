
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
		var rotationMat = m4.multiply(m4.yRotation(this.rot.y), m4.multiply(m4.xRotation(this.rot.x), m4.zRotation(this.rot.z)));
		this.matrix = m4.multiply(m4.translation(this.pos.x, this.pos.y, this.pos.z),m4.multiply(rotationMat, m4.scaling(this.scale.x, this.scale.y, this.scale.z)));
	}
	Translate(v)
	{
		this.pos = new vec3(this.pos.x + v.x, this.pos.y + v.y, this.pos.z + v.z);
		this.CalculateMatrix();
	}
}

const attribs_pos2 = [
	{"name" : "a_position", size : 2, type : gl.FLOAT, normalized : false, stride : 8, offset : 0},
 ]

 const attribs_text = [
	{"name" : "a_position", size : 2, type : gl.FLOAT, normalized : false, stride : 8, offset : 0},
	{"name" : "a_char_offset", size : 1, type : gl.FLOAT, normalized : false, stride : 4, offset : 0},
	{"name" : "a_uv_offset", size : 2, type : gl.FLOAT, normalized : false, stride : 8, offset : 0},
 ]

const attribs_pos_norm = [
	{"name" : "a_position", size : 3, type : gl.FLOAT, normalized : false, stride : 24, offset : 0},
	{"name" : "a_normal", size : 3, type : gl.FLOAT, normalized : true, stride : 24, offset : 12}
 ]

class Mesh{
	constructor(vertices, indices, transform, shaderProgram, attribs = attribs_pos_norm, glPrimativeType = gl.TRIANGLES, glDrawMode = gl.STATIC_DRAW)
	{
		this.vertices = vertices;
		this.indices = indices;
		this.transform = transform;
		this.shaderProgram = shaderProgram;
		this.attribs = attribs;
		this.glPrimativeType = glPrimativeType;
		this.glDrawMode = glDrawMode;

		this.buildGPUBuffers();
		this.SetupVertexAttributes(this.attribs);
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

	SetUniforms()
	{
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "u_MMat"), false, this.transform.matrix);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "u_VMat"), false, m4.inverse(eyeTransform.matrix));
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "u_PMat"), false, PMat);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "u_ScreenToClipMat"), false, ScreenToClipMat);
	}

	SetupVertexAttributes(attrib_profile)
	{		
		this.BindBuffers();

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		attrib_profile.forEach(attrib => {
			var a_loc = gl.getAttribLocation(this.shaderProgram, attrib.name);	// look up where the vertex data needs to go.	
			gl.vertexAttribPointer(a_loc, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
			gl.enableVertexAttribArray(a_loc);	// Turn on the attribute
		})

	    gl.bindVertexArray(null);
	}

	BindBuffers(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	}

	Render()
	{
		gl.useProgram(this.shaderProgram);	// Tell it to use our program (pair of shaders)
		this.SetUniforms();
		gl.bindVertexArray(this.vao);
		this.BindBuffers();
		gl.drawElements(this.glPrimativeType, this.indices.length, gl.UNSIGNED_SHORT, 0);
	}
}


class TextMesh{
	constructor(transform, content, fontWidth = 16, color = new vec3(1,1,1), centered = false)
	{		
		var mesh = new Mesh(quadVerticesTS, quadIndicesTS, transform, programText, attribs_pos2, gl.TRIANGLE_STRIP, gl.STATIC_DRAW);
		this.mesh = mesh;

        this.content = content;
		this.fontWidth = fontWidth;
		this.centered = centered;

		this.buildGPUBuffers();
	}

	SetContent(content)
	{
		this.content = content;
		
		this.buildContentSpecificGPUBuffers();
	}

	buildContentSpecificGPUBuffers()
	{
		const charOffsets = this.GenerateCharOffsets();
		const charOffsetBuffer = gl.createBuffer();
		this.charOffsetBuffer = charOffsetBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, charOffsetBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charOffsets), this.mesh.glDrawMode);

		const uv_offsets = this.GenerateUVOffsets();
		const uvOffsetsBuffer = gl.createBuffer();
		this.uvOffsetsBuffer = uvOffsetsBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, uvOffsetsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uv_offsets, this.mesh.glDrawMode);
	}

	buildGPUBuffers()
	{
		this.mesh.buildGPUBuffers();
		this.buildContentSpecificGPUBuffers();
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

	SetUniforms = function(){
		this.mesh.SetUniforms();

		var fontSizeLoc = gl.getUniformLocation(this.mesh.shaderProgram, "u_font_size");
		gl.uniform1f(fontSizeLoc, this.fontWidth);
	}

	BindBuffers = function(){
		this.mesh.BindBuffers();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.charOffsetBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvOffsetsBuffer);
	}

	SetAttributes = function(){

		this.mesh.SetupVertexAttributes(this.mesh.attribs);

		gl.bindVertexArray(this.mesh.vao);

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.charOffsetBuffer);
		var charOffsetLoc = gl.getAttribLocation(this.mesh.shaderProgram, "a_char_offset");	// look up where the vertex data needs to go.
		gl.vertexAttribPointer(charOffsetLoc, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(charOffsetLoc);

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvOffsetsBuffer);
		var uvOffsetsLoc = gl.getAttribLocation(this.mesh.shaderProgram, "a_uv_offset");	// look up where the vertex data needs to go.
		gl.vertexAttribPointer(uvOffsetsLoc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(uvOffsetsLoc);

		// this line says this attribute only changes for each 1 instance
		gl.vertexAttribDivisor(charOffsetLoc, 1);
		gl.vertexAttribDivisor(uvOffsetsLoc, 1);

		gl.bindVertexArray(null);
	}

	Render()
	{
		gl.useProgram(this.mesh.shaderProgram);	// Tell it to use our program (pair of shaders)

		gl.bindTexture(gl.TEXTURE_2D, fontTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		this.SetUniforms();

		this.SetAttributes();
		gl.bindVertexArray(this.mesh.vao);

		this.BindBuffers();

		gl.drawElementsInstanced(this.mesh.glPrimativeType, this.mesh.indices.length, gl.UNSIGNED_SHORT, 0, this.content.length);
	}
}

/*
class TextMesh
{
	constructor(transform, content, fontWidth = 16, color = new vec3(1,1,1), centered = false)
	{
		this.vertices = quadVerticesTS;
		this.indices = quadIndicesTS;
		this.transform = transform;
		this.shaderProgram = programText;
		this.attribs = attribs_pos2;
		this.glPrimativeType = gl.TRIANGLE_STRIP;
		this.glDrawMode = gl.STATIC_DRAW;

		this.content = content;
		this.fontWidth = fontWidth;
		this.color = color;
		this.centered = centered;

		this.buildGPUBuffers();
		this.SetupVertexAttributes(this.attribs);
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

	SetUniforms()
	{
		var ModelMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_MMat");
		gl.uniformMatrix4fv(ModelMatrixLoc, false, this.transform.matrix);
		var ViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_VMat");
		gl.uniformMatrix4fv(ViewMatrixLoc, false, VMat);
		var ProjMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_PMat");
		gl.uniformMatrix4fv(ProjMatrixLoc, false, PMat);
	}

	SetupVertexAttributes(attrib_profile)
	{		
		this.BindBuffers();

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		attrib_profile.forEach(attrib => {
			var a_loc = gl.getAttribLocation(this.shaderProgram, attrib.name);	// look up where the vertex data needs to go.	
			gl.vertexAttribPointer(a_loc, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
			gl.enableVertexAttribArray(a_loc);	// Turn on the attribute
		})


		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.charOffsetBuffer);
		var charOffsetLoc = gl.getAttribLocation(this.shaderProgram, "a_char_offset");	// look up where the vertex data needs to go.
		gl.vertexAttribPointer(charOffsetLoc, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(charOffsetLoc);

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvOffsetsBuffer);
		var uvOffsetsLoc = gl.getAttribLocation(this.shaderProgram, "a_uv_offset");	// look up where the vertex data needs to go.
		gl.vertexAttribPointer(uvOffsetsLoc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(uvOffsetsLoc);


		// this line says this attribute only changes for each 1 instance
		gl.vertexAttribDivisor(charOffsetLoc, 1);
		gl.vertexAttribDivisor(uvOffsetsLoc, 1);

	    gl.bindVertexArray(null);
	}

	BindBuffers(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	}

	Render()
	{
		gl.useProgram(this.shaderProgram);	// Tell it to use our program (pair of shaders)
		this.SetUniforms();
		gl.bindVertexArray(this.vao);
		this.BindBuffers();

		gl.drawElementsInstanced(this.glPrimativeType, this.indices.length, gl.UNSIGNED_SHORT, 0, this.content.length);
	}
}
*/