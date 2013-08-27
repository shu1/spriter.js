/**
 * Copyright (c) 2012 Flyover Games, LLC 
 * Copyright (c) 2013 Zaxuhe
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

/*
spriter_animation handles the sprites positions, draw, zoom,update and rotation of a spriter object
*/


// Add methods like this.  All Person objects will be able to invoke this
spriter_animation.prototype.set_camera = function ()
{
	this.pose.setAnim(0);
	camera_scale = 1;
}

function spriter_animation(url, draw_canvas, is_gl)
{
	this.url = url;
	this.draw_canvas = draw_canvas;
	this.is_gl = is_gl;
	
	this.pos_data =new Object();;
	this.pos_data.pos_x = 0;
	this.pos_data.pos_y = 0;
	this.pos_data.scale_x = 1;
	this.pos_data.scale_y = 1;
	this.pos_data.angle = 0;
    this.pos_data.flip = 1;
    this.loop = true;

	this.canvas_w = 640;
	this.canvas_h = 480;
	this.debug_draw = false;
	this.time_scale = 1.0;
	this.info_div = document.getElementById("info_div");
	this.data_loaded = false;
	this.on_finish_change = undefined;
	this.on_finish_callback = undefined;
	this.on_loop_callback = undefined;
	this.on_finish_callback_again = true;

	//We load spriter animation
	this.pose = new spriter.pose();

	var url = this.url;
	//var url = "rapido/rapido.scml";

	//info_div.innerHTML = "Loading...";
	var data = new spriter.data();
	data.loadFromURL(url, function (anim)
	{
		anim.pose = new spriter.pose(data);
		anim.set_camera(anim.pose);
		anim.data_loaded = true;
		//info_div.innerHTML = "Animation Name: " + anim.pose.getAnimName();
	},this);
}

spriter_animation.prototype.set_scale= function(scale_x, scale_y)
{
	this.pos_data.scale_x = scale_x;
	this.pos_data.scale_y = scale_y;
}

spriter_animation.prototype.set_position= function(pos_x, pos_y)
{
	this.pos_data.pos_x = pos_x;
	this.pos_data.pos_y = pos_y;
}

spriter_animation.prototype.set_rotation= function(rotation)
{
	this.pos_data.angle = rotation;
}

spriter_animation.prototype.get_rotation= function()
{
	return this.pos_data.angle;
}

spriter_animation.prototype.get_x = function()
{
	return this.pos_data.pos_x;
}

spriter_animation.prototype.get_y = function()
{
	return this.pos_data.pos_y;
}

spriter_animation.prototype.get_scale_x = function()
{
	return this.pos_data.scale_x;
}

spriter_animation.prototype.get_scale_y = function()
{
	return this.pos_data.scale_y;
}

spriter_animation.prototype.flip = function(flip)
{
    if (flip != null)
    {
        this.pos_data.flip = flip;
        return;
    }
    if (this.pos_data.flip == 1)
    {
        this.pos_data.flip = -1;
    }
    else
    {
        this.pos_data.flip = 1;
    }
}

spriter_animation.prototype.setLooping = function(loop)
{
	this.loop = loop;
}

//Can be used for name or id
spriter_animation.prototype.onFinishAnimSetAnim = function (anim_id)
{
	this.on_finish_change = anim_id;
}

//Can be used for name or id
spriter_animation.prototype.setAnim = function (anim_id)
{
	this.pose.setAnim(anim_id);
}

//Can be used for name or id
spriter_animation.prototype.getAnimNames = function ()
{
	return this.pose.getAnimNames();
}

//Can be used for name or id
/*
@call_again call everytime the loop finished or call just once: defaults true
@callback the function to call when the animation finished
*/
spriter_animation.prototype.onFinishAnimCallback= function (call_again, callback)
{
	if (call_again == undefined)
	{
		call_again = true;
	}
	this.on_finish_callback = callback;
	this.on_finish_callback_again = call_again;
}

//Can be used for name or id
/*
@call_again call everytime the loop finished or call just once: defaults true
@callback the function to call when the animation finished
*/
spriter_animation.prototype.onLoopAnimCallback= function (callback)
{
	this.on_loop_callback = callback;
}

spriter_animation.prototype.update = function(tick)
{
	if (this.data_loaded == false)
	{
		return;
	}
	var anim_time = tick.elapsed_time * this.time_scale;

	//
	/*if ((this.pose.getTime() + anim_time) < 0)
	{
		this.pose.setPrevAnim();
		//info_div.innerHTML = "Animation Name: " + this.pose.getAnimName();
	}*/
	//finish current animation
	if ((this.pose.getTime() + anim_time) >= this.pose.getAnimLength())
	{
		//change to aimation when finishes
		if (this.on_finish_change != undefined)
		{
			this.setAnim(this.on_finish_change);
			this.on_finish_change = undefined;
		}
		//callback
		if (this.on_finish_callback != undefined)
		{
			this.on_finish_callback.call();
			if (this.on_finish_callback_again == false)
			{
				this.on_finish_callback = undefined;
			}
		}
		if (this.on_loop_callback != undefined)
		{
			this.on_loop_callback.call();
		}
	}

	this.pose.setLooping(this.loop);
	this.pose.update(anim_time);
}

spriter_animation.prototype.draw_2d = function()
{
	var ctx_2d = this.draw_canvas.ctx_2d;

	if (ctx_2d)
	{
		//ctx_2d.clearRect(0, 0, ctx_2d.canvas.width, ctx_2d.canvas.height);

		ctx_2d.save();

			// 0,0 at center, x right, y up
			//ctx_2d.translate(ctx_2d.canvas.width / 2, ctx_2d.canvas.height / 2);
			ctx_2d.scale(1, -1);


			if (this.debug_draw)
			{
				this.draw_canvas.debug_draw_pose_2d(this.pose);

				var extent = get_pose_extent(this.pose);
				ctx_2d.lineWidth = 4;
				ctx_2d.lineCap = 'round';
				ctx_2d.strokeStyle = 'blue';
				ctx_2d.strokeRect(
					extent.min.x, extent.min.y, 
					extent.max.x - extent.min.x, 
					extent.max.y - extent.min.y);
			}
			else
			{
				this.draw_canvas.draw_pose_2d(this.pose,this.pos_data);
			}

		ctx_2d.restore();
	}
}

spriter_animation.prototype.draw_gl = function()
{
	var ctx_gl = this.draw_canvas.ctx_gl;

	if (ctx_gl)
	{
		// apply camera
		var camera_mtx = new fo.m3x2();
		//camera_mtx.selfScale(1 / this.camera_scale, 1 / this.camera_scale);
		//camera_mtx.selfRotateDegrees(-this.camera_angle);
		//camera_mtx.selfTranslate(-this.camera_x, -this.camera_y);
		
		this.draw_canvas.load_camera_mtx(camera_mtx);

		this.draw_canvas.draw_pose_gl(this.pose);
	}
}

spriter_animation.prototype.draw = function()
{
	if (this.is_gl == false)
	{
		this.draw_2d();
	}
	else
	{
		this.draw_gl();
	}
}


