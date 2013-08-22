var fo = fo || {};

/**
 * @constructor 
 * @param {HTMLCanvasElement} canvas_gl 
 */
fo.view_gl = function (canvas_gl)
{
	var opt_gl = {};

	var ctx_gl = canvas_gl.getContext('webgl', opt_gl);
	ctx_gl = ctx_gl || canvas_gl.getContext('experimental-webgl', opt_gl);
	ctx_gl = ctx_gl || canvas_gl.getContext('webkit-3d', opt_gl);
	ctx_gl = ctx_gl || canvas_gl.getContext('moz-webgl', opt_gl);
	this.ctx_gl = ctx_gl;

	if (!ctx_gl)
	{
		canvas_gl.style.backgroundColor = 'rgba(127,0,0,1.0)';
	}

	if (ctx_gl)
	{
		//window.console.log(ctx_gl.getSupportedExtensions());

		if (!ctx_gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc') && 
			!ctx_gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc'))
		{
			window.console.log("No WebGL Compressed Texture S3TC");
		}
	}

	if (ctx_gl)
	{
		ctx_gl.clearColor(0.0, 0.0, 0.0, 0.0);
		ctx_gl.clearDepth(1.0);

		ctx_gl.depthFunc(ctx_gl.LEQUAL);
		ctx_gl.enable(ctx_gl.DEPTH_TEST);

		//ctx_gl.alphaTest(ctx_gl.GREATER, 0.5);
		//ctx_gl.enable(ctx_gl.ALPHA_TEST);

		ctx_gl.blendFunc(ctx_gl.ONE, ctx_gl.ONE_MINUS_SRC_ALPHA);
		ctx_gl.enable(ctx_gl.BLEND);

		ctx_gl.viewport(0, 0, ctx_gl.canvas.width, ctx_gl.canvas.height);

		// matrices
		var uMatrixP = this.uMatrixP = new Float32Array(16); // projection matrix
		var uMatrixC = this.uMatrixC = new Float32Array(16); // camera matrix
		var uMatrixM = this.uMatrixM = new Float32Array(16); // modelview matrix

		var uGlobalAlpha = this.uGlobalAlpha = new Float32Array(1);

		var mtx = new fo.m3x2();
		mtx.selfScale(2 / ctx_gl.canvas.width, 2 / ctx_gl.canvas.height);
		this.load_projection_mtx(mtx);

		this.load_camera_mtx(fo.m3x2.IDENTITY);

		this.load_modelview_mtx(fo.m3x2.IDENTITY);

		var compile_shader = function (src, type)
		{
			var shader = ctx_gl.createShader(type);
			ctx_gl.shaderSource(shader, src);
			ctx_gl.compileShader(shader);
			if (!ctx_gl.getShaderParameter(shader, ctx_gl.COMPILE_STATUS))
			{
				window.console.log(ctx_gl.getShaderInfoLog(shader));
				ctx_gl.deleteShader(shader);
				shader = null;
			}
			return shader;
		}

		// vertex shader
		var vs_src = "";
		vs_src += "uniform mat4 uMatrixP;";
		vs_src += "uniform mat4 uMatrixC;";
		vs_src += "uniform mat4 uMatrixM;";
		vs_src += "attribute vec3 aVertexPosition;";
		vs_src += "attribute vec4 aVertexColor;";
		vs_src += "attribute vec2 aVertexTexCoord;";
		vs_src += "varying vec4 vColor;";
		vs_src += "varying vec2 vTexCoord;";
		vs_src += "void main(void) {";
		vs_src += " gl_Position = uMatrixP * uMatrixC * uMatrixM * vec4(aVertexPosition, 1.0);";
		vs_src += " vColor = aVertexColor;";
		vs_src += " vTexCoord = aVertexTexCoord;";
		vs_src += "}";
		var vs = compile_shader(vs_src, ctx_gl.VERTEX_SHADER);

		// fragment shader
		var fs_src = "";
		fs_src += "precision mediump float;";
		fs_src += "uniform float uGlobalAlpha;";
		fs_src += "uniform sampler2D uSampler;";
		fs_src += "varying vec4 vColor;";
		fs_src += "varying vec2 vTexCoord;";
		fs_src += "void main(void) {";
		fs_src += " gl_FragColor = texture2D(uSampler, vTexCoord.st);";
		fs_src += " gl_FragColor *= uGlobalAlpha;";
		fs_src += "}";
		var fs = compile_shader(fs_src, ctx_gl.FRAGMENT_SHADER);

		var link_program = function (vs, fs)
		{
			var program = ctx_gl.createProgram();
			ctx_gl.attachShader(program, vs);
			ctx_gl.attachShader(program, fs);
			ctx_gl.linkProgram(program);
			if (!ctx_gl.getProgramParameter(program, ctx_gl.LINK_STATUS))
			{
				window.console.log("could not link shader program");
				ctx_gl.deleteProgram(program);
				program = null;
			}
			return program;
		}

		// shader program
		var program = this.program = link_program(vs, fs);

		program.uMatrixP = ctx_gl.getUniformLocation(program, "uMatrixP");
		program.uMatrixC = ctx_gl.getUniformLocation(program, "uMatrixC");
		program.uMatrixM = ctx_gl.getUniformLocation(program, "uMatrixM");

		program.uGlobalAlpha = ctx_gl.getUniformLocation(program, "uGlobalAlpha");
		program.uSampler = ctx_gl.getUniformLocation(program, "uSampler");

		program.aVertexPosition = ctx_gl.getAttribLocation(program, "aVertexPosition");
		program.aVertexColor = ctx_gl.getAttribLocation(program, "aVertexColor");
		program.aVertexTexCoord = ctx_gl.getAttribLocation(program, "aVertexTexCoord");

		// vertex position buffer
		var vertex_position_array = 
		[
			-1.0, -1.0, 0.0, // tl
			-1.0,  1.0, 0.0, // bl
			 1.0,  1.0, 0.0, // br
			 1.0, -1.0, 0.0  // tr
		];  
		var vertex_position_buffer = this.vertex_position_buffer = ctx_gl.createBuffer();
		ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, vertex_position_buffer);
		ctx_gl.bufferData(ctx_gl.ARRAY_BUFFER, new Float32Array(vertex_position_array), ctx_gl.STATIC_DRAW);
		vertex_position_buffer.itemType = ctx_gl.FLOAT;
		vertex_position_buffer.itemSize = 3; // floats per position
		vertex_position_buffer.numItems = vertex_position_array.length / vertex_position_buffer.itemSize;

		// vertex color buffer
		var vertex_color_array = 
		[
			1.0, 0.0, 0.0, 0.5, // tl
			0.0, 1.0, 0.0, 0.5, // bl
			0.0, 0.0, 1.0, 0.5, // br
			1.0, 1.0, 1.0, 0.5  // tr
		];  
		var vertex_color_buffer = this.vertex_color_buffer = ctx_gl.createBuffer();
		ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, vertex_color_buffer);
		ctx_gl.bufferData(ctx_gl.ARRAY_BUFFER, new Float32Array(vertex_color_array), ctx_gl.STATIC_DRAW);
		vertex_color_buffer.itemType = ctx_gl.FLOAT;
		vertex_color_buffer.itemSize = 4; // floats per color
		vertex_color_buffer.numItems = vertex_color_array.length / vertex_color_buffer.itemSize;

		// vertex texture coordinate buffer
		var vertex_texcoord_array = 
		[
			0.0, 0.0, // tl
			0.0, 1.0, // bl
			1.0, 1.0, // br
			1.0, 0.0  // tr
		];  
		var vertex_texcoord_buffer = this.vertex_texcoord_buffer = ctx_gl.createBuffer();
		ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, vertex_texcoord_buffer);
		ctx_gl.bufferData(ctx_gl.ARRAY_BUFFER, new Float32Array(vertex_texcoord_array), ctx_gl.STATIC_DRAW);
		vertex_texcoord_buffer.itemType = ctx_gl.FLOAT;
		vertex_texcoord_buffer.itemSize = 2; // floats per texture coordinate
		vertex_texcoord_buffer.numItems = vertex_texcoord_array.length / vertex_texcoord_buffer.itemSize;

		// vertex index buffer
		var vertex_index_array = 
		[
			0, 1, 2, 3
		];
		var vertex_index_buffer = this.vertex_index_buffer = ctx_gl.createBuffer();
		ctx_gl.bindBuffer(ctx_gl.ELEMENT_ARRAY_BUFFER, vertex_index_buffer);
		ctx_gl.bufferData(ctx_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertex_index_array), ctx_gl.STATIC_DRAW);
		vertex_index_buffer.itemType = ctx_gl.UNSIGNED_SHORT;
		vertex_index_buffer.itemSize = 1; // unsigned short per index
		vertex_index_buffer.numItems = vertex_index_array.length / vertex_index_buffer.itemSize;
	}
}

