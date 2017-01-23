
/* Business types chart
 * This has the module functionality in order to use the update function.
 * @module busTypesChart
 * @params chartWidth, chartHeight
*/

var busTypesChart = function(chartWidth,chartHeight) {

    var that = {};
    var that = Object.create(busTypesChart.prototype);

    var selectedTypes = [];
    var cellsData = [];
    var cellSelected = false;

    var margin = { top: 0, left: 10, right: 10, bottom: 20 },
        width = chartWidth - margin.right - margin.left, //chartWidth = 390
        height = chartHeight - margin.top - margin.bottom; // chartHeight = 100

    var textMargin = {top:25, left:5, right: 5, bottom:3},
        btwMargin  = 10,
        letterSize = 7.15;

    var t = d3.transition().duration(750);

    var maxTextSize = 32,
        minTextSize = 14;

    var svg = d3.select("#business_types").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Creating an array containing an object
     * with business types and their sum for each city.
     * @method initialFormat2
     * @param {data} Data to be formatted
     */

    var formatObject = function (d) {
        var typeSums = [];
        busTypes.forEach(function(el){
            var typeCount = +d[el] ? +d[el] : 0 ;
            if (typeCount){
                typeSums.push({
                    category: el, 
                    count: typeCount
                });
            }
        });
        return typeSums;
    }

    /* Calculate relative size of each text element
     * @method formatData
     * @param {Array} data array
     */

    var formatData = function (data) {

       var typeSums = Array.isArray(data) ? data : formatObject(data);
       
       var maxCount = d3.max(typeSums, function(d) { return d.count;});
       var minCount = d3.min(typeSums, function(d) { return d.count;});
       var countRange = maxCount - minCount;
       var range = maxTextSize - minTextSize;

       var newArr = typeSums.map(function(el, i){
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


    /* Calculate x and y values for each text item
     * @method calcXandY
     * @param {Array} data array
     */

     var calcXAndY = function (arr) {

        var firstRow = [],
            secondRow = [],
            thirdRow = [],
            fourthRow = []

        var bestArr = [];
        
        var range = maxTextSize - minTextSize;

        var calcedArr = arr.map(function(el){
            var textLength = el.category.length; 
            var ratio = (el.textSize-minTextSize)*1.0/range;
            var actualWidth = Math.round(textLength*(letterSize * (1 + ratio)));// 7.15 is actual size, it can be changed
            return {count:el.count, category: el.category, textSize: el.textSize, textWidth:actualWidth};
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

            // Solve the remainder problem here for the first row, there are times when it looks screwed.
            // There are some cases that row is calculated beforehand and the case switches to the corresponding row,
            // Without waiting for the earlier rows. There must be a way to solve this.
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
                        return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:47};
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
                        return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:69};
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:47};
                }
               } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x: 0, y:47};
                }
            } else {
                fourthRow.push(el);
                if (fourthRow.length > 1){
                    var nCount = 0;
                    for (var j=0; j<fourthRow.length-1; j++){
                        nCount += fourthRow[j].textWidth + btwMargin;
                    }
                    return {category:el.category, count: el.count, textSize: el.textSize, x:nCount, y:69};
                } else {
                    return {category:el.category, count: el.count, textSize: el.textSize, x:0, y:69};
                }
            }

        });

        return bestArr;
     } 


    /* Filter grid cells by checking whether they contain at least one business  
     * from selected types.
     * @method filterTypes
     * @param {Array} Data array
     */

    var filterTypes = function(data) {

         d3.selectAll(".cellgrids").style("display", "none");

         var avg_light = 0;
         var count = 0;

         console.log(selectedTypes);

         data.forEach(function(el){
             var total = selectedTypes.reduce(function(acc, e){
                 return el[e] ? (acc + 1) : acc ;
             }, 0);

             if (total == selectedTypes.length){
                 d3.select("#c" + el.cell_id).style("display", "block");
                 avg_light += el.averlight;
                 count ++;
             }
         });

         avg_light /= count;
         avg_light = Math.round(avg_light * 100) / 100
         d3.select("#light_digits").text(avg_light);
         d3.select("#light_digits").attr("sv_val", avg_light);

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

    /* Update business types widget with new data
     * @method updateBusTypes
     * @param {Array} Data array
     */

    that.updateBusTypes = function(data) {

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
                //if (!cellSelected){
                    if (d3.select(this).classed("active")) {
                        d3.select(this).classed("active", false)
                        var category = d3.select(this).text();
                        var ind = selectedTypes.indexOf(category);
                        selectedTypes.splice(ind, 1);
                        filterTypes(cellsData);
                    } else {
                        d3.select(this).classed("active", true);
                        var category = d3.select(this).text();
                        selectedTypes.push(category);
                        filterTypes(cellsData);
                        }
                //} else {
                //    console.log("You can filter by business types if you deselect grid cells")
                //}
             });
            
    }

    Object.freeze(that);
    return that;

} 

