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
window.tagCharts = [];
window.newData;
window.topics;
window.state;
window.typesData = [];
window.topicsData = [];
window.filtered = false;

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

// busTypes is a list of predefined types utilized in the business types chart.
var instaTopics = ['advertising','beverage','car','entertainment',
        'family','fashion','food','interiors','landscape','monochrome','nature',
        'portrait','sky','sports'];

// Business Types Widget is initiated here:
var busTypesChart = tagCloudChart(390, 100, "#business_types");
var instaTopicsChart = tagCloudChart(370, 100, "#instagram_topics" ); //390
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

    var q = d3.queue(2).defer(d3.csv, "../data/" + currentCity_o + "_grid.csv")
                       .defer(d3.csv, "../data/denver_instagram_topics.csv")
    if (currentCity_o != "Chicago"){
        q.defer(d3.csv, "../data/Chicago_grid.csv")
    }
    //.defer(d3.json, "data/"+currentCity+"_zipcode.json"/*"zipcode_business_geojson/" + currentCity*/)
    q.await(dataDidLoad);
}


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  dataDidLoad(error, grid)                                                  //
//                                                                            //
//  Checks successful data load                                               //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function dataDidLoad(error, grid, topics, chicago_data) {
    if (!grid) return

    d3.select("#loader").transition().duration(600).style("opacity", 0).remove();

    window.dataLst = Object.keys(grid[0])
    window.mydata = grid;
    //window.state = newBusTypesChart.convertToArray(grid);
    //window.topics = topics;
    if (topics) window.topics = topics;
    if (chicago_data) window.chicago_data = chicago_data;

    charts(grid, selectedCharts);

    initCanvas(grid);

    initControl();
    
}

