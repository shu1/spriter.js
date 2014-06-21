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
var main = function() {
	var canvas_2d = document.body.appendChild(document.createElement('canvas'));
	canvas_2d.style.border = '1px solid black';
	canvas_2d.width = window.innerWidth;
	canvas_2d.height = window.innerHeight;
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
			anim_b.set_rotation(anim_b.get_rotation()+1);
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
