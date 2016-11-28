'use strict';

var myinit = function () {
    window.panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street_view'),
        {
            position: {lat: 41.878180, lng: -87.630270},
            pov: {heading: 165, pitch: 0},
            zoom: 1
        });

    var currentCity = document.URL.split("#")[1].split("*")[0]

    d3.queue()
        .defer(d3.csv, "../data/chicago.csv"/*"grids/" + currentCity*/)
        //.defer(d3.json, "data/chicago_zipcode.json"/*"zipcode_business_geojson/" + currentCity*/)
        .await(dataDidLoad);
        //.await(mytest);
}


var mytest = function(){
    
}

var groupToWords = {
    "1": "Low Income, Low Intensity",
    "2": "Low Income, Medium Intensity",
    "3": "Low Income, High Intensity",
    "4": "Medium Income, Low Intensity",
    "5": "Medium Income, Medium Intensity",
    "6": "Medium Income, High Intensity",
    "7": "High Income, Low Intensity",
    "8": "High Income, Medium Intensity",
    "9": "High Income, High Intensity"
}

var colors = {
    "1": "#fff7bc",
    "2": "#fee391",
    "3": "#fec44f",
    "4": "#fee0d2",
    "5": "#fc9272",
    "6": "#de2d26",
    "7": "#deebf7",
    "8": "#9ecae1",
    "9": "#3182bd",
}

var center = cityCentroids["Chicago"]

var initurl = window.location.href;

var selectedCharts = [];

if(!initurl.split("*")[1]){//if no dataset is specified in the url
    //window.location.href = initurl.split("*")[0] + "*population|income|business_diversity|development_intensity|light_average|places";
    //selectedCharts = ["population","income","business_diversity","development_intensity","light_average","places"];
}else{//dataset is not null
    selectedCharts = initurl.split("*")[1].split("|");



}




window.cell_selected = false;
window.zoomedData = ["street_view","instagram_pics"];

window.newData;

var __map = null
var __canvas = null
var __bounds = null
window.__DisX = null
window.__Corners = null

var __gridData = null

var originalZoom = 5
var maxZoom = 16
var minZoom = 8
var currentZoom = null

var currentCenter = center
var colorByLight = true
var radius = 1

var alpha = 1
var alphaScale = d3.scale.linear().domain([minZoom, maxZoom]).range([0.6, .03]);

function dataDidLoad(error, grid) {
    charts(grid,selectedCharts) ////

    d3.select("#loader").transition().duration(600).style("opacity", 0).remove();
    //d3.selectAll(".data_select_ui").style("display", "inline")
    initControl();
    initCanvas(grid);
}

function project(d) {
    return __map.project(getLL(d));
}
function unproject(d) {
    return __map.unproject(d);
}
function getLL(d) {
    return new mapboxgl.LngLat(+d.lng, +d.lat)
}



