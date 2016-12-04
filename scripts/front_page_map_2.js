var icons = {
    "Uncategorized":"Uncategorized",
    "New Economy-Quality of Life Hubs":"New_Economy-Quality_of_Life_Hubs",
    "Large-Faster Growth":"Large-Faster_Growth",
    "Growth Magnets":"Growth_Magnets",
    "Rust Belt-Declining":"Rust_Belt-Declining",
    "Large-Slow Growth":"Large-Slow_Growth"
}

var cityTypeColors = {
"5":"#e9c057",
"2":"#e3587b",
"3":"#61d89a",
"4":"#f5955e",
"1":"#20c0e2"
}
var cityType = {
    "1":"Large-Slow Growth",
    "2":"Large-Faster_Growth",
    "3":"Rust Belt-Declining",
    "4":"New_Economy-Quality_of_Life_Hubs",
    "5":"Growth Magnets"
}

var cityCentroids = {
    "Port St. Lucie":{lat:27.273049,lng:-80.358226},
    "Phoenix":{lat:33.448377,lng:-112.074037},
    "Salt Lake City":{lat:40.760779,lng:-111.891047},
    "Cleveland":{lat:41.49932,lng:-81.694361},
    "Pittsburg":{lat:40.440625,lng:-79.995886},
    "Milwaukee":{lat:43.038903,lng:-87.906474},
    "Rochester":{lat:43.16103,lng:-77.610922},
    "Youngstown":{lat:41.09978,lng:-80.649519},
    "Denver":{lat:39.739236,lng:-104.990251},
    "Los Angeles":{lat:34.052234,lng:-118.243685},
    "San Jose":{lat:37.338208,lng:-121.886329},
    "Nashville":{lat:36.162664,lng:-86.781602},
    "Portland":{lat:45.523062,lng:-122.676482},
    "Raleigh":{lat:35.77959,lng:-78.638179},
    "Orlando":{lat:28.538336,lng:-81.379236},
    "Las Vegas":{lat:36.114707,lng:-115.17285},
    "Philadelphia":{lat:39.952584,lng:-75.165222},
    "New York":{lat:40.712784,lng:-74.005941},
    "Chicago":{lat:41.878114,lng:-87.629798},
    "Boston":{lat:42.360083,lng:-71.05888},
    "Washington":{lat:38.907192,lng:-77.036871},
    "Houston":{lat:29.760427,lng:-95.369803},
    "Atlanta":{lat:33.748995,lng:-84.387982}
}
var xSelection = "Sum_of_Light"
var ySelection = "Population_2014"
var rLabel = "Population_2014"
var list= ["Land_Area","MAX","Average_Sum_of_Light","Sum_of_Light","Population_in_2000","Population_2014","Population_Change","Density_2000","Density_2014","Land_Area","GMP_2013","Sum_of_Light_Per_Capita"]
var tip = d3.tip()
    .attr("class","d3-tip")
    .offset([100,60])
function drawKey(keyData){
  //  console.log("key")
    d3.selectAll("#bubble-key svg").remove()
    var size = 30
    var keyArray = []
    for(var i in keyData){
      keyArray.push({"color":keyData[i],"key":i})
    }
    var height = keyArray.length*size+10
    var keySvg=d3.select("#bubble-key").append("svg").attr("width",300).attr("height",height)
    
    keySvg.selectAll("image")
    .data(keyArray)
    .enter()
    .append("svg:image")
    .attr("class",function(d,i){return "_"+i})
    .attr("x",5)
    .attr("y",function(d,i){return i*size+0})
    .attr("width",35)
    .attr("height",35)
    .attr("xlink:href",function(d){
        var fileName = d.key.split(" ").join("_")+".png"
        return "../icons/msaselection/"+fileName})

    keySvg.selectAll("text")
    .data(keyArray)
    .enter()
    .append("text")
    .attr("x",45)
    .attr("y",function(d,i){return i*30+23})
    .text(function(d){
      var keys = Object.keys(groupToWords)
      if(keys.indexOf(d.key)>-1){
          return groupToWords[d.key]
      }
      return d.key})
    .attr("fill",function(d){return d.color})
     .attr("class", function(d){return d.key})
}    

