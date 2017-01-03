'use strict';

String.prototype.lowercase = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

var currentCity_o = document.URL.split("#")[1].split("*")[0];
var currentCity = document.URL.split("#")[1].split("*")[0].lowercase();

d3.selectAll("#nowmsa").text(fullName[currentCity_o]);

var center = cityCentroids[currentCity_o];

var initurl = window.location.href;

var selectedCharts = [];

if (!initurl.split("*")[1]) {//if no dataset is specified in the url
} else {//dataset is not null
    selectedCharts = initurl.split("*")[1].split("|");
}

window.cell_selected = false;
window.dataLst = [];
window.mydata;
window.zoomedData = ["street_view", "instagram_pics"];
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

var myinit = function () {
    window.panorama = new google.maps.StreetViewPanorama(
        document.getElementById('streetview_window'),
        {
            position: { lat: 41.878180, lng: -87.630270 },
            pov: { heading: 165, pitch: 0 },
            zoom: 1
        });

    window.streetviewService = new google.maps.StreetViewService;


    // Initialize Firebase
    // TODO: Replace with your project's customized code snippet
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAiBlTxG8xEPP_5Zioj167WIxXMtI2pcVk",
        authDomain: "atlaslighting-25bbb.firebaseapp.com",
        databaseURL: "https://atlaslighting-25bbb.firebaseio.com",
        storageBucket: "atlaslighting-25bbb.appspot.com",
        messagingSenderId: "1085151504834"
    };
    firebase.initializeApp(config);
    var rootRef = firebase.database().ref();


    d3.queue()
        .defer(d3.csv, "../data/" + currentCity_o + ".csv"/*"grids/" + currentCity*/)
        //.defer(d3.json, "data/"+currentCity+"_zipcode.json"/*"zipcode_business_geojson/" + currentCity*/)
        .defer(d3.csv, "../data/atlas_time_template.csv")
        .await(dataDidLoad);
}



