
'use strict';

$(function() {
	queue()
		.defer(d3.json, "grids/chicago")
        .defer(d3.json,"zipcode_business_geojson/chicago")
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
var projection = d3.geo.mercator().scale(20000).center([center.lng,center.lat])
var densityScale = d3.scale.linear().domain([3000,31684]).range([5,50])
var projection = d3.geo.mercator().scale(30000).center([-87.7,42.3])
var populationChart = dc.barChart("#population")
var incomeChart = dc.barChart("#income")
var busDivChart = dc.barChart("#business_diversity")
var devIntChart = dc.rowChart("#development_intensity")
var ligAveChart = dc.barChart("#light_average")
var placesChart = dc.barChart("#places")

var __map = null
var colorByLight = true
function dataDidLoad(error,grid,zipcodes) {
    console.log("grid", grid, "zip", zipcodes)
   // charts(grid)
   // console.log("ew",zipcodes[0]["geojson"])
    baseMap(zipcodes[0]["geojson"])
   // drawPolygons(zipcodes)
}
function baseMap(zipcodes){
    console.log(zipcodes[0]["geojson"])
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXJtaW5hdm4iLCJhIjoiSTFteE9EOCJ9.iDzgmNaITa0-q-H_jw1lJw';
    var map = new mapboxgl.Map({
        container: "map", // container id
        style: 'mapbox://styles/arminavn/cimgzcley000nb9nluxbgd3q5', //stylesheet location
        center: [-86.4,41.6], // starting position
        zoom: 8 ,// starting zoom
        interactive:false
    });
    function project(d) {
        return map.project(getLL(d));
    }
    function getLL(d) {
          return new mapboxgl.LngLat(+d.lng, +d.lat)
    }
    var transform = d3.geo.transform({point: projectPoint});
	var path = d3.geo.path().projection(transform);
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
    
    var container = map.getCanvasContainer()
    var svg = d3.select(container).append("svg").attr("class","zipcodemap")
    svg.call(tip)
    svg.selectAll("path") 
        .data(zipcodes.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill","#3182bd")
        .style("fill-opacity",0.1)
        .style("stroke","#3182bd")
        .style("stroke-width",1)
        .style("opacity",.4)
    .attr("cursor","pointer")
    d3.selectAll("path")
        .on("mouseover",function(d){
            console.log(d)
            d3.select("#zipcode_C").html(d.properties.name)
            
            d3.select("#income_C").html("**$"+parseInt(Math.random()*50000))
            d3.select("#business_C").html("**"+parseInt(Math.random()*5000))
            d3.select("#businessD_C").html("**"+parseInt(Math.random()*8))
            d3.select("#population_C").html("**"+parseInt(Math.random()*5000))
            d3.select("#light_C").html("**"+Math.random()*3)
            tip.html("zipcode: "+d.properties.name)
            tip.show()
            d3.select(this).style("fill-opacity",1)
        })
        .on("mouseout",function(d){
            tip.hide()
            d3.select(this).style("fill-opacity",.1)
            
        })
    
    function projectPoint(lon, lat) {
            var point = map.project(new mapboxgl.LngLat(lon, lat));
    		this.stream.point(point.x, point.y);
    	}
}
function initCanvas(data){

    if(__map == null){
    
        mapboxgl.accessToken = 'pk.eyJ1IjoiYXJtaW5hdm4iLCJhIjoiSTFteE9EOCJ9.iDzgmNaITa0-q-H_jw1lJw';
        __map = new mapboxgl.Map({
            container: "map", // container id
            style: 'mapbox://styles/arminavn/cimgzcley000nb9nluxbgd3q5', //stylesheet location
            center: [-86.4,41.6], // starting position
            zoom: 8 // starting zoom
        });
        
    }
    var map = __map
 //   var svg = d3.select(map.getPanes().overlayPane).append("svg")
    
    function project(d) {
        return map.project(getLL(d));
    }
    function getLL(d) {
          return new mapboxgl.LngLat(+d.lng, +d.lat)
    }
    var bbox = document.body.getBoundingClientRect();
   
//svg.append("circle").attr("cx",200).attr("cy",200).attr("r",20)

    
    var chart = d3.select("#map").append("canvas").attr("class","datalayer").node()
     chart.width = 1800
     chart.height = 1200
     // .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom()))
      //.node().getContext("2d");

        var context = chart.getContext("2d");


        context.clearRect(0, 0, chart.width, chart.height);
        data.forEach(function(d, i) {
            var x = project(d).x
            var y = project(d).y
            var fillColor = null
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
            if(colorByLight==true){
                var light = d.averlight
                var lightScale = d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"])
                fillColor = lightScale(light)   
            }else{
                var IC = d.inc_cat
                var DI = d.dev_intensity
                if(IC == 1){
                    if(DI == 1){fillColor = colors[1]}
                    else if(DI == 2){fillColor = colors[2]}
                    else{fillColor = colors[3]}
                }else if (IC ==2){
                    if(DI == 1){fillColor =  colors[4]}
                    else if(DI == 2){fillColor =  colors[5]}
                    else{fillColor = colors[6]}
                }else if (IC ==3){
                    if(DI == 1){fillColor =  colors[7]}
                    else if(DI == 2){fillColor = colors[8]}
                    else{fillColor = colors[9]}
                }
            }
            
            
          context.beginPath();
          context.rect(x,y, 1, 1);
          context.fillStyle=fillColor;
    //      context.fillStyle = "rgba(0,0,0,.3)"
          context.fill();
          context.closePath();
        });
 //   context.clearRect(0, 0, chart.width, chart.height);   
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
    
    
    var lngDimension = ndx.dimension(function(d){
        var projectedLat = projection([d.lng,d.lat])[1]
        var projectedLng = projection([d.lng,d.lat])[0]
        
        return [projectedLat,projectedLng,d.dev_intensity]
    })

      var colors = ["red","blue","orange","red"]
    var lngGroup = lngDimension.group().reduce(
        function(p,v){
            ++p.count
            p.id = v.id;
            p.lat = v.lat;
            p.lng = v.lng;
            return p;
        },
        function(p,v){
            --p.count
            p.id = "";
            p.lat = 0;
            p.lng = 0;
            return p;
        },function(){
            return{count:0,x:0,y:0,label:""};
        })
        
        var chartHeight = 80
    busDivChart.width(chartWidth).height(chartHeight)
        .group(busDivGroup).dimension(busDivDimension)        
        .ordinalColors(["#aaaaaa"])
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .x(d3.scale.linear().domain([0, 3]))
    
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
    
    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#ffffff"])      
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        
       // .x(d3.scale.linear().domain([0, 4]))
        .xAxis().ticks(4)
    
    ligAveChart.width(chartWidth).height(chartHeight)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        //.round(dc.round.floor)
        //.alwaysUseRounding(true)
        .elasticY(true)
        .ordinalColors(["#ffffff"])
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
        initCanvas(data)
        dc.renderAll();
}
function reDrawMap(data){

    d3.selectAll("#map circle").transition().duration(1000).attr("opacity",0)
    d3.selectAll("#map circle").data(data).transition().duration(1000).attr("opacity",1)

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
        .on("mouseover",function(d){console.log(d)})
}
function drawPolygons(geoData){
    
  //  var container = __map.getCanvasContainer()
    var svg = d3.select("#map").append("svg").attr("id","zipcode").attr("width",1200).attr("height",2000)
   // var svg = d3.select("#map svg")
	var path = d3.geo.path().projection(projection);

    svg.selectAll("path") 
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "zipcodes")
        .attr("d", path)
        .style("fill","none")
        .style("stroke","#ffffff")
        .style("stroke-width",1)
        .style("opacity",1)
        .attr("cursor","pointer")
    d3.selectAll("path").on("mouseover",function(){d3.select(this).style("fill","red")}
)}
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