/**
 * @return {void} 
 * @param {Float32Array} dst 
 * @param {fo.m3x2} mtx 
 */
var set_a16_from_m3x2 = function (dst, src)
{
	dst[ 0] = src.a_x; dst[ 1] = src.a_y; dst[ 2] = 0; dst[ 3] = 0; // col 0
	dst[ 4] = src.b_x; dst[ 5] = src.b_y; dst[ 6] = 0; dst[ 7] = 0; // col 1
	dst[ 8] = 0;       dst[ 9] = 0;       dst[10] = 1; dst[11] = 0; // col 2
	dst[12] = src.c_x; dst[13] = src.c_y; dst[14] = 0; dst[15] = 1; // col 3
}

/**
 * @return {void} 
 * @param {fo.m3x2} mtx 
 */
fo.view_gl.prototype.load_projection_mtx = function (mtx)
{
	set_a16_from_m3x2(this.uMatrixP, mtx);
}

/**
 * @return {void} 
 * @param {fo.m3x2} mtx 
 */
fo.view_gl.prototype.load_camera_mtx = function (mtx)
{
	set_a16_from_m3x2(this.uMatrixC, mtx);
}

/**
 * @return {void} 
 * @param {fo.m3x2} mtx 
 */
fo.view_gl.prototype.load_modelview_mtx = function (mtx)
{
	set_a16_from_m3x2(this.uMatrixM, mtx);
}

