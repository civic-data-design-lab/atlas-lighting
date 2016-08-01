    var tip = d3.tip()
        .attr("class","d3-tip")
        .style("font-size","11px")
        .offset([0,30])

var dataSources = {
    "householdMedianIncome":"link to datasource",
    "lightingIntensity":"link to datasource",
    "populationDensity":"link to datasource",
    "placeDiversity":"link to datasource",
    "placeDensity":"link to datasource",
    "developmentIntensity":"link to datasource"
}

d3.select(".filterTitle")
    .on("mouseover",function(d){
        console.log("show")
        tip.html("show")
        tip.show()
    })