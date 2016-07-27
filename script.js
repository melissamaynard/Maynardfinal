var app;

// Declaring our constants
var START_YEAR = 1950;
var END_YEAR = 2015;
var MAX_RADIUS = 50;
var TRANSITION_DURATION = 750;



// // d3.queue() enables us to load multiple data files. Following the example below, we make
// // additional .defer() calls with additional data files, and they are returned as results[1],
// // results[2], etc., once they have all finished downloading.
d3.queue()
   .defer(d3.json, 'data/data.json')
   .awaitAll(function (error, results) {
     if (error) { throw error; }
     app.initialize(results[0]);
   });

app = {
  data: [],
  components: [],

  options: {
    year: START_YEAR
  },

  initialize: function (data) {
    app.data = data;

    // Here we create each of the components on our page, storing them in an array
    app.components = [
      new Chart('#chart')
    ];

    // Add event listeners and the like here

    // app.resize() will be called anytime the page size is changed
    d3.select('window').on('resize', app.resize);

    // For demo purposes, let's tick the year every 750ms
    function incrementYear() {
      app.options.year += 1;
      if (app.options.year > END_YEAR) {
        app.options.year = START_YEAR;
      }

      app.update();
    }
      
      d3.interval(incrementYear, TRANSITION_DURATION);
    // d3.interval(incrementYear, TRANSITION_DURATION);
  },

  resize: function () {
    app.components.forEach(function (c) { if (c.resize) { c.resize(); }});
  },

  update: function () {
    app.components.forEach(function (c) { if (c.update) { c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;

  // SVG and MARGINS

  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y");

  // SCALES

  var x = d3.scaleTime()
          .range([0, width]),
    y = d3.scaleLinear()
          .range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  //since time is years, left out parseDate and changed scaleTime to scaleLinear for x from Bostock V4 example
//I don't think that will work because of the need to diffentiate between categories and time

  var stack = d3.stack();

  var area = d3.area()
    .x(function(d, i) { return x(d.data); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

  //Because I'm not using date formatting, deleted .date from Bostock V4 example

  // AXES

  var xAxis = d3.axisBottom()
    .scale(chart.x);

  var yAxis = d3.axisLeft()
      .scale(chart.y);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // YEAR LABEL

  chart.svg.append('text')
    .attr('class', 'year')
    .attr('x', chart.width / 2)
    .attr('y', chart.height / 2)
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('font-size', '230px')
    .style('font-weight', 'bold')
    .style('opacity', 0.2)
    .text(app.options.year);

  chart.update();
}

Chart.prototype = {
  update: function () {
    var chart = this;

    // TRANSFORM DATA

    var txData = app.data.filter(function (d) { return d.year === app.options.year; });

    // UPDATE CHART ELEMENTS

    var t = d3.transition().duration(TRANSITION_DURATION);

    var yearText = d3.selectAll('.year')
      .transition().delay(TRANSITION_DURATION / 2)
      .text(app.options.year);

    var countries = chart.svg.selectAll('.country')
      .data(txData, function (d) { return d.country;});

    countries.enter().append('circle')
      .attr('class', 'country')
      .style('fill', function (d) { return chart.color(d.continent); })
      .style('opacity', 0.75)
      .attr('r', 0)
      .attr('cx', chart.width / 2)
      .attr('cy', chart.height / 2)
      .merge(countries)
      .sort(function (a, b) { return b.population - a.population; })
      .transition(t)
      .attr('r', function (d) { return chart.r(d.population); })
      .attr('cx', function (d) { return chart.x(d.total_fertility); })
      .attr('cy', function (d) { return chart.y(d.life_expectancy); });

    countries.exit()
      .transition(t)
      .attr('r', 0)
      .remove();
  }
}