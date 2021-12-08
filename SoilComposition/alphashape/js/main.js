//import {initScene} from "./volume";

var width = 960,
    // size = 230,
    size = 60,
    padding = 2;
    // padding = 40;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);


var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

var color = d3.scaleOrdinal(d3.schemeCategory10);

// async function fetchData(path) {
//     try {
//         const response = await fetch(path, {
//             method: 'GET',
//             //credentials: 'same-origin'
//         });
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error(error);
//     }
// }

// var colorObj = { "r": "setosa", "l": "versicolor", "rXl": "virginica"}
var colorObj = { "r": "setosa", "l": "versicolor", "rXl": "virginica"}


async function plot_raw(ordering) {
    if (d3.selectAll('.plots')){
        d3.selectAll('.plots').remove();
    }



    let intersection_areas = await fetchData('data/intersection_areas.json')
    let paths = await fetchData('data/paths.json')
    let paths_ = paths.paths
    let separation = await fetchData('data/sorted_separations.json')
    // let each_separation = await fetchData('data/each_separations.json')
    // let each_intersection = await fetchData('data/each_intersection_areas.json')
1
    // each_separation.then(d=> slider_separation(d3.min(Object.values(d)),d3.max(Object.values(d))))

// d3.csv("data/flowers.csv", function(error, data) {
    d3.csv("data/test_all.csv", function (error, data) {


        profiles = d3.map(data, function(d){return d.profile;}).keys()

        //profiles.push('rXl')

        if (error) throw error;

        let domainByTrait = {}
        let traits;

        switch(ordering) {
            case 'default':
                traits = d3.keys(data[0]).filter(function (d) {return d !== "profile";})
                break;
            case 'intersection':
                traits = Object.keys(intersection_areas).reverse()
                break;
            case 'separation':
                traits = Object.keys(separation).reverse()
                break;}

        let n = traits.length;

        traits.forEach(function (trait) {
            domainByTrait[trait] = d3.extent(data, function (d) {
                return +d[trait];
            });
        });

        xAxis.tickSize(size * n).tickFormat(d3.format('.2s'));
        yAxis.tickSize(-size * n).tickFormat(d3.format('.2s'));

        var brush = d3.brush()
            .on("start", brushstart)
            .on("brush", brushmove)
            .on("end", brushend)
            .extent([[0, 0], [size, size]]);

        var svg = d3.select("body").append("svg")
            .attr("class", "plots")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "x axis")
            // .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
            .attr("transform", function (d, i) {
                return "translate(" + i * size + "," + size * n + ")";
            })
            // .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });
            .each(function (d, i) {
                x.domain(domainByTrait[d]);
                d3.select(this).call(xAxis.tickSize(-size * (n - i)).tickFormat(d3.format('.2s')));
            });
        svg.selectAll(".x.axis text").attr('y', 0)
            .attr("transform", `translate(0,${size * n})rotate(30)`)
            .style("text-anchor", "start");

        svg.selectAll(".y.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function (d, i) {
                return "translate(0," + i * size + ")";
            })
            // .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });
            .each(function (d, i) {
                y.domain(domainByTrait[d]);
                d3.select(this).call(yAxis.tickSize(-size * (i + 1)).tickFormat(d3.format('.2s')));
            });

        var cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter().append("g")
            //.attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + d.i * size + "," + d.j * size + ")";
            })
            // .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
            .each(plot);

        // Titles for the diagonal.
        cell.filter(function (d) {
            return d.i === d.j;
        }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function (d) {
                return d.x;
            });

        cell.call(brush);

        function plot(p) {
            var cell = d3.select(this);

            let _x = x.copy().domain(domainByTrait[p.x]);
            let _y = y.copy().domain(domainByTrait[p.y]);

            cell.attr('class' , `cell ${p.x}_${p.y}`)

            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding);

            cell.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) {
                    return _x(d[p.x]);
                })
                .attr("cy", function (d) {
                    return _y(d[p.y]);
                })
                .attr("r", 1)
                // .attr("r", 4)
                .style("fill", function (d) {
                    return color(colorObj[d.profile]);
                });

            profiles.forEach( async function(_profile){
                let _path = "alphashapes_"+_profile+"/"+_profile+"_"+p.x+"_"+p.y+".csv"
                if(p.x != p.y && paths_.includes(_path)){
                    await d3.csv(_path,function(error, data) {

                            let _x = x.copy().domain(domainByTrait[p.x]);
                            let _y = y.copy().domain(domainByTrait[p.y]);

                            if (error) return ;

                            cell.selectAll("polygon"+_profile)
                                .data([data])
                                .enter()
                                .append("polygon")
                                .attr("points",function(d) {
                                    return d.map(function(d) {
                                        // return [x(d.x),y(d.y)].join(",");
                                        return [_x(+d.x),_y(+d.y)].join(",");
                                    }).join(" ");
                                })
                                //.attr("stroke","black")
                                .attr("stroke", function(d){return color(colorObj[_profile])})
                                .style("opacity", 0.5)
                                .style("fill", function(d){return color(colorObj[_profile]);})
                                .attr("stroke-width",2);

                        }
                    )
                }
                let _path2 = "alphashapes_"+_profile+"/"+_profile+"_"+p.y+"_"+p.x+".csv"
                if(p.x != p.y && paths_.includes(_path2)){
                    await d3.csv(_path2,function(error, data) {

                            let _x = x.copy().domain(domainByTrait[p.x]);
                            let _y = y.copy().domain(domainByTrait[p.y]);

                            if (error) return ;

                            cell.selectAll("polygon"+_profile)
                                .data([data])
                                .enter()
                                .append("polygon")
                                .attr("points",function(d) {
                                    return d.map(function(d) {
                                        // return [x(d.x),y(d.y)].join(",");
                                        return [_x(+d.y),_y(+d.x)].join(",");
                                    }).join(" ");
                                })
                                //.attr("stroke","black")
                                .attr("stroke", function(d){return color(colorObj[_profile])})
                                .style("opacity", 0.5)
                                .style("fill", function(d){return color(colorObj[_profile]);})
                                .attr("stroke-width",2);

                        }
                    )
                }
            })
        }

        var brushCell;

        // Clear the previously-active brush, if any.
        function brushstart(p) {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.move, null);
                brushCell = this;
                x.domain(domainByTrait[p.x]);
                y.domain(domainByTrait[p.y]);
                //initScene(['R'], [p.x], 0, 1)
            }

        }

        // Highlight the selected circles.
        function brushmove(p) {
            var e = d3.brushSelection(this);
            svg.selectAll("circle").classed("hidden", function (d) {
                return !e
                    ? false
                    : (
                        e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                        || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                    );
            });
        }

        // If the brush is empty, select all circles.
        function brushend() {
            var e = d3.brushSelection(this);
            if (e === null) svg.selectAll(".hidden").classed("hidden", false);
        }
    });
