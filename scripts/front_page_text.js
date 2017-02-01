var front_page_text = {
    dataTitle:"MSAs",
    mapTitle:"MAP",
    groupTitle:"GROUPING",
    data:"Is drew am hill from mr. Valley by oh twenty direct me so. Departure defective arranging rapturous ddissimilar me astonished estimating cultivated. On no applauded exquisite my additions. Pronounce add boy estimable nay suspected.",
    map:"Passage its ten led hearted removal cordial. Preference any astonished unreserved mrs. Prosperous understood middletons in conviction an uncommonly do. Supposing so be resolving breakfast am or perfectly. Is drew am hill from mr. Valley by oh twenty direct me so. Departure defective arranging rapturous ddissimilar me astonished estimating cultivated.",
    group:"drew am hill from mr. Valley by oh twenty direct me so. Departure defective arranging rapturous ddissimilar me astonished estimating cultivated. On no applauded exquisite my additions. Pronounce add boy estimable nay"
}

function frontPageText(){
  var pTitleDiv = d3.select("#text").append("div").attr("id","dataTitle").attr("class","subtitle")
        .html(front_page_text["dataTitle"])
    
  var populationDiv = d3.select("#text").append("div").attr("id","dataF")
        .html(front_page_text["data"])
    
  var sTitleDiv = d3.select("#text").append("div").attr("id","mapTitle").attr("class","subtitle")
        .html(front_page_text["mapTitle"])
    
  var selectionDiv = d3.select("#text").append("div").attr("id","mapF")
        .html(front_page_text["map"])
  
    
  var sTitleDiv = d3.select("#text").append("div").attr("id","groupTitle").attr("class","subtitle")
        .html(front_page_text["groupTitle"])
    
  var selectionDiv = d3.select("#text").append("div").attr("id","groupF")
        .html(front_page_text["group"])
}