spriter.js
==========
Since CocoonJS does not support DOMParser (for XML parsing), the original Spriter.js did not work in CocoonJS.  This fork is a workaround, by pre-converting the SCML to JSON, so your actual CocoonJS game can just use the JSON.  This will also remove the overhead of XML parsing in your game.

How to use:
==========
<a href="http://shu1.github.io/spriter.js/">http://shu1.github.io/spriter.js/</a>
##Generate JSON:
Run spriter.js in a PC browser (tested in Google Chrome). Click the top left button and navigate to your Spriter animation folder, or just drag and drop the folder onto the button. It will automatically look for the .scml file in the folder, and generate a .js file, which will auto-download to your browser's downloads folder. This is the JSON file that you will include in your CocoonJS game.

It is recommended that you open this file and remove the indent spaces, this will probably cut your file size by 2/3. In most code editors, just select all and press shift-tab a bunch of times until all the indents go away.

##Use the JSON in your CocoonJS game:
In your html, include the generated .js file, "spriter.js", "spriter_draw_2d.js", and "spriter_object.js" in that order.  Look at main_2d.js to see how to use the JSON data, starting from the line:
```
var anim_a = new spriter_animation("test/test.scml", view_2d, anim_a_data)
```
If your SCML file was called anim_a.scml, then your JSON file will be called anim_a.js, and the JSON object inside it will be named anim_a_data.  Which is why you pass anim_a_data into "new spriter_animation()".

If you have a non-looping animation by setting anim_a.setLooping(false), then trigger the animation later by calling anim_a.setAnim("jump"), etc.
