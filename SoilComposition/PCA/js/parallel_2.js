import {initScene, init_data} from "./volume_2.js";
import {verifyChecked, checkAll} from "./calc_2.js";


export function buildParallelChart(_profiles, dims, sorted_dims, data_passed, sel, profile_dims) {

    let resolution = 50

    let elem, vMin, vMax;

    let colors = {
        "R": to_hsl("#8F7C00"),
        "S": to_hsl("#C20088"),
        "L": to_hsl("#00998F")
    };

    let _colors = {
        "R": "#8F7C00",
        "S": "#C20088",
        "L": "#00998F"
    }

    function to_hsl(color){
        let _color = d3v5.color(color);
        let __color = _color.formatHsl();
        let arr = [+(__color.split("(")[1].split(",")[0]), +(__color.split(" ")[1].split("%")[0]), +(__color.split(" ")[2].split("%")[0])];
        return arr;
    }

    let dimObject = {};
    dims.forEach(dim => dimObject[dim.name] = dim);

    dimObject['Sample ID'] = {}
    dimObject['Sample ID']['name'] = 'Sample ID'
    dimObject['Sample ID']['hide'] = false
    dimObject['Sample ID']['min'] = 0
    dimObject['Sample ID']['max'] = 100
    dimObject['Sample ID']['color'] = '#000000'

    var width = document.body.clientWidth,
        height = d3.max([document.body.clientHeight - 580, 240]);

    var m = [35, 0, 10, 0],
        w = width - m[1] - m[3],
        h = height - m[0] - m[2],
        xscale = d3.scale.ordinal().rangePoints([0, w], 1),
        yscale = {},
        dragging = {},
        line = d3.svg.line(),
        axis = d3.svg.axis().orient("left").ticks(1 + height / 50),
        data,
        foreground,
        background,
        highlighted,
        dimensions,
        legend,
        render_speed = 50,
        brush_count = 0,
        excluded_groups = [];

// Scale chart and canvas height
    d3.select("#chart")
        .style("height", (h + m[0] + m[2]) + "px")

    d3.selectAll("#chart canvas")
        .attr("width", w)
        .attr("height", h)
        .style("padding", m.join("px ") + "px");

// Foreground canvas for primary view
    foreground = document.getElementById('foreground').getContext('2d');
    foreground.globalCompositeOperation = "destination-over";
    foreground.strokeStyle = "rgba(0,100,160,0.1)";
    foreground.lineWidth = .5;
    foreground.fillText("Loading...", w / 2, h / 2);

// Highlight canvas for temporary interactions
    highlighted = document.getElementById('highlight').getContext('2d');
    //highlighted.strokeStyle = "rgba(0,100,160,1)";
    //highlighted.strokeStyle = "red";
    highlighted.lineWidth = 1;

// Background canvas
    background = document.getElementById('background').getContext('2d');
    background.strokeStyle = "rgba(0,100,160,0.1)";
    background.lineWidth = 1.7;

    d3.select("div#chart").selectAll("svg").remove()

    var svg = d3.select("div#chart").append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    //let prof = profiles[document.getElementById('framework').value]

    Promise.all(Array.from(_profiles, x => d3v5.csv(`./data/new/${x}-processed.csv`))
    ).then(function(files) {

        let raw_data = []
        files.forEach(d => raw_data = raw_data.concat(d));


// Load the data and visualization
    //d3.csv("./data/" + prof + ".csv", function (raw_data) {
        // Convert quantitative scales to floats
        data = raw_data.map(function (d) {
            for (var k in d) {
                if (k.split(' ')[1] == "Concentration" && !dimObject[k].hide && !dimObject[k].noShow) {

                    d[k] = parseFloat(d[k]) || 0;
                }
            }
            return d;
        });

        console.log(data)

        switch (_profiles.length){
            case 1:
                for (let i in data){
                    //data[i]["id"] = _profiles[0] + i;
                    data[i]["id"] = data_passed[i]["id"];
                    //data[i]["group"] = _profiles[0];
                    data[i]["group"] = data_passed[i]["profile"];
                }
                break;
            case 2:
                for (let i in data){
                    data[i]["id"] = data_passed[i]["id"];
                    if (i < data_passed[0].length){
                        data[i]["group"] = data_passed[i]["profile"];
                    }
                    else{
                        data[i]["group"] = data_passed[i]["profile"];
                    }
                }
                break;
            case 3:
                for (let i in data){
                    data[i]["id"] = data_passed[i]["id"];
                    if (i < data_passed[0].length){
                        data[i]["group"] = data_passed[i]["profile"];
                    }
                    else if (i >= data_passed[0].length && i < data_passed[1].length){
                        data[i]["group"] = data_passed[i]["profile"];
                    }
                    else{
                        data[i]["group"] = data_passed[i]["profile"];
                    }
                }
                break;
        }

        data.forEach(d=>{d['Sample ID'] = +d['Sample ID'].split('-')[0]+5})

        // Extract the list of numerical dimensions and create a scale for each.
        xscale.domain(dimensions = d3.keys(data[0]).filter(function (k) {
                return (_.isNumber(data[0][k])) && (yscale[k] = d3.scale.linear()
                    .domain(k === 'Sample ID' ? [0,100] :d3.extent(data, function (d) {
                        return +d[k];
                    }))
                    .range([h, 0]));
            }).sort(function(a, b){
            return sorted_dims.indexOf(a) - sorted_dims.indexOf(b);
        }));


        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + xscale(d) + ")";
            })
            .call(d3.behavior.drag()
                .on("dragstart", function (d) {
                    dragging[d] = this.__origin__ = xscale(d);
                    this.__dragged__ = false;
                    d3.select("#foreground").style("opacity", "0.35");
                })
                .on("drag", function (d) {
                    dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                    dimensions.sort(function (a, b) {
                        return position(a) - position(b);
                    });
                    xscale.domain(dimensions);
                    g.attr("transform", function (d) {
                        return "translate(" + position(d) + ")";
                    });
                    brush_count++;
                    this.__dragged__ = true;

                    // Feedback for axis deletion if dropped
                    if (dragging[d] < 12 || dragging[d] > w - 12) {
                        d3.select(this).select(".background").style("fill", "#bb0000");
                    } else {
                        d3.select(this).select(".background").style("fill", null);
                    }
                })
                .on("dragend", function (d) {
                    if (!this.__dragged__) {
                        // no movement, invert axis
                        var extent = invert_axis(d);

                    } else {
                        // reorder axes
                        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");

                        var extent = yscale[d].brush.extent();
                    }

                    // remove axis if dragged all the way left
                    if (dragging[d] < 12 || dragging[d] > w - 12) {
                        remove_axis(d, g);
                    }

                    // TODO required to avoid a bug
                    xscale.domain(dimensions);
                    update_ticks(d, extent);

                    // rerender
                    d3.select("#foreground").style("opacity", null);

                    brush(sel);
                    delete this.__dragged__;
                    delete this.__origin__;
                    delete dragging[d];

                }))


        // Add an axis and title.
        g.append("svg:g")
            .attr("class", "axis")
            .attr("transform", "translate(0,0)")
            .each(function (d) {
                d3.select(this).call(axis.scale(yscale[d]));
            })
            .append("svg:text")
            .attr("text-anchor", "middle")
            .attr("y", function (d, i) {
                return i % 2 == 0 ? -10 : -16
            })
            .attr("x", 0)
            .attr("class", "label")
            // .text(String)
            .text(function (d) {
                return d == "Sample ID" ? 'Depth' : d.split(' ')[0]
            })
            .append("title")
            .text("Click to invert. Drag to reorder");

        let sel = d3.selectAll('.dimension').filter(d=> d == 'Sample ID').select('.axis').selectAll('g').select('text').text(d=> `${d} cm`)


        // Add and store a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush).on("brushend",(sel)=>brush(sel,true)));
            })
            .selectAll("rect")
            .style("visibility", null)
            .attr("x", -23)
            .attr("width", 36)
            .append("title")
            .text("Drag up or down to brush along this axis");

        g.selectAll(".extent")
            .append("title")
            .text("Drag or resize this filter");

        legend = create_legend(colors, brush);

        // Render full foreground
        brush(sel);

        d3.selectAll(".axis").each(function () {
            d3.select(this)
                .select("text.label")
                .each(function (d) {
                    d3.select(this.parentNode)
                        .select('path')
                        .style('stroke', function (e) {
                            return dimObject[d].color;
                        })
                });
        });
    });