var __nodes = null
var padding = 1;
var __msaOverview = null
 //drawKey(typeColors)
$(function() {
	d3.queue()
		.defer(d3.csv, "../data/groupdata.csv")
        //.defer(d3.csv,"data/city_comparisons_all.csv")
        .defer(d3.json,"../data/us_corrected.json")
		.defer(d3.csv, "../data/msa_overview.csv")
    .await(caseDataDidLoad);
})
function caseDataDidLoad(error,data,us,msaOverview) {
     __msaOverview = msaOverview
    d3.selectAll("#info").style("display","inline")
    var width = 800, height = 600;
    var fill = d3.scale.ordinal().range(['#827d92','#827354','#523536','#72856a','#2a3285','#383435'])
    var svg = d3.select("#frontpage-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    for (var j = 0; j < data.length; j++) {
      data[j].radius = +data[j].value / 3;
      data[j].x = Math.random() * width;
      data[j].y = Math.random() * height;
    }    
    
    svg.call(tip)    
        
        d3.select("#frontpage-map svg").selectAll("circle")
        .data(msaOverview)        
        .enter()
        .append("circle")
        .attr("r",0)
        .attr("cx",300)
        .attr("cy",400)
        .attr("class",function(d){
            return cityType[d.Class].split(" ").join("_")
        })
    d3.select("#centered").append("div").attr("id","chartTitle")
        
        draw('mapB',data,us,msaOverview);

    $( ".radio" ).click(function() {
        $(this).parent().find("label").removeClass("active")
        $(this).addClass('active')
      draw(this.id,data,us,msaOverview);
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
function drawPolygons(geoData){
    var svg = d3.select("#frontpage-map svg")
	var path = d3.geo.path().projection(projection);
    svg.insert("path", ".graticule")
      .datum(topojson.feature(geoData, geoData.objects.land))
      .attr("class", "country")
      .attr("d", path)
		.style("fill","none")
        .style("stroke","#ffffff")
        .style("stroke-width",2)
	    .style("opacity",.5)
      .attr("transform", "translate(80,0)")
          d3.select("#chartTitle").html("MSA Locations")
//svg.insert("path", ".graticule")
//      .datum(topojson.mesh(geoData, geoData.objects.states, function(a, b) { return a !== b; }))
//    
//      //.datum(topojson.feature(geoData, geoData.objects.land))
//    .attr("class", "country")
//    .attr("d", path)
//		.style("fill","none")
//        .style("stroke","#ffffff")
//        .style("stroke-width",1)
//	    .style("opacity",.5)
//      .attr("transform", "translate(80,0)")
    
    ;
}

var projection = d3.geo.albers().scale(1000).center([12, 38.7])
    var force = d3.layout.force()
    .friction(.9)
    .gravity(0.1)
    .charge(-30)
    .start()
var margin = {top: 20, right: 20, bottom: 30, left: 140},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width-30]);

var y = d3.scale.linear()
    .range([height, 30]);

var r = d3.scale.linear()
    .range([5,20]);
var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
.orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(4)
    .orient("left");
function draw (varname,data,map,msaOverview) {
    
      var centers = getCenters(varname, [800, 600],data);
      labels(centers)
   //   force.stop();
      //  var r = d3.scale.linear().range([5,20])

//   r.domain(d3.extent(msaOverview, function(d) {return d["Population_2014"];}));
r.domain([1000000,20000000])
    if(varname == "mapB"){
        d3.selectAll(".country").remove()
        d3.select("#yAxisData").remove()
        d3.select("#xAxisData").remove()
        d3.select("#yAxisArrow").remove()
        d3.select("#xAxisArrow").remove()
        force.stop();
        drawPolygons(map)
        d3.selectAll("circle")
        .data(msaOverview)        
       // .enter()
        //.append("circle")
        .transition()//.delay(100).duration(800)          
        .style("fill",function(d){return cityTypeColors[d.Class]; })
        .attr("r",function(d){
            return r(d[rLabel])
          //  return densityScale(d.density)
        })
        .attr("opacity",.5)
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
        .attr("transform", "translate(80,0)")
        .attr("cursor","pointer")

d3.selectAll("circle")        
        .on("mouseover",function(d){
          var tipText = formatTip(d)
          tip.html(tipText)
            tip.show()})
        .on("mouseout",function(){tip.hide()})

        d3.selectAll(".axis").remove()
        drawKey(typeColors)  
 //       force.stop();        
//    }else if(varname =="group"){
//        d3.select("#yAxisData").remove()
//        d3.select("#xAxisData").remove()
//        force.on("tick", tick(centers, varname,data));
//        
//        d3.selectAll(".country").remove()
//         force.resume();
//        var rScale = d3.scale.linear().domain([10,100]).range([3,25])
//        d3.selectAll("circle").data(data)
//                // .transition().duration(100)          
//        .style("fill",function(d){ return cityNameColors[d.name]})
//        .attr("r",function(d){return rScale(parseFloat(d.value))})
//        .attr("opacity",1)
//        d3.selectAll(".axis").remove()
//        drawKey(cityNameColors)
//        labels(centers)
//        .attr("cursor","pointer")
//        d3.selectAll("#groupF").style("fill","red")        
    }else if(varname =="msaB"){

             force.stop();
        d3.selectAll(".country").remove()
        d3.selectAll(".axis").remove()         
             force.resume();
        d3.select("#yAxisData").remove()
        d3.select("#xAxisData").remove()
        d3.select("#yAxisArrow").remove()
        d3.select("#xAxisArrow").remove()
        drawCustomBubbleChart(__msaOverview)
    }
}
var units = {
  "value":"value unit",
  "density":"# per sq mile",
  "gmp":"$",
  "popChange":"%"
}



function drawCustomBubbleChart(data){

    var svg = d3.select("#frontpage-map svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

  d3.selectAll("#frontpage-map circle").remove()
                
  generateAxis(list,data,xSelection,ySelection,rLabel)
  drawChart(data,xSelection,ySelection,rLabel)
    
}
function generateAxis(list,data,xSelection,ySelection,rLabel){
    d3.select("#centered").append("select").attr("id","xAxisData")
    d3.select("#centered").append("select").attr("id","yAxisData")
          d3.select("#chartTitle").html(ySelection.split("_").join(" ")+"/"+xSelection.split("_").join(" "))

    d3.select("#centered").append("svg").attr("id","xAxisArrow")
    .attr("width",8)
    .attr("height",8)
    .append("svg:image")
    .attr("x",0)
    .attr("y",0)
    .attr("width",8)
    .attr("height",8)
    .attr("xlink:href","../icons/arrow_down.png")

    d3.select("#centered").append("svg").attr("id","yAxisArrow")
    .attr("width",8)
    .attr("height",8)
    .append("svg:image")
    .attr("x",0)
    .attr("y",0)
    .attr("width",8)
    .attr("height",8)
    .attr("xlink:href","../icons/arrow_down.png")

      for(var i in list){
          var label = list[i].split("_").join(" ")
        d3.select("#yAxisData").append("option").attr("value",list[i])
          .text(label)
          .attr("id",list[i])
              d3.select("#"+ySelection).attr("selected","selected")
      }
      for(var i in list){
          var label = list[i].split("_").join(" ")
          
        d3.select("#xAxisData").append("option").attr("value",list[i]).text(label).attr("id",list[i])
          if(list[i]==xSelection){
              d3.select("#"+xSelection).attr("selected","selected")
          }
      }
      
      d3.select("#xAxisData").on("change",function(){
        xSelection = d3.select(this).property('value')
        update(data,xSelection,ySelection,rLabel)
          d3.select("#chartTitle").html(ySelection.split("_").join(" ")+"/"+xSelection.split("_").join(" "))
      })
      d3.select("#yAxisData").on("change",function(){
        ySelection = d3.select(this).property('value')
        update(data,xSelection,ySelection,rLabel)
          d3.select("#chartTitle").html(ySelection.split("_").join(" ")+"/"+xSelection.split("_").join(" "))
      })

}

function update(data,xLabel,yLabel,rLabel){

  data.forEach(function(d) {
    d[xLabel] = +d[xLabel];
    d[yLabel] = +d[yLabel];
  });
  x.domain(d3.extent(data, function(d) { return d[xLabel];}));  
  y.domain(d3.extent(data, function(d) { return d[yLabel];}));
  //r.domain(d3.extent(data, function(d) { return d[rLabel];}));
r.domain([1000000,20000000])
  
 var svg = d3.select("#frontpage-map svg")
d3.selectAll(".axis").remove()
svg.append("g")
    .attr("class", "x axis")
      .attr("transform", "translate(80," + height + ")")
    .call(xAxis)
  .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text(units[xLabel]);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
      .attr("transform", "translate(80,0)")
    
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(units[yLabel])

  d3.selectAll("circle")    
    .transition().duration(1000)
    .attr("cx", function(d) { return x(d[xLabel]); })
    .attr("cy", function(d) { return y(d[yLabel] ); })
      .attr("r", function(d){ return r(d[rLabel]);})
    
}

function drawChart(data,xLabel,yLabel,rLabel){
  var svg = d3.select("#frontpage-map svg")
  
    var tip = d3.tip()
        .attr("class","d3-tip")
        .style("font-size","11px")
        .offset([200,60])
    svg.call(tip)
  
  data.forEach(function(d) {
      d[xLabel] = +d[xLabel];
      d[yLabel] = +d[yLabel];
  });

  x.domain(d3.extent(data, function(d) { return d[xLabel];}));  
  y.domain(d3.extent(data, function(d) { return d[yLabel];}));
//  r.domain(d3.extent(data, function(d) { return d[rLabel];}));
r.domain([1000000,20000000])

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(80," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(units[xLabel]);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .attr("transform", "translate(80,0)")
      
    .append("text")
      .attr("class", "label")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(units[yLabel])

  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("transform", "translate(80,0)")
      .attr("class", xLabel+"_"+yLabel)
      .attr("r", function(d){ return r(d[rLabel]);;})
      .attr("opacity",.5)
      .attr("cx", function(d) { return x(d[xLabel]); })
      .attr("cy", function(d) { return y(d[yLabel] ); })
        .style("fill",function(d){return cityTypeColors[d.Class]; })
      .on("mouseover",function(d){
          var tipText = formatTip(d)
          tip.html(tipText)
          tip.show()
      })
      .on("mouseout",function(d){
          tip.hide()
      })
      .attr("cursor","pointer")
      
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#ffffff");

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}
function formatTip(data){

  var formatComma = d3.format("0,000");
  var formatted = ""
  for (var i in data){
      if(i.split("_").join(" ")!="name"){
    formatted+= i.split("_").join(" ")
    formatted+= ": "          
      }
      if(isNaN(formatComma(parseFloat(data[i]).toFixed(2)))!=true){
    formatted+= formatComma(parseFloat(data[i]).toFixed(2))          
      }
      else{
          formatted+=data[i]
      }
    formatted+="</br>"
  }
  
  return formatted
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
    nodes.each(collide(.05,data))
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }
}

function labels (centers) {
var svg = d3.select("#frontpage-map svg")
  svg.selectAll(".label").remove();
  svg.selectAll(".label")
  .data(centers).enter().append("text")
  .attr("class", "label")
  .text(function (d) {return groupToWords[d.name] })
  .attr("transform", function (d) {
    return "translate(" + (d.x + (d.dx / 4)) + ", " + (d.y + 20) + ")";
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