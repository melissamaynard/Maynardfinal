var margin = { top: 20, right: 80, bottom: 30, left: 100 },
    width  = 1500 - margin.left - margin.right,
    height = 650  - margin.top  - margin.bottom;

var labels = {
    veggies: 'Daily average consumption of vegetables in cups',
    meat: 'Daily average consumption of meat and eggs in ounces',
    dairy: 'Daily average consumption of dairy and in cups',
    fats: 'Daily average consumption of fats in grams',
    grains: 'Daily average consumption of grains in ounces',
    nuts: 'Daily average consumption of nuts in ounces',
    seafood: 'Daily average consumption of seafood in ounces',
    sugar: 'Daily average consumption of sugars in teaspoons',
    fruit: 'Daily average consumption of fruit in cups'

} 

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

        chart.svg.selectAll("*").remove();

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
          .text(labels[foodType]);
        chart.selection = chart.svg.selectAll(".veggies")
          .data(veggiesArr)
          .enter().append("g")
            .attr("class", "veggies");

        chart.selection.append("path")
          .attr("class", function (d) { return "streamPath " + d.name.replace(' ', '-'); })
          .attr("d", function (d) { return chart.area(d.values); })
          .style("stroke", "grey");

        chart.legend = chart.svg.selectAll(".legend")
            .data(varNames.slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(55," + i * 20 + ")";  
            });

        chart.legend.append("rect")
            .attr("class", function (d) { return "streamPath " + d.replace(' ', '-'); })
            .attr("x", width - 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("stroke", "grey");


        chart.legend.append("text")
            .attr("x", width - 12)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

        d3.select('#description').text(function(){
        if (foodType === "veggies") {return "Average daily consumption of vegetables increased from 1.5 cups per person to 1.7 cups per person between 1970 to 2013, following a similar increase in total food consumption. In particular, Americans are consuming more green vegetables, including lettuce, spinach, kale, broccoli, collard greens, and mustard greens. Potatoes maintained their status at America’s most popular vegetable throughout this period, with the average person consuming almost ¾ a cup daily at their peak in 1970 in comparison to about ½ cup in 2013."}
        else if (foodType=== "meat") {return "The average American consumed about an ounce less of beef every day in 2013 than they did in 1970, while consuming about an ounce more of chicken. Total meat consumption was relatively steady during this period, however. "}
        else if (foodType=== "dairy") {return "Average daily consumption of dairy increased from 1.6 cups per person to 1.78 cups per person from 1970 to 2013, following a similar increase in total food consumption. Americans are consuming far more cheese and yogurt than they used to, while fluid milk consumption has fallen significantly, from .95 cups in 1970 to .63 cups in 2013."}
        else if (foodType=== "fruit") {return "Total fruit consumption remained relatively steady between 1970 and 2013, beginning and ending the time period at .9 cups per person per day, with only minor fluctuations in between. Fruit juice comprised almost a third of all fruit consumption. Peanuts (including peanut butter) represent more than half of all nuts consumed, though almonds have surged in popularity since 2005."}
        else if (foodType=== "seafood") {return "The average American consumed slightly more seafood in 2013 (.38 ounces) than in 1970 (.33 ounces), driven  by an increase in the consumption of fresh seafood."}
        else if (foodType=== "sugar") {return "The American Heart Association recommends that men limit sugar consumption to 9 teaspoons per day and women limit sugar consumption to 6 teaspoons per day. The average American consumed more than double the recommended amount of sugar in 2013 (22.4 teaspoons), however, with corn-based sugars such has high-fructose corn syrups surging in popularity since 1970. Total sugar consumption has tapered off slightly since its peak of 26.4 teaspoons per capita in 1999."}
              
      })

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

d3.select('#nuts').on('click', function () {
    stream.update('nuts');
});

d3.select('#sugar').on('click', function () {
    stream.update('sugar');
});

d3.select('#seafood').on('click', function () {
    stream.update('seafood');

});