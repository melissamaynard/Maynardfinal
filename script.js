var app;

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

    initialize: function (data) {
    app.data = data;

    // Here we create each of the components on our page, storing them in an array
    app.components = [
      new Chart('#chart')
    ];

    // Add event listeners and the like here

    // app.resize() will be called anytime the page size is changed
    d3.select('window').on('resize', app.resize);

    
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

  var stack = d3.stack();

  
  var area = d3.area()
    .x(function(d, i) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

//this is specifying the coordinates for the areas

 
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var keys = data.columns.slice(1);

  x.domain(d3.extent(data, function(d) { return d.date; }));
  z.domain(keys);
  stack.keys(keys);

  var layer = g.selectAll(".layer")
    .data(stack(data))
    .enter().append("g")
      .attr("class", "layer");

  layer.append("path")
      .attr("class", "area")
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

  layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
    .append("text")
      .attr("x", width - 6)
      .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
      .attr("dy", ".35em")
      .style("font", "10px sans-serif")
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });

//Axes  

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

 g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"));

//there used to be an extra parentheses in line above }); but sublime was flagging as error

function type(d, i, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]] / 100;
  return d;
}

