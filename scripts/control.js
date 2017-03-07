
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  initControl()                                                             //
//                                                                            //
//  Initializing the controls                                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function initControl() {

    var droptop = $("#todrop").offset().top;
    var dropbot = droptop + $("#todrop").height();
    var dropleft = $("#todrop").offset().left;
    var dropright = dropleft + $("#todrop").width();

    $('.data_icon_handle').mouseover(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "block");
    });

    $('.data_icon_handle').mouseout(function(event){
        event.preventDefault();
        $(this).siblings(".data_intro").css("display", "none");

    });

    $('.data_item').draggable({
        drag: function (event, ui) {
            $("#selector").css("width", "100%");
            $("#selector").css("overflow-y", "hidden");
            $("#selector").css("direction", "ltr");
        },

        stop: function (event, ui) {
            $("#selector").css("width", "335px");
            $("#selector").css("overflow-y", "auto");

            if ($(this).attr("style").indexOf("left") > -1) {//get back to original position
                $(this).attr("style", "position: relative;");
            }
        }

    });

    $('#todrop').droppable({
        drop: function (event, ui) {
            $(ui.draggable).attr("style", "position: relative; display: none;");
            // $(ui.draggable).attr("style", "opacity: 0.5;");
            var id = $(ui.draggable).attr("id").split("d_")[1];
            selectedCharts.push(id);
            if (id == "business_types" || id == "instagram_topics"){
                window.tagCharts.push(id);
            }
            updateChart(selectedCharts);
            $(this).css("background-color", "rgba(255,255,255,0)");
            var currentToDropHeight = $('#todrop').css('height');
            $('#todrop').css('height', 'calc(100%-300px)');
            $(this).css("background-color", "rgba(0,0,0,0)");
            $(this).css("border-width", "1px");
            $('.drop_indi').css("color", "rgba(255,255,255,1)");
            $('#todrop > img').removeClass("invert");
        },
        over: function (event, ui) {
            $(this).css("background-color", "rgba(255,255,255,0.6)");
            $(this).css("border-width", "0px");
            $('.drop_indi').css("color", "rgba(0,0,0,1)");
            $('#todrop > img').attr("class", "invert");
        },
        out: function (event, ui) {
            $(this).css("background-color", "rgba(0,0,0,0)");
            $(this).css("border-width", "1px");
            $('.drop_indi').css("color", "rgba(255,255,255,1)");
            $('#todrop > img').removeClass("invert");
        }


    });

    //used to control the left bar tabs
    $(".click_data").click(function () {
        $("#datasets").show()
        $("#case_studies").hide()
        $(this).addClass("selectedTab");
        $(".click_case").removeClass("selectedTab");

    });
    $(".click_case").click(function () {
        $("#datasets").hide()
        $("#case_studies").show();
        $(this).addClass("selectedTab");
        $(".click_data").removeClass("selectedTab");
    });   

    //controls the left bar collapsing and showing
    $(".left_clickbar.datasets>img").click(function () {
        if ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1) {
            //back to selecting mode            
            $(".left_clickbar>img").css("transform", "rotate(0deg)");
            $("#selector").css("width", "335px");
            $("#selector").css("overflow-y", "auto");
            $(".left_back").animate({
                left: "0px"
            }, 300, function () { });
            $("#selector").animate({
                left: "0px"
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "333px"
            }, 300, function () { });
            $("#todrop").show();
            $("#zoomIn").animate({
                left: "345px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "390px"
            }, 300, function () { });
            setTimeout(function(){
               $('.gradient_container').show(); 
           }, 300);
        } else {
            //back to folding mode
            $(".left_clickbar>img").css("transform", "rotate(180deg)");
            $("#selector").css("width", "335px");
            $("#todrop").hide();
            $("#zoomIn").animate({
                left: "50px"
            }, 300, function () { });                
            $("#zoomOut").animate({
                left: "95px"
            }, 300, function () { });    
            $(".left_back").animate({
                left: "-335px",
            }, 300, function () { });
            $("#selector").animate({
                left: "-335px",
            }, 300, function () { });
            $(".slide_hide").animate({
                left: "0px"
            }, 300, function () { });
            setTimeout(function(){
               $('.gradient_container').hide(); 
           }, 100);

        }
    })



    //show cell view
    $(".click_case_right").click(function () {
        $("#map-info").hide();
        $("#report-info").show();
        $(this).addClass("selectedTab");
        $(".fold_bar").removeClass("selectedTab");
    });
    
    //show regional view
    $(".fold_bar").click(function () {
        $("#map-info").show();
        $("#report-info").hide();       
        $(this).addClass("selectedTab");
        $(".click_case_right").removeClass("selectedTab");
        //show instagram likes from left panel
        //$("#d_ins_likes").show();
        //show topics from left panel
        //$("#d_instagram_topics").show();

        if (selectedCharts.indexOf("ins_likes") === -1) {
            $("#d_ins_likes").show()
        }

        if (selectedCharts.indexOf("instagram_topics") === -1) {
            $("#d_instagram_topics").show()
        }



    });   

    // controls the right bar collapsing and showing
    $(".rightbar").click(function(){  
        if(!$(this).attr("style") || ($(this).attr("style") && $(this).attr("style").indexOf("180") > -1)){
            // hide
            $(this).css("transform", "rotate(0deg)");

            $("#info").animate({
                right: "-430px"
            }, 300, function () { });

            $(".fold_bar").animate({
                right: "0px"
            }, 300, function () { });

            $(".right_back").animate({
                right: "-405px"
            }, 300, function () { });            

            $(".right_clickbar").animate({
                right: "0px"
            }, 300, function () { });

            $("#export").animate({
                right: "-430px"
            }, 300, function () { });

        }
        else{
            // show
            $(this).css("transform", "rotate(180deg)");

            $("#info").animate({
                right: "0px"
            }, 300, function () { });

            $(".fold_bar").animate({
                right: "430px"
            }, 300, function () { });

            $(".right_back").animate({
                right: "0px"
            }, 300, function () { });

            $(".right_clickbar").animate({
                right: "430px"
            }, 300, function () { });

            $("#export").animate({
                right: "0px"
            }, 300, function () { });

        }
    });


    //////////////////////////////////// collapse datasets

    $(".toggle-title").click(function(){
        var firstParent = $(this).parents()[0];
        var parent = $(firstParent).parent();
        var myid = $(parent).attr("id");
        var queryId = "#"+myid;
        if (myid == "street_view") {
            $("#frame_for_streets").toggle();
        } else if (myid == "instagram_pics"){
            $("#frame_for_instas").toggle();
        } else {
            $(`${queryId} > .digits`).toggle();
            $(`${queryId} > svg`).toggle();
        }

        $(this).find('#collapseIndicator').toggleClass("selectedCollapseIndicator");
    })

    //////////////////////////////////// .rm dataset from the right panel
    $(".rm_data").click(function(){
        var myid = $(this).parent().parent().parent().parent().attr("id");
        $("#"+myid).hide();
        $("#d_"+myid).show();

        if (myid === "business_types" || myid === "instagram_topics" ) {
            window.tagCharts.splice(window.tagCharts.indexOf(myid),1);
            if (myid === "business_types"){
                busTypesChart.tagRelease("business_types");
            }

            if (myid ==="instagram_topics"){
                instaTopicsChart.tagRelease("instagram_topics");
            }

        }

        var myindex = selectedCharts.indexOf(myid);
        if (myindex > -1) {
            selectedCharts.splice(myindex, 1);
        }
        updateChart(selectedCharts);

        if (myid == "business_opening_percent") {
            //d3.selectAll(".cellgrids").style("display", "none");
            window.filtered = false;
            filterCells(window.mydata);
            //updateAndDraw(window.)
        }

    })

    $(".tag_item").click(function () {

        if ($(this).attr("class").indexOf("selected") > -1) {
            $(".tag_item").removeClass("selected");
            $(".data_item").not("#d_business_opening_average").show();
            $("#d_instagram_pics").hide();
            $("#d_street_view").hide();
            if (currentCity_o === "Chicago") {
                $("#d_instagram_topics").hide();
            }
            updateChart(selectedCharts);
        } else {
            $(".tag_item").removeClass("selected");
            $(this).toggleClass("selected");
            $(".data_item").hide();
            $("." + $(this).attr("id")).show();
            updateChart(selectedCharts);
        }

    });

    $(".data_searchbox input").val("Enter your search term...").css({
       'font-size' : '10px',
       'color' : 'gray'
    });
    $(".data_searchbox input").focus(function () { 
        $(this).val("");
    });
    $(".data_searchbox input").focusout(function () { 
        $(".data_searchbox input").val("Enter your search term..").css({
       'font-size' : '10px',
       'color' : 'gray'
        });
    });
    $(".data_searchbox input").keyup(function () {
        if (!$(this).val()) {
            $(".data_item").show();
        } else {
            $(".data_item").hide();
            $(".data_item[id*='" + $(this).val() + "']").show();
        }
    });

    $("#export_btn").click(function () { //$("#export .bottom_btn")
        $("#export_add").css("display", "block");
        $("#export_add input").val(window.location.href);

        var data = window.newData;
        var csvContent = "";

        csvContent += Object.keys(data[0]).join(",") + "\n";
        data.forEach(function (infoArray, index) {
            var dataString = Object.values(infoArray).join(",");
            csvContent += index < data.length ? dataString + "\n" : dataString;
        });

        var encodedUri = encodeURI(csvContent);
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        var link = document.getElementById("exportcsv");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "exported_data.csv");

    });

    $("#cp_btn").click(function () {
        var copyTextarea = document.querySelector('#export_add input');
        copyTextarea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });
    $("#bk_btn").click(function () {
        $("#export_add").css("display", "none");
    });
}