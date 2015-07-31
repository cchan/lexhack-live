//Delaunay Triangulation Background
//Extremely modified from http://bl.ocks.org/mbostock/4341156


//http://stackoverflow.com/a/1041492/1181387
var targetimg = new Image();
targetimg.src = 'lh-big.png';
targetimg.crossOrigin = "Anonymous";//http://stackoverflow.com/a/27840082/1181387

var testcontext = document.getElementById('testcanvas').getContext('2d');
var targetimgdata;

$(targetimg).one("load", function(){ //need to wait for image to load (http://stackoverflow.com/a/3877079/1181387)
	testcontext.drawImage(targetimg, 0, 0);
	targetimgdata = testcontext.getImageData(0, 0, targetimg.width, targetimg.height).data;
	//this is a flat array: Pixel1 1 R, G, B, A, Pixel2 R, G, B, A, ...
}).each(function(){if(this.complete)$(this).load();});


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
	//Determine color of triangle
	var x=(d[0][0]+d[1][0]+d[2][0])/3;
	var y=(d[0][1]+d[1][1]+d[2][1])/3;
	
	x = Math.floor(x * targetimg.width/width);
	y = Math.floor(y * targetimg.height/height); //Scaled to the target image size
	
	var index = (x + y * targetimg.width)*4;
	
	colors[elemInd] = "rgb("+targetimgdata[index]+","+targetimgdata[index+1]+","+targetimgdata[index+2]+")";
	
	//Return the vertices of the triangle
	return "M" + d.join("L") + "Z";
  }), String);
  path.exit().remove();
  path.enter().append("path").attr("style",function(d,i){return "fill:"+colors[i];}).attr("d", String);
}
var drawinterval = setInterval(redraw,250);
$(window).blur(function(){clearInterval(drawinterval);});
$(window).focus(function(){drawinterval = setInterval(redraw,250);});