// copy one canvas to another, grayscale
    function gray_copy(source, target) {
        var pixels = source.getImageData(0, 0, w, h);
        target.putImageData(grayscale(pixels), 0, 0);
    }

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
    function grayscale(pixels, args) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        return pixels;
    };

    function create_legend(colors, brush) {
        // create legend
        var legend_data = d3.select("#legend")
            .html("")
            .selectAll(".row")
            .data(_.keys(colors).sort())

        // filter by group
        var legend = legend_data
            .enter().append("div")
            .attr("title", "Hide group")
            .on("click", function (d) {
                // toggle food group
                if (_.contains(excluded_groups, d)) {
                    d3.select(this).attr("title", "Hide group")
                    excluded_groups = _.difference(excluded_groups, [d]);
                    brush();
                } else {
                    d3.select(this).attr("title", "Show group")
                    excluded_groups.push(d);
                    brush();
                }
            })

        legend
            .append("span")
            .style("background", function (d, i) {
                return color(d, 0.85)
            })
            .attr("class", "color-bar");

        legend
            .append("span")
            .attr("class", "tally")
            .text(function (d, i) {
                return 0
            });

        legend
            .append("span")
            .text(function (d, i) {
                return " " + d
            });

        return legend;
    }

// render polylines i to i+render_speed
    function render_range(selection, i, max, opacity) {
        selection.slice(i, max).forEach(function (d) {
            path(d, foreground, color(d.group, opacity));
        });
    };

