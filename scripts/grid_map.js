'use strict';

////////////////////////////////////////////////////////////////////////////////
//  Variable initilization                                                    //
////////////////////////////////////////////////////////////////////////////////

var currentCity_o = document.URL.split("#")[1].split("*")[0];
var currentCity = document.URL.split("#")[1].split("*")[0].toLowerCase();
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
window.typesData = [];

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

// busTypes is a list of predefined types utilized in the business types chart.
var busTypes = ['beauty','culture','education','entertainment',
        'finance','food','health','nightclub','office','other','public_use',
        'recreation','religious','residential','restaurant','retail','service',
        'transportation'];

// Business Types Widget is initiated here.
var newBusTypesChart = tagCloudChart(390, 100);

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  myinit()                                                                  //
//                                                                            //
//  Sets up the grid, loads the data                                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
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
        apiKey: "AIzaSyClx2B45ikrkZ5mYRvMnC8hIAcSN23LZXE",
        authDomain: "atlas-lighting.firebaseapp.com",
        databaseURL: "https://atlas-lighting.firebaseio.com",
        storageBucket: "atlas-lighting.appspot.com",
        messagingSenderId: "784412993307"
    };
    firebase.initializeApp(config);
    var rootRef = firebase.database().ref();

    d3.queue()
        .defer(d3.csv, "../data/" + currentCity_o + "_grid.csv"/*"grids/" + currentCity*/)
        //.defer(d3.json, "data/"+currentCity+"_zipcode.json"/*"zipcode_business_geojson/" + currentCity*/)
        .await(dataDidLoad);
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  dataDidLoad(error, grid)                                                  //
//                                                                            //
//  Checks successful data load                                               //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function dataDidLoad(error, grid) {
    d3.select("#loader").transition().duration(600).style("opacity", 0).remove();

    window.dataLst = Object.keys(grid[0])
    window.mydata = grid;

    charts(grid, selectedCharts);

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


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  initControl()                                                             //
//                                                                            //
//  Initializing the controls                                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function initControl() {

    var droptop = $("#todrop").offset().top;
    var dropbot = droptop + $("#todrop").height();
    var dropleft = $("#todrop").offset().left;
    var dropright = dropleft + $("#todrop").width();

    $('.data_icon_handle').mouseover(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "block");
    });

    $('.data_icon_handle').mouseout(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "none");

    });

    /*
    $('.data_icon_handle').mouseenter(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "block");
    });

    $('.data_icon_handle').mouseover(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "block");
    });

    $('.data_icon_handle').mouseleave(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "none");

    $('.data_icon_handle').mouseout(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "none");

    }); */


    $('.data_item').draggable({
        drag: function (event, ui) {
            $("#selector").css("width", "100%");
            $("#selector").css("overflow-y", "hidden");
            $("#selector").css("direction", "ltr");
        },

        stop: function (event, ui) {
            $("#selector").css("width", "335px");
            $("#selector").css("overflow-y", "auto");

            if ($(this).attr("style").indexOf("left") > -1) {//get back to original position
                $(this).attr("style", "position: relative;");
            }
        }

    });

    $('#todrop').droppable({
        drop: function (event, ui) {
            $(ui.draggable).attr("style", "position: relative; display: none;");
            // $(ui.draggable).attr("style", "opacity: 0.5;");
            selectedCharts.push($(ui.draggable).attr("id").split("d_")[1]);
            updateChart(selectedCharts);
            $(this).css("background-color", "rgba(255,255,255,0)");
            var currentToDropHeight = $('#todrop').css('height');
            $('#todrop').css('height', 'calc(100%-300px)');
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

    $(".rightbar").click(function(){
        if(!$(this).attr("style") || ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1)){
            $(this).css("transform", "rotate(0deg)");

            $("#info").animate({
                right: "-430px"
            }, 300, function () { });

            $(".fold_bar").animate({
                right: "0px"
            }, 300, function () { });


            $("#export").animate({
                right: "-430px"
            }, 300, function () { });

        }
        else{
            $(this).css("transform", "rotate(180deg)");

            $("#info").animate({
                right: "0px"
            }, 300, function () { });

            $(".fold_bar").animate({
                right: "430px"
            }, 300, function () { });

            $("#export").animate({
                right: "0px"
            }, 300, function () { });

        }
    });



    $(".left_clickbar.datasets>img").click(function () {
        if ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1) {
            //back to selecting mode            
            $(".left_clickbar>img").css("transform", "rotate(0deg)");
            $("#selector").css("width", "335px");
            $("#selector").css("overflow-y", "auto");
            $(".left_back").animate({
                left: "0px"
            }, 300, function () { });
            $("#selector").animate({
                left: "0px"
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "331px"
            }, 300, function () { });
            $("#todrop").show();
            $("#zoomIn").animate({
                left: "350px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "380px"
            }, 300, function () { });
            setTimeout(function(){
               $('.gradient_container').show(); 
           }, 300);
        } else {
            //back to folding mode
            $(".left_clickbar>img").css("transform", "rotate(180deg)");
            $("#selector").css("width", "335px");
            $("#todrop").hide();
            $("#zoomIn").animate({
                left: "50px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "80px"
            }, 300, function () { });    
            $(".left_back").animate({
                left: "-335px",
            }, 300, function () { });
            $("#selector").animate({
                left: "-335px",
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "0px"
            }, 300, function () { });
            setTimeout(function(){
               $('.gradient_container').hide(); 
           }, 100);

        }
    })

    $(".left_clickbar.case_studies>img").click(function () {
        if ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1) {
            //back to selecting mode
            $(".left_clickbar>img").css("transform", "rotate(0deg)");
            $("#selector").css("width", "335px");
            $("#selector").css("overflow-y", "auto");
            $(".left_back").animate({
                left: "0px"
            }, 300, function () { });
            $("#selector").animate({
                left: "0px"
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "331px"
            }, 300, function () { });
            $("#todrop").show();
            $("#zoomIn").animate({
                left: "350px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "380px"
            }, 300, function () { });   
            setTimeout(function(){
               $('.gradient_container').show(); 
           }, 300);

        } else {
            //back to folding mode
            $(".left_clickbar>img").css("transform", "rotate(180deg)");
            $("#selector").css("width", "335px");
            $(".left_back").animate({
                left: "-335px",
            }, 300, function () { });
            $("#selector").animate({
                left: "-335px",
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "0px"
            }, 300, function () { });
            $("#todrop").hide();

            $("#todrop").hide(); 
            $("#zoomIn").animate({
                left: "50px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "80px"
            }, 300, function () { });    

            setTimeout(function(){
               $('.gradient_container').hide(); 
           }, 100);
        }
    });

    //////////////////////////////////// .rm dataset from the right panel
    $(".rm_data").click(function(){
        var myid = $(this).parent().parent().parent().parent().attr("id");
        
        console.log(myid);
        $("#"+myid).hide();
        $("#d_"+myid).show();

        var myindex = selectedCharts.indexOf(myid);
        if (myindex > -1) {
            selectedCharts.splice(myindex, 1);
        }
        updateChart(selectedCharts);

    })

    $(".tag_item").click(function () {

        if ($(this).attr("class").indexOf("selected") > -1) {
            $(".tag_item").removeClass("selected");
            $(".data_item").show();
            updateChart(selectedCharts);
        } else {
            $(".tag_item").removeClass("selected");
            $(this).toggleClass("selected");
            $(".data_item").hide();
            $("." + $(this).attr("id")).show();
            updateChart(selectedCharts);
        }

    });

    $(".data_searchbox input").val("Enter your search term...").css({
       'font-size' : '10px',
       'color' : 'gray'
    });
    $(".data_searchbox input").focus(function () { 
        $(this).val("");
    });
    $(".data_searchbox input").focusout(function () { 
        $(".data_searchbox input").val("Enter your search term..").css({
       'font-size' : '10px',
       'color' : 'gray'
        });
    });
    $(".data_searchbox input").keyup(function () {
        if (!$(this).val()) {
            $(".data_item").show();
        } else {
            $(".data_item").hide();
            $(".data_item[id*='" + $(this).val() + "']").show();
        }
    });

    $("#export .bottom_btn").click(function () {
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

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  initCanvas(data)                                                          //
//                                                                            //
//  Initializing  and rendering the canvas                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
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
    // var mygOBI = mapsvg.append("g").attr("opacity", "0.6");

    __bounds = map.getBounds();
    window.__DisX = Math.abs(project(__bounds._sw).x - project(__bounds._ne).x);
    window.__Corners = [project(__bounds._sw).x, project(__bounds._ne).y];

    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  render()                                                                  //
    //                                                                            //
    //  Rendering the canvas                                                      //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////
    function render() {
        var lightScale = d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"])
        var radius = 6 / 1400 * Math.pow(2, map.getZoom());

        var openBusinessScale = d3.scale.linear().domain([0, 2515]).range([0.2,1]);
        var openBusinessScaleColor = d3.scale.linear().domain([0, 2515]).range(["#E5DEF7", "#8D6EDE", "#2C1764"]);

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
                                    window.panorama.setPosition(unproject([mypos.left+(thisradius - 10)/2, mypos.top+(thisradius - 10)/2]));
                                    d3.select("#street_view_plc").style("display", "none");
                                    d3.select("#street_view_plc0").style("display", "none");
                                    d3.select("#streetview_window").style("display", "block");

                                }else{
                                    console.log("not ok");
                                    d3.select("#streetview_window").style("display", "none");
                                    d3.select("#street_view_plc").style("display", "block");
                                    d3.select("#street_view_plc0").style("display", "none");

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
                })
                .on("mouseenter",function(){

                    if (map.getZoom() >= 10) {

                        var myx = d3.event.clientX;
                        var myy = d3.event.clientY;

                        var loc = unproject([myx, myy]);
                        var mykey = "AIzaSyBM59LWQXfxJzh06UPYicEM9Ro6RRFCHQc";
                        var latlng = loc.lat+","+loc.lng

                        var myreq = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+latlng+"&key="+mykey

                        d3.json(myreq, function(error, data) {
                            if (error) throw error;
                            d3.selectAll(".toolip_cell").remove();

                            var infobox = d3.select("body").append("div").attr("class", "toolip_cell")
                                .style("left",(myx)+"px")
                                .style("top",(myy)+"px");
                            
                            var address = data.results[0].formatted_address;
                            infobox.text(address);

                        });
                    }
                })
                .on("mouseout",function(){
                    d3.selectAll(".toolip_cell").remove();
                })
        });

        // //////////////////////////////////// ANIMATION BEHAVIOR /////////////////////////////////// 
        // var increment=0;
        // var animationIsRunning=false;
        // (function tick() {  
        //     $('button.toggleAnimation').off().on('click', function(e) {
        //         e.preventDefault();
        //         animationIsRunning = !animationIsRunning;
        //         if (animationIsRunning) {
        //             $('button.toggleAnimation').addClass('isPressed');
        //         }
        //         else {
        //             $('button.toggleAnimation').addClass('isNotPressed');
        //         }
        //         console.log("click", animationIsRunning);
        //     })
        //     if (animationIsRunning) {  
        //         if (increment<23) {  filterhour(window.newData, increment, increment+1); }
        //         else { increment = 0; }
        //         ++increment; 
        //     }
        //     setTimeout(tick, 1000);
        // })();
    }

    //////////////////////////////////// CALL TO RENDER ///////////////////////////////////
    render();

    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  zoomed()                                                                  //
    //                                                                            //
    //  Zooming into the map                                                      //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////
    function zoomed() {
        cellDisselect();
        var disX = Math.abs(project(__bounds._sw).x - project(__bounds._ne).x);
        var Corners = [project(__bounds._sw).x, project(__bounds._ne).y];
        var myscale = disX / window.__DisX;
        var mytranslate = (Corners[0] - window.__Corners[0]) + "," + (Corners[1] - window.__Corners[1]);
        myg.attr("transform", "translate(" + mytranslate + ")scale(" + myscale + ")");
    }

    //////////////////////////////////// ZOOM BUTTONS ///////////////////////////////////
    $('#zoomIn').on('click', function(e) {
        e.preventDefault();
        var currentZoom = map.getZoom();
        currentZoom < 20 ? map.setZoom(currentZoom+0.5) : null;
        // console.log(map.getZoom())
    })    
    $('#zoomOut').on('click', function(e) {
        e.preventDefault();
        var currentZoom = map.getZoom();
        currentZoom > 1 ? map.setZoom(currentZoom-0.5) : null;
        // console.log(map.getZoom())
    })
    map.on("viewreset", function () {
        zoomed();
    })
    map.on("move", function () {
        zoomed();
    })
}

