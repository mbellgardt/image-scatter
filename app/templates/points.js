// parameters for point cloud interaction
zoom_speed = {{zoom_speed}};
min_scale = {{min_scale}};
point_scale = {{point_scale}};
point_image_threshold = {{point_image_threshold}};
initial_scale = {{initial_scale}}

// point cloud data
coords = [
	{% for point in points %}
		math.matrix([{{point.coords[0]}}, {{point.coords[1]}}, 1]),
	{% endfor %}
];

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

function movePoint(idx, x_pos, y_pos) 
{
	var d = document.getElementById("point-" + idx);
	d.style.position = "absolute";
	d.style.left = x_pos-(pointsize*0.5)+'px';
	d.style.top = y_pos-(pointsize*0.5)+'px';
}

function showPointImage(idx)
{
	var p = document.getElementById("point-" + idx);
	if (parseInt(p.style.left) < -pointsize) {return false;}
	if (parseInt(p.style.left) > parseInt(window.innerWidth)) {return false;}
	if (parseInt(p.style.top) < -pointsize) {return false;}
	if (parseInt(p.style.top) > parseInt(window.innerHeight)) {return false;}
	
	var im = document.getElementById("point-img-" + idx);
	im.removeAttribute("hidden")
	return true;
}

function hidePointImage(idx)
{
	var im = document.getElementById("point-img-" + idx);
	im.setAttribute("hidden", "hidden")
}

function scalePoint(idx)
{
	var p = document.getElementById("point-" + idx);
	var im = document.getElementById("point-img-" + idx);
	
	p.style.width = pointsize + "px";
	p.style.height = pointsize + "px";
	
	if (pointsize > point_image_threshold) 
	{
		if (!showPointImage(idx)) {return;}
		if(im.naturalWidth > im.naturalHeight)
		{
			im.style.width = pointsize + "px";
			im.style.height = "auto"
		}
		else
		{
			im.style.height = pointsize + "px";
			im.style.width = "auto"
		}
	}
	else
	{
		hidePointImage(idx)
	}
}

function draw() 
{
	pointsize = (scale - min_scale + 1) * point_scale;
	new_coords = math.multiply(coords, math.transpose(view))
	for(i=0; i<coords.length; i++)
	{
		scalePoint(i);
		movePoint(i, new_coords.get([i, 0]), new_coords.get([i, 1]));
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