/**
 * @return {void} 
 * @param {spriter.pose} pose 
 */
fo.view_gl.prototype.draw_pose_gl = function (pose)
{
	var ctx_gl = this.ctx_gl;

	pose.strike();

	var mtx = new fo.m3x2();

	if (pose.m_data && pose.m_data.folder_array)
	{
		var folder_array = pose.m_data.folder_array;
		var object_array = pose.m_tweened_object_array;
		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx)
		{
			var object = object_array[object_idx];
			var folder = folder_array[object.folder];
			var file = folder.file_array[object.file];

			mtx.makeIdentity();

			// apply object transform
			mtx.selfTranslate(object.x, object.y);
			mtx.selfRotateDegrees(object.angle);
			mtx.selfScale(object.scale_x, object.scale_y);

			// image extents
			var ex = 0.5 * file.width;
			var ey = 0.5 * file.height;
			mtx.selfScale(ex, ey);

			// local pivot in unit (-1 to +1) coordinates
			var lpx = (object.pivot_x * 2) - 1;
			var lpy = (object.pivot_y * 2) - 1;
			mtx.selfTranslate(-lpx, -lpy);

			this.load_modelview_mtx(mtx);

			this.uGlobalAlpha[0] = object.a;

			if (!file.texture && file.image && !file.image.hidden)
			{
				file.texture = ctx_gl.createTexture();
				ctx_gl.bindTexture(ctx_gl.TEXTURE_2D, file.texture);
				ctx_gl.pixelStorei(ctx_gl.UNPACK_FLIP_Y_WEBGL, true);
				ctx_gl.pixelStorei(ctx_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				ctx_gl.texImage2D(ctx_gl.TEXTURE_2D, 0, ctx_gl.RGBA, ctx_gl.RGBA, ctx_gl.UNSIGNED_BYTE, file.image);
				ctx_gl.texParameteri(ctx_gl.TEXTURE_2D, ctx_gl.TEXTURE_MAG_FILTER, ctx_gl.LINEAR);
				ctx_gl.texParameteri(ctx_gl.TEXTURE_2D, ctx_gl.TEXTURE_MIN_FILTER, ctx_gl.LINEAR);
				ctx_gl.texParameteri(ctx_gl.TEXTURE_2D, ctx_gl.TEXTURE_WRAP_S, ctx_gl.CLAMP_TO_EDGE);
				ctx_gl.texParameteri(ctx_gl.TEXTURE_2D, ctx_gl.TEXTURE_WRAP_T, ctx_gl.CLAMP_TO_EDGE);
				ctx_gl.bindTexture(ctx_gl.TEXTURE_2D, null);
			}

			if (file.texture)
			{
				var program = this.program;

				ctx_gl.useProgram(program);

				ctx_gl.uniformMatrix4fv(program.uMatrixP, false, this.uMatrixP);
				ctx_gl.uniformMatrix4fv(program.uMatrixC, false, this.uMatrixC);
				ctx_gl.uniformMatrix4fv(program.uMatrixM, false, this.uMatrixM);

				ctx_gl.uniform1fv(program.uGlobalAlpha, this.uGlobalAlpha);

				ctx_gl.activeTexture(ctx_gl.TEXTURE0);
				ctx_gl.bindTexture(ctx_gl.TEXTURE_2D, file.texture);
				ctx_gl.uniform1i(program.uSampler, 0);

				ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, this.vertex_position_buffer);
				ctx_gl.vertexAttribPointer(program.aVertexPosition, this.vertex_position_buffer.itemSize, this.vertex_position_buffer.itemType, false, 0, 0);
				ctx_gl.enableVertexAttribArray(program.aVertexPosition);

				ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, this.vertex_color_buffer);
				ctx_gl.vertexAttribPointer(program.aVertexColor, this.vertex_color_buffer.itemSize, this.vertex_color_buffer.itemType, false, 0, 0);
				ctx_gl.enableVertexAttribArray(program.aVertexColor);

				ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, this.vertex_texcoord_buffer);
				ctx_gl.vertexAttribPointer(program.aVertexTexCoord, this.vertex_texcoord_buffer.itemSize, this.vertex_texcoord_buffer.itemType, false, 0, 0);
				ctx_gl.enableVertexAttribArray(program.aVertexTexCoord);

				ctx_gl.bindBuffer(ctx_gl.ELEMENT_ARRAY_BUFFER, this.vertex_index_buffer);
				ctx_gl.drawElements(ctx_gl.TRIANGLE_FAN, this.vertex_index_buffer.numItems, this.vertex_index_buffer.itemType, 0);
			}
		}
	}
}