window.populationChart = dc.barChart("#population")
window.incomeChart = dc.barChart("#income")
window.busDivChart = dc.bubbleChart("#business_diversity")

window.devIntChart = dc.barChart("#development_intensity")
window.ligAveChart = dc.barChart("#light_average")
window.placesChart = dc.barChart("#places");

window.insChart = dc.barChart("#ins")
window.insLikesChart = dc.barChart("#ins_likes")
window.busPriChart = dc.barChart("#business_price")
window.OBIaverage = dc.barChart("#business_opening_average");
window.OBIpercent = dc.barChart("#business_opening_percent");

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  charts(data, selectedCharts)    --- dc.js ---                             //
//                                                                            //
//  Rendering the charts                                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function charts(data, selectedCharts) {
    d3.selectAll(".dc-chart").style("display", "none");
    d3.select("#street_view").style("display", "block");


    d3.selectAll(".lock").style("display", "block");

    selectedCharts.forEach(function (d) {
        d3.select("#d_" + d).style("display", "none");
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true) {
            d3.select("#" + d).style("display", "block");
        }
    })

    if(selectedCharts.indexOf("street_view")>-1){
        d3.select("#street_view").style("opacity", "1");
        d3.select("#street_view").style("position", "relative");
    }
    if(selectedCharts.indexOf("instagram_pics")>-1){
        d3.select("#instagram_pics").style("display", "block");
    }

    var maxBDiv = null;
    var minBDiv = null;    
    var maxDInt = null;
    var maxLight = null;
    var maxPlaces = null;

    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  Getting the data for each cell                                            //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////

    data.forEach(function (d) {
        d.OBIaverage = 0;
        d.OBIpercent = 0;
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

        // Business types recasting
        d.beauty = +d.beauty ? +d.beauty : 0; 
        d.culture = +d.culture ? +d.culture : 0;
        d.education = +d.education ? +d.education : 0; 
        d.entertainment = +d.entertainment ? +d.entertainment : 0; 
        d.finance = +d.finance ? +d.finance : 0; 
        d.food = +d.food ? +d.food : 0; 
        d.health = +d.health ? +d.health : 0;
        d.nightclub = +d.nightclub ? +d.nightclub : 0;
        d.office = +d.office ? +d.office : 0; 
        d.other = +d.other ? +d.other : 0; 
        d.public_use = +d.public_use ? +d.public_use : 0; 
        d.recreation = +d.recreation ? +d.recreation : 0; 
        d.religious = +d.religious ? +d.religious : 0; 
        d.residential = +d.residential ? +d.residential : 0; 
        d.restaurant = +d.restaurant ? +d.restaurant : 0; 
        d.retail = +d.retail ? +d.retail : 0; 
        d.service = +d.service ? +d.service : 0; 
        d.transportation = +d.transportation ? +d.transportation : 0;   
        // -------------------------------------------------------------------------- OBI values
        for (var i=0;i<24;i++){
            if  (+d['b_opening_'+i] >0) {
                d.OBIaverage += +d['b_opening_'+i];
                d.OBIpercent += +d['b_opening_'+i];
            }
        }

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
    var chartWidth = 320; //304
    var chartHeight = 125; //52

    var actChrtWidth = 264;

    var chartWidthBusDiv = 320;
    var chartHeightBusDiv = 52;

    var chartMargins = {top: 8, left: 30, right: 10, bottom: 20}; //{top: 0, left: 50, right: 10, bottom: 20};

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    /* Creating an array of objects
     * containing business types and their sum for each city.
     * @method initialFormat
     * @param {Array} Data to be formatted
     */

    var typeSums = [];
    busTypes.forEach(function(el){
        var typeSum = ndx.groupAll().reduceSum(function(d){return d[el];}).value();
        if (typeSum){
            typeSums.push({
                category: el, 
                count: typeSum
            });
        }
    });

    window.typesData = typeSums;
    
    newBusTypesChart.bindData(data);
    newBusTypesChart.updateBusTypes(typeSums);
    window.count = data.length;
    
    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  Creating the charts for each type                                         //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////

    var busDivDimension = ndx.dimension(function (d) {
        return (Math.round((d.b_diversity - minBDiv) / (maxBDiv - minBDiv) * 3) + 1) || 0
    });
    var busDivGroup = busDivDimension.group();

    var latDimension = ndx.dimension(function (d) {
        return d.lat
    });

    var devIntDimension = ndx.dimension(function (d) { return parseInt(d.dev_intensity) });
    var devIntGroup = devIntDimension.group();

    var placesDimension = ndx.dimension(function (d) { 
        if (d.places>100) return 100; 
        else return d.places });
    var placesGroup = placesDimension.group()

    var insDimension = ndx.dimension(function (d) { 
        if(d.insta_cnt > 50 ) return 50;
        else return d.insta_cnt });
    var insGroup = insDimension.group()

    window.insChart.width(chartWidth).height(chartHeight)
        .group(insGroup).dimension(insDimension)
        //.elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins(chartMargins)
        .centerBar(true)
        .x(d3.scale.linear().domain([1, 51]))
        .y(d3.scale.linear().domain([0, 600]))
    window.insChart.yAxis().ticks(2)

    var insLikesDimension = ndx.dimension(function (d) { 
        if(d.insta_like > 1000 ) return 1000;
        else return d.insta_like })

    var insLikesGroup = insLikesDimension.group()

    window.insLikesChart.width(chartWidth).height(chartHeight)
        .group(insLikesGroup).dimension(insLikesDimension)
        //.elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins(chartMargins)
        .centerBar(true)
        .x(d3.scale.linear().domain([1, 1001]))
        .y(d3.scale.linear().domain([0, 20]))
    window.insLikesChart.yAxis().ticks(2)

    var busPriDimension = ndx.dimension(function (d) { return d.b_price });
    var busPriGroup = busPriDimension.group()

    window.busPriChart.width(chartWidth).height(chartHeight)
        .group(busPriGroup).dimension(busPriDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins(chartMargins)
        .x(d3.scale.linear().domain([0.5, 4]))
        .xUnits(function(){return 50;})
        .gap(1)
        .centerBar(true)
        .yAxis().ticks(2);

    var OBIpercentDimension = ndx.dimension(function (d) { return d.OBIpercent });
    var OBIpercentGroup = OBIpercentDimension.group();

    window.OBIpercent.width(chartWidth).height(chartHeight)
        .group(OBIpercentGroup).dimension(OBIpercentDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins(chartMargins)
        .x(d3.scale.linear().domain([0, 50]))
        .gap(1)
        .yAxis().ticks(1);

    var OBIaverageDimension = ndx.dimension(function (d) { return d.OBIaverage });
    var OBIaverageGroup = OBIaverageDimension.group();

    window.OBIaverage.width(chartWidth).height(70)
        .group(OBIaverageGroup).dimension(OBIaverageDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins(chartMargins)
        .x(d3.scale.linear().domain([0, 1000]))
        .y(d3.scale.linear().domain([0, 300]))        
        .gap(1)
        .yAxis().ticks(1)

    busDivChart.width(chartWidthBusDiv).height(chartHeightBusDiv*2)
        .group(busDivGroup).dimension(busDivDimension)
        .ordinalColors(["#aaaaaa"])
        .margins({top: 0, left: 50, right: 10, bottom: 20})
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
        .margins(chartMargins)
        .x(d3.scale.linear().domain([1, 101]))
        //.yAxisLabel('# OF CELLS')
    placesChart.yAxis().ticks(2)

    var chartColors = { "1": "#fff7bc", "2": "#fee391", "3": "#fec44f", "4": "#fee0d2", "5": "#fc9272", "6": "#de2d26", "7": "#deebf7", "8": "#9ecae1", "9": "#3182bd" }
    var appendableDev = true;

    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .x(d3.scale.linear().domain([0, maxDInt]))
        .margins(chartMargins)
        .on('renderlet', function(chart){

        })
        //.yAxisLabel('# OF CELLS')
        .xAxis().ticks(10)
    devIntChart.yAxis().ticks(2)

    /* Average Light Index chart
     * We are calculating predefined ranges to represent low, medium and high intensities of light.
    */

    var ligAveDimension = ndx.dimension(function (d) { return parseInt(d.averlight) });
    var laGroup = ligAveDimension.group();
    var extent = d3.extent(data, function(el){return parseInt(el.averlight)});
    var sortedLights = data.map(function(el){return parseInt(el.averlight)}).sort(function(a, b){return a - b});

    

    var firstQL = d3.quantile(sortedLights, 0.33);
    var secondQL= d3.quantile(sortedLights, 0.66);

    var xOfFirstQL = actChrtWidth*(firstQL/(extent[1]-extent[0]));
    var xOfSecondQL = actChrtWidth*(secondQL/(extent[1]-extent[0]));

    var appendableLig = true;

    ligAveChart.width(chartWidth).height(chartHeight)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        .elasticY(true)
        .colors(d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"]))
        .colorAccessor(function (d) { return d.key })
        .margins(chartMargins)
        // Draw range lines
        .on('renderlet', function(chart){
            if (appendableLig){
                addQuantiles(chart, xOfFirstQL, xOfSecondQL, 3, 2, chartHeight, chartMargins, 2);
                appendableLig = false;
            }
        })
        .x(d3.scale.linear().domain([0, maxLight]))
        //.yAxisLabel('# OF CELLS')
        .yAxis().ticks(3);
        

    /* Population Chart
     * We are dividing the distribution into three quantiles: low, medium and high 
    */

    var popDimension = ndx.dimension(function (d) { return parseInt(d.population) })
    var pGroup = popDimension.group();
    var topPop = pGroup.top(2);
    var maxPopY = topPop[1].value;
    var extentI = d3.extent(data, function(el){return parseInt(parseFloat(el.population) / 1000) * 1000});
    var sortedIncomes = data.map(function(el){return parseInt(parseFloat(el.population) / 1000) * 1000}).sort(function(a, b){return a - b});
    var quants = quantileCalc(extentI, sortedIncomes, actChrtWidth);
    var appendablePop = true;

    populationChart.width(chartWidth).height(chartHeight).dimension(popDimension).group(pGroup)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .elasticX(true)
        .ordinalColors(["#aaaaaa"])
        .x(d3.scale.linear().domain([0, 30]))
        .y(d3.scale.linear().domain([0, maxPopY])) //Take the max
        .margins(chartMargins)
        .on('renderlet', function(chart){
            if (appendablePop){
                addQuantiles(chart, quants.firstX, quants.secondX, 3, 2, chartHeight, chartMargins, 2);
                appendablePop = false;
            }
        })
        .yAxis().ticks(2)
        
    populationChart.xAxis().ticks(4)

    /* Median Household Income Chart
     * We are dividing the distribution into three quantiles: low, medium and high 
    */

    var incomeDimension = ndx.dimension(function (d) {
        return parseInt(parseFloat(d.income) / 1000) * 1000;
    });
    var iGroup = incomeDimension.group();
    //var iGroupEmpty = remove_empty_bins(iGroup);
    //console.log(maxIncY);
    var extentI = d3.extent(data, function(el){return parseInt(parseFloat(el.income) / 1000) * 1000});
    var sortedIncomes = data.map(function(el){return parseInt(parseFloat(el.income) / 1000) * 1000}).sort(function(a, b){return a - b});
    //var firstQI = d3.quantile(sortedIncomes, 0.33);
    //var secondQI = d3.quantile(sortedIncomes, 0.66);
    //var xOfFirstQI = actChrtWidth*(firstQI/(extentI[1]-extentI[0]));
    //var xOfSecondQI = actChrtWidth*(secondQI/(extentI[1]-extentI[0]));
    var quants = quantileCalc(extentI, sortedIncomes, actChrtWidth);

    var appendableInc = true;
    incomeChart.width(chartWidth).height(chartHeight).dimension(incomeDimension).group(iGroup)
        .round(dc.round.floor)
        .ordinalColors(["#ffffff"])
        .alwaysUseRounding(true)
        .elasticX(true)
        .elasticY(true)
        .margins(chartMargins)
        .on('renderlet', function (chart) {
            window.newData = incomeDimension.top(Infinity)
            d3.select("#map .datalayer").remove()
            var canvas = __canvas

            d3.selectAll(".cellgrids").style("display", "none");
            var mytime = $("#selected_time").text().split(" - ");
            var start = mytime[0];
            var end = mytime[1];

            filterhour(window.newData,start,end);

            if (appendableInc){
                addQuantiles(chart, quants.firstX, quants.secondX, 5, 5, chartHeight, chartMargins, 6);
                appendableInc = false;
            }

            var median = d3.median(window.newData, function(el){return parseInt(parseFloat(el.income) / 1000) * 1000;});
            var correspond = thisQuantile(median, extentI, quants.first, quants.second);

            bindText(correspond, median, "#income_digits", "#income_digits_o");
            //d3.select("#income_digits").text(correspond);
            //d3.select("#income_digits").attr("sv_val", correspond);

        })
        .x(d3.scale.linear().domain([1, window.count]))
        //.yAxisLabel('# OF CELLS')
        //.y(d3.scale.linear().domain([1, maxIncY])); //max was 1000

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
        .on('renderlet', function(d){
            var toParse = d3.select(".dc-data-count").text();
            var parseArr = toParse.split(" ");
            var theCount = parseArr.filter(function(el){if (!isNaN(el[0])){return el;}})[0];
            var $img = $("#export_btn").find('img');
            $("#export_btn").html("EXPORT"+" "+"("+" "+theCount+" "+ "Cells Selected"+" "+")");
            $("#export_btn").prepend($img);
        });

    //////////////////////////////////// renderAll()   --- dc.js ---- ///////////////////////////////////
    dc.renderAll();
    d3.selectAll("#business_diversity path").remove();
    d3.selectAll("#business_diversity line").remove();
    
    //////////////////////////////////// timeSelector   --- d3.js ---- ///////////////////////////////////
    timeSelector(chartWidth,chartHeight); 
    if (selectedCharts.indexOf("business_opening_percent") !== -1) { //show second bar on load
        $('#business_opening_average').show();
        $('#business_opening_average').find('#time_selector').hide();
        $('#business_opening_average').find('#selected_time').hide();
    }
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  cellSelect(datum)                                                         //
//                                                                            //
//  Behavior when a user selects a cell                                       //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function cellSelect(d) {
    window.cell_selected = true;
    updateZoomedChart(selectedCharts);
    d3.select("#light_digits").text(d.averlight);
    $("#instagram_plc").hide();
    $("#instagram_plc0").hide();

    var cell_id = d.cell_id;

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
                                    console.log('error on instagram pics');
                                    d3.select(this).remove();
                                    count--;
                                })
                                .on("mousemove",function(){
                                    var myx = d3.event.clientX;
                                    var myy = d3.event.clientY;
                                    d3.select(".toolip_img").remove();
                                    d3.select("body").append("img").attr("src", insdata[k]["url"]).attr("class", "toolip_img")
                                        .style("left",(myx-5-150)+"px")
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
    newBusTypesChart.assignSelect(true);
    newBusTypesChart.updateBusTypes(d);

}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  cellDisselect()                                                           //
//                                                                            //
//  Behavior when a user unselects a cell                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function cellDisselect() {
    window.cell_selected = false;
    d3.select(".overlay_rect").remove();
    d3.select("#light_digits").text(d3.select("#light_digits").attr("sv_val"));
    updateZoomedChart(selectedCharts);
    /*
    d3.select("#street_view").style("opacity", "1");
    d3.select("#street_view").style("position", "relative");
    d3.select("#street_view").style("display", "none"); */

    newBusTypesChart.assignSelect(false);
    newBusTypesChart.updateBusTypes(window.typesData);

}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  updateZoomedChart(selectedCharts)                                         //
//                                                                            //
//  Interacting with charts on the right panel                                //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function updateZoomedChart(selectedCharts) {
    selectedCharts.forEach(function (d) {
        d3.select("#" + d).style("display", "none");
    })

    selectedCharts.forEach(function (d) {
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true)//certain data is shown only if cell is selected
            d3.select("#" + d).style("display", "block");
    })

    d3.select("#street_view").style("opacity", "1");
    d3.select("#street_view").style("position", "relative");
    d3.select("#street_view").style("display", "none");

    if(selectedCharts.indexOf("street_view")>-1){
        d3.select("#street_view").style("display", "block");
        d3.select("#streetview_window").style("opacity", "1");
        d3.select("#street_view_plc0").style("display", "block");
        d3.select("#street_view_plc").style("display", "none");

    }else{
        d3.select("#street_view").style("display", "none");
    }
    d3.select("#streetview_window").style("opacity", "1");
    d3.select("#streetview_window").style("position", "relative");
    d3.select("#streetview_window").style("display", "none");

    if(selectedCharts.indexOf("instagram_pics")>-1){
        d3.select("#instagram_pics").style("display", "block");
        $("#instagram_plc0").show();
        $("#instagram_plc").hide();
        d3.selectAll(".ins_thumb").remove();
    }else{
        d3.select("#instagram_pics").style("display", "none");
    }
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  updateZoomedChart(selectedCharts)                                         //
//                                                                            //
//  Selecting which charts show on the right panel                            //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function updateChart(selectedCharts) {
    window.location.href = initurl.split("*")[0] + "*" + selectedCharts.join("|");
    d3.selectAll(".dc-chart").style("display", "none");
    d3.select(".dc-data-count").style("display", "block");
    d3.select(".lock").style("display", "block");

    selectedCharts.forEach(function (d) {
        d3.select("#d_" + d).style("display", "none");
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true) {
            d3.select("#" + d).style("display", "block");
        }
    })

    //////////////////////////////////// SPECIAL BEHAVIOR FOR THE OBI CHARTS 
    if (selectedCharts.indexOf("business_opening_percent") !== -1) 
    { //percentage filter is not selected, the AVERAGE graph should not show
        $('#business_opening_average').show();
        $('#business_opening_average').find('#time_selector').hide();
        $('#business_opening_average').find('#selected_time').hide();
    }
    updateZoomedChart(selectedCharts);
  
    //$("#dc-data-count").css({"display":"none"});
}



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  timeSelector(id, chartWidth,chartHeight)  --- d3.js ---                   //
//                                                                            //
//  Renders the time selector slider                                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function timeSelector(chartWidth,chartHeight) {
    var start = 9; //starting point of brush on chart
    var end = 12; //ending point of brush on chart
    var start0 = 0; //starting point for code before anyone interacts with brush
    var end0 = 24; //ending point for code before anyone interacts with brush
    var margin = { top: 10, left: 10, right: 0, bottom: 0 },
        width = chartWidth - margin.right,
        height = 32;

    var svg = d3.select("#time_selector").append("svg")
        .attr('id', 'time_selector')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("rect")
	    .attr("width", 300)
	    .attr("height", 2)
        .attr("fill", "rgb(50,50,50)").attr("stroke","rgba(255,255,255,0.3)");

	var context = svg.append('g')
		.attr('class', 'context');

	var x = d3.scale.linear()
        .domain([start0,end0])
		.range([0, 300]);

	var brush = d3.svg.brush()
		.x(x).extent([start,end])
		.on('brushend', brushend);

	context.append('g')
		.attr('class', 'brushItem')
		.call(brush)
		.selectAll('rect')
		.attr('y', -12)
		.attr('height', 24);

	svg.append("g")
	    .attr("class", "x axis hour myhour")
	    .call(d3.svg.axis().tickValues([0,3,6,9,12,15,18,21,24]).tickSize(10,0)
	      .scale(x)
	      .orient("bottom"))
	  .selectAll("text")
	    .attr("x", -4).attr("y",15)
	    .style("text-anchor", null);

	d3.select(".extent").attr("height", 29);
	d3.select(".background").attr("height", 50);
	d3.selectAll(".resize rect").attr("height", 29);
    d3.selectAll(".tick line").style("opacity","0.3");

	function brushend() {
        brush.extent()[0] = Math.round(brush.extent()[0])
        brush.extent()[1] = Math.round(brush.extent()[1])
        var rdstart = Math.round(brush.extent()[0]);
        var rdend = Math.round(brush.extent()[1]);
        
        brush.extent([rdstart,rdend]);
        
        if (rdend - rdstart == 0){
            $('#business_opening_percent').find('#selected_time').text(0+" - "+24);
            filterhour(window.newData, rdstart, rdend);
            if (selectedCharts.includes("business_opening_average") || selectedCharts.includes("business_opening_percent")) {updateOBI(window.newData, rdstart,rdend);}
        }
        else {
            $('#business_opening_percent').find('#selected_time').text(rdstart+" - "+rdend);
            filterhour(window.newData, rdstart, rdend);
            if (selectedCharts.includes("business_opening_average") || selectedCharts.includes("business_opening_percent")) {updateOBI(window.newData, rdstart,rdend);}
        }
	}

}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  filterhour(data, rdstart, rdend)  --- d3.js ---                           //
//                                                                            //
//  Syncs the map with the selected values after using the time slider        //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function filterhour(data, rdstart, rdend){
    var ave_lit = 0;
    var count_ = 0;
    $('#business_opening_percent').find('#selected_time').text(rdstart+" - "+rdend);
    data.forEach(function (d) {
        // if (rdstart == rdend || (rdstart == 0 && rdend == 24)){
        //     d3.select("#c" + d.cell_id).style("display", "block");
        //     ave_lit += d.averlight;
        //     count_ ++;
        // }
        // else {
        //     d3.select("#c" + d.cell_id).style("display", "none");
        // }

        if (d.OBIaverage!=0){
            d3.select("#c" + d.cell_id).style("display", "block");
            ave_lit += d.averlight;
            count_ ++;
        }
        else {
            d3.select("#c" + d.cell_id).style("display", "none");
        }
    })

    if (count_!==0) {
        ave_lit /= count_;
        ave_lit = Math.round(ave_lit * 100) / 100; 
        d3.select("#light_digits_o").text(ave_lit);
        d3.select("#light_digits_o").attr("sv_val", ave_lit);
    }

}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  updateOBI(dataUpdate, start, end)  --- dc.js ---                          //
//                                                                            //
//  Updates the two dc.js charts for the open business values                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function updateOBI(dataUpdate,start,end){
    var chartHeight_ = 100;
    var chartWidth_ = 320;
    var cf = crossfilter(dataUpdate);
    cf.remove();
    dataUpdate.forEach(function (d) {
       d.OBIaverage = 0;
       d.OBIpercent = 0;
       for (var i=start;i<end;i++){
            if (+d['b_opening_'+i] >0) {
                 d.OBIaverage += +d['b_opening_'+i];   
                 d.OBIpercent += +d['b_opening_'+i];   
            }
        }

    });
    cf.add(dataUpdate);
    var OBIaverageDimension_ = cf.dimension(function (d) { return d.OBIaverage });
    var OBIaverageGroup_ = OBIaverageDimension_.group();    
    var OBIpercentDimension_ = cf.dimension(function (d) { return d.OBIpercent });
    var OBIpercentGroup_ = OBIpercentDimension_.group();

    window.OBIaverage.width(chartWidth_).height(70)
            .group(OBIaverageGroup_).dimension(OBIaverageDimension_);    
    window.OBIpercent.width(chartWidth_).height(chartHeight_)
            .group(OBIpercentGroup_).dimension(OBIpercentDimension_);

    dc.redrawAll();
}


