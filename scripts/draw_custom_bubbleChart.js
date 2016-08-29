var units = {
  "value":"value unit",
  "density":"# per sq mile",
  "gmp":"$",
  "popChange":"%"
}
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);
    
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

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

var xSelection = "PopulationChange"
var ySelection = "SumofLight"
var rLabel = "Population2014"
