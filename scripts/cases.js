'use strict';

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

function updateAndSelectCharts(charts){
	selectedCharts = charts
	updateZoomedChart(selectedCharts);
}

function resetMapChicago(){
	__map.setZoom(8);
	__map.setCenter(new mapboxgl.LngLat(-87.39999999999993,41.84692829282653));
}

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
			$("#case-navigation .nav-next").hide();
			$("#back_to_map").show();
		} else {
			$("#case-navigation .nav-next").show()
		}

		switch (pageNum) {
		case 1:
			$("#case-text").html(
				'<p>This is Case 1, Page 1. This is Case 1, Page 1. In order to select geographically diverse and economically vibrant set of U.S. cities to best represent the variation of urbanized areas in the country, the team conducted a selection process. Typically, research at this scale focuses on the top 100 MSAs (Metropolitan Statistical Area) by population. This convenient metric accounts for a large portion of the nation&#x27;s population and economy. The research uses one primary cutoff (population) and several factors (pop. growth, pop.-weighted density, and Gross Metropolitan Product) to sort the list of potential MSAs for further study. The rationale and steps in the process are detailed below:</p><p>POPULATION THRESHOLD </p><p>Limiting population is probably the most common feature of research attempting to compare metros statistically. The logic behind segregating the metros into size classes based on population recognizes both the need to compare apples to apples and that scale thresholds exist that impact urban infrastructures, physical form and economic developments. </p><p>POPULATION GROWTH</p><p> The selection process requries a factor that can transparently distinguish between cities that grew historically and those that grow more rapidly in recent times. Thus, we utilize recent population growth (2000-2014) as a factor that can transparently distinguish between cities that grew historically and those that grow more rapidly in recent times. The diversity signifies drastically different approaches to infrastructure creation and usage for these urbanized areas and each should be represented in the final selection set.</p>')
			$("#msaB").click()
			// change and manually run change update fn
			$("#xAxisData").val("Population_Change")
			$("#yAxisData").val("GMP_2013")
			d3.select("#xAxisData").on("change")()
			d3.select("#yAxisData").on("change")()
			updateAndSelectCharts([])
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
			$("#all_charts").css("border-bottom", "0px solid white");
			updateAndSelectCharts(["income"])
			break;
		}
		break;
	case 2:
		if (pageNum == 7){
			$("#case-navigation .nav-next").hide();
			$("#back_to_map").show();
		} else {
			$("#case-navigation .nav-next").show()
		}
		switch (pageNum) {
		case 1:
			$("#case-text").html(
				'<p>It has long been known that in regions with similar levels of development within a single country, the total upward light output of the city is strongly related to its population. The community development level has been found to play a central role in determining both lit area and how much light is emitted per capita. However, differences in lighting intensities between different income groups have received little study. This case study examines the relationship between economic conditions of urban areas and their average radiance of artiﬁcial light at night. In this study,  we used the VIIRS Nighttime Lights dataset, maintained by the Earth Observation Group, NOAA National Geophysical Data Center.  The dataset is used to measure quantity of light from earth’s surface on a radiometric sensor.  The value was calculated for each grid cell by summing the DNB radiance (in nWcm−2·sr−1). The second dataset used is household median income data largely taken from the U.S. Census and American Community Survey. Residents living in upper-income communities made, on average, more than $57,000 per year; those living in middle-income communities made, on average, between $45,000-$57,000 per year; with those living in lower-income communities making less than $45,000 per year.</p>')

			$("#cases").hide()
			$("#map").show()
			updateIncome(0, 250000)
			resetMapChicago()
			updateAndSelectCharts([])
			break;
		case 2:
			$("#case-text").html(
				'<p>This is Case 2, Page 2. Analysis of low income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			$("#map-info").show()
			resetMapChicago()
			updateIncome(0, 58000)
			updateAndSelectCharts(["income"])
			$("#light_average").show();
			break;
		case 3:
			$("#case-text").html(
				'<p>This is Case 2, Page 3. Medium income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			$("#map-info").show()
			resetMapChicago()
			updateIncome(58000,84000)
			updateAndSelectCharts(["income"])
			$("#light_average").show();
			break;
		case 4:
			$("#case-text").html(
				'<p>This is Case 2, Page 4. High Income. The method is simple. First, we define our range from $0 to $45,000 per year in order to select the cells that belong to lower income tier. This gives us an average lighting intensity for the low income cells. We repeat the same procedure for the middle and upper income tiers. Finally, we aggregate all three intensities together to relate them to each other. The values show us that lighting intensity of lighting is inversely proportional to household median income. As income increases, the lighting intensity decreases. This relationship has several implications. </p>')

			resetMapChicago()
			updateIncome(84000, 250000)
			updateAndSelectCharts(["income"])
			$("#light_average").show();
			break;
		case 5:
			$("#case-text").html(
				'<p>This is Case 2, Page 5. Chicago urban high population density with streetview. In Chicago Metropolitan Statistical Area , we see that a large proportion of the high intensity lightings occur within the Cook county, whereas low lighting areas occur in suburban and rural areas.  Cook county has higher population density than outer suburbs, with more of the population living inside multi-floored townhouses and apartment buildings. The urban fabric is dense and street lighting network is tightly connected.</p>')
			updateIncome(0, 250000)
			__map.setZoom(13);
			__map.setCenter(new mapboxgl.LngLat(-87.841285,42.212873)); 
			$("rect#c259733").d3Click()
			updateAndSelectCharts(["income", "street_view"])
			$("#light_average").show();
			break;
		case 6:
			$("#case-text").html(
					'<p>This is Case 2, Page 6. Chicago suburban low population density. On the other hand, suburban areas have lower densities than central cities, dominated by single-family homes on small plots of land or farm fields. Residential and commercial development is separated and dispersed. Eventually, the street lighting becomes more loose and intensity getting concentrated on main streets and shopping malls.</p>')
			
			__map.setZoom(13);
			__map.setCenter(new mapboxgl.LngLat(-87.651257, 41.865412));
			$("rect#c252893").d3Click()
			updateAndSelectCharts(["income", "street_view"])
			$("#light_average").show();
			break;
		case 7:
			$("#case-text").html(
				'<p>This is Case 2, Page 7. There are at least two speculations that we can raise about lighting intensity pattern in different income groups. First, there is a strong correlation between income and spatial patterns. These spatial patterns directly influence street lighting network, street width, building height, prevalence and typical radiance of commercial facilities which can be the main reason for the variation in lighting intensities. For example, car oriented suburban streets may be simply less brightly lit than walkable city center streets. Second explanation could be the lamp technology (LED vs. sodium lamps) that is in use. It is possible that big proportion of street lighting in the city center is using old technology. Whereas the new settlements in suburban parts might be using LED technologies.</p>')
			$("#map-info").show()

			updateAndSelectCharts([])
			resetMapChicago()
			break;
		}
		break;
	default:
		console.log("not handled - case " + caseNum);
	}
}