////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  Utility functions                                                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


/* Convert Thousands to K format. @Jake Feasel
 */

function kFormatter(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num
}

/* Utility function to remove empty bins.
 */

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}

/* Utility function to remove selected bins.
 */

function remove_small_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value > 1;
            });
        }
    };
}

/* Utility function to bind text to a DOM element.
 */

var bindText = function(quanText, median, selection_1, selection_2){
    if (quanText === "MEDIUM"){
        $(selection_1).css("font-size", "14px");
    } else {
        $(selection_1).css("font-size", "24px");
    }
    $(selection_1).html(quanText);
    $(selection_1).attr("sv_val", quanText);
    var newText =`${kFormatter(median)}`;
    console.log(newText);
    console.log(selection_2);
    $(selection_2).html(newText);
    $(selection_2).attr("sv_val", newText);
}

/* Utility function to move a d3 element back in appearance order.
 */

d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};


/* Function for drawing Quantile Lines on the selected chart.
 * @method addQuantiles
 * @param {Object} chart
 * @param {Number} firstQ
 * @param {Number} secondQ
 * @param {Number} b -Offset parameter
 * @param {Number} c -Offset parameter
 * @param {Number} chrtHeight
 * @param {Object} chrtMargins
 * @param {Number} fontSize 
 */