function initControl() {

    var droptop = $("#todrop").offset().top;
    var dropbot = droptop + $("#todrop").height();
    var dropleft = $("#todrop").offset().left;
    var dropright = dropleft + $("#todrop").width();



    $('.data_item').draggable({
        drag:function(event,ui){
            $("#selector").css("width","100%");
            $("#selector").css("overflow-y","hidden");
            $("#selector").css("direction","ltr");
        },

        stop:function(event,ui){
            //$(this).attr("style","position: relative;");
            $("#selector").css("width","416px");
            $("#selector").css("overflow-y","auto");
            $("#selector").css("direction","rtl");

            if($(this).attr("style").indexOf("left")>-1){//get back to original position
                $(this).attr("style","position: relative;");
            }
        }

    });
    $('#todrop').droppable({
      drop: function( event, ui ) {
            $(ui.draggable).attr("style","position: relative;display:none");
            //$(ui.draggable).hide();
            selectedCharts.push($(ui.draggable).attr("id").split("d_")[1]);
            updateChart(selectedCharts);
            $(this).css("background-color","rgba(255,255,255,0)");

      },
      over: function( event, ui ){
          $(this).css("background-color","rgba(255,255,255,0.2)");
      },
      out: function( event, ui ){
          $(this).css("background-color","rgba(255,255,255,0)");
      }


    });

    $(".left_clickbar>img").click(function(){
        if($(this).attr("style") && $(this).attr("style").indexOf("180")>-1){
            //back to selecting mode

            $(".left_clickbar>img").css("transform","rotate(0deg)");
            $("#selector").css("width","416px");
            $("#selector").css("overflow-y","auto");
            $("#selector").css("direction","rtl");
            $( ".left_back" ).animate({
                left: "0px"
            }, 300, function() {});
            $( "#selector" ).animate({
                left: "0px"
            }, 300, function() {});
            $( ".slide_hide" ).animate({
                left: "386px"
            }, 300, function() {});

            $("#todrop").show();

        }else{
            //back to folding mode

            $(".left_clickbar>img").css("transform","rotate(180deg)");
            $("#selector").css("width","416px");
            $("#todrop").hide();
            $( ".left_back" ).animate({
                left: "-390px",
            }, 300, function() {});
            $( "#selector" ).animate({
                left: "-390px",
            }, 300, function() {});
            $( ".slide_hide" ).animate({
                left: "0px"
            }, 300, function() {});

        }


    });

    $(".tag_item").click(function(){

        if($(this).attr("class").indexOf("selected")>-1){
            $(".tag_item").removeClass("selected");
            $(".data_item").show();
        }else{
            $(".tag_item").removeClass("selected");
            $(this).toggleClass("selected");
            $(".data_item").hide();
            $("."+$(this).attr("id")).show();
        }

    });

    $(".data_searchbox input").keyup(function() {
        if(!$(this).val()){
            $(".data_item").show();
        }else{
            $(".data_item").hide();
            $(".data_item[id*='"+$(this).val()+"']").show();
        }
    });

    $("#export_btn").click(function(){
        $("#export_add").css("display","block");
        $("#export_add input").val(window.location.href);

        var data = window.newData;
        var csvContent = "";

        csvContent += Object.keys(data[0]).join(",")+"\n";
        data.forEach(function(infoArray, index){
            var dataString = Object.values(infoArray).join(",");
            csvContent += index < data.length ? dataString+ "\n" : dataString;
        }); 

        var encodedUri = encodeURI(csvContent);
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        var link = document.getElementById("exportcsv");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "exported_data.csv");

    });

    $("#cp_btn").click(function(){

        var copyTextarea = document.querySelector('#export_add input');
        copyTextarea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }

    });

    $("#bk_btn").click(function(){

        $("#export_add").css("display","none");

    });
    
}