function dataDidLoad(error, grid) {
    d3.select("#loader").transition().duration(600).style("opacity", 0).remove();

    window.dataLst = Object.keys(grid[0])
    window.mydata = grid;
    console.log(window.dataLst);

    charts(grid, selectedCharts)

    initCanvas(grid);
    initControl();
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

    $('.data_item').mouseenter(function(event){
        event.preventDefault();
        $(this).children(".data_intro")
        .show()
        .animate({
            right:"0px"
        },300,function(){
            console.log("sdfsdfsdfsdf");
        })
    });

    $('.data_item').mouseleave(function(event){
        event.preventDefault();
        $(this).children(".data_intro")
        .animate({
            right:"-380px"
        },300,function(){
            $(this).hide();
            console.log("sdfsdfsdfsdf");
        })
    });


    $('.data_item').draggable({
        drag: function (event, ui) {
            $("#selector").css("width", "100%");
            $("#selector").css("overflow-y", "hidden");
            $("#selector").css("direction", "ltr");
        },

        stop: function (event, ui) {
            $("#selector").css("width", "416px");
            $("#selector").css("overflow-y", "auto");
            $("#selector").css("direction", "rtl");

            if ($(this).attr("style").indexOf("left") > -1) {//get back to original position
                $(this).attr("style", "position: relative;");
            }
        }

    });

    $('#todrop').droppable({
        drop: function (event, ui) {
            $(ui.draggable).attr("style", "position: relative;display:none");
            selectedCharts.push($(ui.draggable).attr("id").split("d_")[1]);

            updateChart(selectedCharts);
            $(this).css("background-color", "rgba(255,255,255,0)");
        },
        over: function (event, ui) {
            $(this).css("background-color", "rgba(255,255,255,0.2)");
        },
        out: function (event, ui) {
            $(this).css("background-color", "rgba(255,255,255,0)");
        }


    });

    $(".click_data").click(function () {
        $("#datasets").show()
        $("#case_studies").hide()
        $(this).addClass("selectedTab");
        $(".click_case").removeClass("selectedTab");

    });

    $(".click_case").click(function () {
        $("#datasets").hide()
        $("#case_studies").show();
        $(this).addClass("selectedTab");
        $(".click_data").removeClass("selectedTab");
    });

    $(".left_clickbar.datasets>img").click(function () {
        if ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1) {
            //back to selecting mode
            $(".left_clickbar>img").css("transform", "rotate(0deg)");
            $("#selector").css("width", "416px");
            $("#selector").css("overflow-y", "auto");
            $("#selector").css("direction", "rtl");
            $(".left_back").animate({
                left: "0px"
            }, 300, function () { });
            $("#selector").animate({
                left: "0px"
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "386px"
            }, 300, function () { });
            $("#todrop").show();
        } else {
            //back to folding mode
            $(".left_clickbar>img").css("transform", "rotate(180deg)");
            $("#selector").css("width", "416px");
            $("#todrop").hide();
            $(".left_back").animate({
                left: "-390px",
            }, 300, function () { });
            $("#selector").animate({
                left: "-390px",
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "0px"
            }, 300, function () { });
        }
    })

    $(".left_clickbar.case_studies>img").click(function () {
        if ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1) {
            //back to selecting mode
            $(".left_clickbar>img").css("transform", "rotate(0deg)");
            $("#selector").css("width", "416px");
            $("#selector").css("overflow-y", "auto");
            $("#selector").css("direction", "rtl");
            $(".left_back").animate({
                left: "0px"
            }, 300, function () { });
            $("#selector").animate({
                left: "0px"
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "386px"
            }, 300, function () { });
        } else {
            //back to folding mode
            $(".left_clickbar>img").css("transform", "rotate(180deg)");
            $("#selector").css("width", "416px");
            $(".left_back").animate({
                left: "-390px",
            }, 300, function () { });
            $("#selector").animate({
                left: "-390px",
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "0px"
            }, 300, function () { });
            $("#todrop").hide();
        }
    });

    $("#case_studies .data_item").click(function () {
        $("#map").hide();
        $("#map-info").hide();
        $("#cases").show();
        $("#case-info").show();
    })

    $("#case_studies #case_study_1").click(function () {
        $("#case-info #case-2").hide()
        $("#case-info #case-1").show()
    })
    $("#case_studies #case_study_2").click(function () {
        $("#case-info #case-1").hide()
        $("#case-info #case-2").show()
    })

    $("#hide_cases").click(function () {
        $("#cases").hide();
        $("#case-info").hide();
        $("#map").show();
        $("#map-info").show();
    })

    $(".tag_item").click(function () {

        if ($(this).attr("class").indexOf("selected") > -1) {
            $(".tag_item").removeClass("selected");
            $(".data_item").show();
        } else {
            $(".tag_item").removeClass("selected");
            $(this).toggleClass("selected");
            $(".data_item").hide();
            $("." + $(this).attr("id")).show();
        }

    });

    $(".data_searchbox input").keyup(function () {
        if (!$(this).val()) {
            $(".data_item").show();
        } else {
            $(".data_item").hide();
            $(".data_item[id*='" + $(this).val() + "']").show();
        }
    });

    $("#export_btn").click(function () {
        $("#export_add").css("display", "block");
        $("#export_add input").val(window.location.href);

        var data = window.newData;
        var csvContent = "";

        csvContent += Object.keys(data[0]).join(",") + "\n";
        data.forEach(function (infoArray, index) {
            var dataString = Object.values(infoArray).join(",");
            csvContent += index < data.length ? dataString + "\n" : dataString;
        });

        var encodedUri = encodeURI(csvContent);
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        var link = document.getElementById("exportcsv");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "exported_data.csv");

    });

    $("#cp_btn").click(function () {
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
    $("#bk_btn").click(function () {
        $("#export_add").css("display", "none");
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
    }

    var map = __map

    var container = map.getCanvasContainer()
    d3.select(container).select("svg").remove();

    var mapsvg = d3.select(container).append("svg")
        .style("width", "100%")
        .style("height", "100%")
        .style("position", "absolute")
        .style("z-index", "10");

    d3.select(container).append("div").attr("class", "svg_overlay");

    var myg = mapsvg.append("g").attr("opacity", "0.6");

    __bounds = map.getBounds();
    window.__DisX = Math.abs(project(__bounds._sw).x - project(__bounds._ne).x);
    window.__Corners = [project(__bounds._sw).x, project(__bounds._ne).y];

    function render() {
        var lightScale = d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"])
        var radius = 6 / 1400 * Math.pow(2, map.getZoom());
        if (currentCity_o != "Chicago") {
            radius = 1.8 * radius;
        }

        var zoomAlphaScale = d3.scale.linear().domain([8, 16]).range([.8, .2])
        alpha = zoomAlphaScale(map.getZoom())
        myg.selectAll("rect").remove();

        data.forEach(function (d, i) {
            var coordinates = { lat: d.lat, lng: d.lng }
            var light = d.averlight
            var fillColor = lightScale(light)

            //console.log(project(d).x,project(d).y);
            myg.append("rect")
                .attr("x", project(d).x)
                .attr("y", project(d).y)
                .attr("id", "c" + d.cell_id)
                .attr("width", radius)
                .attr("height", radius)
                .attr("fill", fillColor)
                .attr("class", "cellgrids")
                .on("click", function () {


                    if (map.getZoom() >= 12) {
                        var mypos = $(this).position();
                        var thisradius = 6 / 1400 * Math.pow(2, map.getZoom());

                        streetviewService.getPanorama(
                            {location: unproject([mypos.left+(thisradius - 10)/2, mypos.top+(thisradius - 10)/2])},
                            function(result, status) {
                                if (status === 'OK') {
                                    console.log("ok");
                                    d3.select("#street_view_plc").style("display", "none");
                                    d3.select("#streetview_window").style("display", "block");
                                    window.panorama.setPosition(unproject([mypos.left+(thisradius - 10)/2, mypos.top+(thisradius - 10)/2]));

                                }else{
                                    console.log("not ok");
                                    d3.select("#streetview_window").style("display", "none");
                                    d3.select("#street_view_plc").style("display", "block");

                                }
                            });


                        if (currentCity_o != "Chicago") {
                            thisradius = 1.8 * thisradius;
                        }

                        d3.select(".overlay_rect").remove();
                        d3.select(".svg_overlay").append("div")
                            .attr("class", "overlay_rect")
                            .style("left", mypos.left + "px")
                            .style("top", mypos.top + "px")
                            .style("width", (thisradius - 10) + "px")
                            .style("height", (thisradius - 10) + "px");
                        cellSelect(d);
                    }
                });
        });
    }
    render();


    function zoomed() {
        cellDisselect();
        var disX = Math.abs(project(__bounds._sw).x - project(__bounds._ne).x);
        var Corners = [project(__bounds._sw).x, project(__bounds._ne).y];
        var myscale = disX / window.__DisX;
        var mytranslate = (Corners[0] - window.__Corners[0]) + "," + (Corners[1] - window.__Corners[1]);
        myg.attr("transform", "translate(" + mytranslate + ")scale(" + myscale + ")");
    }

    map.on("viewreset", function () {
        zoomed();
    })
    map.on("move", function () {
        zoomed();
    })
}


function cellSelect(d) {
    window.cell_selected = true;
    updateZoomedChart(selectedCharts);
    d3.select("#light_digits").text(d.averlight);
    $("#instagram_plc").hide();

    console.log(d);

    var cell_id = d.cell_id;

    //if(selectedCharts.indexOf("instagram")>-1)

    var ref = firebase.database().ref(cell_id);
    ref.once("value")
        .then(function (snapshot) {
            d3.selectAll(".ins_thumb").remove();
            var insdata = snapshot.val();

            if (insdata) {
                var limit = 48;
                var count = 0;
                for (var k in insdata) {
                    (function(k){
                        if (count < limit) {
                            //console.log(k);
                            d3.select("#instagram_pics").append("img").attr("src", insdata[k]["url"]).attr("class", "ins_thumb")
                                .on('error', function() {
                                    console.log('error');
                                    d3.select(this).remove();
                                    count--;
                                })
                                .on("mousemove",function(){
                                    var myx = d3.event.clientX;
                                    var myy = d3.event.clientY;
                                    d3.select(".toolip_img").remove();
                                    d3.select("body").append("img").attr("src", insdata[k]["url"]).attr("class", "toolip_img")
                                        .style("left",(myx+5)+"px")
                                        .style("top",(myy+5)+"px");
                                })
                                .on("mouseout",function(){
                                    d3.select(".toolip_img").remove();
                                })
                        }
                        count++;


                    })(k)

                }
            }
            else{
                $("#instagram_plc").show();
            }
        });

}

function cellDisselect() {
    window.cell_selected = false;
    d3.select(".overlay_rect").remove();
    d3.select("#light_digits").text(d3.select("#light_digits").attr("sv_val"));
    updateZoomedChart(selectedCharts);
    d3.select("#street_view").style("opacity", "1");
    d3.select("#street_view").style("position", "relative");
    d3.select("#street_view").style("display", "none");


}

function updateZoomedChart(selectedCharts) {
    selectedCharts.forEach(function (d) {
        d3.select("#" + d).style("display", "none");
    })

    selectedCharts.forEach(function (d) {
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true)//certain data is shown only if cell is selected
            d3.select("#" + d).style("display", "block");
    })
}

function updateChart(selectedCharts) {
    window.location.href = initurl.split("*")[0] + "*" + selectedCharts.join("|");
    d3.selectAll(".dc-chart").style("display", "none");
    d3.select(".dc-data-count").style("display", "block");
    d3.select(".lock").style("display", "block");


    selectedCharts.forEach(function (d) {
        d3.select("#d_" + d).style("display", "none");
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true)//certain data is shown only if cell is selected
            d3.select("#" + d).style("display", "block");
    })
}




