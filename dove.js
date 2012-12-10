// functions accessible from the html page
var update, draw;

$(function() {
	var height = 500;
	var width = 500;

	var $canvas = $('#dove');
	$canvas.attr({ height: height, width:width });

	var c = $canvas[0].getContext('2d');

	var vertexRadius = 10;
	var vertices = {};
	var edges = [];

	// update the vertices and edges variables
	// according to the contents of #doveinput
	update = function(str)
	{
		console.log(str);
		var vertexList = [];
		edges = [];
		
		var lines = str.split('\n');
		for (var n = 0; n < lines.length; n++)
		{
			if (lines[n].match(/^\s*$/))
				continue;
				// failed attempt at ignoring blank lines
				// i think this is the source of the "phantom vertices" bug
			
			var e = lines[n].split(' ');
			
			// add vertices as we come across them;
			// ensure each name appears exactly once
			if (vertexList.indexOf(e[0]) === -1)
				vertexList.push(e[0]);
			
			if (e.length === 2)
			{
				if (vertexList.indexOf(e[1]) === -1)
					vertexList.push(e[1]);
					
				edges.push(e);
			}
		}
		
		vertices = {};
		var radius = width/2 - 100;
		for (var n = 0; n < vertexList.length; n++)
		{
			vertices[vertexList[n]] = {
				x: width/2  + radius*Math.cos(2*Math.PI*n/vertexList.length),
				y: height/2 + radius*Math.sin(2*Math.PI*n/vertexList.length),
			};
		}
	}

	var highlight = null;
	var mousebinding = null;

	draw = function()
	{
		c.clearRect(0, 0, width, height);
		
		c.strokeStyle = 'black';
		c.lineWidth = vertexRadius/2;
		c.lineCap = 'round';
		for (n = 0; n < edges.length; n++)
		{
			var p1 = vertices[edges[n][0]];
			var p2 = vertices[edges[n][1]];
			
			c.beginPath();
			c.moveTo(p1.x, p1.y);
			c.lineTo(p2.x, p2.y);
			c.stroke();
			c.closePath();
		}
		
		
		c.font = '14pt sans-serif';
		c.strokeStyle = 'white';
		for (var v in vertices)
		{
			var vtx = vertices[v];
			c.beginPath();
			c.arc(vtx.x, vtx.y, vertexRadius, 0, 2*Math.PI, false);
			c.closePath();
			c.fillStyle = v === highlight ? 'red' : 'black';
			c.fill();
			
			if ($('#drawnames').attr('checked'))
			{
				c.fillStyle = 'black';
				c.strokeText(v, vtx.x, vtx.y);
				c.fillText(v, vtx.x, vtx.y);
			}
		}
	}

	var distSq = function(x1, y1, x2, y2)
	{
		return (function(a,b){return a*a+b*b})(x1-x2,y1-y2);
	}

	$canvas.mousemove(function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;
		
		if (mousebinding)
		{
			vertices[mousebinding] = {x:x, y:y};
		}
		else
		{
			// don't update the highlighting
			// if a vertex is being dragged
			for (v in vertices)
			{
				var vtx = vertices[v];
				var d = distSq(x, y, vtx.x, vtx.y);
				if (d < vertexRadius*vertexRadius)
				{
					highlight = v;
					draw();
					return;
				}
			}
			highlight = null;
		}
		draw();
	}).mousedown(function(e) {
		if (highlight)
			mousebinding = highlight;
	}).mouseup(function(e) {
		mousebinding = null;
	});

	update($('#doveinput').text());
	draw();
});