function initCanvas(data) {
    __gridData = data
    //draws map tile if map is null
    if (__map == null) {
        mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
        __map = new mapboxgl.Map({
            container: "map", // container id
            style: 'mapbox://styles/jjjiia123/cipn0g53q0004bmnd1rzl152g', //stylesheet location
            center: currentCenter, // starting position
            zoom: originalZoom,// starting zoom
            maxZoom: maxZoom,
            minZoom: minZoom
        });
        // __map.scrollZoom.disable()
        __map.addControl(new mapboxgl.Geocoder({ position: "bottom-left" }));
        __map.addControl(new mapboxgl.Navigation({ position: "bottom-left" }));
    }

    var map = __map

/*    map.style.on("load", function () {
        map.addSource("zipcodes", {
            "type": "geojson",
            "data": zipcodes
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

        map.on("mousemove", function (e) {
            var features = map.queryRenderedFeatures(e.point, { layers: ["state-fills"] });
            if (features.length) {
                map.setFilter("route-hover", ["==", "name", features[0].properties.name]);

                var currentZipData = features[0].properties
                popup
                    .setLngLat([JSON.stringify(e.lngLat["lng"]), JSON.stringify(e.lngLat["lat"])])
                    .setHTML("Zipcode: "
                    + currentZipData.name + "</br>HMI: " + currentZipData.HMI
                    + "</br>Total Population: " + currentZipData.TOT_POP
                    + "</br>Diversity: " + (currentZipData.diversity).toFixed(2)
                    + "</br>Places: " + currentZipData.places_cou
                    + "</br>Light Mean: " + (currentZipData.light_mean).toFixed(2)
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

    })*/


    var container = map.getCanvasContainer()

    d3.select(container).select("svg").remove();


    var mapsvg = d3.select(container).append("svg")
        .style("width","100%")
        .style("height","100%")
        .style("position","absolute")
        .style("z-index","10");

    d3.select(container).append("div").attr("class","svg_overlay");


    var myg = mapsvg.append("g").attr("opacity","0.6");

    __bounds = map.getBounds();
    window.__DisX = Math.abs(project(__bounds._sw).x-project(__bounds._ne).x);
    window.__Corners = [project(__bounds._sw).x,project(__bounds._ne).y];


    function render() {
        var lightScale = d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"])

        var radius = 6 / 1400 * Math.pow(2, map.getZoom());

        var zoomAlphaScale = d3.scale.linear().domain([8, 16]).range([.8, .2])
        alpha = zoomAlphaScale(map.getZoom())

        myg.selectAll("rect").remove();

        data.forEach(function(d,i){
            var coordinates = { lat: d.lat, lng: d.lng }
            var light = d.averlight
            var fillColor = lightScale(light)

            myg.append("rect")
                .attr("x",project(d).x)
                .attr("y",project(d).y)
                .attr("id","c"+i)
                .attr("width",radius)
                .attr("height",radius)
                .attr("fill",fillColor)
                .attr("class","cellgrids")
                .on("click",function(){
                    if(map.getZoom()>=14){
                        var mypos = $(this).position();

                        window.panorama.setPosition(unproject([mypos.left,mypos.top]));
                        var thisradius = 6 / 1400 * Math.pow(2, map.getZoom());

                        d3.select(".overlay_rect").remove();
                        d3.select(".svg_overlay").append("div")
                            .attr("class","overlay_rect")
                            .style("left",mypos.left+"px")
                            .style("top",mypos.top+"px")
                            .style("width",(thisradius-10)+"px")
                            .style("height",(thisradius-10)+"px");
                        cellSelect(d);
                    }
                });
        });
    }
    render();


    function zoomed() {
        cellDisselect();

        var disX = Math.abs(project(__bounds._sw).x-project(__bounds._ne).x);
        var Corners = [project(__bounds._sw).x,project(__bounds._ne).y];

        var myscale = disX/window.__DisX;
        var mytranslate = (Corners[0]-window.__Corners[0])+","+(Corners[1]-window.__Corners[1]);

        myg.attr("transform", "translate(" + mytranslate + ")scale(" + myscale + ")");
    }

    map.on("viewreset",function(){
        zoomed();
    })
    map.on("move", function() {
        zoomed();
    })
}


function cellSelect(d){
    window.cell_selected = true;
    updateZoomedChart(selectedCharts);

    d3.select("#light_digits").text(d.averlight);
    
    console.log(d);
}

function cellDisselect(){
    window.cell_selected = false;
    d3.select(".overlay_rect").remove();
    d3.select("#light_digits").text(d3.select("#light_digits").attr("sv_val"));
    updateZoomedChart(selectedCharts);
}

function updateZoomedChart(selectedCharts) {
    selectedCharts.forEach(function(d){
        if(window.zoomedData.indexOf(d)==-1 || window.cell_selected == true)//certain data is shown only if cell is selected
        d3.select("#"+d).style("display","block");
    })
}

function updateChart(selectedCharts) {
    window.location.href = initurl.split("*")[0] + "*" + selectedCharts.join("|");
    d3.selectAll(".dc-chart").style("display","none");
    d3.select(".dc-data-count").style("display","block");
    d3.select(".lock").style("display","block");

    
    selectedCharts.forEach(function(d){
        d3.select("#d_"+d).style("display","none");
        if(window.zoomedData.indexOf(d)==-1 || window.cell_selected == true)//certain data is shown only if cell is selected
        d3.select("#"+d).style("display","block");
    })
}


window.populationChart = dc.barChart("#population")
window.incomeChart = dc.barChart("#income")
window.busDivChart = dc.barChart("#business_diversity")
window.devIntChart = dc.rowChart("#development_intensity")
window.ligAveChart = dc.barChart("#light_average")
window.placesChart = dc.barChart("#places")