// simple data table
// function data_table(sample) {
//     // sort by first column
//     var sample = sample.sort(function(a,b) {
//         var col = d3.keys(a)[0];
//         return a[col] < b[col] ? -1 : 1;
//     });
//
//
//
//     var table = d3.select("#states")
//         .html("")
//         .selectAll(".row")
//         .data(sample)
//         .enter().append("div")
//         .on("mouseover", highlight)
//         .on("mouseout", unhighlight);
//
//     table
//         .append("span")
//         .attr("class", "color-block")
//         .style("background", function(d) { return color(d.group,0.85) })
//
//     table
//         .append("span")
//         .text(function(d) { return d.state; })
// }

// Adjusts rendering speed
    function optimize(timer) {
        var delta = (new Date()).getTime() - timer;
        render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
        render_speed = Math.min(render_speed, 300);
        return (new Date()).getTime();
    }

// Feedback on rendering progress
    function render_stats(i, n, render_speed) {
        d3.select("#rendered-count").text(i);
        d3.select("#rendered-bar")
            .style("width", (100 * i / n) + "%");
        d3.select("#render-speed").text(render_speed);
    }

// Feedback on selection
    function selection_stats(opacity, n, total) {
        d3.select("#data-count").text(total);
        d3.select("#selected-count").text(n);
        d3.select("#selected-bar").style("width", (100 * n / total) + "%");
        d3.select("#opacity").text(("" + (opacity * 100)).slice(0, 4) + "%");
    }

// Highlight single polyline
    function highlight(d) {
        d3.select("#foreground").style("opacity", "0.25");
        d3.selectAll(".row").style("opacity", function (p) {
            return (d.group == p) ? null : "0.3"
        });
        //path(d, highlighted, color(d.group), 1);
        path(d, highlighted, _colors[d.group], 1);
    }

// Remove highlight
    function unhighlight() {
        d3.select("#foreground").style("opacity", null);
        d3.selectAll(".row").style("opacity", null);
        highlighted.clearRect(0, 0, w, h);
    }

    function invert_axis(d) {
        // save extent before inverting
        if (!yscale[d].brush.empty()) {
            var extent = yscale[d].brush.extent();
        }
        if (yscale[d].inverted == true) {
            yscale[d].range([h, 0]);
            d3.selectAll('.label')
                .filter(function (p) {
                    return p == d;
                })
                .style("text-decoration", null);
            yscale[d].inverted = false;
        } else {
            yscale[d].range([0, h]);
            d3.selectAll('.label')
                .filter(function (p) {
                    return p == d;
                })
                .style("text-decoration", "underline");
            yscale[d].inverted = true;
        }
        return extent;
    }

