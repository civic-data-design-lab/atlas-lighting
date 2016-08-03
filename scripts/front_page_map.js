$(function() {
	d3.queue()
		.defer(d3.json, "/us_json")
        .defer(d3.json, "/city_comparisons_all")
        .defer(d3.json, "/groups_data")
    .await(dataDidLoad);
})

var projection = d3.geo.mercator().scale(660).center([-83,39])
var densityScale = d3.scale.linear().domain([3000,31684]).range([5,50])
var map = true

function dataDidLoad(error,states,cities,groups) {
    var mapSvg = d3.select("#map").append("svg").attr("width",800).attr("height",800)
    drawPolygons(states)
    var formatedData = formatCitiesData(cities)
    drawDotsMap(formatedData)
//    drawChart(formatedData)
    drawControls(formatedData,groups)
    //drawChart(data)
}
function drawPolygons(geoData,svg){
    var svg = d3.select("#map svg")
	var path = d3.geo.path().projection(projection);
    svg.insert("path", ".graticule")
      .datum(topojson.feature(geoData, geoData.objects.land))
      .attr("class", "country")
      .attr("d", path)
		.style("fill","#000")
        .style("stroke","#ffffff")
        .style("stroke-width",1)
	    .style("opacity",1)
}
function jsonToArray(data){
    var array = []
    for(var i in data){
        array.push([i,data[i]])
    }
    return array
}
function drawChart(data){
    
    var arrayFormatData = jsonToArray(data)
    var popScale = d3.scale.linear().domain([-15,90]).range([10,680])
    var gmpScale = d3.scale.linear().domain([0,1800000]).range([480,10])

    var xAxis = d3.svg.axis()
        .scale(popScale)
        .orient("bottom")
    
    var yAxis = d3.svg.axis()
        .scale(gmpScale)
        .orient("left") 
       
    d3.selectAll(".country").transition().duration(1000).style("opacity",0)
    var tip = d3.tip()
        .attr("class","d3-tip")
        .style("font-size","11px")
        .offset([0,30])
    var svg = d3.select("#map svg")
    svg.call(tip)
    d3.selectAll(".dots").transition().duration(1000)
        .attr("cy",function(d){
            var gmp = data[fullName[d[0]]].gmp
            return gmpScale(gmp)
        })
        .attr("cx",function(d){
            var popChange = data[fullName[d[0]]].popChange
            return popScale(popChange)
        })
        .attr("transform","translate(60,0)")
        //.on("mouseover",function(d){console.log(d)})
        
    svg.selectAll(".otherCities")
        .data(arrayFormatData)
        .enter()
        .append("circle")
        .attr("class","otherCities")
        .attr("cx",function(d){
            var popChange = d[1].popChange
            return popScale(popChange)
        })
        .attr("cy",function(d){
            var gmp = d[1].gmp
            return gmpScale(gmp)
        })
        .attr("r",function(d){
            return densityScale(d[1].density)
        })
        .style("opacity",0)
        .attr("fill",function(d){
            return typeColors[typeNumberToText[d[1].type]]
        })
        .attr("transform","translate(60,0)")
        .on("mouseover",function(d){
           // console.log(d)
            var tipText = tipTextFormat(d)
            tip.html(tipText)
            tip.show()
        })
        .on("mouseout",function(d){
            tip.hide()
        })
        .transition()
        .duration(1000)
        .style("opacity",.2)
        
   svg.append("g").attr("class","x axis").call(xAxis).attr("transform","translate(60,480)")
   svg.append("g").attr("class","y axis").call(yAxis).attr("transform","translate(60,0)")
   svg.append("text").attr("class","axis").text("Population Change (2000-2014)").attr("x",0).attr("y",0).attr("transform","translate(290,515)").attr("fill","#fff")
   svg.append("text").attr("class","axis").text("Gross Metropolitan Product(millions of dollars,2013)").attr("x",0).attr("y",0).attr("transform","translate(70,30)").attr("fill","#fff")

}
function tipTextFormat(data){
    var text = data[0]+"</br>"
    for(var i in data[1]){
        text+=i
        text+=": "
        text+=data[1][i]
        text+="</br>"
    }
    return text
}

