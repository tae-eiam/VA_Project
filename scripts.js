//----------------------- Variables -----------------------

var date = "2020-04-06 00:00";
var utilities = "overall";

//----------------------- Dataset -----------------------

d3.csv("mc1-reports-data.csv").then(function(data) {
    var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
    var formatDate = d3.timeFormat("%Y-%m-%d %H:%M");

    data.forEach(function(d) {
        d.time = formatDate(parseDate(d.time));
        d.sewer_and_water = +d.sewer_and_water;
        d.power = +d.power;
        d.roads_and_bridges = +d.roads_and_bridges;
        d.medical = +d.medical;
        d.buildings = +d.buildings;
        d.shake_intensity = +d.shake_intensity;
        d.location = +d.location;
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
         .style("stroke", "lightgrey")
         .style("fill", "none");

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
                .attr("fill", "none")
                .attr("transform", function(feature) {
                    console.log(feature);
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
                                .domain(["0-2", "3-4", "5-6", "7-8", "9-10"])
                                .range(["rgb(198, 244, 11)", "rgb(249, 255, 7)", "rgb(255, 189, 5)", "rgb(255, 146, 5)", "rgb(255, 6, 4)"]);

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
                                .shapeWidth(30)
                                .orient("horizontal")
                                .scale(colorOrdinal);
          
        colorSvg.select(".legendOrdinal")
                .call(legendOrdinal);

        //----------------------- Map Functions -----------------------

        function clearMap() {
            g.selectAll("path")
             .style("fill", "none");

            missingG.selectAll("path")
                    .attr("fill", "none");
        } 
        
        function redrawMap() {
            clearMap()
            var filteredData = filterData(date, utilities);
                    
            filteredData.forEach(function(d) {
                g.select("path[id='" + d[1] +"']")
                    .style("fill", function() {
                        switch(utilities) {
                            case "sewer_and_water": return colors(d[0]);
                            case "power": return colors(d[0]);
                            case "roads_and_bridges": return colors(d[0]);
                            case "medical": return colors(d[0]);
                            case "buildings": return colors(d[0]);
                            case "shake_intensity": return colors(d[0]);
                            default: return colors(d[0]);
                        }
                    });

                if(!d[0]) {
                    missingG.select("#missing" + d[1])
                            .attr("fill", "grey");
                }
            });
        }

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
            date = this.value;
            redrawMap();
        });

        //----------------------- Utilities -----------------------

        d3.select("#utilities")
        .on("change", function() {
            utilities = this.value;
            redrawMap();
        });

        //----------------------- Miscellaneous -----------------------

        function filterData(date, utilities) {
            var filteredData = data.filter(function(d) {return (d.time == date)})
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

        function colors(value) {
            if (!value) {
                return "white";
            } else if (value >= 0 && value <= 2) {
                return "#c6f40b";
            } else if (value > 2 && value <= 4) {
                return "#f9ff07";
            } else if (value > 4 && value <= 6) {
                return "#ffbd05";
            } else if (value > 6 && value <= 8) {
                return "#ff9205";
            } else if (value > 8 && value <= 10) {
                return "#ff0604";
            } else {
                return "black"; // Display this color means there is an error.
            }
        }

        //----------------------- Finished loading data -----------------------

        redrawMap();
        document.getElementById("loading-container").style.display = "none";
    });
});






