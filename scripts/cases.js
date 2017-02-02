'use strict';

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};


// 2d array of functions to be run ([i][j] = case i, page j)
var currCase = -1
var currPage = -1
function showCase(caseNum, pageNum){
	currCase = caseNum
	currPage = pageNum

	if (pageNum == 1) {
		$("#case-navigation .nav-prev").hide()
	} else {
		$("#case-navigation .nav-prev").show()
	}
	switch (caseNum) {
	case 1:
		if (pageNum == 4){
			$("#case-navigation .nav-next").hide()
		} else {
			$("#case-navigation .nav-next").show()
		}

		switch (pageNum) {
		case 1:
			$("#case-text").html(
				'<p>This is Case 1, Page 1. Some text should go here</p>')
			$("#msaB").click()
			// change and manually run change update fn
			$("#xAxisData").val("Population_Change")
			$("#yAxisData").val("GMP_2013")
			d3.select("#xAxisData").on("change")()
			d3.select("#yAxisData").on("change")()
			updateZoomedChart([])
			break;
		case 2:
			$("#case-text").html(
				'<p>Here\'s some new text for page 2</p>')
			$("#mapB").click()
			break;
		case 3:
			$("#case-text").html(
				'<p>Here\'s some new text for page 3</p>')

			$("#map").hide()
			$("#map-info").hide()
			$("#cases").show()

			$("#msaB").click()
			$("#xAxisData").val("Density_2014")
			$("#yAxisData").val("Sum_of_Light_Per_Capita")
			d3.select("#yAxisData").on("change")()
			d3.select("#yAxisData").on("change")()
			break;
		case 4:
			$("#case-text").html(
				'<p>Here\'s some new text for page 4</p>')

			$("#cases").hide()
			$("#map").show()
			$("#map-info").show()
			updateZoomedChart(["income"])
			break;
		}
		break;
	case 2:
		if (pageNum == 7){
			$("#case-navigation .nav-next").hide()
		} else {
			$("#case-navigation .nav-next").show()
		}
		switch (pageNum) {
		case 1:
			$("#case-text").html(
				'<p>It has long been known that in regions with similar levels of development within a single country, the total upward light output of the city is strongly related to its population. The community development level has been found to play a central role in determining both lit area and how much light is emitted per capita. However, differences in lighting intensities between different income groups have received little study. This case study examines the relationship between economic conditions of urban areas and their average radiance of artiﬁcial light at night. In this study,  we used the VIIRS Nighttime Lights dataset, maintained by the Earth Observation Group, NOAA National Geophysical Data Center.  The dataset is used to measure quantity of light from earth’s surface on a radiometric sensor.  The value was calculated for each grid cell by summing the DNB radiance (in nWcm−2·sr−1). The second dataset used is household median income data largely taken from the U.S. Census and American Community Survey. Residents living in upper-income communities made, on average, more than $57,000 per year; those living in middle-income communities made, on average, between $45,000-$57,000 per year; with those living in lower-income communities making less than $45,000 per year.</p>')

			$("#cases").hide()
			$("#map").show()
			__map.setZoom(8);
			__map.setCenter(new mapboxgl.LngLat(-87.39999999999993,41.84692829282653));
			__map.fire("move");
			updateZoomedChart([])
			break;
		case 2:
			$("#case-text").html(
				'<p>This is Case 2, Page 2. Analysis of low income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			$("#map-info").show()
			incomeChart.focus([0,45000])
			updateZoomedChart(["income"])
			break;
		case 3:
			$("#case-text").html(
				'<p>This is Case 2, Page 3. Medium income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			incomeChart.focus([45000,57000])
			break;
		case 4:
			$("#case-text").html(
				'<p>This is Case 2, Page 4. High Income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			incomeChart.focus([57000,250000])
			updateZoomedChart(["income"])
			break;
		case 5:
			$("#case-text").html(
				'<p>This is Case 2, Page 5. Chicago urban high population density with streetview. In Chicago Metropolitan Statistical Area , we see that a large proportion of the high intensity lightings occur within the Cook county, whereas low lighting areas occur in suburban and rural areas.  Cook county has higher population density than outer suburbs, with more of the population living inside multi-floored townhouses and apartment buildings. The urban fabric is dense and street lighting network is tightly connected.</p>')
			incomeChart.focus([0,250000])

			__map.setZoom(13);
			__map.setCenter(new mapboxgl.LngLat(-87.60073880988456,41.80349170325138));
			__map.fire("move");
			$("rect#c259733").d3Click()
			updateZoomedChart(["income", "street_view"])
			break;
		case 6:
			$("#case-text").html(
					'<p>This is Case 2, Page 6. Chicago suburban low population density. On the other hand, suburban areas have lower densities than central cities, dominated by single-family homes on small plots of land or farm fields. Residential and commercial development is separated and dispersed. Eventually, the street lighting becomes more loose and intensity getting concentrated on main streets and shopping malls.</p>')
			
			__map.setZoom(13);
			__map.setCenter(new mapboxgl.LngLat(-87.825248146057,41.829015128986356));
			__map.fire("move");
			$("rect#c252893").d3Click()
			updateZoomedChart(["income", "street_view"])
			break;
		case 7:
			$("#case-text").html(
				'<p>This is Case 2, Page 7. There are at least two speculations that we can raise about lighting intensity pattern in different income groups. First, there is a strong correlation between income and spatial patterns. These spatial patterns directly influence street lighting network, street width, building height, prevalence and typical radiance of commercial facilities which can be the main reason for the variation in lighting intensities. For example, car oriented suburban streets may be simply less brightly lit than walkable city center streets. Second explanation could be the lamp technology (LED vs. sodium lamps) that is in use. It is possible that big proportion of street lighting in the city center is using old technology. Whereas the new settlements in suburban parts might be using LED technologies.</p>')
			$("#map-info").show()

			__map.setZoom(8);
			__map.setCenter(new mapboxgl.LngLat(-87.39999999999993,41.84692829282653));
			__map.fire("move");
			updateZoomedChart([])
			break;
		}
		break;
	default:
		console.log("not handled - case " + caseNum);
	}
}

$("#hide_cases").click(function () {
    $("#cases").hide();
    $("#case-info").hide();
    $("#case-navigation").hide()
    $("#export").show()
    $("#map").show();
    $("#map-info").show();
})

$("#case_studies .data_item").click(function () {
    $("#map").hide();
    $("#map-info").hide();
    $("#map-info .dc-chart").hide()
    $("#export").hide()
    $("#case-navigation").show()
    $("#cases").show();
    $("#case-info").show();
})

$("#case_studies #case_study_1").click(function () {
    $("#case-info #case-2").hide()
    $("#case-info #case-1").show()
    showCase(1, 1)
})
$("#case_studies #case_study_2").click(function () {
    $("#case-info #case-1").hide()
    $("#case-info #case-2").show()
    showCase(2, 1)
})

$("#case-navigation .nav-next").click(function(){
	showCase(currCase, currPage + 1)
})
$("#case-navigation .nav-prev").click(function(){
	showCase(currCase, currPage - 1)
})