//
// function cross(a, b) {
//     var c = [], n = a.length, m = b.length, i, j;
//     for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
//     // for (j = -1; ++j < m;) for (i = -1; ++i <= j;)  c.push({x: a[i], i: i, y: b[j], j: j});
//
//     return c;
// }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (j = -1; ++j < m;) for (i = -1; ++i <= j;) c.push({x: a[i], i: i, y: b[j], j: j});
        //for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        //console.log(c)
        return c;
    }
    slider_separation(0, 0.2593955834802844);
    slider_intersection(0, 393695090.2041057);
}
plot_raw('default')
initScene(['R'], ['Ca'], 0, 1)


async function _filter_separation(val){
    let each_separation = await fetchData('data/each_separations_2.json')

    const asArray = Object.entries(each_separation);

    const filtered = asArray.filter(([key, value]) => value >= val);

    const filtered_obj = Object.fromEntries(filtered);

    let arr =  Object.keys(filtered_obj)

    arr.forEach(d=> arr.push(`${d.toString().split('_')[1]}_${d.toString().split('_')[0]}`))

    return arr;

}

function filter_separation(val){
    d3.selectAll('.cell').attr('opacity', .25)
    if (val > 0){
        _filter_separation(val).then(function (d){
            d.forEach(d=>
                // console.log(`${d.toString().split('_')[1]}_${d.toString().split('_')[0]}`),
                d3.selectAll(`.cell.${d}`).attr('opacity', 1))
                // d3.selectAll(`.cell.${d.toString().split('_')[1]}_${d.toString().split('_')[0]}`).attr('opacity', 1))
        })
    }
    else{d3.selectAll('.cell').attr('opacity', 1)}
}

async function _filter_intersection(val){
    let each_separation = await fetchData('data/each_intersection_areas_2.json')

    const asArray = Object.entries(each_separation);

    const filtered = asArray.filter(([key, value]) => value >= val);

    const filtered_obj = Object.fromEntries(filtered);

    let arr =  Object.keys(filtered_obj)

    arr.forEach(d=> arr.push(`${d.toString().split('_')[1]}_${d.toString().split('_')[0]}`))

    return arr;

}

function filter_intersection(val){
    d3.selectAll('.cell').attr('opacity', .25)
    if (val > 0){
        _filter_intersection(val).then(function (d){
            d.forEach(d=>
                d3.selectAll(`.cell.${d}`).attr('opacity', 1),
                // d3.selectAll(`.cell.${d.toString().split('_')[1]}_${d.toString().split('_')[0]}`).attr('opacity', 1)
            )
        })
    }
    else{d3.selectAll('.cell').attr('opacity', 1)}
}

function slider_separation(min, max){

    if (d3.select('div#slider-separation svg')){
        d3.select('div#slider-separation svg').remove();
    }
    //var data = [0, 0.05];

    var sliderSimple = d3v6
        .sliderBottom()
        .min(min)
        .max(max)
        .width(300)
        //.tickFormat(d3v6.format('.2%'))
        .ticks(5)
        .default(0)
        .on('onchange', val => {
            filter_separation(val)
            d3.select('p#value-separation').text(d3v6.format('.3')(val));
        });

    var gSimple = d3v6
        .select('div#slider-separation')
        .append('svg')
        .attr('width', 400)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
    d3.select('p#value-separation').text((sliderSimple.value()));
}

function slider_intersection(min, max){
    //var data = [0, 0.05];
    if (d3.select('div#slider-intersection svg')){
        d3.select('div#slider-intersection svg').remove();
    }

    var sliderSimple = d3v6
        .sliderBottom()
        .min(min)
        .max(max)
        .width(300)
        //.tickFormat(d3v6.format('.2%'))
        .ticks(5)
        .default(0)
        .on('onchange', val => {
            filter_intersection(val)
            d3.select('p#value-intersection').text(d3v6.format('.3')(val));
        });

    var gSimple = d3v6
        .select('div#slider-intersection')
        .append('svg')
        .attr('width', 400)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
    d3.select('p#value-intersection').text((sliderSimple.value()));
}


