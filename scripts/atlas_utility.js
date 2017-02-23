
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  Utility functions                                                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function updateAndDraw(data){
    window.filtered = true;
    window.ndx.remove();
    window.ndx.add(data);
    dc.redrawAll();
}

function updateNDX(data){
    window.ndx.remove();
    window.ndx.add(data);
}


/* Reduce function for tagCloud charts.
 */

var betterReduce = function(el, elements){
    var reduced = elements.reduce(function(acc, e){
        return el[e] ? (acc + 1) : acc ;
    }, 0);
    return reduced
}

/* Reduce function for tagCloud charts.
 */

var betterReduceInsta = function(el, elements){
    var reduced = elements.reduce(function(acc, e){
        var newE = 'insta_'+e;
        return el[newE] ? (acc + 1) : acc ;
    }, 0);
    return reduced
}



/* Convert Thousands to K format.
 */

function kFormatter(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num
}

/* Utility function to remove empty bins.
 */

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}

/* Utility function to remove selected bins.
 */

function remove_small_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value > 1;
            });
        }
    };
}

/* Utility function to bind text to a DOM element.
 */

var bindText = function(quanText, median, selection_1, selection_2){
    if (quanText === "MEDIUM"){
        $(selection_1).css("font-size", "14px");
    } else {
        $(selection_1).css("font-size", "24px");
    }
    $(selection_1).html(quanText);
    $(selection_1).attr("sv_val", quanText);
    var newText =`${kFormatter(median)}`;
    $(selection_2).html(newText);
    $(selection_2).attr("sv_val", newText);
}


/* Utility function to bind text to a DOM element.
 */

var bindText2 = function(quanText, selection){
    if (quanText === "MEDIUM"){
        $(selection).css("font-size", "14px");
    } else {
        $(selection).css("font-size", "24px");
    }
    $(selection).html(quanText);
    $(selection).attr("sv_val", quanText);
}

/* Utility function to bind text to a DOM element.
 */

var bindDollarText = function(median, selection){
    var newText =`${median}K`;
    $(selection).html(newText);
    $(selection).attr("sv_val", newText);
}

/* Utility function to bind text to a DOM element.
 */


var bindSmallText = function(median, selection){
    var newText =`${median}K`;
    $(selection).html(newText);
    $(selection).attr("sv_val", newText);
}

/* Utility function to bind text to a DOM element.
 */


var bindSmallText2 = function(text, selection){
    var newText =`${text}`;
    $(selection).html(newText);
    $(selection).attr("sv_val", newText);
}


/* Utility function to bind text to the businessPrice chart.
 */

var bindPriceText = function(median, selection){
    var newText =`${median}x$`;
    $(selection).html(newText);
    $(selection).attr("sv_val", newText);
}

/* Utility function to bind text to a DOM element.
 */

var bindInstaText = function(median, selection_1){
    if (median == 0){
        var newText = `>${median}`
    } else {
        var newText = `${median}`
    }

    $(selection_1).html(newText);
    $(selection_1).attr("sv_val", newText);
}

/* Utility function to move a d3 element back in appearance order.
 */

d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

/* Draws x and y axis labels to a dc chart.
 * @method drawLabels
 * @param {Object} chart
 * @param {String} x_text
 * @param {String} y_text
 */

var drawLabels = function(chart, x_text, y_text){ 
    chart.svg().append('text').attr('class', 'y-label').attr('text-anchor', 'middle')
        .attr('x', -60).attr('y', 35).attr('dy', '-25').attr('transform', 'rotate(-90)')
        .text(y_text).style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
        .style("font-size", "8px")
    chart.svg().append('text').attr('class', 'x-label').attr('text-anchor', 'middle')
        .attr('x', 170).attr('y', 138).attr('dy', '0')
        .text(x_text).style("fill", "white").style("font-family", "Dosis").style("font-weight", "300")
        .style("font-size", "8px")
}