function addQuantiles(chart, firstQ, secondQ, b, c, chrtHeight, chrtMargins, fontSize) {
        chart.select("svg")
             .append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")")
             .append("line")
             .attr("x1", firstQ)
             .attr("y1", 0)
             .attr("x2", firstQ)
             .attr("y2", chrtHeight - chrtMargins.bottom - chrtMargins.top)
             .style("stroke", "lightgrey")
             .style("stroke-width", "1.6");
             
        chart.select("svg")
             .append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")")
             .append("line")
             .attr("x1", secondQ)
             .attr("y1", 0)
             .attr("x2", secondQ)
             .attr("y2", chrtHeight - chrtMargins.bottom - chrtMargins.top)
             .style("stroke", "lightgrey")
             .style("stroke-width", "1.6")
        
        if ((secondQ - firstQ) > 30) {
            var textConst = (firstQ/2)-b; // b is 3 and c is 2 for Lighting Average,
            var texts = [{text:"LOW", x: textConst}, { text:"MEDIUM", x: firstQ + c }, {text:"HIGH",x:secondQ + textConst}];
            var g = chart.select("svg").append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")");
            var newChart = g.selectAll("text").data(texts);
            
            newChart.enter()
             .append("text")
             .text(function(el){return el.text;})
             .attr("y", chrtMargins.top ) //chrtHeight -chrtMargins.bottom -2
             .attr("x", function(el){return el.x})
             .style("font-size", fontSize + "px") // 3 for Lighting Average
             .style("color", "lightgrey")
             .style("font-family", "Ropa Sans")

     };
};

/* Calculates which quantile given selections' median fall into.
 * @method thisQuantile
 * @param {Array} Data
 */

var thisQuantile = function(median, extent, firstQ, secondQ){
   if (median >= extent[0] && median <= firstQ){
       return "LOW";
   } else if (median > firstQ && median <= secondQ){
       return "MEDIUM";
   } else {
       return "HIGH"
   }
}

/* Calculates quantiles
 * @method quantileCalc
 * @param {Array}
 * @param {Array}
 */

var quantileCalc = function(extent, sorted, width){
    var firstQ = d3.quantile(sorted, 0.33);
    var secondQ = d3.quantile(sorted, 0.66);
    var xOfFirstQ = width*(firstQ/(extent[1]-extent[0]));
    var xOfSecondQ = width*(secondQ/(extent[1]-extent[0]));
    return {firstX: xOfFirstQ, secondX: xOfSecondQ, first:firstQ, second:secondQ}
}






