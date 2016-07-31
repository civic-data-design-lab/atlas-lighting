var nightlightColors = {
"1":"#fff7bc",
"2":"#fee391",
"3":"#fec44f",
"4":"#fee0d2",
"5":"#fc9272",
"6":"#de2d26",
"7":"#deebf7",
"8":"#9ecae1",
"9":"#3182bd",
}
var cityNameColors = {
"San Jose":"#ccd29f",
"Orlando":"#68a0c5",
"Milwaukee":"#cad848",
"Washington":"#567e69",
"Denver":"#72db5b",
"Chicago":"#d07b38",
"Pittsburg":"#72d8b9",
"Portland":"#cea946",
"Las Vegas":"#609745",
"Los Angeles":"#8c723d"
}

var cityTypeColors = {
"San Jose":"#f5955e",
"Orlando":"#e9c057",
"Milwaukee":"#61d89a",
"Washington":"#e3587b",
"Denver":"#e3587b",
"Chicago":"#20c0e2",
"Pittsburg":"#61d89a",
"Portland":"#f5955e",
"Las Vegas":"#e9c057",
"Los Angeles":"#20c0e2"
}
var typeColors={
"Large-Slow Growth":"#20c0e2",
"Rust Belt-Declining":"#62d999",
"Growth Magnets":"#e9c057",
"Large-Faster Growth":"#e4587b",
"New Economy-Quality of Life Hubs":"#f28954"
}

var groupToWords = {
"1":"Low Income, Low Intensity",
"2":"Low Income, Medium Intensity",
"3":"Low Income, High Intensity",
"4":"Medium Income, Low Intensity",
"5":"Medium Income, Medium Intensity",
"6":"Medium Income, High Intensity",
"7":"High Income, Low Intensity",
"8":"High Income, Medium Intensity",
"9":"High Income, High Intensity"
}
var cityCentroids = {
    "San Jose":{lat:37.338208,lng:-121.886329},
    "Orlando":{lat:28,lng:-81},
    "Milwaukee":{lat:43.038903,lng:-87.906474},
    "Washington":{lat:39,lng:-77},
    "Denver":{lat:39,lng:-104},
    "Chicago":{lat:41.878114,lng:-87.629798},
    "Pittsburg":{lat:40,lng:-79},
    "Portland":{lat:45.523062,lng:-122.676482},
    "Las Vegas":{lat:36.084,lng:-115.153739},
    "Los Angeles":{lat:34,lng:-118}
}
function drawKey(keyData){
    console.log("key")
    d3.selectAll("#bubble-key svg").remove()
    var size = 10
    var keyArray = []
    for(var i in keyData){
      keyArray.push({"color":keyData[i],"key":i})
    }
    var height = keyArray.length*size+10
    var keySvg=d3.select("#bubble-key").append("svg").attr("width",450).attr("height",height)
    keySvg.selectAll("rect")
    .data(keyArray)
    .enter()
    .append("rect")
    .attr("x",10)
    .attr("y",function(d,i){return i*size+10})
    .attr("width",size-2)
    .attr("height",size-2)
    .attr("fill",function(d){return d.color})

    keySvg.selectAll("text")
    .data(keyArray)
    .enter()
    .append("text")
    .attr("x",25)
    .attr("y",function(d,i){return i*size+18})
    .text(function(d){
      var keys = Object.keys(groupToWords)
      if(keys.indexOf(d.key)>-1){
          return groupToWords[d.key]
      }
      return d.key})
    .attr("fill",function(d){return d.color})
}    

var __nodes = null
var padding = 2;

 //drawKey(typeColors)
$(function() {
	d3.queue()
		.defer(d3.csv, "data/groupdata.csv")
        .defer(d3.csv,"data/city_comparisons_all.csv")
        .defer(d3.json,"data/us.json")
	//	.defer(d3.json, "grids.geojson")
    .await(dataDidLoad);
})
function dataDidLoad(error,data,comparison,us) {

      
    var width = 800, height = 600;
    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])
    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].value / 3;
      data[j].x = Math.random() * width;
      data[j].y = Math.random() * height;
    }    
    


    var groupCenters = getCenters("group",[800,600],data)

    var tip = d3.tip()
    .attr("class","d3-tip")
    .offset([20,10])
    
    svg.call(tip)    
    var nodes = svg.selectAll("circle")
      .data(data);
//  var filter = svg.append("defs")
//    .append("filter")
//      .attr("id", "blur")
//    .append("feGaussianBlur")
//      .attr("stdDeviation", 3);
      
