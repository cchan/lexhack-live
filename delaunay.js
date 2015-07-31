//Delaunay Triangulation Background
//Extremely modified from http://bl.ocks.org/mbostock/4341156

//Made from a scaled-down screenshot of the LexHack homepage
//curated in Paint
//loaded into Octave (Octave is SO cool)
//and outputted as a sparse array.
var pixels = [
	[12, 3],
	[11, 4],
	[13, 4],
	[10, 5],
	[14, 5],
	[10, 7],
	[11, 7],
	[12, 7],
	[13, 7],
	[14, 7],
	[14, 8],
	[14, 9],
	[12, 10],
	[13, 10],
	[11, 11],
	[14, 11],
	[12, 12],
	[14, 12],
	[11, 13],
	[13, 13],
	[14, 13],
	[12, 14],
	[13, 14],
	[11, 15],
	[13, 15],
	[14, 15],
	[10, 17],
	[11, 17],
	[12, 17],
	[13, 17],
	[14, 17],
	[12, 18],
	[10, 19],
	[11, 19],
	[12, 19],
	[13, 19],
	[14, 19],
	[11, 21],
	[13, 21],
	[14, 21],
	[11, 22],
	[14, 22],
	[11, 23],
	[12, 23],
	[13, 23],
	[14, 23],
	[12, 24],
	[13, 24],
	[11, 25],
	[14, 25],
	[11, 26],
	[12, 26],
	[14, 26],
	[10, 28],
	[11, 28],
	[12, 28],
	[13, 28],
	[14, 28],
	[12, 29],
	[13, 29],
	[11, 30],
	[14, 30],
	[10, 32],
	[14, 32],
	[11, 33],
	[13, 33],
	[12, 34]
];
var pixelswidth = 38;
var pixelsheight = 26;

var width, height, vertices, svg, vertexvels, path; //needs to be global for resize timeout and for not-in-closure functions

$(function(){
	width = $(document).innerWidth();
	height = $(document).height();
	points = Math.floor($(document).width()/4) + 150; //Estimation. If it's mobile it probably wants less.

	//Initialize vertices
	vertices = d3.range(points).map(function(d) {
	  var y = 0;
	  if(Math.random()<.1)
		y = Math.random()*height;
	  else
		y = Math.random()*height/3 + height/3;
	  return [Math.random() * width, y];
	});
	
	//Make sure the whole thing is covered [corners]
	vertices[0] = [0,0];
	vertices[1] = [width,0];
	vertices[2] = [0,height];
	vertices[3] = [width,height];
	
	//Initialize velocities
	vertexvels = d3.range(points).map(function(d){
		return [Math.random()*8 - 4, Math.random()*8 - 4];
	});
	
	svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "delaunay");
	
	path = svg.append("g").selectAll("path");
	
	redraw();
});



//https://stackoverflow.com/questions/4298612/jquery-how-to-call-resize-event-only-once-its-finished-resizing
var resizetimeout;
$(window).resize(function() {
    clearTimeout(resizetimeout);
    resizetimeout = setTimeout(doResize,200); //Needs width, height, vertices, svg to be global.
});

function doResize(){
	var oldwidth = width, oldheight = height;
	svg.attr("width",0).attr("height",0);//make sure the svg doesn't count
	width = $(document).innerWidth();
	height = $(document).height();
	svg.attr("width", width)
		.attr("height", height);
	
	for(var i = 0; i < vertices.length; i++){
		vertices[i][0] *= width / oldwidth;
		vertices[i][1] *= height / oldheight;
	}
	vertices[0] = [0,0];
	vertices[1] = [width,0];
	vertices[2] = [0,height];
	vertices[3] = [width,height];
}

function redraw() {
  for(var i = 4; i < points; i++){
	if(vertices[i][0] < 0 || vertices [i][0] > width) vertexvels[i][0] *= -1;
	if(vertices[i][1]>height/3 && vertices[i][1]<2*height/3){
		vertices[i][1] += vertexvels[i][1]/10; //slow down while in the detail zone
		vertices[i][0] += vertexvels[i][0]/4;
	}
	else{
		vertices[i][1] += vertexvels[i][1];
		vertices[i][0] += vertexvels[i][0];
	}
	if(vertices[i][1] < 0 || vertices [i][1] > height) vertexvels[i][1] *= -1;
  }
  var colors = [];
  path = path.data(d3.geom.delaunay(vertices).map(function(d,elemInd) {
	var x=(d[0][0]+d[1][0]+d[2][0])/3;
	var y=(d[0][1]+d[1][1]+d[2][1])/3;
	
	colors[elemInd] = "rgb(110,119,136)";
	for(var j=0;j<pixels.length;j++){
		if(pixels[j][1]==Math.floor(x * pixelswidth / width)
			&& pixels[j][0]==Math.floor(y * pixelsheight / height)){
			if(pixels[j][1] > 15)
				colors[elemInd] = "#ffc747";
			else
				colors[elemInd] = "#eee";
			break;
		}
	}
	return "M" + d.join("L") + "Z";
  }), String);
  path.exit().remove();
  path.enter().append("path").attr("style",function(d,i){return "fill:"+colors[i];}).attr("d", String);
}
var drawinterval = setInterval(redraw,200);
$(window).blur(function(){clearInterval(drawinterval);});
$(window).focus(function(){drawinterval = setInterval(redraw,200);});