/* Function for drawing Quantile Lines on the selected chart.
 * @method addQuantiles
 * @param {Object} chart
 * @param {Number} firstQ
 * @param {Number} secondQ
 * @param {Number} b -Offset parameter
 * @param {Number} c -Offset parameter
 * @param {Number} chrtHeight
 * @param {Object} chrtMargins
 * @param {Number} fontSize 
 */

function addQuantiles(chart, firstQ, secondQ, chrtHeight, chrtMargins, fontSize) {
        chart.select("svg")
             .append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")")
             .append("line")
             .attr("x1", firstQ)
             .attr("y1", 0)
             .attr("x2", firstQ)
             .attr("y2", chrtHeight - chrtMargins.bottom - chrtMargins.top)
             .style("stroke", "lightgrey")
             .style("stroke-width", "1.6")
             .style("stroke-dasharray", "4");
             
        chart.select("svg")
             .append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")")
             .append("line")
             .attr("x1", secondQ)
             .attr("y1", 0)
             .attr("x2", secondQ)
             .attr("y2", chrtHeight - chrtMargins.bottom - chrtMargins.top)
             .style("stroke", "lightgrey")
             .style("stroke-width", "1.6")
             .style("stroke-dasharray", "4");
        
        if ((secondQ - firstQ) > 30) {
            var tConst = (firstQ/2)-6;
            var tConst2 = (secondQ - firstQ)/2;
            var tConst3 = (270 - secondQ)/2;
            var texts = [{text:"LOW", x: tConst}, { text:"MEDIUM", x: firstQ + tConst2 - 12}, {text:"HIGH",x:secondQ + tConst3 - 7}];
            var g = chart.select("svg").append("g").attr("transform", "translate(" + chrtMargins.left + "," + chrtMargins.top + ")");
            var newChart = g.selectAll("text").data(texts);
            
            newChart.enter()
             .append("text")
             .text(function(el){return el.text;})
             .attr("y", chrtMargins.top ) //chrtHeight -chrtMargins.bottom -2
             .attr("x", function(el){return el.x})
             .style("font-family", "Dosis")
             .style("font-size", fontSize + "px") // 3 for Lighting Average
             .style("fill", "#20C0E2"); //#20C0E2

     };
};

/* Calculates which quantile given selections' median fall into.
 * @method thisQuantile
 * @param {Array} Data
 */

var thisQuantile = function(median, extent, firstQ, secondQ){
   if (median >= extent[0] && median <= firstQ){
       return "LOW";
   } else if (median > firstQ && median <= secondQ){
       return "MEDIUM";
   } else {
       return "HIGH"
   }
}

/* Calculates quantiles
 * @method quantileCalc
 * @param {Array}
 * @param {Array}
 */

var quantileCalc = function(extent, sorted, width){
    var firstQ = d3.quantile(sorted, 0.33);
    var secondQ = d3.quantile(sorted, 0.66);
    var xOfFirstQ = width*(firstQ/(extent[1]-extent[0]));
    var xOfSecondQ = width*(secondQ/(extent[1]-extent[0]));
    return {firstX: xOfFirstQ, secondX: xOfSecondQ, first:firstQ, second:secondQ}
}

/* Calculates quantiles for Development Intensity chart
 * @method quantileCalc
 * @param {Array}
 * @param {Array}
 */

var quantileCalcDev = function(width){
    return {firstX: width*(1/2), secondX: width*(4/5), first:49, second:79}
}


