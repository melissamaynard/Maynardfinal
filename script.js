var margin = { top: 20, right: 55, bottom: 30, left: 40 },
    width  = 1000 - margin.left - margin.right,
    height = 500  - margin.top  - margin.bottom;

function Stream(data) {
    var chart = this;

    chart.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    chart.y = d3.scale.linear()
        .rangeRound([height, 0]);

    chart.xAxis = d3.svg.axis()
        .scale(chart.x)
        .orient("bottom");

    chart.yAxis = d3.svg.axis()
        .scale(chart.y)
        .orient("left");

    chart.stack = d3.layout.stack()
        .offset("wiggle")
        .values(function (d) { return d.values; })
        .x(function (d) { return chart.x(d.label) + chart.x.rangeBand() / 2; })
        .y(function (d) { return d.value; });

    chart.area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return chart.x(d.label) + chart.x.rangeBand() / 2; })
        .y0(function (d) { return chart.y(d.y0); })
        .y1(function (d) { return chart.y(d.y0 + d.y); });

    chart.color = d3.scale.ordinal()
        .range(["#74c476", "#41ab5d", "#238b45", "#edf8e9", "#c7e9c0", "#a1d99b", "#005a32", "D1160C", "FF9339", "FF9332", "FCCD00", "BDAFA4", "FFE132", "869760", "A7B38D", "647936", "191518"]);

    chart.svg = d3.select("body").append("svg")
          .attr("width",  width  + margin.left + margin.right)
          .attr("height", height + margin.top  + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

// a tutorial I'm trying to follow (http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs) glazes over the above code as "declaring variables," so not sure what to do other than start with it. From the rest of the code, it appears that nothing in it is specific to the data set used in the tutorial.

Stream.prototype.update = function (foodType) {

    var chart = this;

    d3.csv("data/" + foodType + ".csv", function (error, data) {
        console.log("initial data: " + foodType, data);

        var labelVar = 'year';
        //identifying year as the time element/categorical variable
        var varNames = d3.keys(data[0])
            .filter(function (key) { return key !== labelVar;});
        //create an array of variable names
        chart.color.domain(varNames);
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
        chart.x.domain(data.map(function (d) { return d.year; }));
        //establishing domain for x
        chart.stack(veggiesArr);
        console.log("stacked veggiesArr", veggiesArr);

        chart.y.domain([0, d3.max(veggiesArr, function (c) {
            return d3.max(c.values, function (d) { return d.y0 + d.y; });
          })]);
        //establish y domain, send data to stack

        chart.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(chart.xAxis);

        chart.svg.append("g")
          .attr("class", "y axis")
          .call(chart.yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Daily average consumption of vegetables in cups");
        chart.selection = chart.svg.selectAll(".veggies")
          .data(veggiesArr)
          .enter().append("g")
            .attr("class", "veggies");

        chart.selection.append("path")
          .attr("class", "streamPath")
          .attr("d", function (d) { return chart.area(d.values); })
          .style("fill", function (d) { return chart.color(d.name); })
          .style("stroke", "grey");

        chart.legend = chart.svg.selectAll(".legend")
            .data(varNames.slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
              return "translate(55," + i * 20 + ")";
            });

        chart.legend.append("rect")
            .attr("x", width - 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color)
            .style("stroke", "grey");

        chart.legend.append("text")
            .attr("x", width - 12)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });
    });
};

stream = new Stream();

stream.update('veggies');

d3.select('#vegetables').on('click', function () {
    stream.update('veggies');
});

d3.select('#meat').on('click', function () {
    stream.update('meat');
});

d3.select('#dairy').on('click', function () {
    stream.update('dairy');
});

d3.select('#fruit').on('click', function () {
    stream.update('fruit');
});

d3.select('#grains').on('click', function () {
    stream.update('grains');
});

d3.select('#fats').on('click', function () {
    stream.update('fats');
});

d3.select('#nuts').on('click', function () {
    stream.update('nuts');
});

d3.select('#sugar').on('click', function () {
    stream.update('seafood');
});