function dataDidLoad2(error, grid, chicago_data){
    if (chicago_data) {
        window.chicago_data = chicago_data
    }
    d3.select("#loader").transition().duration(600).style("opacity", 0).remove();

    window.dataLst = Object.keys(chicago_data[0])
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

        //Switch pattern might be better here
        if (currentCity_o == "LA") {
            radius = 1.82 * radius;
        } else if (currentCity_o == "Sanjose"){
            radius = 1.88 * radius;
        } else if (currentCity_o == "Pittsburgh"){
            radius = 1.97 * radius;
        } else  {
            radius = 2 * radius;
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

                    if (map.getZoom() >= 0) { //12
                        var mypos = $(this).position();
                        var thisradius = 6 / 1400 * Math.pow(2, map.getZoom());

                        streetviewService.getPanorama(
                            {location: unproject([mypos.left+(thisradius - 10)/2, mypos.top+(thisradius - 10)/2])},
                            function(result, status) {
                                if (status === 'OK') {
                                    //console.log("ok");
                                    window.panorama.setPosition(unproject([mypos.left+(thisradius - 10)/2, mypos.top+(thisradius - 10)/2]));
                                    d3.select("#street_view_plc").style("display", "none");
                                    d3.select("#street_view_plc0").style("display", "none");
                                    d3.select("#streetview_window").style("display", "block");

                                }else{
                                    //console.log("not ok");
                                    d3.select("#streetview_window").style("display", "none");
                                    d3.select("#street_view_plc").style("display", "block");
                                    d3.select("#street_view_plc0").style("display", "none");

                                }
                        });

                        //Switch pattern might be better here
                        if (currentCity_o == "LA") {
                            thisradius = 1.82 * thisradius;
                        } else if (currentCity_o == "Sanjose"){
                            thisradius = 1.92 * thisradius; 
                        } else  {
                            thisradius = 2 * thisradius;
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

window.insChart = dc.barChart("#ins");
window.insLikesChart = dc.barChart("#ins_likes");
window.busPriChart = dc.barChart("#business_price");
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
    d3.select("#street_view").style("display", "none");
    d3.select("#streetview_window").style("display", "none");

    selectedCharts.forEach(function (d) {
        d3.select("#d_" + d).style("display", "none");
        if (window.zoomedData.indexOf(d) == -1 || window.cell_selected == true) {
            d3.select("#" + d).style("display", "block");
        }
    })

    

    if(selectedCharts.indexOf("street_view") !== - 1){
        d3.select("#street_view").style("display", "block");
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
        d.OBIcount = +d.b_opening_count;
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
            }
        }
        if (d.OBIcount > 0) {
            d.OBIpercentage = Math.floor((d.OBIaverage/ 24) / d.OBIcount * 100);
        }
        else {
            d.OBIpercentage = 0;
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
    var chartWidth = 320; //304 //320
    var chartHeight = 140; //52

    var actChrtWidth = 264;

    var chartWidthBusDiv = 320;
    var chartHeightBusDiv = 52;

    var chartMargins = {top: 8, left: 40, right: 10, bottom: 30};//20 //{top: 0, left: 50, right: 10, bottom: 20};

    window.ndx = crossfilter(data);
    var all = window.ndx.groupAll();

    /* Creating an array of objects
     * containing business types and their sum for each city.
     * @method initialFormat
     * @param {Array} Data to be formatted
     */

    var typeSums = [];
    busTypes.map(function(el){
        var typeSum = window.ndx.groupAll().reduceSum(function(d){return d[el];}).value();
        if (typeSum){
            typeSums.push({
                category: el, 
                count: typeSum
            });
        }
    });

    var topicSums = [];
    instaTopics.map(function(el){
        var topicSum = window.ndx.groupAll().reduceSum(function(d){return d[el];}).value();
        if (topicSum){
            topicSums.push({
                category: el, 
                count: topicSum
            });
        }
    })

    //console.log(window.topics);

    window.typesData = typeSums;
    window.topicsData =  topicSums;
    //newBusTypesChart.bindData(data);
    //newBusTypesChart.updateBusTypes(typeSums);

    window.count = data.length;
    
    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  Creating the charts for each type                                         //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////

    var busDivDimension = window.ndx.dimension(function (d) {
        return (Math.round((d.b_diversity - minBDiv) / (maxBDiv - minBDiv) * 3) + 1) || 0
    });
    var busDivGroup = busDivDimension.group();

    var latDimension = window.ndx.dimension(function (d) {
        return d.lat
    });

    /* Instagram density chart
     * 
    */

    var insDimension = window.ndx.dimension(function (d) { 
        if(d.insta_cnt > 50 ) return 50;
        else return d.insta_cnt });
    var insGroup = insDimension.group()
    var appendableIns = true

    window.insChart.width(chartWidth).height(chartHeight)
        .group(insGroup).dimension(insDimension)
        //.elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins(chartMargins)
        .centerBar(true)
        .on('renderlet', function(chart){
            window.newData = insDimension.top(Infinity);
            var median = d3.median(window.newData, function(el){return el.insta_cnt>50 ? 50 : el.insta_cnt});
            bindInstaText(median, "#instaDen_digits");
        })
        .on('postRender', function(chart){
            drawLabels(chart, "# OF POSTS", "# OF CELLS");
        })
        .x(d3.scale.linear().domain([1, 51]))
        .y(d3.scale.linear().domain([0, 600]))
    window.insChart.yAxis().ticks(2)

    var insLikesDimension = window.ndx.dimension(function(d) { 
        for (var i = 1000; i >= 0; i=i-100) {
            if (d.insta_like >= i) {return i} 
        }
    });


    var insLikesGroup = insLikesDimension.group().reduceSum(function(d){return d.insta_like>=100;});

    window.insLikesChart.width(chartWidth).height(chartHeight)
        .dimension(insLikesDimension).group(insLikesGroup)
        .margins(chartMargins)
        .elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(5)
        // .centerBar(true)
        .on('renderlet', function(chart){
            var selected = window.newData.map(function(el){return el.insta_like}).filter(function(d){return d >=100})
            var median = d3.median(selected);
            bindSmallText2(median, "#instaLikes_digits");
        })
        .on('postRender', function(chart){
            drawLabels(chart, "# OF LIKES", "# OF CELLS");
            var text = "CELLS THAT HAS LESS THAN 100 LIKES HAS NOT BEEN SELECTED"
            bindSmallText2(text, "#insta_explain");
            // chart.selectAll("rect.bar").on("click", chart.onClick);
        })
        // .x(d3.scale.ordinal().domain(["0", "10","20","30","40","50","60", "70", "80", "90", "100+"]))
        .x(d3.scale.ordinal().domain([100,200,300,400,500,600,700,800,900,1000]))
        .xUnits(dc.units.ordinal);

    window.insLikesChart.yAxis().ticks(2);

    var busPriDimension = window.ndx.dimension(function (d) {return d.b_price;});
    var busPriGroup = busPriDimension.group()

    window.busPriChart.width(chartWidth).height(chartHeight)
        .group(busPriGroup).dimension(busPriDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins(chartMargins)
        .x(d3.scale.linear().domain([0.5, 4]))
        .xUnits(function(){return 50;})
        .gap(1)
        .on('renderlet', function(chart){
            var median = d3.median(window.newData, function(el){return el.b_price;});
            bindPriceText(median, "#busPri_digits");
        })
        .on('postRender', function(chart) {
            drawLabels(chart, "PRICE LEVEL", "# OF CELLS");
        })
        .centerBar(true)
        .yAxis().ticks(2);

    var OBIpercentDimension = window.ndx.dimension(function (d) { return d.OBIpercentage; });
    var OBIpercentGroup = OBIpercentDimension.group().reduceSum(function(d){return d.OBIpercentage>0;});

    window.OBIpercent.width(chartWidth).height(100)
        .group(OBIpercentGroup).dimension(OBIpercentDimension)
        .margins(chartMargins)
        .ordinalColors(["#888", "#888", "#888"])
        // .x(d3.scale.ordinal().domain(["0","10","20","30","40","50","60","70","80","90","100"]))
        // .xUnits(dc.units.ordinal)
        .x(d3.scale.linear().domain([0, 100]))
        .xUnits(function(){return 10;})
        .centerBar(true)
        .elasticY(true)
        // .y(d3.scale.linear().domain([0, 1000]))              
        // .on('renderlet', function(_chart){
        //   _chart.selectAll("rect.bar").on("click", _chart.onClick);
        // })
        // .yAxisLabel("Cells", 10)
        .on('renderlet', function(chart){
            var OBIpercent_digits = d3.mean(window.newData, function(el){return el.OBIpercentage>0;});
            bindSmallText((OBIpercent_digits/(24)*100).toFixed(2), "#OBIpercent_digits");

        })
        .on('postRender', function(chart) {
            chart.svg().append('text').attr('class', 'y-label').attr('text-anchor', 'middle')
                .attr('x', -60).attr('y', 35).attr('dy', '-25').attr('transform', 'rotate(-90)')
                .text('# OF CELLS').style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
                .style("font-size", "8px");

            chart.svg().append('text').attr('class', 'x-label').attr('text-anchor', 'middle')
                .attr('x', 170).attr('y', 120).attr('dy', '-25')
                .text('PERCENTAGE OF OPEN BUSINESSES').style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
                .style("font-size", "8px")

            updateOBI(6,18);
        }) 
        .yAxis().ticks(2);


    var OBIaverageDimension = window.ndx.dimension(function (d) { return d.OBIaverage });
    var OBIaverageGroup = OBIaverageDimension.group();
    var appendableObiAvg = true;
    window.OBIaverage.width(chartWidth).height(100)
        .group(OBIaverageGroup).dimension(OBIaverageDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .margins(chartMargins)
        .x(d3.scale.linear().domain([1, 150]))
        //.y(d3.scale.linear().domain([0, 800]))        
        .centerBar(true)
        .elasticY(true)
        .gap(1)
        .brushOn(true)
        .on('renderlet', function(chart){
            var OBIaverage_digits = d3.mean(window.newData, function(el){return el.OBIaverage>0;});
            bindSmallText((OBIaverage_digits/(24)).toFixed(2), "#OBIaverage_digits");

        })
        .on('postRender', function(chart) {
            chart.svg().append('text').attr('class', 'y-label').attr('text-anchor', 'middle')
                .attr('x', -60).attr('y', 35).attr('dy', '-25').attr('transform', 'rotate(-90)')
                .text('# OF CELLS').style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
                .style("font-size", "8px");

            chart.svg().append('text').attr('class', 'x-label').attr('text-anchor', 'middle')
                .attr('x', 170).attr('y', 120).attr('dy', '-25')
                .text('AVERAGE # OF OPEN BUSINESSES').style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
                .style("font-size", "8px");
        }) 
        .yAxis().ticks(2)



    busDivChart.width(chartWidthBusDiv).height(chartHeightBusDiv*2)
        .group(busDivGroup).dimension(busDivDimension)
        .ordinalColors(["#aaaaaa"])
        .margins({top: 0, left: 50, right: 10, bottom: 20})
        .x(d3.scale.linear().domain([0.5, 4.5]))
        .y(d3.scale.linear().domain([0, 1]))
        //.r(d3.scale.linear().domain([0, window.count*5]))
        .colors(["#808080"])
        //.elasticRadius([true])
        .keyAccessor(function (p) {
            return p.key;
        })
        .valueAccessor(function (p) {
            return 0.5;
        })
        .radiusValueAccessor(function (p) {
            return p.value/window.count*chartHeightBusDiv*4/5;
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

    /* Places chart
     * 
    */

    var placesDimension = window.ndx.dimension(function (d) { 
        if (d.places>100) return 100; 
        else return d.places });
    var placesGroup = placesDimension.group()
    var appendableP = true;

    placesChart.width(chartWidth).height(chartHeight)
        .group(placesGroup).dimension(placesDimension)
        .elasticY(true)
        .ordinalColors(["#aaaaaa"])
        .gap(0)
        .margins(chartMargins)
        .x(d3.scale.linear().domain([1, 101]))
        .on('renderlet', function(chart){
            window.newData = placesDimension.top(Infinity);
            var extent = d3.extent(data, function (el) { return el.places>100 ? 100 : el.places});
            var sorted = data.map(function (el) { return el.places>100 ? 100 : el.places}).sort(function(a, b){return a - b});
            var quants = quantileCalc(extent, sorted, actChrtWidth);
            if (appendableP){
                addQuantiles(chart, quants.firstX, quants.secondX, chartHeight, chartMargins, 6);
                appendableP = false;
            }
            
            var median = d3.median(window.newData, function (el) { return el.places>100 ? 100 : el.places});
            var correspond = thisQuantile(median, extent, quants.first, quants.second);

            bindText(correspond, median, "#places_digits", "#places_digits_o");
        })
        .on('postRender', function(chart) {
            drawLabels(chart, "BUSINESSES", "# OF CELLS");
        })
    placesChart.yAxis().ticks(2)


    var chartColors = { "1": "#fff7bc", "2": "#fee391", "3": "#fec44f", "4": "#fee0d2", "5": "#fc9272", "6": "#de2d26", "7": "#deebf7", "8": "#9ecae1", "9": "#3182bd" }
    
    var devIntDimension = window.ndx.dimension(function (d) { return parseInt(d.dev_intensity) });
    var devIntGroup = devIntDimension.group();
    var appendableDev = true;

    devIntChart.width(chartWidth).height(chartHeight)
        .group(devIntGroup).dimension(devIntDimension)
        .ordinalColors(["#888", "#888", "#888"])
        .x(d3.scale.linear().domain([0, maxDInt]))
        .margins(chartMargins)
        .on('renderlet', function(chart){
            window.newData = devIntDimension.top(Infinity);
            var quants = quantileCalcDev(actChrtWidth);
            if (appendableDev){
                addQuantiles(chart, quants.firstX, quants.secondX, chartHeight, chartMargins, 6); //5 25 for devInt
                appendableDev = false;
            }
            var median = d3.median(window.newData, function (el) {return parseInt(el.dev_intensity)});
            var correspond = thisQuantile(median, [0, 100], quants.first, quants.second);

            bindText(correspond, median+"%", "#devInt_digits", "#devInt_digits_o");

        })
        //.yAxisLabel('# OF CELLS')
        .on('postRender', function(chart) {
            drawLabels(chart, "IMPERVIOUS SURFACES / TOTAL COVER", "# OF CELLS");
        })
        .xAxis().ticks(10)
    devIntChart.yAxis().ticks(2)

    /* Average Light Index chart
     * We are calculating predefined ranges to represent low, medium and high intensities of light.
    */

    var ligAveDimension = window.ndx.dimension(function (d) { return parseInt(d.averlight) });
    var laGroup = ligAveDimension.group();
    var appendableLig = true;

    ligAveChart.width(chartWidth).height(chartHeight)
        .group(laGroup).dimension(ligAveDimension).centerBar(true)
        .elasticY(true)
        .colors(d3.scale.linear().domain([0, 200, 400]).range(["#3182bd", "#fee391", "#fc9272"]))
        .colorAccessor(function (d) { return d.key })
        .margins(chartMargins)
        // Draw range lines
        .on('renderlet', function(chart){
            window.newData = ligAveDimension.top(Infinity);
            var extent = d3.extent(data, function(el){return parseInt(el.averlight)});
            var sorted = data.map(function(el){return parseInt(el.averlight)}).sort(function(a, b){return a - b});
            var quants = quantileCalc(extent, sorted, actChrtWidth);

            d3.select("#map .datalayer").remove()
            //var canvas = __canvas

            d3.selectAll(".cellgrids").style("display", "none");
            var mytime = $("#selected_time").text().split(" - ");
            var start = mytime[0];
            var end = mytime[1];

            //console.log(window.newData);

            busTypesChart.bindData(window.newData);
            instaTopicsChart.bindData(window.newData);

            console.log(window.newData.length);

            if (!window.filtered){
                filterCells(window.newData);
            } else {
                displayCells(window.newData);
            }

            if (appendableLig){
                addQuantiles(chart, quants.firstX, quants.secondX, chartHeight, chartMargins, 6);
                appendableLig = false;
            }
            var median = d3.median(window.newData, function(el){return parseInt(el.averlight)} );
            var correspond = thisQuantile(median, extent, quants.first, quants.second);
            bindText(correspond, median, "#light_digits","#light_digits_o");

            /*
            if (selectedCharts.indexOf("business_opening_percent") !== -1) {
                filterhour(window.newData,start,end);
            }*/
            
        })
        .x(d3.scale.linear().domain([0, maxLight]))
        .on('postRender', function(chart) {
            drawLabels(chart, "NANOWATTS/CM²/SR", "# OF CELLS");
        })
        .yAxis().ticks(3);
        

    /* Population Chart
     * We are dividing the distribution into three quantiles: low, medium and high 
    */

    var popDimension = window.ndx.dimension(function (d) { return parseInt(d.population) })
    var pGroup = popDimension.group();
    var topPop = pGroup.top(2);
    var maxPopY = topPop[1].value;
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
            window.newData = popDimension.top(Infinity);
            var extent = d3.extent(data, function(el){return parseInt(el.population)});
            var sorted = data.map(function(el){return parseInt(el.population)}).sort(function(a, b){return a - b});
            var quants = quantileCalc(extent, sorted, actChrtWidth);

            if (appendablePop){
                addQuantiles(chart, quants.firstX, quants.secondX, chartHeight, chartMargins, 6);
                appendablePop = false;
            }
            
            var median = d3.median(window.newData, function(el){return parseInt(el.population)} );
            var correspond = thisQuantile(median, extent, quants.first, quants.second);

            bindText(correspond, median, "#pop_digits", "#pop_digits_o");
            
        })
        .on('postRender', function(chart) {
            drawLabels(chart, "PEOPLE PER ACRE", "# OF CELLS");
        }) 
        .yAxis().ticks(2)
        
    populationChart.xAxis().ticks(4)

    /* Median Household Income Chart
     * We are dividing the distribution into three quantiles: low, medium and high 
    */

    var incomeDimension = window.ndx.dimension(function (d) {
        return parseInt(parseFloat(d.income) / 1000) * 1000;
    });
    var iGroup = incomeDimension.group();

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
            //d3.select("#map .datalayer").remove()
            //var canvas = __canvas

            //d3.selectAll(".cellgrids").style("display", "none");
            //var mytime = $("#selected_time").text().split(" - ");
            //var start = mytime[0];
            //var end = mytime[1];

            //filterhour(window.newData,start,end);

            var extent = d3.extent(data, function(el){return parseInt(parseFloat(el.income) / 1000) * 1000});
            var sorted = data.map(function(el){return parseInt(parseFloat(el.income) / 1000) * 1000}).sort(function(a, b){return a - b});
            var quants = quantileCalc(extent, sorted, actChrtWidth);

            if (appendableInc){
                addQuantiles(chart, quants.firstX, quants.secondX, chartHeight, chartMargins, 6); // 5, 5
                appendableInc = false;
            }

            var median = d3.median(window.newData, function(el){return parseInt(parseFloat(el.income) / 1000) * 1000;});
            var correspond = thisQuantile(median, extent, quants.first, quants.second);
            bindText(correspond, median, "#income_digits", "#income_digits_o");

        })
        .x(d3.scale.linear().domain([1, window.count]))
        .on('postRender', function(chart) {
            drawLabels(chart, "DOLLARS", "# OF CELLS");
        })
        //.y(d3.scale.linear().domain([1, maxIncY])); //max was 1000

    incomeChart.yAxis().ticks(2)
    incomeChart.xAxis().ticks(4)


    //////////////////////////////////// Business Types Chart ///////////////////////////////////

    busTypesChart.bindOriginalData(data);
    //busTypesChart.bindData(window.newData);
    busTypesChart.updateElements(typeSums);

    //////////////////////////////////// Instagram Topics Chart /////////////////////////////////

    instaTopicsChart.bindOriginalData(data);
    //instaTopicsChart.bindData(window.newData);
    instaTopicsChart.updateElements(topicSums);

    //////////////////////////////////// Data Count /////////////////////////////////

    dc.dataCount(".dc-data-count")
        .dimension(window.ndx)
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
            $("#export_btn").html("EXPORT"+" "+"("+" "+theCount+" "+ "Cells"+" "+")");
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
    d3.select("#light_digits_o").text(d.averlight);
    $("#instagram_plc").hide();
    $("#instagram_plc0").hide();

    var cell_id = d.cell_id;

    // Needs a change with ref(MSA_1/cell_id) ..
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


    busTypesChart.assignSelect(true);
    busTypesChart.updateElements(d);


    instaTopicsChart.assignSelect(true);
    instaTopicsChart.updateElements(d);

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
    d3.select("#light_digits_o").text(d3.select("#light_digits_o").attr("sv_val"));
    updateZoomedChart(selectedCharts);
    /*
    d3.select("#street_view").style("opacity", "1");
    d3.select("#street_view").style("position", "relative");
    d3.select("#street_view").style("display", "none"); */

    busTypesChart.assignSelect(false);
    instaTopicsChart.assignSelect(false);
    busTypesChart.updateElements(window.typesData);
    instaTopicsChart.updateElements(window.topicsData);

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

    //d3.select("#street_view").style("opacity", "1");
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
    //d3.select("#streetview_window").style("opacity", "1");
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
//  updateChart(selectedCharts)                                               //
//                                                                            //
//  Selecting which charts show on the right panel                            //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function updateChart(selectedCharts) {
    window.location.href = initurl.split("*")[0] + "*" + selectedCharts.join("|");
    d3.selectAll(".dc-chart").style("display", "none");
    d3.select(".dc-data-count").style("display", "none");
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
        //timeSelectorReset(); //reset the time selector

        filterCells(window.newData);
        $('#timeSelectorReset').css('opacity', 0); // hide the specific button
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
    var start = 6; //starting point of brush on chart  // 0
    var end = 18; //ending point of brush on chart  // 24
    var start0 = 0; //starting point for code before anyone interacts with brush  // 0
    var end0 = 24; //ending point for code before anyone interacts with brush // 24
    var margin = { top: 20, left: 30, right: 0, bottom: 0 },
        width = 300,
        height = 32;

    var svg = d3.select("#time_selector").append("svg")
        .attr('id', 'time_selector')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("rect")
	    .attr("width", width-30)
	    .attr("height", 2)
        .attr("fill", "rgb(50,50,50)").attr("stroke","rgba(255,255,255,0.3)");

	var context = svg.append('g')
		.attr('class', 'context');

	var x = d3.scale.linear()
        .domain([start0,end0])
		.range([0, width-30]);

	var brush = d3.svg.brush()
		.x(x).extent([start,end])
		.on('brushend', brushend);

	context.append('g')
		.attr('class', 'brushItem')
		.call(brush)
		.selectAll('rect')
		.attr('y', -15)
		.attr('height', 30);

	svg.append("g")
	    .attr("class", "x axis hour myhour")
	    .call(d3.svg.axis().tickValues([0,3,6,9,12,15,18,21,24]).tickSize(10,0)
	      .scale(x)
	      .orient("bottom"))
	  .selectAll("text")
	    .attr("x", -4).attr("y",20)
	    .style("text-anchor", null);

    d3.select(".extent").attr("height", 29).attr("class", "brushItemRect");
	d3.select(".background").attr("height", 50);
	d3.selectAll(".resize rect").attr("height", 29);
    d3.selectAll(".tick line").style("opacity","0.3");

	function brushend() {
        brush.extent()[0] = Math.round(brush.extent()[0])
        brush.extent()[1] = Math.round(brush.extent()[1])
        var rdstart = Math.round(brush.extent()[0]);
        var rdend = Math.round(brush.extent()[1]);
        
        brush.extent([rdstart,rdend]);
        
        if (rdend - rdstart <= 1){
            //$('#business_opening_percent').find('#selected_time').text(0+" - "+24); // 0 - 24
            //d3.selectAll('.brushItem').select('rect.extent').attr('width', 135).attr('x', 67.5);
            //d3.selectAll('.brushItem').select('g.resize.e').attr("transform", "translate(202.5,0)");
            //d3.selectAll('.brushItem').select('g.resize.w').attr("transform", "translate(67.5,0)");
            //use mbstock example here:
            //filterhour(window.newData, start, end);
            window.filtered = false;
            filterCells(window.mydata);
            brush.extent([6, 18]); //rdstart, rdend
            brush(d3.select(".brushItem").transition().duration(500));
            if (selectedCharts.includes("business_opening_average") || selectedCharts.includes("business_opening_percent")) { updateOBI(start,end);} //rdstart, rdend
        }
        else {
            $('#business_opening_percent').find('#selected_time').text(rdstart+" - "+rdend);
            //filterhour(window.newData, rdstart, rdend);
            window.filtered = false;
            filterCells(window.newData);
            if (selectedCharts.includes("business_opening_average") || selectedCharts.includes("business_opening_percent")) { updateOBI(rdstart,rdend);}
        }
	}

}

/*
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  filterhour(data, rdstart, rdend)  --- d3.js ---                           //
//                                                                            //
//  Syncs the map with the selected values after using the time slider        //
//  *We can make this a more generic function by integrating it with the tag  //
//  cloud charts' filtering function*                                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function filterhour(data, rdstart, rdend){
    $('#timeSelectorReset').css('opacity', 1);
    var ave_lit = 0;
    var count_ = 0;
    $('#business_opening_percent').find('#selected_time').text(rdstart+" - "+rdend);
    data.map(function (d) {
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
        ave_lit = Math.round(ave_lit);
        d3.select("#light_digits_o").text(ave_lit);
        d3.select("#light_digits_o").attr("sv_val", ave_lit);
    }

}*/

var filterCells = function(data){

    var selectedTypes = busTypesChart.selectedElements();
    var selectedTopics = instaTopicsChart.selectedElements();
    var typesLen = selectedTypes.length;
    var topicsLen = selectedTopics.length;

    if ((busTypesChart.isTypeSelected() || instaTopicsChart.isTypeSelected())) {
        if (selectedCharts.includes("business_opening_percent")){
            if ((busTypesChart.isTypeSelected() && instaTopicsChart.isTypeSelected())) {
                var filtered = data.filter(function(el){
                    var types = betterReduce(el, selectedTypes);
                    var topics = betterReduce(el, selectedTopics);
                    if ((types == typesLen) && (topics == topicsLen) && el.OBIaverage!=0 ){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
            } else if (busTypesChart.isTypeSelected()) {
                var filtered = data.filter(function(el){
                    var types = betterReduce(el, selectedTypes);
                    if ((types == typesLen) && el.OBIaverage!=0 ){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
            } else {
                var filtered = data.filter(function(el){
                    var topics = betterReduce(el, selectedTopics);
                    if ((topics == topicsLen) && el.OBIaverage!=0 ){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
            } 
    } else {
        if ((busTypesChart.isTypeSelected() && instaTopicsChart.isTypeSelected())) {
                var filtered = data.filter(function(el){
                    var types = betterReduce(el, selectedTypes);
                    var topics = betterReduce(el, selectedTopics);
                    if ((types == typesLen) && (topics == topicsLen)){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
            } else if (busTypesChart.isTypeSelected()) {
                var filtered = data.filter(function(el){
                    var types = betterReduce(el, selectedTypes);
                    if (types == typesLen){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
                //updateNDX(filtered);
            } else {
                var filtered = data.filter(function(el){
                    var topics = betterReduce(el, selectedTopics);
                    if (topics == topicsLen){
                        d3.select("#c" + el.cell_id).style("display", "block");
                        return el;
                    } else {
                        d3.select("#c" + el.cell_id).style("display", "none");
                    }
                })
                updateAndDraw(filtered);
            }
        }
    } else if (selectedCharts.includes("business_opening_percent")) {
        console.log("I should be here!");
        filtered = data.filter(function(el){
            if (el.OBIaverage!=0){
                d3.select("#c" + el.cell_id).style("display", "block");
                return el;
            } else {
                d3.select("#c" + el.cell_id).style("display", "none");
            }
        })
        updateAndDraw(filtered);

    }  else {
        data.map(function(el){
            d3.select("#c" + el.cell_id).style("display", "block");
        })
        updateAndDraw(data);
    } 
}


var displayCells = function(data){
    console.log(data.length);
    data.map(function(el){
        d3.select("#c"+el.cell_id).style("display", "block");
    })
}


function timeSelectorReset() {
    filterhour(window.newData, 6, 18); //0 - 24
};

function timeSelectorResetBack() {
    filterhour(window.newData, 0, 24);
}
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  updateOBI(start, end)  --- dc.js ---                                      //
//                                                                            //
//  Updates the two dc.js charts for the open business values                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function updateOBI(start,end){
    window.ndx.remove();
    window.newData.map(function (d) {
        d.OBIaverage = 0;
        d.count = +d.business_opening_count;
        for (var i=start;i<end;i++){
            if (+d['b_opening_'+i] >0) {
                 d.OBIaverage += +d['b_opening_'+i];   
            }
        }
        if (d.OBIcount > 0) {
            d.OBIpercentage = Math.floor((d.OBIaverage/ (end-start)) / d.OBIcount * 100);
        }
        else {
            d.OBIpercentage = 0;
        }
    });
    window.ndx.add(window.newData);
    //dc.redrawAll();
}


////////////////////////////////////////////////////////////////////////////////