$(".datasets").click(function () {
	// if in case mode, hide cases
	if ($("#case-info").is(":hidden")) return
	if (window.old_zoom){
		__map.setZoom(window.old_zoom)
		__map.setCenter(window.old_center)
		__map.fire("move")
		window.old_zoom = undefined
	}
    $("#cases").hide();
    $("#case-info").hide();
    $("#case-navigation").hide()
    $("#export").show()
    $("#map").show();
    $("#map-info").show();
    __map.setZoom(8);
    $(".dc-chart").hide();
    $("#light-average").show();
    $("#todrop").show();
})

$("#case_studies .data_item").click(function () {
    $("#map").hide();
    $("#map-info").hide();
    $("#map-info .dc-chart").hide()
    $("#export").hide()
    $("#case-navigation").show()
    $("#cases").show();
    $("#case-info").show();
    $(".dc-chart").hide();
})

$("#case_studies #case_study_1").click(function () {
    $("#case-info #case-2").hide()
    $("#case-info #case-1").show()
    showCase(1, 1)
})

$("#case_studies #case_study_2").click(function () {
	if (window.old_zoom == undefined){
		window.old_zoom = __map.getZoom()
		window.old_center = __map.getCenter()
	}

    $("#case-info #case-1").hide()
    $("#case-info #case-2").show()
    showCase(2, 1)
})

$("#case-navigation .nav-next").click(function(){
	$(".dc-chart").hide();
	$("#todrop").hide();
	showCase(currCase, currPage + 1)
})

$("#case-navigation .nav-prev").click(function(){
	$(".dc-chart").hide();
	showCase(currCase, currPage - 1)
})

$("#back_to_map").click(function(){
	
})


