'use strict';


$(function() {


var currentCity = document.URL.split("#")[1]
console.log(currentCity)
	d3.queue()
// <<<<<<< HEAD
		.defer(d3.json, "grids/" + currentCity)
        .defer(d3.json,"zipcode_business_geojson/"+ currentCity)
// =======
// 		.defer(d3.csv, "grid_values_"+currentCity+".csv")
//         .defer(d3.json,"zipcode_business_"+currentCity+".json")
// >>>>>>> 3508b612b6c96b4b648a7634cae917ae6614c7ec
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
//var center = {lat:41.857673, lng:-87.688886}
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
var maxZoom = 16
var minZoom  = 8
var currentZoom = null

var currentCenter = center
var colorByLight = true
var radius = 1

var alpha = 1
var alphaScale = d3.scale.linear().domain([minZoom,maxZoom]).range([0.6,.03])
function dataDidLoad(error,grid,zipcodes) {
    console.log("in grid ,map", zipcodes)
    charts(grid)
    d3.select("#loader").remove()
initCanvas(grid,zipcodes[0]["geojson"])
   
}
function project(d) {
    return __map.project(getLL(d));
}
function getLL(d) {
      return new mapboxgl.LngLat(+d.lng, +d.lat)
}

function zoom() {    
    var canvas = __canvas
    
    canvas.save();
    canvas.clearRect(0, 0,1200,1200);
        
    //    canvas.translate(d3.event.translate[0], d3.event.translate[1]);
    //    canvas.scale(d3.event.scale, d3.event.scale);
    //    currentZoom = originalZoom*d3.event.scale
    // //   draw();
    //    
    //
    //    var fillColor = "#000"
    //    var lightScale = d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"])
    //    var i = -1, n = __gridData.length, d;
    //    
    //    while (++i < n) {
    //        __canvas.beginPath();
    //      d = __gridData[i];
    //      
    //      var light = d.averlight
          radius = radius*d3.event.scale
    //       fillColor = lightScale(light)
    //      __canvas.moveTo(project(d).x,project(d).y);
    //      __canvas.rect(project(d).x,project(d).y,radius,radius)
    //      __canvas.fillStyle = fillColor
    //         __canvas.globalAlpha=1.0/d3.event.scale
    //
    //      __canvas.fill();
    //    }
    //    
  initCanvas(__gridData)  
}

function initCanvas(data,zipcodes){
    __gridData = data
    //draws map tile if map is null
    if(__map == null){
        mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
        __map = new mapboxgl.Map({
            container: "map", // container id
            style: 'mapbox://styles/jjjiia123/cipn0g53q0004bmnd1rzl152g', //stylesheet location
            center: currentCenter, // starting position
            zoom: originalZoom,// starting zoom
            maxZoom:maxZoom,
            minZoom:minZoom
        });
        __map.scrollZoom.disable()
        __map.addControl(new mapboxgl.Geocoder({position:"bottom-left"}));       
        __map.addControl(new mapboxgl.Navigation({position:"bottom-left"}));
    }
    
    var map = __map
    
    map.style.on("load",function(){
        map.addSource("zipcodes",{
            "type":"geojson",
            "data":zipcodes
        })
        map.addLayer({
                "id": "state-fills",
                "type": "fill",
                "source": "zipcodes",
                "layout": {},
                "paint": {
                    "fill-color": "#627BC1",
                    "fill-opacity": 0
                }
            });
            map.addLayer({
                   "id": "route-hover",
                   "type": "line",
                   "source": "zipcodes",
                   "layout": {},
                   "paint": {
                       "line-color": "#fff",
                       "line-width": 2
                   },
                   "filter": ["==", "name", ""]
               });
        
       var popup = new mapboxgl.Popup({
           closeButton: false,
           closeOnClick: false
       });
    
        map.on("mousemove", function(e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ["state-fills"] });
                if (features.length) {
                    map.setFilter("route-hover", ["==", "name", features[0].properties.name]);
                
                    var currentZipData = features[0].properties
                    popup
                            .setLngLat([JSON.stringify(e.lngLat["lng"]),JSON.stringify(e.lngLat["lat"])])
                            .setHTML("Zipcode: "
                            +currentZipData.name+"</br>HMI: "+currentZipData.HMI
                    +"</br>Total Population: "+currentZipData.TOT_POP
                    +"</br>Diversity: "+(currentZipData.diversity).toFixed(2)
                    +"</br>Places: "+currentZipData.places_cou
                    +"</br>Light Mean: "+(currentZipData.light_mean).toFixed(2)
                    )   
                    .addTo(map)
                } else {
                    map.setFilter("route-hover", ["==", "name", ""]);
                }
                if (!features.length) {
                       popup.remove();
                       return;
                   }

            });
   
    })

    
    var container = map.getCanvasContainer()
    var canvas = d3.select(container).append("canvas").attr("class","datalayer")
        .attr("width",2000)
        .attr("height",  2000)
        .node().getContext("2d");
     __canvas = canvas
    
    function render(){
      //  console.log(["render",data.length])
        var lightScale = d3.scale.linear().domain([0,200,400]).range(["#3182bd","#fee391","#fc9272"])
        var i = -1, n = data.length, d;    
        canvas.clearRect(0,0,2000,2000)

        var radius = 6/1400*Math.pow(2,map.getZoom())
    
        var zoomAlphaScale = d3.scale.linear().domain([8,16]).range([.8,.2])
        alpha = zoomAlphaScale(map.getZoom())
        while (++i < n) {
           canvas.beginPath();
             d = data[i];
             var coordinates = {lat:d.lat,lng:d.lng}
             var light = d.averlight
             var fillColor = lightScale(light)
             canvas.moveTo(project(d).x,project(d).y);
             canvas.rect(project(d).x,project(d).y,radius,radius)
         //    canvas.rect(d3Projection([coordinates.lng,coordinates.lat])[0],d3Projection([coordinates.lng,coordinates.lat])[1],radius,radius)
             //console.log(coordinates)
             //console.log(d3Projection([coordinates.lng,coordinates.lat]))
             canvas.fillStyle = fillColor
             canvas.globalAlpha=alpha
             canvas.fill();
       }         
    }
    render()
    
    map.on("viewreset",function(){
        console.log("viewreset")
        render()
    })
    map.on("move", function() {
           render()
        console.log("move")
        
         })
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
    var chartWidth = 380
    
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

        var chartHeight = 65
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
           // console.log("render canvas")
            var canvas = __canvas
           
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
    	d3.select("#loader").transition().duration(600).style("opacity",0).remove();
}

