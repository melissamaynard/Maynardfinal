 var margin = {top: 20, right: 55, bottom: 30, left: 40},
          width  = 1000 - margin.left - margin.right,
          height = 500  - margin.top  - margin.bottom;

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      var y = d3.scale.linear()
          .rangeRound([height, 0]);

      var stack = d3.layout.stack()
          .offset("wiggle")
          .values(function (d) { return d.values; })
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y(function (d) { return d.value; });

      var area = d3.svg.area()
          .interpolate("cardinal")
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y0(function (d) { return y(d.y0); })
          .y1(function (d) { return y(d.y0 + d.y); });

      var color = d3.scale.ordinal()
          .range(["#001c9c","#101b4d","#475003","#9c8305","#d3c47c"]);

      var svg = d3.select("body").append("svg")
          .attr("width",  width  + margin.left + margin.right)
          .attr("height", height + margin.top  + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //a tutorial I'm trying to follow (http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs) glazes over the above code as "declaring variables," so not sure what to do other than start with it. From the rest of the code, it appears that nothing in it is specific to the data set used in the tutorial.

      d3.csv("data/veggies.csv", function (error, data) {
        console.log("initial data", data);

        var labelVar = 'year';
        //identifying year as the time element/categorical variable
        var varNames = d3.keys(data[0])
            .filter(function (key) { return key !== labelVar;});
        //create an array of variable names
        color.domain(varNames);
        //set varnames array as domain for color scale
        var veggiesArr = [], veggies = {};
        varNames.forEach(function (name) {
          veggies[name] = {name: name, values:[]};
          veggiesArr.push(veggies[name]);
        });
        //setting up array of objects for each vegetable category

        data.forEach(function (d) {
          varNames.map(function (name) {
            veggies[name].values.push({label: d[labelVar], value: +d[name]});
          });
        });
        //filling in values needed for each category of vegetables
        x.domain(data.map(function (d) { return d.year; }));
        //establishing domain for x
        stack(veggiesArr);
        console.log("stacked veggiesArr", veggiesArr);

        y.domain([0, d3.max(veggiesArr, function (c) { 
            return d3.max(c.values, function (d) { return d.y0 + d.y; });
          })]);
        //establish y domain, send data to stack
        var selection = svg.selectAll(".veggies")
          .data(veggiesArr)
          .enter().append("g")
            .attr("class", "veggies");

        selection.append("path")
          .attr("class", "streamPath")
          .attr("d", function (d) { return area(d.values); })
          .style("fill", function (d) { return color(d.name); })
          .style("stroke", "grey");

         });
        //append a g element for each category of vegetables, append path