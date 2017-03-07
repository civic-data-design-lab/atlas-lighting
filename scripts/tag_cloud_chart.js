
/* Generic tag cloud maker for Business types chart and Instagram Topics chart
 * This has the module functionality in order to use the update function.
 * @module tagCloudChart
 * @params chartWidth, chartHeight
*/

var tagCloudChart = function(chartWidth,chartHeight, selection, isInsta) { //"#business_types"

    var that = {};
    var that = Object.create(tagCloudChart.prototype);

    var selectedTypes = [];
    var cellsData = [];
    var dataMemory = {};
    var originalData = [];
    var cellSelected = false;
    var typeSelected = false;
    var isInstagram = isInsta;

    var margin = { top: 0, left: 10, right: 10, bottom: 20 },
        width = chartWidth - margin.right - margin.left, //chartWidth = 390
        height = chartHeight - margin.top - margin.bottom; // chartHeight = 100

    var textMargin = {top:25, left:5, right: 5, bottom:3},
        btwMargin  = 10,
        letterSize = 7.15;

    var t = d3.transition().duration(750);

    var maxTextSize = 32,
        minTextSize = 14;

    var svg = d3.select(selection).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Create an array containing an object
     * with business types and their sum for each city.
     * @method initialFormat2
     * @param {data} Data to be formatted
     */

    var formatObject = function (d) {

        if (!isInstagram){
            var typeSums = [];
            busTypes.map(function(el){
                var typeCount = +d[el] ? +d[el] : 0 ;
                if (typeCount){
                    typeSums.push({
                        category: el, 
                        count: typeCount
                    });
                }
            });
            return typeSums
        } else {
            var topicSums = [];
            instaTopics.map(function(el){
                var topicCount = +d[el] ? +d[el] : 0 ;
                if (topicCount){
                    var newEl = el.replace('insta_', '');
                    topicSums.push({
                        category: newEl, 
                        count: topicCount
                    });
                }
            });
            return topicSums;
        }
    }

    /* Calculate relative size of each text element
     * @method formatData
     * @param {Array} data array
     */

    var formatData = function (data) {

       var elementSums = Array.isArray(data) ? data : formatObject(data);
       
       var maxCount = d3.max(elementSums, function(d) { return d.count;});
       var minCount = d3.min(elementSums, function(d) { return d.count;});
       var countRange = maxCount - minCount;
       var range = maxTextSize - minTextSize;

       var newArr = elementSums.map(function(el, i){
           if (el.count == maxCount){
               return {category:el.category, count: el.count, textSize: maxTextSize};
           } else if (el.count == minCount){
               return {category:el.category, count: el.count, textSize: minTextSize};
           } else {
               var ratio = el.count*1.0/countRange;
               var newTextSize = minTextSize + Math.round(range*ratio);
               return {category:el.category, count: el.count, textSize: newTextSize};
           }
           
       });

        return newArr;
     }


    // Better design is possible, but not urgent.
    /* Calculate x and y values for each text item
     * @method calcXandY
     * @param {Array} data array
     */

     var calcXAndY = function (arr) {

        var firstRow = [],
            secondRow = [],
            thirdRow = [],
            fourthRow = [],
            fifthRow = [],
            sixthRow = [];

        var thirdAlready = [],
            fourthAlready = [],
            fifthAlready = [];
            sixthAlready = [];

        var bestArr = [];
        var newWidth = 0;
        
        var range = maxTextSize - minTextSize;

        var calcedArr = arr.map(function(el){
            var textLength = el.category.length; 
            var ratio = (el.textSize-minTextSize)*1.0/range;
            var actualWidth = Math.round(textLength*(letterSize * (1 + ratio)));// 7.15 is actual size, it can be changed
            if (el.category !== 'monochrome') {
                return {count:el.count, category: el.category, textSize: el.textSize, textWidth:actualWidth};
            } else {
                return {count:el.count, category: el.category, textSize: el.textSize, textWidth:actualWidth+20};
            }
        })

        calcedArr.sort(function(a, b){return b.count - a.count});
        var cpCalcedArr = calcedArr.slice();

        bestArr = calcedArr.map(function(el, i){
            var count = 0;
            for (var j = 0; j < i; j++){
                count += cpCalcedArr[j].textWidth + btwMargin;
            }
            var posX = count + el.textWidth;
            var actualPosX = posX % width;
            var row = Math.floor(posX/width);

            if(row == 0){
                firstRow.push(el);
                if (firstRow.length > 1){
                    return {category:el.category, count: el.count, textSize: el.textSize, x: count, y:0};
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x: 0, y:0}
                }
            } else if (row == 1){
                secondRow.push(el);
                if (secondRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<secondRow.length-1; j++){
                        nCount += secondRow[j].textWidth + btwMargin;
                    }
                    if(Math.floor((nCount + el.textWidth)/width) > 0){
                        secondRow.splice(-1, 1);
                        thirdRow.push(el);
                        if (thirdAlready.length){
                            newWidth = thirdAlready[0].textWidth + btwMargin;
                        } else {
                            thirdAlready.push(el);
                            newWidth = 0;
                        }
                        return {category:el.category, count: el.count, textSize: el.textSize, x:newWidth, y:47};
                    } else { 
                        return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:25};
                    }
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x: 0, y:25};
                }
            } else if (row == 2){
                thirdRow.push(el);
                if (thirdRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<thirdRow.length-1; j++){
                        nCount += thirdRow[j].textWidth + btwMargin;
                    }
                    if(Math.floor((nCount + el.textWidth)/width) > 0){
                        thirdRow.splice(-1, 1);
                        fourthRow.push(el);
                        if (fourthAlready.length){
                            newWidth = fourthAlready[0].textWidth + btwMargin;
                        } else {
                            fourthAlready.push(el);
                            newWidth = 0;
                        }
                        return {category:el.category, count: el.count, textSize: el.textSize, x:newWidth, y:69};
                    } else {
                        return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:47};
                }
               } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x: 0, y:47};
                }
            } else if (row == 3) {
                fourthRow.push(el);
                if (fourthRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<fourthRow.length-1; j++){
                        nCount += fourthRow[j].textWidth + btwMargin;
                    }
                    if(Math.floor((nCount + el.textWidth)/width) > 0){
                        fourthRow.splice(-1, 1);
                        fifthRow.push(el);
                        if (fifthAlready.length) {
                            newWidth = fifthAlready[0].textWidth + btwMargin;
                        } else {
                            fifthAlready.push(el);
                            newWidth = 0;
                        }
                        return {category:el.category, count: el.count, textSize: el.textSize, x:newWidth, y:91};
                    } else {
                        return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:69};
                 }
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:69};
                }
            } else if (row == 4) {
                fifthRow.push(el);
                if (fifthRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<fifthRow.length-1; j++){
                        nCount += fifthRow[j].textWidth + btwMargin;
                    }
                    if(Math.floor((nCount + el.textWidth)/width) > 0){
                        fifthRow.splice(-1, 1);
                        sixthRow.push(el);
                        if (sixthAlready.length) {
                            newWidth = sixthAlready[0].textWidth + btwMargin;
                        } else {
                            sixthAlready.push(el);
                            newWidth = 0;
                        }
                        return {category:el.category, count: el.count, textSize: el.textSize, x:newWidth, y:113};
                    } else {
                        return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:91};
                 }
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:91};
                }



            } else {
                sixthRow.push(el);
                if (sixthRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<sixthRow.length-1; j++){
                        nCount += sixthRow[j].textWidth + btwMargin;
                    }
                    return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:113};
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:113};
                }
            }

        });

        return bestArr;
     } 


    that.convertToObject = function(data){
        cellState = data.map(function(el){
            var val = ($('#c'+el.cell_id+':visible').length == 0) ? 0 : 1 ;
            return {cell_id: el.cell_id, state:val};
        });
        return cellState;

    }

    /* Return boolean value if a type is selected.
     * @method isTypeSelected
     */

     that.selectedElements = function(){
        return selectedTypes;
    }

    /* Return boolean value if a type is selected.
     * @method isTypeSelected
     */

    that.isTypeSelected = function(){
        return typeSelected;
    }

    /* Change boolean value of whether a cell is selected or not
     * @method assignSelect
     * @param {Bool} Truth value
     */

    that.assignSelect = function(boole){
        cellSelected = boole;
    }

    /* Bind cell data to the widget
     * @method bindData
     * @param {Array} Data array
     */

    that.bindData = function(data){
        cellsData = data;
    }

    that.bindPrevData = function(data){
        prevData = data;
    }

    that.getOriginalData = function(){
        return originalData;
    }

    /* Bind original cell data to the widget
     * @method bindData
     * @param {Array} Data array
     */

    that.bindOriginalData = function(data){
        originalData = data;
    }

    /* Select top 3 types/topics for each cell.
     */

    that.topTags = function(d){
        var sums = formatObject(d);
        var sortedSums = sums.sort(function(a, b) {return b.count - a.count});
        sortedSums = sortedSums.filter(function(el){
            if (el.category !== "other") { return el; }
        });
        return sortedSums.length > 2 ? sortedSums.slice(0,3).map(function(el){return el.category}) : sortedSums.map(function(el){return el.category});
    }

    /* Deselect selected tags
     * Release filter and bind Data.
     * @method tagRelease
     */

     that.tagRelease = function(version){
        //console.log("this fired!");
        selectedTypes = [];
        window.filtered = false;
        filterCells(originalData, true);
        $(`#${version} .types-text`).each(function(){
            if ($(this).hasClass("active")){
                $(this).removeClass("active");
                $(this).css("fill-opacity", "0.5");
            }
        })
     }

    /* Update business types widget with new data
     * @method updateElements
     * @param {Array} Data array
     */

    that.updateElements = function(data) {

        var fData = formatData(data);
        var fData = fData.sort(function(a, b) {return b.count - a.count});
        var fiData = calcXAndY(fData);

        var typeSort = g.selectAll("text")
                    .data(fiData);

        //exit pattern
        typeSort.exit()
            .transition(t)
            .style("fill-opacity", 1e-6)
            .remove();

        //update pattern
        typeSort
            .text(function(d){
                return d.category;
            })
            .classed("active", function(d){
                if (selectedTypes.indexOf(d.category) > -1) {
                    d3.select(this).style("fill-opacity", "1");
                    return true
                } else {
                    d3.select(this).style("fill-opacity", "0.5");
                    return false
                };
            })
            .transition(t)
            .style("font-size", function(d) { return d.textSize + "px"; })
            .attr("y", function(d){ return textMargin.top + d.y;})
            .attr("x", function(d) { return textMargin.left + d.x; })

        //enter pattern
        typeSort.enter()
            .append("text")
            .style("font-family", "Ropa Sans")
            .style("font-size", function(d) { return d.textSize + "px"; }) 
            .style("fill", "rgb(32, 192, 226")
            .text(function(d){return d.category;})
            .attr("class", "types-text")
            .classed("active", function(d){
                return (selectedTypes.indexOf(d.category) > -1) ? true : false;
            })
            .attr("y", function(d){ return textMargin.top + d.y;})
            .attr("x", function(d) { return textMargin.left + d.x;})
            .on('mouseover', function(){
                d3.select(this).style("fill-opacity", "1");
            })
            .on('mouseout', function(){
                if (!d3.select(this).classed("active")){
                    d3.select(this).style("fill-opacity", "0.5");
                }
            })
            .on('click', function(){
                    if (d3.select(this).classed("active")) {
                        d3.select(this).classed("active", false)
                        var category = d3.select(this).text();
                        var ind = selectedTypes.indexOf(category);
                        selectedTypes.splice(ind, 1);
                        if (selectedTypes.length === 0){
                            typeSelected = false;
                            window.filtered = false;
                            window.released = true;
                            filterCells(originalData, true);
                        } else {
                            typeSelected = true;
                            window.filtered = false;
                            filterCells(originalData, true);
                        }
                    } else {
                        typeSelected = true;
                        d3.select(this).classed("active", true);
                        var category = d3.select(this).text();
                        selectedTypes.push(category);
                        window.filtered = false;
                        window.released = false;
                        filterCells(cellsData);
                    }
             });
            
    }

    Object.freeze(that);
    return that;

} 

