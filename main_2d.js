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

	//Draw on 2d
	var canvas_2d = canvas_div.appendChild(document.createElement('canvas'));
	canvas_2d.style.border = '1px solid black';
	canvas_2d.width = canvas_w;
	canvas_2d.height = canvas_h;
	var view_2d = new fo.view_2d(canvas_2d);

	//Time scale
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


	//Enable debug draw (only works on 2d not webgl)
	var debug_draw = false;

	var checkbox = control_div.appendChild(document.createElement('input'));
	var checkbox_label = control_div.appendChild(document.createElement('span'));
	checkbox.type = 'checkbox';
	checkbox.checked = debug_draw;
	checkbox_label.innerHTML = "Debug Draw";
	checkbox.addEventListener('change', function (e)
	{
		debug_draw = e.target.checked;
	}, 
	false);

	var anim_a = new spriter_animation("test/test.scml", view_2d, false);//2d
	anim_a.set_position(320,240);
	anim_a.flip();
	anim_a.setLooping(false);
	anim_a.onFinishAnimSetAnim("idle");
	anim_a.onFinishAnimCallback(false,function(){alert("test")});	

	var anim_b = new spriter_animation("rapido/rapido.scml", view_2d, false);//2d
	anim_b.set_scale(0.3,0.3);
	anim_b.set_position(320,240);

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
		if (anim_b.data_loaded == true)
		{
			anim_b.set_rotation(anim_b.get_rotation()+1);
		}

		tick.time_last = time;

		//draw 2d
		var ctx_2d = view_2d.ctx_2d;

		if (ctx_2d)
		{
			ctx_2d.clearRect(0, 0, ctx_2d.canvas.width, ctx_2d.canvas.height);

			anim_a.draw();
			anim_b.draw();
		}
	}

	loop(tick.time_last);
}