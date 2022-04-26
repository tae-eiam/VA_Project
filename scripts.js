//----------------------- Variables -----------------------

var chosenDate = new Date("2020-04-06 00:00");
var utilities = "overall";

var runningInterval;
var currentRunningDate;
var startDate = new Date("2020-04-06 00:00");
var endDate = new Date("2020-04-07 00:05");

var timeStampDateFormat = d3.timeFormat("%a %d %H:%M");

var playStatus = false;

var selectedLocation = 1;
var selectedHeatmapTime = new Date("2020-04-06 00:00");

//----------------------- Dataset -----------------------

Promise.all([d3.csv("mc1-data.csv"), d3.csv('mc1-hour-data.csv'), d3.csv('whole-reliabilities.csv')]).then(function(allData) {
    var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
    var formatDate = d3.timeFormat("%Y-%m-%d %H:%M");

    allData[0].forEach(function(d) {
        d.time = formatDate(parseDate(d.time));
        d.overall = +d.overall;
        d.sewer_and_water = +d.sewer_and_water;
        d.power = +d.power;
        d.roads_and_bridges = +d.roads_and_bridges;
        d.medical = +d.medical;
        d.buildings = +d.buildings;
        d.shake_intensity = +d.shake_intensity;
        d.location = +d.location;
        d.one_reliability = +d.one_reliability;
    });

    allData[1].forEach(function(d) {
        d.time = parseDate(d.time);
        d.location1 = d.location1.substring(1, d.location1.length - 1).split(",");
        d.location2 = d.location2.substring(1, d.location2.length - 1).split(",");
        d.location3 = d.location3.substring(1, d.location3.length - 1).split(",");
        d.location4 = d.location4.substring(1, d.location4.length - 1).split(",");
        d.location5 = d.location5.substring(1, d.location5.length - 1).split(",");
        d.location6 = d.location6.substring(1, d.location6.length - 1).split(",");
        d.location7 = d.location7.substring(1, d.location7.length - 1).split(",");
        d.location8 = d.location8.substring(1, d.location8.length - 1).split(",");
        d.location9 = d.location9.substring(1, d.location9.length - 1).split(",");
        d.location10 = d.location10.substring(1, d.location10.length - 1).split(",");
        d.location11 = d.location11.substring(1, d.location11.length - 1).split(",");
        d.location12 = d.location12.substring(1, d.location12.length - 1).split(",");
        d.location13 = d.location13.substring(1, d.location13.length - 1).split(",");
        d.location14 = d.location14.substring(1, d.location14.length - 1).split(",");
        d.location15 = d.location15.substring(1, d.location15.length - 1).split(",");
        d.location16 = d.location16.substring(1, d.location16.length - 1).split(",");
        d.location17 = d.location17.substring(1, d.location17.length - 1).split(",");
        d.location18 = d.location18.substring(1, d.location18.length - 1).split(",");
        d.location19 = d.location19.substring(1, d.location19.length - 1).split(",");
    });

    allData[2].forEach(function(d) {
        d.location = +d.location;
        d.whole_reliability = +d.whole_reliability;
    });

    //----------------------- Map -----------------------

    let svg = d3.select("#map")
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", "45vh");

    let g = svg.append("g");

    var projection = d3.geoMercator()
                        .scale(80000)
                        .center([-119, -0.08])
                        .translate([1490,440]);

    var path = d3.geoPath()
                 .projection(projection);

    d3.json("map.geo.json").then(function(json) {
        g.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("id", (d) => {return d.properties.Id})
         .attr("d", path)
         .attr("class", "map-area")
         .style("stroke", "lightgrey")
         .style("fill", "transparent")
         .on("click", clickMap)
         .on("mouseover", mouseOverMap)
         .on("mouseleave", mouseLeaveMap)
         .on("mousemove", mouseMoveMap);


        d3.select("path[id='" + selectedLocation + "']")
          .style("stroke", "black")
          .style("stroke-width", "2px");

        //----------------------- Map Missing Values -----------------------

        var circleSymbol = d3.symbol().type(d3.symbolCircle).size(100);

        var missingSvg = d3.select("#missing-values")
                            .append("svg")
                            .attr("width", "100%")
                            .attr("height", "100%");

        var missingG = missingSvg.append("g");

        missingG.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("id", (d) => {return "missing" + d.properties.Id})
                .attr("d", circleSymbol)
                .attr("fill", "transparent")
                .attr("transform", function(feature) {
                    switch(feature.properties.Id) {
                        case 1: return "translate(150, 90)";
                        case 2: return "translate(210, 70)";
                        case 3: return "translate(290, 60)";
                        case 4: return "translate(365, 95)";
                        case 5: return "translate(210, 170)";
                        case 6: return "translate(212, 125)";
                        case 7: return "translate(482, 190)";
                        case 8: return "translate(430, 273)";
                        case 9: return "translate(330, 265)";
                        case 10: return "translate(395, 250)";
                        case 11: return "translate(435, 235)";
                        case 12: return "translate(440, 185)";
                        case 13: return "translate(380, 185)";
                        case 14: return "translate(287, 115)";
                        case 15: return "translate(247, 115)";
                        case 16: return "translate(247, 150)";
                        case 17: return "translate(330, 210)";
                        case 18: return "translate(330, 165)";
                        case 19: return "translate(285, 165)";
                    }
                });

        //----------------------- Missing Legend -----------------------

        var missingOrdinal = d3.scaleOrdinal()
                                .domain(["Missing data"])
                                .range(["grey"]);

        var missingSvg = d3.select("#missing-legend")
                            .append("svg")
                            .attr("width", "100%")
                            .attr("height", "100%");

        missingSvg.append("g")
                .attr("class", "legendOrdinal")
                .attr("transform", "translate(10,10)");
  
        var missingLegendOrdinal = d3.legendColor()
                                    .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
                                    .scale(missingOrdinal);
          
        missingSvg.select(".legendOrdinal")
                    .call(missingLegendOrdinal);

        //----------------------- Map Color Legend -----------------------

        var colorOrdinal = d3.scaleOrdinal()
                                .domain(["0.0-2.0", "2.1-4.0", "4.1-6.0", "6.1-8.0", "8.1-10.0"])
                                .range(["#bee7a5", "#ffe87c", "#f6bc66", "#f68c70", "#f55c7a"]);

        var colorSvg = d3.select("#color-legend")
                            .append("svg")
                            .attr("width", "100%")
                            .attr("height", "100%");

        colorSvg.append("g")
                .attr("class", "legendOrdinal")
                .attr("transform", "translate(0,0)");
  
        var legendOrdinal = d3.legendColor()
                                .shape("rect")
                                .shapePadding(2)
                                .shapeWidth(40)
                                .orient("horizontal")
                                .scale(colorOrdinal);
          
        colorSvg.select(".legendOrdinal")
                .call(legendOrdinal);

        //----------------------- DateTimePicker -----------------------

        $(function () {
            $('#date').datetimepicker({
                format : 'YYYY-MM-DD HH:mm',
                defaultDate: "2020-04-06 00:00",
                minDate: "2020-04-06 00:00",
                maxDate: "2020-04-11 00:00",
                useCurrent: false,
                stepping: 5
            });
        });

        $(document).on('dp.change', 'input#date', function() {
            chosenDate = new Date(this.value);
            startDate = new Date(chosenDate);
            endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 24);
            endDate.setMinutes(endDate.getMinutes() + 5);

            if (endDate.getTime() >= new Date("2020-04-11 00:00").getTime()) {
                endDate = new Date("2020-04-11 00:05");
            }

            runPlayer();
            drawHeatmap();
            drawBarChart()
        });

        //----------------------- Utilities -----------------------

        d3.select("#utilities")
        .on("change", function() {
            utilities = this.value;
            runPlayer();
        });

        //----------------------- Time Bar -----------------------
        
        drawTimeBar();

        //----------------------- Play Pause Button -----------------------

        d3.select("#play-button")
          .on("click", clickPlayBtn);

        //----------------------- Heatmap -----------------------

        drawHeatmap();

        //----------------------- Line Chart -----------------------

        drawLineChartLegend();
        drawLineChart();

        //----------------------- Bar Chart -----------------------

        drawBarChartLegend();
        drawBarChart();

        //----------------------- Functions -----------------------

        function clickMap(event, data) {
            d3.selectAll(".map-area")
              .style("stroke", "lightgrey")
              .style("stroke-width", "1px");

            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "2px");

            selectedLocation = data.properties.Id;
            drawHeatmap();
        }

        function mouseOverMap(event, data) {
            d3.select("#tooltip-map")
              .style("display", "block")
              .html(data.properties.Id + ": " + data.properties.Nbrhood);
        }

        function mouseLeaveMap() {
            d3.select("#tooltip-map")
              .style("display", "none");
        }

        function mouseMoveMap(event) {
            var bound = d3.select("#map").node().getBoundingClientRect();

            d3.select("#tooltip-map")
              .style("top", (event.clientY - bound.top) + "px")
              .style("left", (event.clientX - bound.left + 20) + "px");
        }

        function clearMap() {
            g.selectAll("path")
             .style("fill", "transparent");

            missingG.selectAll("path")
                    .attr("fill", "transparent");
        } 
        
        function redrawMap(date = chosenDate) {
            clearMap()

            d3.select("#time-map")
                .html(timeStampDateFormat(date));

            date = formatDate(date);
            var filteredData = filterData(date, utilities);
                    
            filteredData.forEach(function(d) {
                g.select("path[id='" + d[1] +"']")
                    .style("fill", function() { return colors(d[0]); });

                if(!d[0] && d[0] !== 0) {
                    missingG.select("#missing" + d[1])
                            .attr("fill", "grey");
                }
            });
        }

        function clearTimeBar() {
            d3.select("#time-bar > svg").remove();
        }

        function drawTimeBar(date = startDate) {
            clearTimeBar();

            var timeSvg = d3.select("#time-bar")
                        .append("svg")
                        .attr("width", "100%")
                        .attr("height", "50px");

            var timeG = timeSvg.append("g")
                                .attr("transform", "translate(20, 0)");

            var timeWidth = Math.round(timeSvg.node().getBoundingClientRect().width);
            var timeHeight = Math.round(timeSvg.node().getBoundingClientRect().height);

            var timeScale = d3.scaleTime()
                          .domain([startDate, endDate])
                          .range([0, timeWidth - 40]);

            var fiveMinutesData = d3.timeMinute.range(startDate, endDate, 5);
                            
            timeG.append("g")
                    .attr("transform", "translate(0, 30)")
                    .attr("class", "axis")
                    .call(d3.axisBottom(timeScale).ticks(d3.timeHour.every(3)).tickSizeOuter(0));
                    
            timeG.selectAll(".timeBar")
                    .data(fiveMinutesData)
                    .enter()
                    .append("rect")
                    .attr("class", "timeBar")
                    .attr("x", (d) => {return timeScale(d);})
                    .attr("y", 0)
                    .attr("width", (timeWidth - 40) / fiveMinutesData.length)
                    .attr("height", timeHeight - 21)
                    .attr("fill", "#f5f5f5")
                    .on("mouseover", mouseOverTimeBar)
                    .on("mouseleave", mouseLeaveTimeBar)
                    .on("click", clickTimeBar);
   
            timeG.select("rect[x='" + timeScale(date) + "']")
                 .attr("fill", "steelblue");
        }

        function mouseOverTimeBar(event, data) {
            var rect = this.getBoundingClientRect();

            var timeStamp = d3.select("#timestamp")
                                .style("display", "block")
                                .html(timeStampDateFormat(data));

            var tsWidth = timeStamp.node().offsetWidth;
                    
            timeStamp.style("top", (rect.top - 15) + "px")
                     .style("left", (rect.left + ((rect.right - rect.left) / 2) - (tsWidth / 2)) + "px")
        }

        function mouseLeaveTimeBar() {
            d3.select("#timestamp")
              .style("display", "none");
        }

        function clickTimeBar(event, data) {
            runPlayer(data);
        }

        function oneTimeDraw(skipTime = null) {
            currentRunningDate = !skipTime ? new Date(startDate): new Date(skipTime);
            drawTimeBar(currentRunningDate);
            redrawMap(currentRunningDate);
        }

        function loopDraw(skipTime = null) {
            currentRunningDate = !skipTime ? new Date(startDate): new Date(skipTime);

            runningInterval = setInterval(function() {
                drawTimeBar(currentRunningDate);
                redrawMap(currentRunningDate);

                currentRunningDate.setMinutes(currentRunningDate.getMinutes() + 5)
                if (currentRunningDate.getTime() >= endDate.getTime()) {
                    currentRunningDate = new Date(startDate);
                }

            }, 1000);
        }

        function clear() {
            clearInterval(runningInterval);
        }

        function runPlayer(skipTime = null) {
            if (playStatus) {
                clear();
                loopDraw(skipTime);
            } else {
                oneTimeDraw(skipTime);
            }
        }

        function clickPlayBtn() {
            if (playStatus) {
                playStatus = !playStatus;
                d3.select("#play").style("display", "inline");
                d3.select("#pause").style("display", "none");
                d3.select("#play-text").html("Play");
                clear();
            } else {
                playStatus = !playStatus;
                d3.select("#play").style("display", "none");
                d3.select("#pause").style("display", "inline");
                d3.select("#play-text").html("Pause");
                runPlayer(currentRunningDate);
            }
        }

        function clearHeatmap() {
            d3.select("#heatmap > svg").remove();
        }

        function drawHeatmap(date = null) {
            clearHeatmap();

            var marginHeatmap = {top: 20, right: 40, bottom: 20, left: 100};

            var heatmapSvg = d3.select("#heatmap")
                                .append("svg")
                                .attr("width", "100%")
                                .attr("height", "48vh")
                                .on("click", clickOutsideHeatmap);

            var heatmapWidth = heatmapSvg.node().getBoundingClientRect().width - (marginHeatmap.left + marginHeatmap.right),
                heatmapHeight = heatmapSvg.node().getBoundingClientRect().height - (marginHeatmap.top + marginHeatmap.bottom);

            var heatmapG = heatmapSvg.append("g")
                                    .attr("transform", "translate(" + marginHeatmap.left + "," + marginHeatmap.top + ")");

            var heatmapX = d3.scaleTime()
                            .domain([startDate, endDate])
                            .range([0, heatmapWidth]);

            heatmapG.append("g")
                    .attr("class", "axis")                                               
                    .attr("transform", "translate(0," + heatmapHeight + ")")
                    .call(d3.axisBottom(heatmapX).ticks(d3.timeHour.every(3)).tickSizeOuter(0))
                    .select(".domain").remove();

            var utilities = ["Shake Intensity", "Buildings", "Medical", "Roads and Bridges", "Power", "Sewer and Water", "Overall"];
            
            var heatmapY = d3.scaleBand()
                            .domain(utilities)
                            .range([heatmapHeight, 0])
                            .padding(0.01);

            heatmapG.append("g")
                    .attr("class", "axis")
                    .call(d3.axisLeft(heatmapY).tickSize(0))
                    .select(".domain").remove();
            
            var onehour = d3.timeMinute.range(startDate, endDate, 60);
            var heatmapData = filterHeatmapData();
            heatmapData = heatmapData.flatMap(d1 => utilities.map(function(d2, index){ return {"date": d1.time, "utility": d2, "score": d1.utilities[utilities.length - 1 - index]}; }));

            heatmapG.selectAll()
                    .data(heatmapData)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {return heatmapX(d.date)})
                    .attr("y", function(d) {return heatmapY(d.utility)})
                    .attr("width", heatmapWidth / onehour.length)
                    .attr("height", heatmapY.bandwidth())
                    .style("fill", function(d) {return colors(d.score, true)})
                    .style("opacity", function(d) { return !date || date.getTime() == d.date.getTime() ? 1.0 : 0.3; })
                    .on("click", clickHeatmap)
                    .on("mouseover", mouseOverHeatmap)
                    .on("mouseleave", mouseLeaveHeatmap)
                    .on("mousemove", mouseMoveHeatmap);
        }

        function filterHeatmapData() {
            var onehour = d3.timeMinute.range(startDate, endDate, 60);
            return allData[1].map(function(d) {
                                switch(selectedLocation) {
                                    case 1: return {"time": d.time, "utilities": d.location1};
                                    case 2: return {"time": d.time, "utilities": d.location2};
                                    case 3: return {"time": d.time, "utilities": d.location3};
                                    case 4: return {"time": d.time, "utilities": d.location4};
                                    case 5: return {"time": d.time, "utilities": d.location5};
                                    case 6: return {"time": d.time, "utilities": d.location6};
                                    case 7: return {"time": d.time, "utilities": d.location7};
                                    case 8: return {"time": d.time, "utilities": d.location8};
                                    case 9: return {"time": d.time, "utilities": d.location9};
                                    case 10: return {"time": d.time, "utilities": d.location10};
                                    case 11: return {"time": d.time, "utilities": d.location11};
                                    case 12: return {"time": d.time, "utilities": d.location12};
                                    case 13: return {"time": d.time, "utilities": d.location13};
                                    case 14: return {"time": d.time, "utilities": d.location14};
                                    case 15: return {"time": d.time, "utilities": d.location15};
                                    case 16: return {"time": d.time, "utilities": d.location16};
                                    case 17: return {"time": d.time, "utilities": d.location17};
                                    case 18: return {"time": d.time, "utilities": d.location18};
                                    case 19: return {"time": d.time, "utilities": d.location19};
                                }        
                            }).filter((d) => onehour.findIndex((t) => t.getTime() == d.time.getTime()) >= 0);
        }

        function clickOutsideHeatmap() {
            drawHeatmap();
        }

        function clickHeatmap(event, data) {
            event.stopPropagation();
            selectedHeatmapTime = data.date;
            drawHeatmap(selectedHeatmapTime);
            drawLineChart();
        }

        function mouseOverHeatmap(event, data) {
            var formatDateHeatmap = d3.timeFormat("%H:%M");
            var startTime = formatDateHeatmap(data.date);
            var endTime = new Date(data.date);
            endTime.setMinutes(endTime.getMinutes() + 60);
            endTime = formatDateHeatmap(endTime);

            d3.select("#tooltip-heatmap")
              .html(startTime + " - " + endTime)
              .style("display", "block");
        }

        function mouseLeaveHeatmap() {
            d3.select("#tooltip-heatmap")
              .style("display", "none");
        }

        function mouseMoveHeatmap(event) {
            var tooltip = d3.select("#tooltip-heatmap");
            var ttWidth = tooltip.node().offsetWidth;

            tooltip.style("top", (event.clientY - 30) + "px")
                   .style("left", (event.clientX - (ttWidth / 2)) + "px")
        }

        function clearLineChart() {
            d3.select("#linechart > svg").remove();
        }

        function drawLineChart() {
            clearLineChart();

            var margin = {top: 25, right: 150, bottom: 20, left: 100};

            var linechartSvg = d3.select("#linechart")
                                 .append("svg")
                                 .attr("width", "100%")
                                 .attr("height", "33vh");

            var linechartWidth = linechartSvg.node().getBoundingClientRect().width - margin.left - margin.right,
                linechartHeight = linechartSvg.node().getBoundingClientRect().height - margin.top - margin.bottom;

            var linechartG = linechartSvg.append("g")
                                         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var lineEndDate = new Date(selectedHeatmapTime);
            lineEndDate.setMinutes(lineEndDate.getMinutes() + 60);

            var lineData = getLineData(selectedHeatmapTime, lineEndDate);
            var groupData = Array.from(d3.group(lineData, d => d.utility), ([key, value]) => ({key, value}));
            var color = d3.scaleOrdinal(d3.schemeCategory10);
            
            var lineX = d3.scaleTime()
                          .domain([selectedHeatmapTime, lineEndDate])
                          .range([0, linechartWidth]);

            var lineY = d3.scaleLinear()
                          .domain([0, 10])
                          .range([linechartHeight, 0]);

            var lines = d3.line()
                          .x(d => lineX(d.time))
                          .y(d => lineY(d.score));

            linechartG.append("g")
                      .attr("transform", "translate(0," + linechartHeight + ")")
                      .attr("class", "axis")
                      .call(d3.axisBottom(lineX).ticks(d3.timeMinute.every(5)).tickFormat(d3.timeFormat("%H:%M")));

            linechartG.append("g")
                      .attr("class", "axis")
                      .call(d3.axisLeft(lineY));


            var selectedUtilities = d3.selectAll("#linechart-legend .cell").nodes().map(legend => legend.selected)

            groupData.forEach(function(d, index) {
                linechartG.append("path")
                          .style("stroke", function() {return d.color = color(d.key)})
                          .style("stroke-width", "3px")
                          .style("fill", "none")
                          .style("opacity", selectedUtilities[index] ? "1": "0")
                          .attr("d", lines(d.value));
            });

            linechartG.append("path")
                      .attr("id", "value-line")
                      .style("stroke", "black")
                      .style("stroke-width", "2px")
                      .style("opacity", "0");

            var bisect = d3.bisector(function(d) { return d.time; }).left;

            linechartG.append("rect")
                      .style("fill", "none")
                      .style("pointer-events", "all")
                      .attr('width', linechartWidth)
                      .attr('height', linechartHeight)
                      .on('mouseover', function() {
                        d3.select("#value-line")
                            .style("opacity", "1");

                        d3.select("#tooltip-linechart")
                            .style("opacity", "1");
                      })
                      .on('mousemove', function(event) {
                          var posX = d3.pointer(event)[0];

                          var coeff = 1000 * 60 * 5;
                          var focusedDate = lineX.invert(posX);
                          focusedDate = new Date(Math.round(focusedDate.getTime() / coeff) * coeff);

                          var idx = bisect(lineData, focusedDate);
                          var focusedData = lineData.slice(idx, idx + 7).map(d => d.score);

                          posX = lineX(lineData[idx].time);

                          d3.select("#value-line")
                            .attr("d", function() {
                                var d = "M" + posX + "," + linechartHeight;
                                d += " " + posX + "," + 0;
                                return d;
                            });

                          var children = document.getElementById("tooltip-linechart").children;
                          for (let i = 0; i < children.length; i++) {
                            children[i].innerHTML = focusedData[i];
                            children[i].style.color = d3.schemeCategory10[i];
                          }
                      })
                      .on('mouseleave', function() {
                          d3.select("#value-line")
                            .style("opacity", "0");

                          d3.select("#tooltip-linechart")
                            .style("opacity", "0");
                      });
        }

        function getLineData(sdate, edate) {
            var parseDate = d3.timeParse("%Y-%m-%d %H:%M");
            var keys = ['overall', 'sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings', 'shake_intensity'];

            edate = new Date(edate)
            edate.setMinutes(edate.getMinutes() + 5);

            var filteredData = allData[0].filter(function(d) {
                                    var date = parseDate(d.time);
                                    return date.getTime() >= sdate.getTime() && date.getTime() <= edate.getTime() && d.location == selectedLocation;
                                });

            var timeRange = d3.timeMinute.range(sdate, edate, 5);
            var lineData = timeRange.flatMap(time => keys.map(key => { return {"utility": key, "time": time, "score": (0).toFixed(1)} }));
            lineData.forEach(function(ld) {
                filteredData.forEach(function(fd) {
                    if(ld.time.getTime() == parseDate(fd.time).getTime()) {
                        switch(ld.utility) {
                            case "overall": ld.score = (Math.round(fd.overall * 10) / 10).toFixed(1); break;
                            case "sewer_and_water": ld.score = (Math.round(fd.sewer_and_water * 10) / 10).toFixed(1); break;
                            case "power": ld.score = (Math.round(fd.power * 10) / 10).toFixed(1); break;
                            case "roads_and_bridges": ld.score = (Math.round(fd.roads_and_bridges * 10) / 10).toFixed(1); break;
                            case "medical": ld.score = (Math.round(fd.medical * 10) / 10).toFixed(1); break;
                            case "buildings": ld.score = (Math.round(fd.buildings * 10) / 10).toFixed(1); break;
                            case "shake_intensity": ld.score = (Math.round(fd.shake_intensity * 10) / 10).toFixed(1); break;
                        }
                    }
                })
            })      
            
            return lineData;
        }

        function drawLineChartLegend() {
            var colorOrdinal = d3.scaleOrdinal(d3.schemeCategory10)
                                 .domain(["Overall", "Sewer and Water", "Power", "Roads and Bridges", "Medical", "Buildings", "Shake Intensity"]);

            var colorSvg = d3.select("#linechart-legend")
                                .append("svg")
                                .attr("width", "100%")
                                .attr("height", "100%");

            colorSvg.append("g")
                    .attr("class", "legendOrdinal")
                    .attr("transform", "translate(0,0)");
    
            var legendOrdinal = d3.legendColor()
                                    .shapePadding(2)
                                    .scale(colorOrdinal);
            
            colorSvg.select(".legendOrdinal")
                    .call(legendOrdinal);

            d3.selectAll(".cell")
              .property("selected", true)
              .on("click", clickLineChartLegend);
        }

        function clickLineChartLegend() {
            var isSelected = d3.select(this).property("selected");

            if (isSelected) {
                d3.select(this)
                  .property("selected", false)
                  .style("opacity", "0.5");
            } else {
                d3.select(this)
                  .property("selected", true)
                  .style("opacity", "1");
            }

            drawLineChart();
        }

        function clearBarChart() {
            d3.select("#barchart > svg").remove();
        }

        function drawBarChart() {
            clearBarChart();

            var parseDate = d3.timeParse("%Y-%m-%d %H:%M");
            var oneReliableData = allData[0].filter(d => parseDate(d.time).getTime() == startDate.getTime())
                                            .map(d => {return {"location": d.location, "one_reliability": d.one_reliability}});
            oneReliableData = fillMissingReliableItems(oneReliableData);
            var mergedData = mergeReliableData(oneReliableData, allData[2]);

            var locations = mergedData.map(d => d.location);
            
            var marginBarChart = {top: 10, right: 110, bottom: 20, left: 30};
            var barChartSvg = d3.select("#barchart")
                                .append("svg")
                                .attr("width", "100%")
                                .attr("height", "24vh");
            
            var barChartWidth = barChartSvg.node().getBoundingClientRect().width - marginBarChart.left - marginBarChart.right,
                barChartHeight = barChartSvg.node().getBoundingClientRect().height - marginBarChart.top - marginBarChart.bottom;

            var barChartG = barChartSvg.append("g")
                                       .attr("transform", "translate(" + marginBarChart.left + "," + marginBarChart.top + ")");

            var groupX = d3.scaleBand()
                           .domain(locations)
                           .range([0, barChartWidth])
                           .padding(0.2);

            var elementX = d3.scaleBand()
                             .domain(["whole", "one"])
                             .range([0, groupX.bandwidth()]);

            var barY = d3.scaleLinear()
                         .domain([0, 100])
                         .range([barChartHeight, 0]);

            var barColors = d3.scaleOrdinal(d3.schemeCategory10)
                              .domain(["whole", "one"]);

            barChartG.append("g")
                     .attr("class", "axis")
                     .attr("transform", "translate(" + 0 + "," + barChartHeight + ")")
                     .call(d3.axisBottom(groupX).tickSizeOuter(0))

            barChartG.append("g")
                     .attr("class", "axis")
                     .call(d3.axisLeft(barY));

            var group = barChartG.selectAll(".group")
                                 .data(mergedData)
                                 .enter()
                                 .append("g")
                                 .attr("transform",function(d) { return "translate(" + groupX(d.location) + ",0)"; })
                                 .on("click", clickBarChart)
                                 .on("mouseover", mouseOverBarChart)
                                 .on("mouseleave", mouseLeaveBarChart);

            group.selectAll("rect")
                 .data(function(d) {return [{"group": "whole", "value": d.whole_reliability}, {"group": "one", "value": d.one_reliability}]})
                 .enter()
                 .append("rect")
                 .attr("x", function(d) {return elementX(d.group); })
                 .attr("y", function(d) { return barY(d.value); })
                 .attr("width", elementX.bandwidth())
                 .attr("height", function(d) { return barChartHeight - barY(d.value); })
                 .style("fill", function(d) {return barColors(d.group)});
        }

        function fillMissingReliableItems(oneReliableData) {
            var tempData = [...oneReliableData];
            for (var i = 1; i <= 19; i++) {
                var exist = oneReliableData.findIndex(item => item.location == i) >= 0;
                if (!exist) {
                    tempData.push({"location": i, "one_reliability": 0});
                }
            }
            return tempData;
        }

        function mergeReliableData(data1, data2) {
            var mergedData = [];

            for(var i = 1; i <= 19; i++) {
                var d1Idx = data1.findIndex(item => item.location == i);
                var d2Idx = data2.findIndex(item => item.location == i);

                mergedData.push({"location": i, "whole_reliability": (data2[d2Idx].whole_reliability * 100).toFixed(1), "one_reliability": (data1[d1Idx].one_reliability * 100).toFixed(1) });
            }
            return mergedData;
        }

        function drawBarChartLegend() {
            var colorOrdinal = d3.scaleOrdinal(d3.schemeCategory10)
                                 .domain(["Total Data", "One-Day Data"]);

            var colorSvg = d3.select("#barchart-legend")
                                .append("svg")
                                .attr("width", "100%")
                                .attr("height", "100%");

            colorSvg.append("g")
                    .attr("class", "legendOrdinal")
                    .attr("transform", "translate(0,0)");
    
            var legendOrdinal = d3.legendColor()
                                    .shapePadding(2)
                                    .scale(colorOrdinal);
            
            colorSvg.select(".legendOrdinal")
                    .call(legendOrdinal);
        }

        function clickBarChart(event, data) {
            d3.selectAll(".map-area")
              .style("stroke", "lightgrey")
              .style("stroke-width", "1px");

            d3.select("#map > svg path[id='" + data.location + "']")
              .style("stroke", "black")
              .style("stroke-width", "2px");

            selectedLocation = data.location;
            drawHeatmap();
        }

        function mouseOverBarChart(event, data) {
            var parentTop = d3.select("#barchart").node().offsetTop,
                parentLeft = d3.select("#barchart").node().offsetLeft;

            var top = d3.select(this).node().getBoundingClientRect().top,
                left = d3.select(this).node().getBoundingClientRect().left,
                width = d3.select(this).node().getBoundingClientRect().width;

            var location = data.location + ": " + json.features.filter(d => d.properties.Id == data.location).map(d => d.properties.Nbrhood)[0];

            var tooltip = d3.select("#tooltip-barchart")
                            .style("display", "block");

            d3.selectAll("#tooltip-barchart > span")
              .datum([location, data.whole_reliability, data.one_reliability])
              .html((d, i) => i != 0 ? d[i] + "%" : d[i])
              .style("color", function(d, i) {
                  switch(i) {
                      case 1: return d3.schemeCategory10[0];
                      case 2: return d3.schemeCategory10[1];
                      default: return "black";
                  }
              });

              var ttWidth = tooltip.node().offsetWidth,
                  ttHeight = tooltip.node().offsetHeight;

            tooltip.style("top", (top - parentTop - ttHeight - 10) + "px")
                   .style("left", (left - parentLeft - (ttWidth / 2) + (width / 2)) + "px");

            d3.select(this)
              .style("opacity", "0.5");
        }

        function mouseLeaveBarChart() {
            d3.select("#tooltip-barchart")
              .style("display", "none");

            d3.select(this)
              .style("opacity", "1");
        }
        
        function filterData(date, utilities) {
            var filteredData = allData[0].filter(function(d) {return (d.time == date)})
                                    .map(function(d) {
                                        switch(utilities) {
                                            case "sewer_and_water": return [d.sewer_and_water, d.location];
                                            case "power": return [d.power, d.location];
                                            case "roads_and_bridges": return [d.roads_and_bridges, d.location];
                                            case "medical": return [d.medical, d.location];
                                            case "buildings": return [d.buildings, d.location];
                                            case "shake_intensity": return [d.shake_intensity, d.location];
                                            default: return [d.overall, d.location];
                                        }
                                    });
            return filteredData;
        }

        function colors(value, removeColor = false) {
            if (!value && value !== 0) {
                return removeColor ? "none": "transparent";
            } else if (value >= 0 && value <= 2) {
                return "#bee7a5";
            } else if (value > 2 && value <= 4) {
                return "#ffe87c";
            } else if (value > 4 && value <= 6) {
                return "#f6bc66";
            } else if (value > 6 && value <= 8) {
                return "#f68c70";
            } else if (value > 8 && value <= 10) {
                return "#f55c7a";
            } else {
                return "black"; // Display this color means there is an error.
            }
        }

        //----------------------- Finished loading data -----------------------

        runPlayer();
        document.getElementById("loading-container").style.display = "none";
    });
});






