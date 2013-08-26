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

/**
 * @return {void}
 */
var main = function ()
{
	//For test mode
	var directions_div = document.body.appendChild(document.createElement('div'));
	var file_input_div = document.body.appendChild(document.createElement('div'));
	var canvas_div = document.body.appendChild(document.createElement('div'));
	var info_div = document.body.appendChild(document.createElement('div'));
	var control_div = document.body.appendChild(document.createElement('div'));

	directions_div.innerHTML = "Drag a Spriter SCML file and associated image directories to canvas.";

	canvas_div.style.display = 'inline-block';
	info_div.id = "info_div";

	var canvas_w = 640;
	var canvas_h = 480;

	//Draw on webgl
	var canvas_gl = canvas_div.appendChild(document.createElement('canvas'));
	canvas_gl.style.border = '1px solid black';
	canvas_gl.width = canvas_w;
	canvas_gl.height = canvas_h;
	var view_gl = new fo.view_gl(canvas_gl);

	//Time sacle
	var time_scale = 1.0;

	var slider_label = control_div.appendChild(document.createElement('span'));
	var slider = control_div.appendChild(document.createElement('input'));
	var slider_value = control_div.appendChild(document.createElement('span'));
	slider_label.innerHTML = "Time Scale: ";
	slider.type = 'range';
	slider.min = -2.0;
	slider.max = 2.0;
	slider.step = 0.01;
	slider.value = time_scale;
	slider_value.innerHTML = time_scale;
	slider.addEventListener('change', function (e)
	{
		time_scale = parseFloat(e.target.value);
		slider_value.innerHTML = time_scale.toFixed(2);
	}, 
	false);

	var anim_a = new spriter_animation("test/test.scml", view_gl, true);//webgl
	var anim_b = new spriter_animation("rapido/rapido.scml", view_gl, true);//webgl
	//anim_b.scale_x = 0.3;
	//anim_b.scale_y = 0.3;

	//aqui hacemos el main loop donde llamamos todo
	var tick = new Object();
	tick.frame = 0;
	tick.time = 0;
	tick.time_last = 0;
	tick.elapsed_time = 0;

	var loop = function (time)
	{
		window.requestAnimationFrame(loop, null);

		++tick.frame;
		tick.time = time;

		tick.elapsed_time = Math.min(tick.time - tick.time_last, 50);

		anim_a.update(tick);
		anim_b.update(tick);

		tick.time_last = time;

		//draw gl
		var ctx_gl = view_gl.ctx_gl;
		if (ctx_gl)
		{
			ctx_gl.clear(ctx_gl.COLOR_BUFFER_BIT | ctx_gl.DEPTH_BUFFER_BIT);

			anim_a.draw();
			anim_b.draw();
			
			ctx_gl.flush();
		}
	}

	loop(tick.time_last);
}