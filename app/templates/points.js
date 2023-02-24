// parameters for point cloud interaction
zoom_speed = {{zoom_speed}};
min_scale = {{min_scale}};
point_scale = {{point_scale}};
point_thumb_threshold = {{point_thumb_threshold}};
point_image_threshold = {{point_image_threshold}};
initial_scale = {{initial_scale}}

// point cloud data
coords = [
	{% for point in points %}
		math.matrix([{{point.coords[0]}}, {{point.coords[1]}}, 1]),
	{% endfor %}
];

transformed_coords = math.zeros(3, coords.length)

colors = [
	{% for point in points %}
		"{{point.color}}",
	{% endfor %}
]

image_cache = [
	{% for point in points %}
		{ 
			"image": {
				"url": "{{url_for('static', filename=point.file)}}",
				"obj": null,
				"loaded": false
			},
			"thumb": {
				"url": "{{url_for('static', filename=point.thumb)}}",
				"obj": null,
				"loaded": false
			}
		},
	{% endfor %}
]

// initialize internal variables (all velues are overwritten at startup)
scale = initial_scale;
trans = [0, 0];
view = math.identity(3);
pointsize = 1
dragging = false;
last_p = [0, 0]

function initView()
{
	trans = [parseInt(window.innerWidth) / 2, parseInt(window.innerHeight) / 2];
}

function updateView()
{
	view = math.matrix([[scale,     0, trans[0]],
						[    0, scale, trans[1]],
						[    0,     0,       1]])
}

function drawPoint(idx)
{
	var x_pos = transformed_coords.get([idx, 0])
	var y_pos = transformed_coords.get([idx, 1])
	
	if (x_pos < -pointsize) {return;}
	if (x_pos > parseInt(window.innerWidth)+(pointsize*0.5)) {return;}
	if (y_pos < -pointsize) {return;}
	if (y_pos > parseInt(window.innerHeight)+(pointsize*0.5)) {return;}
	
	var rect_left = x_pos-(pointsize*0.5);
	var rect_top = y_pos-(pointsize*0.5);
	var rect_width = Math.max(pointsize,1);
	var rect_height = Math.max(pointsize,1);
	
	var c = document.getElementById("point-canvas");
	var ctx = c.getContext("2d");
	ctx.fillStyle = colors[idx];
	ctx.fillRect(rect_left, rect_top, rect_width, rect_height);
	
	if (pointsize > point_thumb_threshold) 
	{
		var im_c;
		if (pointsize > point_image_threshold)
		{
			im_c = image_cache[idx]["image"];
		}
		else
		{
			im_c = image_cache[idx]["thumb"];
		}
		
		if (im_c.loaded)
		{
			im = im_c["obj"]
			im_ratio = im.naturalWidth / im.naturalHeight;
			if(im_ratio > 1.0) // landscape
			{
				im_height = rect_height/im_ratio
				ctx.drawImage(im,rect_left,rect_top+(rect_height-im_height)*0.5, rect_width, im_height);
			}
			else // portrait
			{
				im_width = rect_width*im_ratio
				ctx.drawImage(im,rect_left + (rect_width-im_width)*0.5,rect_top, im_width, rect_height);
			}
		}
		else
		{
			im_c["obj"] = new Image();
			im_c["obj"]["idx"] = idx;
			im_c["obj"]["im_c"] = im_c;
			im_c["obj"].onload = function () {
				this["im_c"].loaded = true;
				drawPoint(this["idx"])
			}
			im_c["obj"].src = im_c["url"];
		}
	}
}

function draw() 
{
	var c = document.getElementById("point-canvas");
	var dimension = [parseInt(window.innerWidth), parseInt(window.innerHeight)];
	c.width = dimension[0];
	c.height = dimension[1];
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	
	pointsize = (scale - min_scale + 1) * point_scale;
	transformed_coords = math.multiply(coords, math.transpose(view))
	for(i=0; i<coords.length; i++)
	{
		drawPoint(i);
	}
}

function onMouseDown(event)
{
	last_p = [event.pageX, event.pageY];
	dragging = true;
}

function onMouseUp(event)
{
	dragging = false;
}

function onMouseMove(event)
{
	if (dragging)
	{
		p = [event.pageX, event.pageY];
		delta = math.subtract(p, last_p);
		trans = math.add(trans, delta);
		last_p = p;
		updateView();
		draw();
	}
}

function onMouseWheel(event)
{
	p = [event.pageX, event.pageY];
	d = math.subtract(p, trans);
	d = math.divide(d, scale);
	scale += event.deltaY * scale * -zoom_speed;
	if (scale < min_scale) {scale = min_scale}
	d = math.multiply(d, -scale);
	trans = math.add(p, d);
	updateView();
	draw();
}

// initialization on startup
initView()
updateView()
draw()

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('wheel', onMouseWheel);