window.populationChart = dc.barChart("#population")
window.incomeChart = dc.barChart("#income")
window.busDivChart = dc.bubbleChart("#business_diversity")

window.devIntChart = dc.barChart("#development_intensity")
window.ligAveChart = dc.barChart("#light_average")
window.placesChart = dc.barChart("#places")
window.timeFilter = document.getElementById('time_filter');

$(function() {
    $("#slider").slider({
        range: true,
        min: 0,
        max: 24,
        values: [0,3],
        step: 3,
        create: function(event, ui) {
            setSliderTicks(event.target);
        },
        slide: function(event, ui) {
            //add AM/PM label
            var from = ui.values[0]
            var to = ui.values[1]
            $("#time").val(ui.values[0] + " - " + ui.values[1]);
        }
    });
    $("#time").val( $("#slider").slider("values", 0) + " - " + $("#slider").slider("values", 1) );
});

function setSliderTicks(){
    var $slider = $('#slider');
    var max = $slider.slider("option", "max");
    var step = $slider.slider("option", "step");
    var spacing = 99/(max);

    $slider.find('.ui-slider-tick-mark').remove();
    for (var i = 0; i <= max ; i+=3) {
        $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); //append tick marks
        $('<span class="ui-slider-label">'+i+'</span>').css('left', (spacing * i) +  '%').appendTo($slider); //append hour labels
     }
}


