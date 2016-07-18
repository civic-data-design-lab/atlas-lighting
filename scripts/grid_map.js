'use strict';

$(function() {
	d3.queue()
		.defer(d3.csv, "grids_values_export_no0.csv")
      //  .defer(d3.json,"zipcode_business.geojson")
	//	.defer(d3.json, "grids.geojson")
    .await(dataDidLoad);
})
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

var colors = {
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
var center = cityCentroids["Chicago"]
var populationChart = dc.barChart("#population")
var incomeChart = dc.barChart("#income")
var busDivChart = dc.barChart("#business_diversity")
var devIntChart = dc.rowChart("#development_intensity")
var ligAveChart = dc.barChart("#light_average")
var placesChart = dc.barChart("#places")

var __map = null
var  __canvas = null
var __gridData = null

var originalZoom = 9
var currentZoom = 9
var currentCenter = center
var colorByLight = true
var radius = 1
  
function dataDidLoad(error,grid) {
    charts(grid)
    d3.select("#loader").remove()
//initCanvas(grid)
   
}
function project(d) {
    return __map.project(getLL(d));
}
function getLL(d) {
      return new mapboxgl.LngLat(+d.lng, +d.lat)
}
function zoom() {    
    var zoom_map = __map.getZoom();
    var center_map = __map.getCenter();
    
    console.log(project)
    console.log(__gridData)
    console.log(["zoom",d3.event.scale,__map.getZoom()])
    console.log(d3.event.translate)
    var canvas = __canvas
    canvas.save();
    canvas.clearRect(0, 0,1200,1200);
    
    
    
    canvas.translate(d3.event.translate[0], d3.event.translate[1]);
    canvas.scale(d3.event.scale, d3.event.scale);
    currentZoom = originalZoom*d3.event.scale
 //   draw();
    

    var fillColor = "#000"
    var lightScale = d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"])
    var i = -1, n = __gridData.length, d;
    
    while (++i < n) {
        __canvas.beginPath();
      d = __gridData[i];
      
      var light = d.averlight
      radius = d3.event.scale
       fillColor = lightScale(light)
      __canvas.moveTo(project(d).x,project(d).y);
      __canvas.rect(project(d).x,project(d).y,radius,radius)
      __canvas.fillStyle = fillColor
         __canvas.globalAlpha=1.0/d3.event.scale

      __canvas.fill();
    }
    
    
    canvas.restore();
}

function initCanvas(data){
    __gridData = data
//draws map tile if map is null
    if(__map == null){
        mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
        __map = new mapboxgl.Map({
            container: "map", // container id
            style: 'mapbox://styles/jjjiia123/cipn0g53q0004bmnd1rzl152g', //stylesheet location
            center: currentCenter, // starting position
            zoom: currentZoom // starting zoom
        });
    }
   
    var map = __map
 //   map.on('mousemove', function (e) {console.log(JSON.stringify(e.lngLat) )}); 
    
    var bbox = document.body.getBoundingClientRect();

    var container = map.getCanvasContainer()
    console.log(container)
    var canvas = d3.select(container).append("canvas").attr("class","datalayer")
        .attr("width", 1200)
        .attr("height",  1200)
        .call(d3.behavior.zoom().scaleExtent([-10, 10]).on("zoom", zoom))
        .node().getContext("2d");
     __canvas = canvas
  //      draw(data)
    
        var fillColor = "#000"
        var lightScale = d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"])
        var i = -1, n = data.length, d;
        console.log(data[3])
        console.log(project(data[3]))
        
        var testCoords = {lat:42.10975616,lng:-87.75686081}
        console.log(project(testCoords))
        
       while (++i < n) {
           canvas.beginPath();
         d = data[i];
         var coordinates = {lat:d.lat,lng:d.lng}
         var light = d.averlight
          fillColor = lightScale(light)
         //__canvas.moveTo(project(d).x,project(d).y);
         canvas.rect(project(coordinates).x,project(coordinates).y,radius,radius)
         canvas.fillStyle = fillColor
         canvas.globalAlpha=0.8
         canvas.fill();
       }
   
    
   //     canvas.clearRect(0, 0, 1200,1200);
   //     data.forEach(function(d, i) {
   //         var x = project(d).x
   //         var y = project(d).y
   //         var fillColor = "#aaa"
   //         
   //        fillColor = lightScale(d.averlight)
   //
   //       canvas.beginPath();
   //       canvas.rect(x,y, radius, radius);
   //       canvas.fillStyle=fillColor;
   // //      context.fillStyle = "rgba(0,0,0,.3)"
   //       canvas.fill();
   //       canvas.closePath();
   //     });
 //   canvas.clearRect(0, 0,1200,1200);   
}

function charts(data){
    data.forEach(function(d){
        d.lng = +d.lng
        d.lat = +d.lat
        d.id = +d.id
        d.population = +d.population
        d.averlight = +d.averlight
        d.places = +d.places
        d.b_diversity = +d.b_diversity
        d.dev_intensity = +d.dev_intensity//groups
        d.income = +d.income
    })
    var chartWidth = 400
    
    var ndx = crossfilter(data)
    var all = ndx.groupAll()
               
    var busDivDimension = ndx.dimension(function(d){
       // console.log(parseFloat(parseInt(d.b_diversity*100))/100)
        return parseFloat(parseInt(d.b_diversity*100))/100})
    var busDivGroup = busDivDimension.group()
    
    var populationDimension = ndx.dimension(function(d){return parseInt(d.population)})
    var pGroup = populationDimension.group()

    var incomeDimension = ndx.dimension(function(d){
       // console.log(parseInt(parseFloat(d.income)/1000)*1000)
        return parseInt(parseFloat(d.income)/1000)*1000})
    var iGroup = incomeDimension.group()
    
    var ligAveDimension = ndx.dimension(function(d){return parseInt(d.averlight)})
    var laGroup = ligAveDimension.group()
    
    var devIntDimension = ndx.dimension(function(d){return d.dev_intensity})
    var devIntGroup = devIntDimension.group()
    
    var placesDimension = ndx.dimension(function(d){return d.places})
    var placesGroup = placesDimension.group()

        var chartHeight = 80
    busDivChart.width(chartWidth).height(chartHeight)
        .group(busDivGroup).dimension(busDivDimension)        
        .ordinalColors(["#aaaaaa"])
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .x(d3.scale.linear().domain([0, 5]))
    
        busDivChart.yAxis().ticks(2)
        busDivChart.xAxis().ticks(4)
    
    placesChart.width(chartWidth).height(chartHeight)
        .group(placesGroup).dimension(placesDimension)        
        .elasticY(true)
        .ordinalColors(["#aaaaaa"])
          .gap(0)
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        
        .x(d3.scale.linear().domain([0, 20]))
         placesChart.yAxis().ticks(2)

        var chartColors = {"1":"#fff7bc","2":"#fee391","3":"#fec44f","4":"#fee0d2","5":"#fc9272","6":"#de2d26","7":"#deebf7","8":"#9ecae1","9":"#3182bd"}
    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#888","#888","#888"])      
        .margins({top: 0, left: 50, right: 10, bottom: 20})
		.labelOffsetX(-35)
        .xAxis().ticks(4)

    ligAveChart.width(chartWidth).height(chartHeight)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        .elasticY(true)
        .colors(d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"]))
        .colorAccessor(function(d){return d.key })
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .x(d3.scale.linear().domain([0, 500]))
        .yAxis().ticks(3)

    populationChart.width(chartWidth).height(chartHeight).group(pGroup).dimension(populationDimension)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .elasticY(true)
        .elasticX(true)
        .ordinalColors(["#ffffff"])
        .x(d3.scale.linear().domain([0, 30]))
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .yAxis().ticks(2)
    populationChart.xAxis().ticks(4)
    
    incomeChart.width(chartWidth).height(chartHeight).group(iGroup).dimension(incomeDimension)
        .round(dc.round.floor)    
        .ordinalColors(["#ffffff"])
        .alwaysUseRounding(true)
        .elasticY(true)
        .elasticX(true)
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .on('renderlet', function(d) {
                var newData = incomeDimension.top(Infinity)
                //reDrawMap(newData)
            d3.select("#map .datalayer").remove()
            
            initCanvas(newData)
        })
        .x(d3.scale.linear().domain([1,250000]))
        .yAxis().ticks(function(d){
            return 3
        })
        incomeChart.yAxis().ticks(3)
        incomeChart.xAxis().ticks(4)
        
    dc.dataCount(".dc-data-count")
        .dimension(ndx)
        .group(all)
        // (optional) html, for setting different html for some records and all records.
        // .html replaces everything in the anchor with the html given using the following function.
        // %filter-count and %total-count are replaced with the values obtained.
        .html({
            some:"%filter-count areas out of %total-count fit the selection criteria | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all:"Total %total-count areas."
        })
       // initCanvas(data)
        dc.renderAll();
        console.log("take away loader now")
    	d3.select("#loader").transition().duration(600).style("opacity",0).remove();
}

function drawMap(data){
   
    var mapSvg = d3.select("#map").append("svg").attr("width",1000).attr("height",1000)
    mapSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class",function(d){return "_"+d.id})
        .attr("r",1)
        .attr("cx",function(d){
            return parseInt(projection([d.lng,d.lat])[0])
        })
        .attr("cy",function(d){
           return parseInt(projection([d.lng,d.lat])[1])
        })
        .attr("fill",function(d){
            var IC = d.inc_cat
            var DI = d.dev_intensity
            
            if(IC == 1){
                if(DI == 1){return colors[1]}
                else if(DI == 2){return colors[2]}
                else{return colors[3]}
            }else if (IC ==2){
                if(DI == 1){return colors[4]}
                else if(DI == 2){return colors[5]}
                else{return colors[6]}
            }else if (IC ==3){
                if(DI == 1){return colors[7]}
                else if(DI == 2){return colors[8]}
                else{return colors[9]}
            }
            
        })
    .attr("opacity",.5)
     //   .on("mouseover",function(d){console.log(d)})
}
function drawPolygons(geoData){
    
    var container = __map.getCanvasContainer()
    var svg = d3.select(container).append("svg")
   // var svg = d3.select("#map svg")
	var path = d3.geo.path().projection(projection);

    svg.selectAll("path") 
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill","#000")
        .style("stroke","#ffffff")
        .style("stroke-width",1)
        .style("opacity",1)
}
//population,income,averlight,places,b_diversity,dev_intensity,id,lng,lat
function drawKey(){
    var keyArray = []
    for(var i =1; i<=9; i++){
        var color = colors[i]
        var group = groupToWords[i]
        keyArray.push([color,group])
    }
    
    var keySvg = d3.select("#key").append("svg").attr("width",180).attr("height",180)
    keySvg.selectAll(".key")
    .data(keyArray)
    .enter()
    .append("rect")
    .attr("x",0)
    .attr("y",function(d,i){return i*14+10})
    .attr("width",10)
    .attr("height",10)
    .attr("fill",function(d){return d[0]})
    
    keySvg.selectAll(".keyText")
    .data(keyArray)
    .enter()
    .append("text")
    .attr("x",15)
    .attr("y",function(d,i){return i*14+20})
    .attr("width",10)
    .attr("height",10)
    .text(function(d){return d[1]})
    .style("fill","#fff").attr("font-size","11px")
    
     keySvg.append("text").text("Grid Size is 250m x 250m").attr("x",0).attr("y",160)    
    .style("fill","#fff").attr("font-size","11px")

}