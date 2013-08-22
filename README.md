spriter.js
==========

A JavaScript API for the Spriter SCML animation data format.

Demo:
<a href="http://zaxuhe.com/spriter/">http://zaxuhe.com/spriter/</a>

References:

<a href="http://www.brashmonkey.com/index.htm">Spriter Website</a>

<a href="http://www.brashmonkeygames.com/spriter/8-17-2012/GettingStartedWithSCMLGuide(a2).pdf">File Format</a>

How to use:
==========

WebGL:
==========

Use spriter_draw_gl.js instead of spriter_draw_2d.js

Open main.js

Search for "Draw on 2d" and comment the next 5 lines

Search for "Draw on webgl" and uncomment the next 5 lines

Search for "var anim_a = new spriter_animation("test/test.scml", view_2d, false);//2d" and comment it, uncomment next line

And done

2d (no webgl):
==========

It's enabled by default

Using on a project:
==========

Todo