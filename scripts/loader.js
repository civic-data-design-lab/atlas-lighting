var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight);
var newDiv = d3.select("body").append("div").attr("class","loader")
var svg=newDiv.append("svg").attr("width",width).attr("height",height).attr("class","loader-svg")
    
var gradient = svg.append("defs")
  .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");
    
gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#000030")
    .attr("stop-opacity", 1);

gradient.append("stop")
    .attr("offset", "60%")
    .attr("stop-color", "#555")
    .attr("stop-opacity", 1);

gradient.append("stop")
    .attr("offset", "70%")
    .attr("stop-color", "#000020")
    .attr("stop-opacity", 1);
        
svg.append("rect").attr("x",0).attr("y",40).attr("width",width).attr("height",height).attr("class","loader-gradient")
    .attr("fill","url(#gradient)")
    
    .on("click",function(){
        d3.select(".loader-gradient").remove()
        d3.select(".loader-text").remove()
        d3.select(".loader-svg").remove()
    })
    
var introText = "The Atlas of Lighting measures the value of light in cities through numeric and social interactions showing that light is an indicator of increased social and business activity in cities."

var textDiv = d3.select("body").append("div").attr("class","loader-text")
textDiv.html(introText).style("opacity",0).transition().duration(2000).style("opacity",.6)
textDiv.transition().delay(3000).duration(2000).style("opacity",0).remove()
d3.select(".loader-svg").transition().delay(3000).duration(2000).style("opacity",0).remove()
   
//var textDiv = svg.append("text").text(introText).attr("x",100).attr("y",600).attr("font-size","13px").attr("fill","#fff")
//  .attr("class","loader-text")
//  .attr("opacity",0).transition().duration(3000).attr("opacity",.7)
    
    