var recastingHelper = function(data, city) {

    var maxBDiv = null;
    var minBDiv = null;    
    var maxDInt = null;
    var maxLight = null;
    var maxPlaces = null;

    if (city == "Denver") {
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
    
            // Instagram topics recasting
            
            d.insta_advertising = +d.insta_advertising ? +d.insta_advertising : 0;
            d.insta_beverage = +d.insta_beverage ? +d.insta_beverage :0 ;
            d.insta_car = +d.insta_car ? +d.insta_car : 0;
            d.insta_entertainment = +d.insta_entertainment ? +d.insta_entertainment : 0;
            d.insta_family = +d.insta_family ? +d.insta_family : 0;
            d.insta_fashion = +d.insta_fashion ? +d.insta_fashion : 0;
            d.insta_food = +d.insta_food ? +d.insta_food : 0;
            d.insta_interiors = +d.insta_interiors ? +d.insta_interiors : 0;
            d.insta_landscape = +d.insta_landscape ? +d.insta_landscape : 0;
            d.insta_monochrome = +d.insta_monochrome ? +d.insta_monochrome : 0;
            d.insta_nature = +d.insta_nature ? +d.insta_nature : 0;
            d.insta_portrait = +d.insta_portrait ? +d.insta_portrait: 0;
            d.insta_sky = +d.insta_sky ? +d.insta_sky: 0;
            d.insta_sports = +d.insta_sports ? +d.insta_sports: 0;
            
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

        return {maxBDiv: maxBDiv, minBDiv: minBDiv, maxDInt:maxDInt, maxLight: maxLight, maxPlaces: maxPlaces};

    } else if (city == "Sanjose") {
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
    
            // Instagram topics recasting
            d.insta_advertising = +d.insta_advertising ? +d.insta_advertising : 0;
            d.insta_animal = +d.insta_animal ? +d.insta_animal :0 ;
            d.insta_car = +d.insta_car ? +d.insta_car : 0;
            d.insta_entertainment = +d.insta_entertainment ? +d.insta_entertainment : 0;
            d.insta_fashion = +d.insta_fashion ? +d.insta_fashion : 0;
            d.insta_food = +d.insta_food ? +d.insta_food : 0;
            d.insta_group = +d.insta_group ? +d.insta_group : 0;
            d.insta_interiors = +d.insta_interiors ? +d.insta_interiors : 0;
            d.insta_monochrome = +d.insta_monochrome ? +d.insta_monochrome : 0;
            d.insta_nature = +d.insta_nature ? +d.insta_nature : 0;
            d.insta_portrait = +d.insta_portrait ? +d.insta_portrait: 0;
            d.insta_sky = +d.insta_sky ? +d.insta_sky: 0;
            d.insta_sports = +d.insta_sports ? +d.insta_sports: 0;
            
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

        return {maxBDiv: maxBDiv, minBDiv: minBDiv, maxDInt:maxDInt, maxLight: maxLight, maxPlaces: maxPlaces};

    } else if (city == "Pittsburgh"){
        console.log("I should be here!");
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
    
            // Instagram topics recasting
            d.insta_advertising = +d.insta_advertising ? +d.insta_advertising : 0;
            d.insta_animal = +d.insta_animal ? +d.insta_animal :0 ;
            d.insta_architecture = +d.insta_architecture ? +d.insta_architecture : 0;
            d.insta_car = +d.insta_car ? +d.insta_car : 0;
            d.insta_entertainment = +d.insta_entertainment ? +d.insta_entertainment : 0;
            d.insta_family = +d.insta_fashion ? +d.insta_fashion : 0;
            d.insta_fashion = +d.insta_fashion ? +d.insta_fashion : 0;
            d.insta_food = +d.insta_food ? +d.insta_food : 0;
            d.insta_interiors = +d.insta_interiors ? +d.insta_interiors : 0;
            d.insta_monochrome = +d.insta_monochrome ? +d.insta_monochrome : 0;
            d.insta_nature = +d.insta_nature ? +d.insta_nature : 0;
            d.insta_sky = +d.insta_sky ? +d.insta_sky: 0;
            d.insta_sports = +d.insta_sports ? +d.insta_sports: 0;
            
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

        return {maxBDiv: maxBDiv, minBDiv: minBDiv, maxDInt:maxDInt, maxLight: maxLight, maxPlaces: maxPlaces};

    } else {
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

        return {maxBDiv: maxBDiv, minBDiv: minBDiv, maxDInt:maxDInt, maxLight: maxLight, maxPlaces: maxPlaces};
    
    }

}