function drawControls(data,groups){    
    var svg = d3.select("#map svg")
   // svg.append("rect")
   // .attr("x",300)
   // .attr("y",550)
   // .attr("width",50)
   // .attr("height",20)
   // .attr("rx",10)
   // .attr("ry",10)
   // .style("stroke","#fff")
   // .style("stroke-width",2)
   // .attr("cursor","pointer")
   // .on("click",function(){ toggle(data)})

    svg.append("text").text("MAP").attr("x",165).attr("y",565).style("fill","#fff").attr("cursor","pointer")
    .on("click",function(){
        d3.select(".toggle").transition().attr("cx",150)
        if(map != true){
        map = true
        transformMap(data)
        }
      
    })
    svg.append("text").text("DATA").attr("x",265).attr("y",565).style("fill","#fff").attr("cursor","pointer")
    .on("click",function(){
        d3.select(".toggle").transition().attr("cx",250)
        if(map != false){
        map = false
        d3.selectAll(".otherCities").transition().style("opacity",.2)
        drawChart(data)
        }
    })

    svg.append("text").text("GROUPS").attr("x",365).attr("y",565).style("fill","#fff").attr("cursor","pointer")
    .on("click",function(){
        d3.select(".toggle").transition().attr("cx",350)
        drawGroups(groups)
    })

    svg.append("circle")
    .attr("cx",150)
    .attr("cy",560)
    .attr("r",5)
    .attr("fill","#fff")
    .attr("class","toggle")
   // .on("click",function(){ toggle(data)})
  //  .attr("cursor","pointer")
}
function toggle(data){
    if(map == true){
        console.log("map true, changing")
        d3.select(".toggle").transition().attr("cx",310)
        map = false
        d3.selectAll(".otherCities").transition().style("opacity",.2)
        drawChart(data)

    }else{
        console.log("map false, changing")
        d3.select(".toggle").transition().attr("cx",340)
        map = true
        transformMap(data)

    }
}

function formatCitiesData(cities){
    var dictionary = {}
    for(var i in cities){
        var entry = cities[i]
        var geoName = entry["GeoName"]
        var pop1 = parseFloat(entry["Pop1"].split(",").join(""))
        var pop2 = parseFloat(entry["Pop2"].split(",").join(""))
        var popChange = (pop2-pop1)/pop1*100
        var density1 = parseFloat(entry["Density1"].split(",").join(""))
//        var density2 = parseFloat(entry["Density2"].split(",").join(""))
//        var densityChange = density2-density1
        var gmp = parseInt(entry["GMP2013"])
        var type = entry["class"]
        
        if(density1 != "NaN" && gmp !="NaN"){
            dictionary[geoName]={}
            dictionary[geoName]["popChange"]=popChange
            dictionary[geoName]["density"]=density1
            dictionary[geoName]["gmp"]=gmp
            dictionary[geoName]["type"]=type
        }
        
    }
    return dictionary
}
function transformMap(cities){
    d3.selectAll(".otherCities").style("opacity",0)
    d3.selectAll(".axis").style("opacity",0)
    d3.selectAll(".country").transition().duration(2000).style("opacity",1)
    
    d3.selectAll(".dots").transition().duration(1000)
    .attr("cx",function(d){
        var lat = parseFloat(d[1].lat)
        var lng = parseFloat(d[1].lng)
        var projectedLng = projection([lng,lat])[0]
        return projectedLng
    })
    .attr("cy",function(d){
        var lat = parseFloat(d[1].lat)
        var lng = parseFloat(d[1].lng)
        var projectedLat = projection([lng,lat])[1]
        return projectedLat
    })
}
function drawDotsMap(cities){
  //  console.log(cities)
    var cityCentroidsArray = []
    for(var i in cityCentroids){
        cityCentroidsArray.push([i,cityCentroids[i]])
    }
    var tip = d3.tip()
        .attr("class","d3-tip")
        .style("font-size","11px")
        .offset([0,30])
    
    var svg = d3.select("#map svg")
    svg.call(tip)
    
    svg.selectAll(".dots")
        .data(cityCentroidsArray)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r",function(d){
            var city = fullName[d[0]]
            var density = cities[city]["density"]
            return densityScale(density)
        })
        .attr("cx",function(d){
            var lat = parseFloat(d[1].lat)
            var lng = parseFloat(d[1].lng)
            var projectedLng = projection([lng,lat])[0]
            return projectedLng
        })
        .attr("cy",function(d){
            var lat = parseFloat(d[1].lat)
            var lng = parseFloat(d[1].lng)
            var projectedLat = projection([lng,lat])[1]
            return projectedLat
        })
        .attr("fill",function(d){
            return cityColors[d[0]]
        })
        .attr("cursor","pointer")
	    .style("opacity",.8)
        .on("mouseover",function(d){
            var city = fullName[d[0]]
            var values = cities[city]
            var cityType = typeNumberToText[values.type]
            var tipText = city+"</br>"+values.gmp+"</br>"+cityType
            tip.html(tipText)
            tip.show()
        })
        .on("mouseout",function(d){
            tip.hide()
        })
        
}
function drawGroups(data){
    console.log(data)
    
}

function cluster(alpha) {
    return function(d) {
      var cluster = clusters[d.cluster]
        if (cluster === d) return;
      var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
}
function tick(e) {
    node.each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      //.attr("transform", functon(d) {});
      .attr("transform", function(d) {
        var k = "translate(" + d.x + "," + d.y + ")";
        return k;
      })
}
function collide(alpha) {
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