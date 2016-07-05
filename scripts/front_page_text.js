var front_page_text = {
    selectionTitle:"SELECTION FACTORS AND METHODOLOGICAL PROCESS",
    populationTitle:"POPULATION GROWTH AS PROXY",
    selection:"",
    population:"The highest growth rates int he U.S. are focused on these MSAs Raleigh-Cary is often ranked first in job growth, given its strong research universities, healthcare, and tech sectors. All the MSAs in this group are located in the South or West, or the Sun Belt. THis term has some associations with retirement populations, which is still relevant for places like Port St. Lucie, FL. However, the continued robustness of the growth in tech, entertainment, and health sectors mark many of these MSAs as maturing urban areas."
}

function frontPageText(){
  var pTitleDiv = d3.select("#text").append("div").attr("id","pTitle").attr("class","subtitle")
  var populationDiv = d3.select("#text").append("div").attr("id","population")
  var sTitleDiv = d3.select("#text").append("div").attr("id","sTitle").attr("class","subtitle")
  var selectionDiv = d3.select("#text").append("div").attr("id","selection")
  
  pTitleDiv.html(front_page_text["populationTitle"])
  sTitleDiv.html(front_page_text["selectionTitle"])
  
  populationDiv.html(front_page_text["population"])
  selectionDiv.html(front_page_text["selection"])
}
frontPageText()