if (currentCity_o == "LA"){
    window.insChart = dc.barChart("#ins")
    window.insLikesChart = dc.barChart("#ins_likes")
    //window.busi_openingChart = dc.barChart("#business_opening")
    window.busPriChart = dc.barChart("#business_price")

}

function charts(data, selectedCharts) {
    d3.selectAll(".dc-chart").style("display", "none");
    d3.select("#street_view").style("display", "block");
    d3.select(".lock").style("display", "block");

    selectedCharts.forEach(function (d) {
        d3.select("#d_" + d).style("display", "none");
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true) {
            d3.select("#" + d).style("display", "block");
        }
    })

    var maxBDiv = null;
    var minBDiv = null;
    var maxDInt = null;
    var maxLight = null;
    var maxPlaces = null;


    data.forEach(function (d) {
        d.lng = +d.lng;
        d.lat = +d.lat;
        d.cell_id = +d.cell_id;
        d.population = +d.population ? +d.population : 0;
        d.averlight = +d.averlight ? +d.averlight : 0;
        d.places = +d.places ? +d.places : 0;
        d.b_diversity = +d.b_diversity// ? +d.b_diversity : 0;
        d.dev_intensity = +d.dev_intensity ? +d.dev_intensity : 0;//groups
        d.income = +d.income;
        d.b_price = +d.b_price;
        d.insta_cnt = +d.insta_cnt ? +d.insta_cnt : 0;
        d.insta_like = +d.insta_like ? +d.insta_like : 0;

        if (d.b_diversity) {
            if (maxBDiv == null || d.b_diversity > maxBDiv) {
                maxBDiv = d.b_diversity
            }
            if (minBDiv == null || d.b_diversity < minBDiv) {
                minBDiv = d.b_diversity
            }
        }
        if (d.dev_intensity) {
            if (maxDInt == null || d.dev_intensity > maxDInt) {
                maxDInt = d.dev_intensity
            }
        }
        if (d.averlight) {
            if (maxLight == null || d.averlight > maxLight) {
                maxLight = d.averlight
            }
        }
        if (d.places) {
            if (maxPlaces == null || d.places > maxPlaces) {
                maxPlaces = d.places
            }
        }


    })

    var chartWidth = 380;
    var chartHeight = 65;

    var ndx = crossfilter(data);
    var all = ndx.groupAll();
    window.count = data.length;

    var busDivDimension = ndx.dimension(function (d) {
        return (Math.round((d.b_diversity - minBDiv) / (maxBDiv - minBDiv) * 3) + 1) || 0
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

    var iGroup = incomeDimension.group()

    var ligAveDimension = ndx.dimension(function (d) { return parseInt(d.averlight) })
    var laGroup = ligAveDimension.group()

    var devIntDimension = ndx.dimension(function (d) { return parseInt(d.dev_intensity) })
    var devIntGroup = devIntDimension.group()

    var placesDimension = ndx.dimension(function (d) { 
        if (d.places>100) return 100; 
        else return d.places })
    var placesGroup = placesDimension.group()

    if (currentCity_o == "LA"){

        var insDimension = ndx.dimension(function (d) { 
            if(d.insta_cnt > 50 ) return 50;
            else return d.insta_cnt });
        var insGroup = insDimension.group();

        window.insChart.width(chartWidth).height(chartHeight)
            .group(insGroup).dimension(insDimension)
            //.elasticY(true)
            .ordinalColors(["#aaaaaa"])
            .gap(0)
            .margins({ top: 0, left: 50, right: 10, bottom: 20 })
            .x(d3.scale.linear().domain([1, 51]))
            .y(d3.scale.linear().domain([0, 600]));

        window.insChart.yAxis().ticks(2);

        /////////////////////
        var insLikesDimension = ndx.dimension(function (d) { 
            if(d.insta_like > 1000 ) return 1000;
            else return d.insta_like });

        var insLikesGroup = insLikesDimension.group();

        window.insLikesChart.width(chartWidth).height(chartHeight)
            .group(insLikesGroup).dimension(insLikesDimension)
            //.elasticY(true)
            .ordinalColors(["#aaaaaa"])
            .gap(0)
            .margins({ top: 0, left: 50, right: 10, bottom: 20 })
            .x(d3.scale.linear().domain([1, 1001]))
            .y(d3.scale.linear().domain([0, 20]));

        window.insLikesChart.yAxis().ticks(2);

        var busPriDimension = ndx.dimension(function (d) { return d.b_price });
        var busPriGroup = busPriDimension.group();

        window.busPriChart.width(chartWidth).height(chartHeight)
            .group(busPriGroup).dimension(busPriDimension)
            //.elasticY(true)
            .ordinalColors(["#888", "#888", "#888"])
            .margins({ top: 0, left: 50, right: 10, bottom: 20 })
            .x(d3.scale.linear().domain([0.5, 4]))
            .xUnits(function(){return 50;})
            .yAxis().ticks(2);
            //.y(d3.scale.linear().domain([0, 600]));
    }


    busDivChart.width(chartWidth).height(chartHeight*2)
        .group(busDivGroup).dimension(busDivDimension)
        .ordinalColors(["#aaaaaa"])
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .x(d3.scale.linear().domain([0.5, 4.5]))
        .y(d3.scale.linear().domain([0, 1]))
        //.r(d3.scale.linear().domain([0, window.count*5]))
        .colors(["#808080"])
        .keyAccessor(function (p) {
            return p.key;
        })
        .valueAccessor(function (p) {
            return 0.5;
        })
        .radiusValueAccessor(function (p) {
            return p.value/window.count*chartHeight*4/5;
        })
        .label(function (p) {
            return p.value
        })
        .xAxis().tickFormat(function(d, i){
            switch(i) {
            case 0:
                return "VERY LOW"
            case 1:
                return "LOW"
            case 2:
                return "MEDIUM"
            case 3:
                return "HIGH"
            default:
                return ""
            }
        })
    busDivChart.xAxis().ticks(4);        
    busDivChart.yAxis().ticks(0); 

    placesChart.width(chartWidth).height(chartHeight)
        .group(placesGroup).dimension(placesDimension)
        .elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .x(d3.scale.linear().domain([1, 101]))
    placesChart.yAxis().ticks(2)

    var chartColors = { "1": "#fff7bc", "2": "#fee391", "3": "#fec44f", "4": "#fee0d2", "5": "#fc9272", "6": "#de2d26", "7": "#deebf7", "8": "#9ecae1", "9": "#3182bd" }
    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .x(d3.scale.linear().domain([0, maxDInt]))
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .xAxis().ticks(10)
    devIntChart.yAxis().ticks(2);

    ligAveChart.width(chartWidth / 3 * 2).height(chartHeight / 5 * 4)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        .elasticY(true)
        .colors(d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"]))
        .colorAccessor(function (d) { return d.key })
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .x(d3.scale.linear().domain([0, maxLight]))
        .yAxis().ticks(3)

    populationChart.width(chartWidth).height(chartHeight).group(pGroup).dimension(populationDimension)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        //.elasticY(true)
        .elasticX(true)
        .ordinalColors(["#ffffff"])
        .x(d3.scale.linear().domain([0, 30]))
        //.y(d3.scale.linear().domain([0, 200]))
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .yAxis().ticks(2)
    populationChart.xAxis().ticks(4)

    incomeChart.width(chartWidth).height(chartHeight).group(iGroup).dimension(incomeDimension)
        .round(dc.round.floor)
        .ordinalColors(["#ffffff"])
        .alwaysUseRounding(true)
        //.elasticY(true)
        .elasticX(true)
        .margins({ top: 0, left: 50, right: 10, bottom: 20 })
        .on('renderlet', function (d) {
            window.newData = incomeDimension.top(Infinity)
            d3.select("#map .datalayer").remove()
            var canvas = __canvas

            d3.selectAll(".cellgrids").style("display", "none");


            var mytime = $("#selected_time").text().split(" - ");
            var start = mytime[0];
            var end = mytime[1];

            filterhour(window.newData,start,end);
            


        })
        .x(d3.scale.linear().domain([1, window.count]))
        .y(d3.scale.linear().domain([1, 1000]));

    incomeChart.yAxis().ticks(2)
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

    // hide the axes for the bubble charts (must run after render)
    //$("#business_diversity .axis.y").hide();
    d3.selectAll("#business_diversity path").remove();
    d3.selectAll("#business_diversity line").remove();

    selectTime(chartWidth,chartHeight);

}


function selectTime(chartWidth,chartHeight){
    var margin = { top: 0, left: 100, right: 10, bottom: 20 },
        width = chartWidth - margin.left - margin.right,
        height = chartHeight - margin.top - margin.bottom;


	var start = 0;
	var end = 0;

	var start0 = 0;
	var end0 = 24;

    var svg = d3.select("#business_opening").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("rect")
	    .attr("width", width)
	    .attr("height", height)
        .attr("fill", "rgb(50,50,50)").attr("stroke","rgba(255,255,255,0.3)");

	var context = svg.append('g')
		.attr('class', 'context');

	var x = d3.scale.linear()
		.range([0, width])
		.domain([start0,end0]);

	var brush = d3.svg.brush()
		.x(x).extent([start,end])
		.on('brushend', brushend);

	context.append('g')
		.attr('class', 'x brush')
		.call(brush)
		.selectAll('rect')
		.attr('y', 0)
		.attr('height', height);

	svg.append("g")
	    .attr("class", "x axis hour myhour")
	    .call(d3.svg.axis().tickValues([0,3,6,9,12,15,18,21,24]).tickSize(45,0)
	      .scale(x)
	      .orient("bottom"))
	  .selectAll("text")
	    .attr("x", -4).attr("y",51)
	    .style("text-anchor", null);

	d3.select(".extent").attr("height", 29);
	d3.select(".background").attr("height", 50);
	d3.selectAll(".resize rect").attr("height", 29);
    d3.selectAll(".tick line").style("opacity","0.3");


	var featureGroup;
	var featurelst = [];

	function brushend() {

        brush.extent()[0] = Math.round(brush.extent()[0])
        brush.extent()[1] = Math.round(brush.extent()[1])
        var rdstart = Math.round(brush.extent()[0]);
        var rdend = Math.round(brush.extent()[1]);

        brush.extent([rdstart,rdend]);

        if (rdend - rdstart == 0){
            d3.select("#selected_time").text(0+" - "+24);
            //d3.selectAll(".cellgrids").style("display", "block");

            filterhour(window.newData,rdstart,rdend);
        }else{
            d3.select("#selected_time").text(rdstart+" - "+rdend);
            filterhour(window.newData,rdstart,rdend);
        }
	}

}

    function filterhour(data,start,end){

        d3.selectAll(".cellgrids").style("display", "none");

        var ave_lit = 0;
        var count_ = 0;
        data.forEach(function (d) {
            var count = 0;

            if(start == end || start == 0 && end == 24 || currentCity_o == "Chicago"){
                d3.select("#c" + d.cell_id).style("display", "block");
                ave_lit += d.averlight
                count_ ++;
            }

            for(var i=start;i<end;i++){
                count += +d['b_opening_'+i];
            }

            if(count!=0){
                d3.select("#c" + d.cell_id).style("display", "block");
                ave_lit += d.averlight;
                count_ ++;

            }
        })

        ave_lit /= count_;
        ave_lit = Math.round(ave_lit * 100) / 100
        d3.select("#light_digits").text(ave_lit);
        d3.select("#light_digits").attr("sv_val", ave_lit);


    }