// Draw a single polyline
    /*
    function path(d, ctx, color) {
      if (color) ctx.strokeStyle = color;
      var x = xscale(0)-15;
          y = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
      ctx.beginPath();
      ctx.moveTo(x,y);
      dimensions.map(function(p,i) {
        x = xscale(p),
        y = yscale[p](d[p]);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(x+15, y);                               // right edge
      ctx.stroke();
    }
    */

    function path(d, ctx, color) {
        if (color) {
            ctx.strokeStyle = color;
        }
        ctx.beginPath();
        var x0 = xscale(0) - 15,
            y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
        ctx.moveTo(x0, y0);
        dimensions.map(function (p, i) {
            var x = xscale(p),
                y = yscale[p](d[p]);
            var cp1x = x - 0.88 * (x - x0);
            var cp1y = y0;
            var cp2x = x - 0.12 * (x - x0);
            var cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            x0 = x;
            y0 = y;
        });
        ctx.lineTo(x0 + 15, y0);                               // right edge
        ctx.stroke();
    };

    function color(d, a) {
        var c = colors[d];
        //return "black"
        return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
    }

    function position(d) {
        var v = dragging[d];
        return v == null ? xscale(d) : v;
    }

// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
    function brush(sel,isEnd) {

        brush_count++;
        var actives = dimensions.filter(function (p) {
                return !yscale[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return yscale[p].brush.extent();
            });

        let elms = [];
        let vMins = [];
        let vMaxs = [];

        let val_mins = {}
        let val_maxs = {}

        //console.log(_profiles)

        _profiles.forEach(d=>{
            val_mins[d] = []
            val_maxs[d] = []
        })


        // hack to hide ticks beyond extent
        var b = d3.selectAll('.dimension')[0]
            .forEach(function (element, i) {
                var dimension = d3.select(element).data()[0];
                if (_.include(actives, dimension)) {
                    var extent = extents[actives.indexOf(dimension)];

                    console.log(extent)
                    console.log(dimObject[dimension])
                    //console.log(yscale['Ca Concentration'].brush.extent()[0])

                    dimension === 'Sample ID' ? elms.push('Depth') : elms.push(dimension.split(" ")[0])

                    _profiles.forEach(d=>{
                        if (profile_dims[d][dimension]['max'] !== 0){
                            val_mins[d].push((extent[0] - profile_dims[d][dimension]['min']) / (profile_dims[d][dimension]['max'] - profile_dims[d][dimension]['min']));
                            val_maxs[d].push((extent[1] - profile_dims[d] [dimension]['min']) / (profile_dims[d][dimension]['max'] - profile_dims[d][dimension]['min']));
                        }
                        else{
                            val_mins[d].push(0)
                            val_maxs[d].push(0)
                        }

                    })

                    //console.log(val_mins)
                    //console.log(val_maxs)


                    // elms.push (dimension.split(" ")[0]);
                    vMins.push((extent[0] - dimObject[dimension]['min']) / (dimObject[dimension]['max'] - dimObject[dimension]['min']));
                    vMaxs.push((extent[1] - dimObject[dimension]['min']) / (dimObject[dimension]['max'] - dimObject[dimension]['min']));

                    //console.log(dimObject)

                    // elem = dimension.split(" ")[0]
                    // vMin = ((extent[0] - dimObject[dimension]['min']) / (dimObject[dimension]['max'] - dimObject[dimension]['min']));
                    // vMax = ((extent[1] - dimObject[dimension]['min']) / (dimObject[dimension]['max'] - dimObject[dimension]['min']));

                    // if(isEnd)
                    //     buildVolume(_profiles, elem, vMin, vMax);

                    d3.select(element)
                        .selectAll('text')
                        .style('font-weight', 'bold')
                        .style('font-size', '13px')
                        .style('display', function () {
                            var value = d3.select(this).data();
                            return extent[0] <= value && value <= extent[1] ? null : "none"
                        });
                } else {
                    d3.select(element)
                        .selectAll('text')
                        .style('font-size', null)
                        .style('font-weight', null)
                        .style('display', null);
                }
                d3.select(element)
                    .selectAll('.label')
                    .style('display', null);
            });

        if(isEnd)
           if (elms.length != 0 ) {
               if (elms.length === 1 && elms.includes('Depth')) {
                   elms.push('Ca')
                   _profiles.forEach(d=>{
                       val_mins[d].push((dimObject['Ca Concentration']['min'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
                       val_maxs[d].push((dimObject['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
                   })
                   initScene(_profiles, elms, val_mins, val_maxs, resolution)//(_profiles, elms, vMins, vMaxs);
               }
               initScene(_profiles, elms, val_mins, val_maxs, resolution)//(_profiles, elms, vMins, vMaxs);
           }
           else{
               _profiles.forEach(d=>{
                   val_mins[d].push((dimObject['Ca Concentration']['min'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
                   val_maxs[d].push((dimObject['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
               })

               initScene(_profiles, ['Ca'], val_mins, val_maxs, resolution)
           }


        // bold dimensions with label
        d3.selectAll('.label')
            .style("font-weight", function (dimension) {
                if (_.include(actives, dimension)) return "bold";
                return null;
            });

        // Get lines within extents
        var selected = [];
        data
            .filter(function (d) {
                return !_.contains(excluded_groups, d.group);
            })
            .map(function (d) {
                return actives.every(function (p, dimension) {
                    return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
                }) ? selected.push(d) : null;
            });

        showSelected(selected)
        // free text search
        // var query = d3.select("#search")[0][0].value;
        // if (query.length > 0) {
        //     selected = search(selected, query);
        // }

        if (selected.length < data.length && selected.length > 0) {
            d3.select("#keep-data").attr("disabled", null);
            d3.select("#exclude-data").attr("disabled", null);
        } else {
            d3.select("#keep-data").attr("disabled", "disabled");
            d3.select("#exclude-data").attr("disabled", "disabled");
        }


        // total by food group
        var tallies = _(selected)
            .groupBy(function (d) {
                return d.group;
            })

        // include empty groups
        _(colors).each(function (v, k) {
            tallies[k] = tallies[k] || [];
        });

        legend
            .style("text-decoration", function (d) {
                return _.contains(excluded_groups, d) ? "line-through" : null;
            })
            .attr("class", function (d) {
                return (tallies[d].length > 0)
                    ? "row"
                    : "row off";
            });

        legend.selectAll(".color-bar")
            .style("width", function (d) {
                return Math.ceil(600 * tallies[d].length / data.length) + "px"
            });

        legend.selectAll(".tally")
            .text(function (d, i) {
                return tallies[d].length
            });

        let lassoSelect = [];
        data.forEach(function (d){

                if (sel && sel.length && sel.includes(d.id)){
                    lassoSelect.push(d);
                    highlight(d)
                }
            }
        )

        if (!lassoSelect.length){
            unhighlight();
        }

        paths(selected, foreground, brush_count, true);
    }

// render a set of polylines on a canvas
    function paths(selected, ctx, count) {
        if (dimensions[0]){

        var n = selected.length,
            i = 0,
            opacity = d3.min([2 / Math.pow(n, 0.3), 1]),
            timer = (new Date()).getTime();

        selection_stats(opacity, n, data.length)

        var shuffled_data = _.shuffle(selected);

        //data_table(shuffled_data.slice(0,25));

        ctx.clearRect(0, 0, w + 1, h + 1);


        // render all lines until finished or a new brush event
        function animloop() {
            try {
                if (i >= n || count < brush_count) {
                    return true;}
                var max = d3.min([i + render_speed, n]);
                render_range(shuffled_data, i, max, opacity);
                render_stats(max, n, render_speed);
                i = max;
                timer = optimize(timer);  // adjusts render_speed

            }catch (e) {
                ctx.clearRect(0, 0, w + 1, h + 1);
            }
        }
        d3.timer(animloop);
    }}

// transition ticks for reordering, rescaling and inverting
        function update_ticks(d, extent) {
            // update brushes
            if (d) {
                var brush_el = d3.selectAll(".brush")
                    .filter(function(key) { return key == d; });
                // single tick
                if (extent) {
                    // restore previous extent
                    brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush).on("brushend",(sel)=>brush(sel,true)));
                } else {
                    brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush).on("brushend",(sel)=>brush(sel,true)));
                }
            } else {
                // all ticks
                d3.selectAll(".brush")
                    .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush).on("brushend",(sel)=>brush(sel,true))); })
            }

            brush_count++;

            show_ticks();

            // update axes
            d3.selectAll(".axis")
                .each(function(d,i) {
                    // hide lines for better performance
                    d3.select(this).selectAll('line').style("display", "none");

                    // transition axis numbers
                    d3.select(this)
                        .transition()
                        .duration(720)
                        .call(axis.scale(yscale[d]));

                    // bring lines back
                    d3.select(this).selectAll('line').transition().delay(800).style("display", null);

                    d3.select(this)
                        .selectAll('text')
                        .style('font-weight', null)
                        .style('font-size', null)
                        .style('display', null);
                });
        }

// Rescale to new dataset domain
    function rescale() {
        // reset yscales, preserving inverted state
        dimensions.forEach(function (d, i) {
            if (yscale[d].inverted) {
                yscale[d] = d3.scale.linear()
                    .domain(d3.extent(data, function (p) {
                        return +p[d];
                    }))
                    .range([0, h]);
                yscale[d].inverted = true;
            } else {
                yscale[d] = d3.scale.linear()
                    .domain(d3.extent(data, function (p) {
                        return +p[d];
                    }))
                    .range([h, 0]);
            }
        });

        update_ticks();

        // Render selected data
        paths(data, foreground, brush_count);
    }

// Get polylines within extents
    function actives() {
        var actives = dimensions.filter(function (p) {
                return !yscale[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return yscale[p].brush.extent();
            });

        // filter extents and excluded groups
        // var selected = [];
        // data
        //     .filter(function (d) {
        //         return !_.contains(excluded_groups, d.group);
        //     })
        //     .map(function (d) {
        //         return actives.every(function (p, i) {
        //             return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        //         }) ? selected.push(d) : null;
        //     });

        // free text search
        // var query = d3.select("#search")[0][0].value;
        // if (query > 0) {
        //     selected = search(selected, query);
        // }

        //return selected;
    }

// Export data
    function export_csv() {
        var keys = d3.keys(data[0]);
        var rows = actives().map(function (row) {
            return keys.map(function (k) {
                return row[k];
            })
        });
        var csv = d3.csv.format([keys].concat(rows)).replace(/\n/g, "<br/>\n");
        var styles = "<style>body { font-family: sans-serif; font-size: 12px; }</style>";
        window.open("text/csv").document.write(styles + csv);
    }

// scale to window size
    window.onresize = function () {
        width = document.body.clientWidth,
            height = d3.max([document.body.clientHeight - 500, 220]);

        w = width - m[1] - m[3],
            h = height - m[0] - m[2];

        d3.select("#chart")
            .style("height", (h + m[0] + m[2]) + "px")

        d3.selectAll("#chart canvas")
            .attr("width", w)
            .attr("height", h)
            .style("padding", m.join("px ") + "px");

        d3.select("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .select("g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions);
        dimensions.forEach(function (d) {
            yscale[d].range([h, 0]);
        });

        d3.selectAll(".dimension")
            .attr("transform", function (d) {
                return "translate(" + xscale(d) + ")";
            })
        // update brush placement
        d3.selectAll(".brush")
            .each(function (d) {
                d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush).on("brushend",(sel)=>brush(sel,true)));
            })
        brush_count++;

        // update axis placement
        axis = axis.ticks(1 + height / 50),
            d3.selectAll(".axis")
                .each(function (d) {
                    d3.select(this).call(axis.scale(yscale[d]));
                });

        // render data
        brush();
    };

// Remove all but selected from the dataset
    function keep_data() {
        var new_data = actives();
        if (new_data.length == 0) {
            alert("Try removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
            return false;
        }
        data = new_data;
        rescale();
    }

// Exclude selected from the dataset
    function exclude_data() {
        var new_data = _.difference(data, actives());
        if (new_data.length == 0) {
            alert("Try selecting just a few data points then clicking 'Exclude'.");
            return false;
        }
        data = new_data;
        rescale();
    }

    function remove_axis(d, g) {
        dimensions = _.difference(dimensions, [d]);
        xscale.domain(dimensions);
        g.attr("transform", function (p) {
            return "translate(" + position(p) + ")";
        });
        g.filter(function (p) {
            return p == d;
        }).remove();
        update_ticks();
    }

    d3.select("#keep-data").on("click", keep_data);
    d3.select("#exclude-data").on("click", exclude_data);
    d3.select("#export-data").on("click", export_csv);
//d3.select("#search").on("keyup", brush);


// Appearance toggles
    d3.select("#hide-ticks").on("click", hide_ticks);
    d3.select("#show-ticks").on("click", show_ticks);
    d3.select("#dark-theme").on("click", dark_theme);
    d3.select("#light-theme").on("click", light_theme);

    function hide_ticks() {
        d3.selectAll(".axis g").style("display", "none");
        //d3.selectAll(".axis path").style("display", "none");
        d3.selectAll(".background").style("visibility", "hidden");
        d3.selectAll("#hide-ticks").attr("disabled", "disabled");
        d3.selectAll("#show-ticks").attr("disabled", null);
    };

    function show_ticks() {
        d3.selectAll(".axis g").style("display", null);
        //d3.selectAll(".axis path").style("display", null);
        d3.selectAll(".background").style("visibility", null);
        d3.selectAll("#show-ticks").attr("disabled", "disabled");
        d3.selectAll("#hide-ticks").attr("disabled", null);
    };

    function dark_theme() {
        d3.select("body").attr("class", "dark");
        d3.selectAll("#dark-theme").attr("disabled", "disabled");
        d3.selectAll("#light-theme").attr("disabled", null);
    }

    function light_theme() {
        d3.select("body").attr("class", null);
        d3.selectAll("#light-theme").attr("disabled", "disabled");
        d3.selectAll("#dark-theme").attr("disabled", null);
    }

    function showSelected(selected) {

        let _selected = [];
        selected.forEach(d => _selected.push(d.id));

        let p = d3.selectAll(".dot_group");

        if (selected.length != data.length){
            p.each(function (d){
                if (d.selected || (_selected.includes(d.id))){
                    d3.select(this).select("circle").style("opacity", 1);
                }
                else{d3.select(this).select("circle").style("opacity", .25);}
            })
        }
        else if(selected.length === data.length && !sel.length){
            p.each(function(){
                d3.select(this).select("circle").style("opacity", 1);
            })
        }
        else if(selected.length === data.length && sel.length){
            p.each(function(d){
                if (!d.selected){
                    d3.select(this).select("circle").style("opacity", .25);
                }
                else{
                    d3.select(this).select("circle").style("opacity", 1);
                }
            })
        }
    }


    function buildVolume(){
        //console.log(_profiles)
        //if(elem){
        //    initScene(_profiles, elms, vMins, vMaxs)
            //initScene(_profiles, elem, vMin, vMax);
        //}
        //else{
            //initScene(_profiles, ['Ca'], [0], [1], resolution);
            //initScene(_profiles, 'Ca', 0, 1);
        //}

        let val_mins = {}
        let val_maxs = {}

        //console.log(_profiles)

        _profiles.forEach(d=>{
            val_mins[d] = []
            val_maxs[d] = []
        })


        _profiles.forEach(d=>{
            val_mins[d].push((dimObject['Ca Concentration']['min'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
            val_maxs[d].push((dimObject['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']) / (profile_dims[d]['Ca Concentration']['max'] - profile_dims[d]['Ca Concentration']['min']));
        })

        initScene(_profiles, ['Ca'], val_mins, val_maxs, resolution)
    }
    buildVolume();




}



