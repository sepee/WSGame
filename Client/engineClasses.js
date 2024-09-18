
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
		this.matrix = m4.multiply(m4.translation(this.pos.x, this.pos.y, this.pos.z),m4.multiply(m4.scaling(this.scale.x, this.scale.y, this.scale.z), rotationMat));
	}
}

class Mesh{
	constructor(vertices, indices, transform, shaderProgram, attributes = ["a_position"], vertexStride, glPrimativeType = gl.LINES, glDrawMode = gl.DYNAMIC_DRAW)
	{
		this.vertexAttributes = {};
		this.SetStandardAttributes(attributes);

		this.vertices = vertices;
		this.indices = indices;
		this.transform = transform;
		this.shaderProgram = shaderProgram;
		this.vertexStride = vertexStride;
		this.glPrimativeType = glPrimativeType;
		this.glDrawMode = glDrawMode;

		this.buildGPUBuffers();
	}

	SetStandardAttributes(attributes)
	{
		for(let i = 0; i < attributes.length; i++)
			this.SetStandardAttribute(attributes[i]);
	}

	SetStandardAttribute(name)
	{
		switch(name)
		{
			case "a_position":
				this.SetAttributeData("a_position", 2, gl.FLOAT, false);
				break;
			case "a_position3":
				this.SetAttributeData("a_position", 3, gl.FLOAT, false);
				break;
			case "a_uv":
				this.SetAttributeData("a_uv", 2, gl.FLOAT, false);
				break;
			case "a_normal":
				this.SetAttributeData("a_normal", 3, gl.FLOAT, true);
				break;
			case "a_color":
				this.SetAttributeData("a_color", 4, gl.FLOAT, false);
				break;

		}
	}

	SetAttributeData(name, size, type = gl.FLOAT, normalized = false)
	{
		/*
		name : string, should match the attribute name used in the shader program.
		data : array of data.
		size : GLint, specifying size of attribute, must be \in {1,2,3,4}.
		type : GLenum, specifying type of data.
		normalized : GLboolean, true if attribute should be normalized.
		*/
		this.vertexAttributes[name] = {
			"size" : size,
			"type" : type,
			"normalized" : normalized
		};
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
		var ModelMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_MMat");
		gl.uniformMatrix4fv(ModelMatrixLoc, false, this.transform.matrix);
		var ViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_VMat");
		gl.uniformMatrix4fv(ViewMatrixLoc, false, VMat);
		var ProjMatrixLoc = gl.getUniformLocation(this.shaderProgram, "u_PMat");
		gl.uniformMatrix4fv(ProjMatrixLoc, false, PMat);
	}

	BindBuffers()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	}

	SetVertexAttributes()
	{		
		//console.log("setting attributes");
		for (const [key, value] of Object.entries(this.vertexAttributes)) {
			var attribLoc = gl.getAttribLocation(this.shaderProgram, key);	// look up where the vertex data needs to go.
			//console.log(key, attribLoc);
			gl.enableVertexAttribArray(attribLoc);	// Turn on the attribute
			gl.vertexAttribPointer(attribLoc, value.size, value.type, value.normalized, this.vertexStride, 0);	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		  }
	}

	Render()
	{
		gl.useProgram(this.shaderProgram);	// Tell it to use our program (pair of shaders)
		this.SetUniforms();
		this.BindBuffers();
		this.SetVertexAttributes();
		
		// draw
		gl.drawElements(this.glPrimativeType, this.indices.length, gl.UNSIGNED_SHORT, 0);
	}
}

class TextMesh{
	constructor(transform, content, fontWidth = 16, color = new vec3(1,1,1), centered = false)
	{		
		var mesh = new Mesh(quadVerticesTS, quadIndicesTS, transform, programText, ["a_position"], 8, gl.TRIANGLE_STRIP, gl.STATIC_DRAW);
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
	}

	SetAttributes = function(){
		this.mesh.SetVertexAttributes();

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.charOffsetBuffer);
		var charOffsetLoc = gl.getAttribLocation(this.mesh.shaderProgram, "a_char_offset");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(charOffsetLoc);
		gl.vertexAttribPointer(charOffsetLoc, 1, gl.FLOAT, false, 0, 0);
		// this line says this attribute only changes for each 1 instance
		gl.vertexAttribDivisor(charOffsetLoc, 1);

		// set attribute for char offset
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvOffsetsBuffer);
		var uvOffsetsLoc = gl.getAttribLocation(this.mesh.shaderProgram, "a_uv_offset");	// look up where the vertex data needs to go.
		gl.enableVertexAttribArray(uvOffsetsLoc);
		gl.vertexAttribPointer(uvOffsetsLoc, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(uvOffsetsLoc, 1);

		gl.bindTexture(gl.TEXTURE_2D, fontTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	}

	Render()
	{
		gl.useProgram(this.mesh.shaderProgram);	// Tell it to use our program (pair of shaders)

		this.SetUniforms();
		this.BindBuffers();
		this.SetAttributes();

		// draw
		gl.drawElementsInstanced(this.mesh.glPrimativeType, this.mesh.indices.length, gl.UNSIGNED_SHORT, 0, this.content.length);
	}
}