function charts(data,selectedCharts) {
    d3.selectAll(".dc-chart").style("display","none");
    d3.select(".lock").style("display","block");

    selectedCharts.forEach(function(d){
        d3.select("#d_"+d).style("display","none");
        if(window.zoomedData.indexOf(d)==-1 || window.cell_selected == true){
            d3.select("#"+d).style("display","block");
        }
    })


    data.forEach(function (d) {
        d.lng = +d.lng;
        d.lat = +d.lat;
        d.id = +d.id;
        d.population = +d.population ? +d.population:0;
        d.averlight = +d.averlight ? +d.averlight:0;
        d.places = +d.places ? +d.places:0;
        d.b_diversity = +d.b_diversity ? +d.b_diversity:0;
        d.dev_intensity = +d.dev_intensity ? +d.dev_intensity:0;//groups
        d.income = +d.income;
    })

    var chartWidth = 380;

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var busDivDimension = ndx.dimension(function (d) {
        // console.log(parseFloat(parseInt(d.b_diversity*100))/100)
        return parseFloat(parseInt(d.b_diversity * 100)) / 100
    })
    var busDivGroup = busDivDimension.group()

    var populationDimension = ndx.dimension(function (d) { return parseInt(d.population) })
    var pGroup = populationDimension.group()

    var latDimension = ndx.dimension(function (d) {
        return d.lat
    })

    var incomeDimension = ndx.dimension(function (d) {
        return parseInt(parseFloat(d.income) / 1000) * 1000
    })

    //console.log(incomeDimension.top(Infinity));
    var iGroup = incomeDimension.group()

    var ligAveDimension = ndx.dimension(function (d) { return parseInt(d.averlight) })
    var laGroup = ligAveDimension.group()

    var devIntDimension = ndx.dimension(function (d) { return d.dev_intensity })
    var devIntGroup = devIntDimension.group()

    var placesDimension = ndx.dimension(function (d) { return d.places })
    var placesGroup = placesDimension.group()

    var chartHeight = 65
    busDivChart.width(chartWidth).height(chartHeight)
        .group(busDivGroup).dimension(busDivDimension)
        .ordinalColors(["#aaaaaa"])
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .x(d3.scale.linear().domain([0, 5]))

    busDivChart.yAxis().ticks(2)
    busDivChart.xAxis().ticks(4)

    placesChart.width(chartWidth).height(chartHeight)
        .group(placesGroup).dimension(placesDimension)
        .elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })

        .x(d3.scale.linear().domain([0, 20]))
    placesChart.yAxis().ticks(2)

    var chartColors = { "1": "#fff7bc", "2": "#fee391", "3": "#fec44f", "4": "#fee0d2", "5": "#fc9272", "6": "#de2d26", "7": "#deebf7", "8": "#9ecae1", "9": "#3182bd" }
    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .labelOffsetX(-35)
        .xAxis().ticks(4)

    ligAveChart.width(chartWidth/3*2).height(chartHeight/5*4)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        .elasticY(true)
        .colors(d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"]))
        .colorAccessor(function (d) { return d.key })
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .x(d3.scale.linear().domain([0, 500]))
        .yAxis().ticks(3)
    
    populationChart.width(chartWidth).height(chartHeight).group(pGroup).dimension(populationDimension)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .elasticY(true)
        .elasticX(true)
        .ordinalColors(["#ffffff"])
        .x(d3.scale.linear().domain([0, 30]))
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .yAxis().ticks(2)
    populationChart.xAxis().ticks(4)

    incomeChart.width(chartWidth).height(chartHeight).group(iGroup).dimension(incomeDimension)
        .round(dc.round.floor)
        .ordinalColors(["#ffffff"])
        .alwaysUseRounding(true)
        .elasticY(true)
        .elasticX(true)
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .on('renderlet', function (d) {
            window.newData = incomeDimension.top(Infinity)
            //reDrawMap(newData)
            d3.select("#map .datalayer").remove()
            var canvas = __canvas

            //console.log("newdata"+newData[0].id);
            d3.selectAll(".cellgrids").style("display","none");


            //d3.select("#light_digits").text("____");
            
            var ave_lit = 0;
            window.newData.forEach(function(d){
                d3.select("#c"+d.id).style("display","block");
                ave_lit +=d.averlight
            })
            ave_lit /= window.newData.length;
            ave_lit = Math.round(ave_lit * 100) / 100
            d3.select("#light_digits").text(ave_lit);
            d3.select("#light_digits").attr("sv_val" ,ave_lit);

        })
        .x(d3.scale.linear().domain([1, 250000]))
        .yAxis().ticks(function (d) {
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
            some: "%filter-count areas out of %total-count fit the selection criteria | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all: "Total %total-count areas."
        })
        
    dc.renderAll();

}