nodes.enter().append("circle")
    .attr("class", function(d){return "node "+d.name.replace(" ","")})
    .attr("cx", function (d) {return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", function (d) { return d.radius; })
    //  .attr("filter", "url(#blur)")
      
    .style("fill", function (d) {
    return nightlightColors[d.group]; })
    .on("mouseover", function (d) { 
        var selector = d3.select(this).attr("class").split(" ")[1]
        d3.selectAll(".node").transition().duration(1000).attr("opacity",.1)          
        d3.selectAll("."+selector).transition().duration(1000).attr("opacity",1)
        console.log(d)
        tip.html(d.name+" </br> GMP:"+d.gmp+"</br> Population Change:"+d.popChange+"</br> Denisty:"+d.density)
        tip.show()
        //    showPopover.call(this, d); 
    })
    .on("mouseout", function (d) { 
        d3.selectAll(".node").transition().duration(1000).attr("opacity",1)
        tip.hide()
    //    removePopovers(); 
    })

__nodes = nodes
draw('make',data);

$( ".btn" ).click(function() {
  draw(this.id,data);
});
}



var getCenters = function (vname, size,data) {
  var centers, map;
  
  var sortedData = data.sort(function(a,b){return parseInt(b.gridorder)-parseInt(a.gridorder)})
  centers = _.uniq(_.pluck(sortedData, vname)).map(function (d) {
      return {name: d, value: 1};
  });
  map = d3.layout.treemap().size(size).ratio(1/1);
  map.nodes({children: centers});
  return centers;
};

function draw (varname,data) {
    var force = d3.layout.force();
    
      var centers = getCenters(varname, [800, 600],data);
      force.on("tick", tick(centers, varname,data));
      labels(centers)
      force.start();     
    if(varname == "mapB"){
        var projection = d3.geo.mercator().scale(660).center([-85,45])

        d3.selectAll("circle")
        .transition().duration(500)          
        .style("fill",function(d){console.log(d);return nightlightColors[d.group]; })
        .attr("r",function(d){
          return 30
          return parseFloat(d.value)/3})
        .attr("opacity",1)
        .attr("cx",function(d){
            var lat = parseFloat(cityCentroids[d.name].lat)
            var lng = parseFloat(cityCentroids[d.name].lng)
            var projectedLat = projection([lng,lat])[0]
            return projectedLat
        })
        .attr("cy",function(d){
            var lat = parseFloat(cityCentroids[d.name].lat)
            var lng = parseFloat(cityCentroids[d.name].lng)
            var projectedLat = projection([lng,lat])[1]
            return projectedLat
        })
        d3.selectAll(".axis").remove()
        drawKey(nightlightColors)  
        force.stop();
    }else if(varname =="group"){
        var rScale = d3.scale.linear().domain([10,100]).range([3,25])
        d3.selectAll("circle")
        .transition().duration(500)          
        .style("fill",function(d){ return cityNameColors[d.name]})
        .attr("r",function(d){return rScale(parseFloat(d.value))})
        .attr("opacity",1)
        d3.selectAll(".axis").remove()
        drawKey(cityNameColors)
        
    }else if(varname =="msaB"){
        var GMPScale = d3.scale.linear().domain([0,1377989]).range([800,0])
        var popChangeScale = d3.scale.linear().domain([-155946,1792786]).range([800,0])
        var density2010Scale = d3.scale.linear().domain([0,31250]).range([0,100])
        d3.select("#map svg").append("text").text("population change").attr("x",800).attr("y",900).attr("fill","#fff").attr("class","axis")
        d3.select("#map svg").append("text").text("GMP").attr("x",30).attr("y",50).attr("fill","#fff").attr("class","axis")
        d3.selectAll("circle")
        .transition()
        .duration(500)
        .delay(function(d,i){return i*5})
        .style("fill",function(d){return cityTypeColors[d.name]})
        .attr("cy",function(d,i){return GMPScale(d.gmp)})
        .attr("cx",function(d,i){return popChangeScale(d.popChange)})
        .attr("r",function(d,i){return density2010Scale(d.density)})
        .attr("opacity",.2)
        force.stop();
        drawKey(typeColors)
    }
}

function tick(centers, varname,data) {
    var nodes = __nodes
  var foci = {};
  for (var i = 0; i < centers.length; i++) {
    foci[centers[i].name] = centers[i];
  }
  return function (e) {
    for (var i = 0; i < data.length; i++) {
      var o = data[i];
      var f = foci[o[varname]];
      o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
      o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
    }
    nodes.each(collide(.11,data))
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }
}

function labels (centers) {
    
  svg.selectAll(".label").remove();
  svg.selectAll(".label")
  .data(centers).enter().append("text")
  .attr("class", "label")
  .text(function (d) {return groupToWords[d.name] })
  .attr("transform", function (d) {
    return "translate(" + (d.x + (d.dx / 3)) + ", " + (d.y + 20) + ")";
  });
}

function removePopovers () {
  $('.popover').each(function() {
    $(this).remove();
  }); 
}

function showPopover (d) {
    //    console.log(d)
    $(this).popover({
    placement: 'auto top',
    container: 'body',
    trigger: 'manual',
    html : true,
    content: function() { 
        console.log(d)
      return "City: " + d.name + "<br/>Value: " + d.value + 
             "<br/>Group: " + d.group; 
    }
    });
    $(this).popover('show')
}

function collide(alpha,data) {
    var maxRadius = d3.max(_.pluck(data, 'radius'));
    
  var quadtree = d3.geom.quadtree(data);
  return function (d) {
    var r = d.radius + maxRadius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
