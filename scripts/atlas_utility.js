
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






