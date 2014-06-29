/**
 * Copyright (c) 2012 Flyover Games, LLC 
 *  
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software 
 * without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to 
 * whom the Software is furnished to do so, subject to the 
 * following conditions: 
 *  
 * The above copyright notice and this permission notice shall 
 * be included in all copies or substantial portions of the 
 * Software. 
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
 */

"use strict";

/**
 * @return {void}
 */
var main = function() {
	var file_input_div = document.body.appendChild(document.createElement('div'));
	var canvas_div = document.body.appendChild(document.createElement('div'));
	var info_div = document.body.appendChild(document.createElement('div'));
	canvas_div.style.display = 'inline-block';
	info_div.innerHTML = "Animation Name: ";

	var file_input = file_input_div.appendChild(document.createElement('input'));
	file_input.type = 'file';
	file_input.directory = file_input.webkitdirectory = "directory";
	var file_label = file_input_div.appendChild(document.createElement('span'));
	file_label.innerHTML = "Drag SCML file parent directory to the file input.";
	file_input.addEventListener('change', function(e) {
		var input_files = e.target.files;

		for (var input_file_idx = 0, input_files_len = input_files.length; input_file_idx < input_files_len; ++input_file_idx) {
			var input_file = input_files[input_file_idx];
			var filename = input_file.name.split('.');
			if (filename[1].toLowerCase() != 'scml') {
				continue;
			}

			file_label.innerHTML = input_file.name;
			info_div.innerHTML = "Loading...";
			var data = new spriter.data();
			data.loadFromFileList(input_file, input_files, (function(data) { return function() {
				var pose = new spriter.pose(data);
//				set_camera(pose);
				info_div.innerHTML = "Animation Name: " + pose.getAnimName();
			}})(data), filename[0]);
			break;
		}
	});

	canvas_div.addEventListener("dragover", function(e){e.preventDefault()});
	canvas_div.addEventListener("drop", function(e) {
		e.preventDefault();
		var items = e.dataTransfer.items;
		for (var i = 0, ct = items.length; i < ct; ++i) {
			var entry = items[i].webkitGetAsEntry();
			if (!entry.isFile) {
				continue;
			}
			var filename = entry.name.split('.');
			if (filename[1].toLowerCase() != 'scml') {
				continue;
			}

			file_label.innerHTML = entry.name;
			info_div.innerHTML = "Loading...";
			var data = new spriter.data();
			data.loadFromFileEntry(entry, (function(data) { return function() {
				var pose = new spriter.pose(data);
//				set_camera(pose);
				info_div.innerHTML = "Animation Name: " + pose.getAnimName();
			}})(data), filename[0]);
			break;
		}
	});

	var canvas_2d = canvas_div.appendChild(document.createElement('canvas'));
	canvas_2d.style.border = '1px solid black';
	canvas_2d.width = window.innerWidth-10;
	canvas_2d.height = window.innerHeight-70;
	var view_2d = new fo.view_2d(canvas_2d);

	var anim_a = new spriter_animation("test/test.scml", view_2d, anim_a_data);
	anim_a.set_position(canvas_2d.width/2, canvas_2d.height/2);
	anim_a.flip();
//	anim_a.setLooping(false);
	anim_a.onFinishAnimSetAnim("idle");

	var anim_b = new spriter_animation("rapido/rapido.scml", view_2d, anim_b_data);
	anim_b.set_scale(0.3, 0.3);
	anim_b.set_position(canvas_2d.width/2, canvas_2d.height/2);

	//aqui hacemos el main loop donde llamamos todo
	var tick = {};
	tick.frame = 0;
	tick.time = 0;
	tick.time_last = 0;
	tick.elapsed_time = 0;

	var loop = function(time) {
		window.requestAnimationFrame(loop, null);

		tick.frame++;
		tick.time = time;
		tick.elapsed_time = Math.min(tick.time - tick.time_last, 50);

		anim_a.update(tick);
		anim_b.update(tick);
		if (anim_b.data_loaded == true) {
			anim_b.set_rotation(anim_b.get_rotation()-1);
		}

		tick.time_last = time;

		var ctx_2d = view_2d.ctx_2d;
		if (ctx_2d) {
			ctx_2d.clearRect(0, 0, ctx_2d.canvas.width, ctx_2d.canvas.height);

			anim_a.draw();
			anim_b.draw();
		}
	}

	loop(tick.time_last);
}
