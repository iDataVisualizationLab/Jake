//import {initScene} from "./volume";

let margin = {top:30, bottom:0, left:30, right:0}

var width = 960,
    size = 120,
    //size = 60,
    padding = 10;
     //padding = 40;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(4);


var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(4);

var color = d3.scaleOrdinal(d3.schemeCategory10);

let profile_color = {
    'L': d3.schemeCategory10[0],
    'R': d3.schemeCategory10[1],
}

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


let combinations = []
let dots_container = {}
let delaunay_container = {}
let delaunay_properties_container = {}

function load_data(){
    Promise.all([
        d3.csv('data/L.csv'),
        d3.csv('data/R.csv'),
    ]).then(function(files) {
        process_data(files,['L','R'])
    })//.catch(function(err) {
    //     console.error(err)
    // })
}

function process_data(data, profiles){

    let elements = new Array(data.length)

    for (let i = 0 ; i < elements.length; i++){
        elements[i] = new Array()
        data[i].columns.forEach(d=> {
            d.includes("Concentration") ? elements[i].push(d.split(" ")[0]) : null
        })
    }


    let properties = []

    elements[0].forEach(d=> properties.push(`${d} Concentration`))

    console.log(properties)

    let el0 = `${elements[0][0]} Concentration`
    let el1 = `${elements[0][1]} Concentration`
    let el2 = `${elements[0][2]} Concentration`
    let el3 = `${elements[0][3]} Concentration`
    let el4 = `${elements[0][4]} Concentration`
    let el5 = `${elements[0][5]} Concentration`
    let el6 = `${elements[0][6]} Concentration`
    let el7 = `${elements[0][7]} Concentration`
    let el8 = `${elements[0][8]} Concentration`
    let el9 = `${elements[0][9]} Concentration`
    let el10 = `${elements[0][10]} Concentration`
    let el11 = `${elements[0][11]} Concentration`
    let el12 = `${elements[0][12]} Concentration`
    let el13 = `${elements[0][13]} Concentration`
    let el14 = `${elements[0][14]} Concentration`
    let el15 = `${elements[0][15]} Concentration`
    let el16 = `${elements[0][16]} Concentration`
    let el17 = `${elements[0][17]} Concentration`
    let el18 = `${elements[0][18]} Concentration`
    let el19 = `${elements[0][19]} Concentration`
    let el20 = `${elements[0][20]} Concentration`
    let el21 = `${elements[0][21]} Concentration`
    let el22 = `${elements[0][22]} Concentration`
    let el23 = `${elements[0][23]} Concentration`
    let el24 = `${elements[0][24]} Concentration`
    let el25 = `${elements[0][25]} Concentration`
    let el26 = `${elements[0][26]} Concentration`
    let el27 = `${elements[0][27]} Concentration`
    let el28 = `${elements[0][28]} Concentration`
    let el29 = `${elements[0][29]} Concentration`
    let el30 = `${elements[0][30]} Concentration`
    let el31 = `${elements[0][31]} Concentration`
    let el32 = `${elements[0][32]} Concentration`
    let el33 = `${elements[0][33]} Concentration`
    let el34 = `${elements[0][34]} Concentration`
    let el35 = `${elements[0][35]} Concentration`
    let el36 = `${elements[0][36]} Concentration`





    let elements2 = [
        el0, el1,el2, el3 , el4, el5, el6, el7, el8, el9,
        el10, el11, el12, el13, el14, el15, el16, el17, el18,
        el19, el20, el21, el22, el23, el24, el25, el26, el27,
        el28, el29, el30, el31, el32, el33, el34, el35, el36
    ]

    let filtered_data = []

    for (let i = 0; i < data.length; i++){
        let profile_data = data[i].map(function (d){
            let temp_obj = {}
            temp_obj['profile'] = profiles[i]
            properties.forEach(e=>{
                temp_obj[e] = +d[e]
            })
            // temp_obj[el0] = +d[el0]
            // temp_obj[el1] = +d[el1]
            // temp_obj[el2] = +d[el2]
            return temp_obj
        })
        filtered_data = filtered_data.concat(profile_data)
    }

    //console.log(filtered_data)


    // let filtered_data = data[0].map(function (d){
    //     let temp_obj = {}
    //     temp_obj[el1] = +d[el1]
    //     temp_obj[el2] = +d[el2]
    //     return temp_obj
    // })

    //plot(filtered_data, el1, el2, profiles)
    plot_raw(profiles, filtered_data, properties)

}

function find_max_dist(delaunay){


    function dist_squ(a, b) {
        let dx = a[0] - b[0]
        let dy = a[1] - b[1]
        return dx * dx + dy * dy
    }

    let dists = []

    const {points, triangles} = delaunay;

    //console.log(delaunay)

    for (let i = 0; i < triangles.length; i++) {
        const t0 = triangles[i * 3 + 0];
        const t1 = triangles[i * 3 + 1];
        const t2 = triangles[i * 3 + 2];

        const p0 = [points[t0 * 2], points[t0 * 2 + 1]]
        const p1 = [points[t1 * 2], points[t1 * 2 + 1]]
        const p2 = [points[t2 * 2], points[t2 * 2 + 1]]

        dists.push(d3.max([dist_squ(p0, p1),dist_squ(p1, p2),dist_squ(p2, p0)]))
    }

    return d3.extent(dists)
}

function alphashpae_filter(delaunay, combination, input, input_range) {


    let _delaunay_properties = delaunay_properties_container[combination]

    //let alpha_squ = alpha * alpha

    function dist_squ(a, b) {
        let dx = a[0] - b[0]
        let dy = a[1] - b[1]
        return dx * dx + dy * dy
    }

    let paths_container = {}
    let path_verticies_container = {}
    let path_verticies_container_2 = {}


    Object.keys(delaunay).forEach(d=>{

        let _alpha = (input / input_range) * _delaunay_properties[d]['d_range'] + _delaunay_properties[d]['d_min']

        let alpha_squ = _alpha * _alpha

        let paths = []
        const {points, triangles} = delaunay[d];

        let path_vertices = []
        let path_vertices_2 = []



        for (let i = 0; i < triangles.length; i++) {
            const t0 = triangles[i * 3 + 0];
            const t1 = triangles[i * 3 + 1];
            const t2 = triangles[i * 3 + 2];

            const p0 = [points[t0 * 2], points[t0 * 2 + 1]]
            const p1 = [points[t1 * 2], points[t1 * 2 + 1]]
            const p2 = [points[t2 * 2], points[t2 * 2 + 1]]

            if (dist_squ(p0, p1) < alpha_squ && dist_squ(p1, p2) < alpha_squ && dist_squ(p2, p0) < alpha_squ) {
                paths.push(`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`)

                path_vertices_2.push([
                    [p0[0], p0[1]],
                    [p1[0], p1[1]],
                    [p2[0], p2[1]]
                ])

                path_vertices.push([
                    {x:p0[0], y:p0[1]},
                    {x:p1[0], y:p1[1]},
                    {x:p2[0], y:p2[1]}
                ])

            }
        }

        path_verticies_container[d] = path_vertices
        path_verticies_container_2[d] = path_vertices_2
        paths_container[d] = paths;
    })

    // let intersection_area = 0
    //
    // let key1 = Object.keys(path_verticies_container)[0]
    // let key2 = Object.keys(path_verticies_container)[1]
    //
    // for (let i = 0 ; i < path_verticies_container[key1].length; i++){
    //     for (let j = 0 ; j < path_verticies_container[key2].length; j++){
    //         let inter = intersect(path_verticies_container[key1][i], path_verticies_container[key2][j])
    //         if (inter.length != 0){
    //             intersection_area += d3.polygonArea(inter[0].map(function (d){
    //                 return [d['x'], d['y']]
    //             }))
    //         }
    //
    //     }
    // }
    // console.log('intersection area', intersection_area)
    //
    // let area = {}
    //
    // Object.keys(path_verticies_container_2).forEach(d=>{
    //     area[d] = 0
    //     path_verticies_container_2[d].forEach(e=>{
    //         area[d] += d3.polygonArea(e)
    //     })
    // })
    // console.log('alpha-shape areas', area)

    return paths_container
}

function draw(paths, combination) {

    //console.log(combination)


    d3.selectAll(`.a-shape.${combination}`).remove()
    //console.log(d3.selectAll(`.a-shapes.${combination}`))

    // let svg = d3.select("#vis_div")
    //     .append("svg")
    //     .attr("width", w)
    //     .attr("height", h)
    //     .attr("class", "a-shapes");

    Object.keys(paths).forEach(d => {
        let svg = d3.select(`.cell.${combination}`)
            .append("g")
            .attr("width", width)
            .attr("height", width)
            //.attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr("class", `a-shape ${combination}`);


        svg.append("g")
            .selectAll(`.a-shape.${combination}`)
            .data(paths[d])
            .enter().append('path')
            .attr('d', e => e)
            .attr('fill', () => profile_color[d])
            .style('opacity', 0.75)
            .attr('stroke', 'black')
            .style('stroke-opacity', .125)
            .attr('class', 'a-shape-paths')
    })

    //console.log(paths)
}

async function plot_raw(profiles, filtered_data, elements) {
    if (d3.selectAll('.plots')){
        d3.selectAll('.plots').remove();
    }

    console.log(filtered_data)




    // let intersection_areas = await fetchData('data/intersection_areas.json')
    // let paths = await fetchData('data/paths.json')
    // let paths_ = paths.paths
    // let separation = await fetchData('data/sorted_separations.json')
    // let each_separation = await fetchData('data/each_separations.json')
    // let each_intersection = await fetchData('data/each_intersection_areas.json')
    // each_separation.then(d=> slider_separation(d3.min(Object.values(d)),d3.max(Object.values(d))))

    //d3.csv("data/plot_data_all.csv", function (error, data) {


        // profiles = d3.map(data, function(d){return d.profile;}).keys()
        //
        // //profiles.push('rXl')
        //
        // if (error) throw error;
        //
        let domainByElements = {}
        // let traits;
        //
        // switch(ordering) {
        //     case 'default':
        //         traits = d3.keys(data[0]).filter(function (d) {return d !== "profile";})
        //         break;
        //     case 'intersection':
        //         traits = Object.keys(intersection_areas).reverse()
        //         break;
        //     case 'separation':
        //         traits = Object.keys(separation).reverse()
        //         break;}

        let n = elements.length;

        elements.forEach(function (d) {
            domainByElements[d] = d3.extent(filtered_data, function (e) {
                return +e[d];
            });
        });

        //console.log(domainByElements)

        // xAxis.tickSize(size * n).tickFormat(d3.format('.2s'));
        // yAxis.tickSize(-size * n).tickFormat(d3.format('.2s'));

        // var brush = d3.brush()
        //     .on("start", brushstart)
        //     .on("brush", brushmove)
        //     .on("end", brushend)
        //     .extent([[0, 0], [size, size]]);

        var svg = d3.select("#vis_div").append("svg")
            .attr("class", "plots")
            .attr("width", size * n + (padding*2) + margin.left + margin.right)
            .attr("height", size * n + (padding*2) + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left} , ${margin.top})`);

        svg.selectAll(".x.axis")
            .data(elements)
            .enter().append("g")
            .attr("class", "x axis")
            // .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
            .attr("transform", function (d, i) {
                // return "translate(" + i * size + "," + size * n + ")";
                return `translate( ${i * size }, ${size * n - (padding/2)})`;

            })
            //.each(function(d) { x.domain(domainByElements[d]); d3.select(this).call(xAxis); });
            .each(function (d, i) {
                x.domain(domainByElements[d]);
                d3.select(this).call(xAxis.tickSize((-size * (n - i))+padding ).tickFormat(d3.format('.2s')));
                // d3.select(this).call(xAxis.tickSize(-size * (n - i)).tickFormat(d3.format('.2s')));
            })
            .call(g => g.selectAll(".tick line")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2,2"));

        // svg.selectAll(".x.axis text").attr('y', 0)
        //     .attr("transform", `translate(0,${size * n})rotate(30)`)
        //     .style("text-anchor", "start");

        svg.selectAll(".y.axis")
            .data(elements)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function (d, i) {
                //return "translate(0," + (i * size) +")";
                return `translate( ${(padding/2)}, ${i * size})`;

            })
            // .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });
            .each(function (d, i) {
                y.domain(domainByElements[d]);
                d3.select(this).call(yAxis.tickSize((-size * (i + 1))+padding).tickFormat(d3.format('.2s')));
            })
            .call(g => g.selectAll(".tick line")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2,2"))
            // .call(g => g.selectAll(".tick text")
            //     .attr("x", 4)
            //     .attr("dy", -4))

        var cell = svg.selectAll(".cell")
            .data(cross(elements, elements))
            .enter().append("g")
            //.attr("class", "cell")
            .attr("transform", function (d) {
                // return "translate(" + d.i * size + "," + d.j * size + ")";
                return `translate(${d.i * size},${d.j * size})`;
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
                return d.x.split(" ")[0];
            })
            .style("font", "20px times");

        //cell.call(brush);

        function plot(p) {
            var cell = d3.select(this);

            let _x = x.copy().domain(domainByElements[p.x]);
            let _y = y.copy().domain(domainByElements[p.y]);

            let x_el = p.x.split(" ")[0]
            let y_el = p.y.split(" ")[0]

            cell.attr('class' , `cell ${x_el}_x_${y_el}`)

            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding)
                .attr('fill', 'none')

            cell.selectAll("circle")
                .data(filtered_data)
                .enter().append("circle")
                .attr("cx", function (d) {
                    return _x(d[p.x]);
                })
                .attr("cy", function (d) {
                    return _y(d[p.y]);
                })
                .attr("r", 2)
                // .attr("r", 4)
                .style("fill", function (d) {
                    return profile_color[d.profile];
                });

            let profiles = [... new Set(filtered_data.map(d=> d.profile))]

            //console.log(profiles)

            let dots = {}

            profiles.forEach(d=>{
                dots[d] = filtered_data.filter(e=> e.profile === d).map(function (f){
                    return {x: _x(f[p.x]), y: _y(f[p.y])}
                })
            })

            dots_container[`${x_el}_x_${y_el}`] = dots

            let delaunay = {}

            Object.keys(dots).forEach(d=>{
                delaunay[d] = d3.Delaunay.from(
                    dots[d],
                    (e) => e.x,
                    (e) => e.y
                )
            })

            delaunay_container[`${x_el}_x_${y_el}`] = delaunay

            delaunay_properties = {}

            Object.keys(delaunay).forEach(d=> {
                delaunay_properties[d] = {}
                delaunay_properties[d]['d_res'] = find_max_dist(delaunay[d])
                delaunay_properties[d]['d_min'] = Math.sqrt(delaunay_properties[d]['d_res'][0])
                delaunay_properties[d]['d_max'] = Math.sqrt(delaunay_properties[d]['d_res'][1])
                delaunay_properties[d]['d_range'] = delaunay_properties[d]['d_max'] - delaunay_properties[d]['d_min']
            })

            delaunay_properties_container[`${x_el}_x_${y_el}`] = delaunay_properties

            combinations.push(`${x_el}_x_${y_el}`)

            draw(alphashpae_filter(delaunay,`${x_el}_x_${y_el}`, 1000, 1000), `${x_el}_x_${y_el}`)



            // filtered_data.filter(e=> e.profile === d).filtered_data.forEach(function (d){
            //     return {x: x_scale(d[_x]), y: y_scale(d[_y])}
            // })

            // filtered_data.filter(e=> e.profile===d).map(function(d){
            //     return {x: x_scale(d[_x]), y: y_scale(d[_y])}
            //
            // d3.Delaunay.from(
            //     dots[d]


            //
            // profiles.forEach( async function(_profile){
            //     let _path = "alphashapes_"+_profile+"/"+_profile+"_"+p.x+"_"+p.y+".csv"
            //     if(p.x != p.y && paths_.includes(_path)){
            //         await d3.csv(_path,function(error, data) {
            //
            //                 let _x = x.copy().domain(domainByTrait[p.x]);
            //                 let _y = y.copy().domain(domainByTrait[p.y]);
            //
            //                 if (error) return ;
            //
            //                 cell.selectAll("polygon"+_profile)
            //                     .data([data])
            //                     .enter()
            //                     .append("polygon")
            //                     .attr("points",function(d) {
            //                         return d.map(function(d) {
            //                             // return [x(d.x),y(d.y)].join(",");
            //                             return [_x(+d.x),_y(+d.y)].join(",");
            //                         }).join(" ");
            //                     })
            //                     //.attr("stroke","black")
            //                     .attr("stroke", function(d){return color(colorObj[_profile])})
            //                     .style("opacity", 0.5)
            //                     .style("fill", function(d){return color(colorObj[_profile]);})
            //                     .attr("stroke-width",2);
            //
            //             }
            //         )
            //     }
            //     let _path2 = "alphashapes_"+_profile+"/"+_profile+"_"+p.y+"_"+p.x+".csv"
            //     if(p.x != p.y && paths_.includes(_path2)){
            //         await d3.csv(_path2,function(error, data) {
            //
            //                 let _x = x.copy().domain(domainByTrait[p.x]);
            //                 let _y = y.copy().domain(domainByTrait[p.y]);
            //
            //                 if (error) return ;
            //
            //                 cell.selectAll("polygon"+_profile)
            //                     .data([data])
            //                     .enter()
            //                     .append("polygon")
            //                     .attr("points",function(d) {
            //                         return d.map(function(d) {
            //                             // return [x(d.x),y(d.y)].join(",");
            //                             return [_x(+d.y),_y(+d.x)].join(",");
            //                         }).join(" ");
            //                     })
            //                     //.attr("stroke","black")
            //                     .attr("stroke", function(d){return color(colorObj[_profile])})
            //                     .style("opacity", 0.5)
            //                     .style("fill", function(d){return color(colorObj[_profile]);})
            //                     .attr("stroke-width",2);
            //
            //             }
            //        )
            //    }
            //})
        }

    //     var brushCell;
    //
    //     // Clear the previously-active brush, if any.
    //     function brushstart(p) {
    //         if (brushCell !== this) {
    //             d3.select(brushCell).call(brush.move, null);
    //             brushCell = this;
    //             x.domain(domainByTrait[p.x]);
    //             y.domain(domainByTrait[p.y]);
    //             initScene(['R','R','L','L'], [p.x,p.y], 0, 1)
    //         }
    //
    //     }
    //
    //     // Highlight the selected circles.
    //     function brushmove(p) {
    //         var e = d3.brushSelection(this);
    //         svg.selectAll("circle").classed("hidden", function (d) {
    //             return !e
    //                 ? false
    //                 : (
    //                     e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
    //                     || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
    //                 );
    //         });
    //     }
    //
    //     // If the brush is empty, select all circles.
    //     function brushend() {
    //         var e = d3.brushSelection(this);
    //         if (e === null) svg.selectAll(".hidden").classed("hidden", false);
    //     }
    // });
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
    // slider_separation(0, 0.2593955834802844);
    // slider_intersection(0, 393695090.2041057);
}

function change_alpha(input, input_range){

    combinations.forEach(d=>{
        draw(alphashpae_filter(delaunay_container[d], d, input, input_range), d)
    })

    //draw(alphashpae_filter(delaunay, val, ((max-min)-1), dots))
}


function make_slider(slider_id, min, max, value, step, width){
    let slider = d3.select("#sliders")
        .append('g')
        .attr('class', slider_id)

    slider.append('input')
        .attr("type", "range")
        .attr('min', min)
        .attr('max', max)
        .attr('value', value)
        .attr('step', step)
        .style('width', `${width}px`)
        .on('input', function(){
            let val = d3.select(this).property("value")
            //console.log(adjust_values(d_min, d_range, val, max-min))
            change_alpha(val, ((max-min)-1))
            //draw(alphashpae_filter(delaunay, val, ((max-min)-1), dots))

            //draw(alphashpae_filter(delaunay,adjust_values(d_min, d_range, val, max-min)), dots)
            d3.select(`#${slider_id}_value_text`).text(val)
        });

    slider.append('p')
        .text("Alpha: ")
        .append('span')
        .attr('id', `${slider_id}_value_text`)
        .text(value)
}

make_slider('s1',0,1000,1000,1, 200)

load_data()




//
// async function plot_raw(ordering) {
//     if (d3.selectAll('.plots')){
//         d3.selectAll('.plots').remove();
//     }
//
//
//
//     let intersection_areas = await fetchData('data/intersection_areas.json')
//     let paths = await fetchData('data/paths.json')
//     let paths_ = paths.paths
//     let separation = await fetchData('data/sorted_separations.json')
//     // let each_separation = await fetchData('data/each_separations.json')
//     // let each_intersection = await fetchData('data/each_intersection_areas.json')
//     // each_separation.then(d=> slider_separation(d3.min(Object.values(d)),d3.max(Object.values(d))))
//
//     d3.csv("data/plot_data_all.csv", function (error, data) {
//
//
//         profiles = d3.map(data, function(d){return d.profile;}).keys()
//
//         //profiles.push('rXl')
//
//         if (error) throw error;
//
//         let domainByTrait = {}
//         let traits;
//
//         switch(ordering) {
//             case 'default':
//                 traits = d3.keys(data[0]).filter(function (d) {return d !== "profile";})
//                 break;
//             case 'intersection':
//                 traits = Object.keys(intersection_areas).reverse()
//                 break;
//             case 'separation':
//                 traits = Object.keys(separation).reverse()
//                 break;}
//
//         let n = traits.length;
//
//         traits.forEach(function (trait) {
//             domainByTrait[trait] = d3.extent(data, function (d) {
//                 return +d[trait];
//             });
//         });
//
//         xAxis.tickSize(size * n).tickFormat(d3.format('.2s'));
//         yAxis.tickSize(-size * n).tickFormat(d3.format('.2s'));
//
//         var brush = d3.brush()
//             .on("start", brushstart)
//             .on("brush", brushmove)
//             .on("end", brushend)
//             .extent([[0, 0], [size, size]]);
//
//         var svg = d3.select("body").append("svg")
//             .attr("class", "plots")
//             .attr("width", size * n + padding)
//             .attr("height", size * n + padding)
//             .append("g")
//             .attr("transform", "translate(" + padding + "," + padding / 2 + ")");
//
//         svg.selectAll(".x.axis")
//             .data(traits)
//             .enter().append("g")
//             .attr("class", "x axis")
//             // .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
//             .attr("transform", function (d, i) {
//                 return "translate(" + i * size + "," + size * n + ")";
//             })
//             // .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });
//             .each(function (d, i) {
//                 x.domain(domainByTrait[d]);
//                 d3.select(this).call(xAxis.tickSize(-size * (n - i)).tickFormat(d3.format('.2s')));
//             });
//         svg.selectAll(".x.axis text").attr('y', 0)
//             .attr("transform", `translate(0,${size * n})rotate(30)`)
//             .style("text-anchor", "start");
//
//         svg.selectAll(".y.axis")
//             .data(traits)
//             .enter().append("g")
//             .attr("class", "y axis")
//             .attr("transform", function (d, i) {
//                 return "translate(0," + i * size + ")";
//             })
//             // .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });
//             .each(function (d, i) {
//                 y.domain(domainByTrait[d]);
//                 d3.select(this).call(yAxis.tickSize(-size * (i + 1)).tickFormat(d3.format('.2s')));
//             });
//
//         var cell = svg.selectAll(".cell")
//             .data(cross(traits, traits))
//             .enter().append("g")
//             //.attr("class", "cell")
//             .attr("transform", function (d) {
//                 return "translate(" + d.i * size + "," + d.j * size + ")";
//             })
//             // .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
//             .each(plot);
//
//         // Titles for the diagonal.
//         cell.filter(function (d) {
//             return d.i === d.j;
//         }).append("text")
//             .attr("x", padding)
//             .attr("y", padding)
//             .attr("dy", ".71em")
//             .text(function (d) {
//                 return d.x;
//             });
//
//         cell.call(brush);
//
//         function plot(p) {
//             var cell = d3.select(this);
//
//             let _x = x.copy().domain(domainByTrait[p.x]);
//             let _y = y.copy().domain(domainByTrait[p.y]);
//
//             cell.attr('class' , `cell ${p.x}_${p.y}`)
//
//             cell.append("rect")
//                 .attr("class", "frame")
//                 .attr("x", padding / 2)
//                 .attr("y", padding / 2)
//                 .attr("width", size - padding)
//                 .attr("height", size - padding);
//
//             cell.selectAll("circle")
//                 .data(data)
//                 .enter().append("circle")
//                 .attr("cx", function (d) {
//                     return _x(d[p.x]);
//                 })
//                 .attr("cy", function (d) {
//                     return _y(d[p.y]);
//                 })
//                 .attr("r", 1)
//                 // .attr("r", 4)
//                 .style("fill", function (d) {
//                     return color(colorObj[d.profile]);
//                 });
//
//             profiles.forEach( async function(_profile){
//                 let _path = "alphashapes_"+_profile+"/"+_profile+"_"+p.x+"_"+p.y+".csv"
//                 if(p.x != p.y && paths_.includes(_path)){
//                     await d3.csv(_path,function(error, data) {
//
//                             let _x = x.copy().domain(domainByTrait[p.x]);
//                             let _y = y.copy().domain(domainByTrait[p.y]);
//
//                             if (error) return ;
//
//                             cell.selectAll("polygon"+_profile)
//                                 .data([data])
//                                 .enter()
//                                 .append("polygon")
//                                 .attr("points",function(d) {
//                                     return d.map(function(d) {
//                                         // return [x(d.x),y(d.y)].join(",");
//                                         return [_x(+d.x),_y(+d.y)].join(",");
//                                     }).join(" ");
//                                 })
//                                 //.attr("stroke","black")
//                                 .attr("stroke", function(d){return color(colorObj[_profile])})
//                                 .style("opacity", 0.5)
//                                 .style("fill", function(d){return color(colorObj[_profile]);})
//                                 .attr("stroke-width",2);
//
//                         }
//                     )
//                 }
//                 let _path2 = "alphashapes_"+_profile+"/"+_profile+"_"+p.y+"_"+p.x+".csv"
//                 if(p.x != p.y && paths_.includes(_path2)){
//                     await d3.csv(_path2,function(error, data) {
//
//                             let _x = x.copy().domain(domainByTrait[p.x]);
//                             let _y = y.copy().domain(domainByTrait[p.y]);
//
//                             if (error) return ;
//
//                             cell.selectAll("polygon"+_profile)
//                                 .data([data])
//                                 .enter()
//                                 .append("polygon")
//                                 .attr("points",function(d) {
//                                     return d.map(function(d) {
//                                         // return [x(d.x),y(d.y)].join(",");
//                                         return [_x(+d.y),_y(+d.x)].join(",");
//                                     }).join(" ");
//                                 })
//                                 //.attr("stroke","black")
//                                 .attr("stroke", function(d){return color(colorObj[_profile])})
//                                 .style("opacity", 0.5)
//                                 .style("fill", function(d){return color(colorObj[_profile]);})
//                                 .attr("stroke-width",2);
//
//                         }
//                     )
//                 }
//             })
//         }
//
//         var brushCell;
//
//         // Clear the previously-active brush, if any.
//         function brushstart(p) {
//             if (brushCell !== this) {
//                 d3.select(brushCell).call(brush.move, null);
//                 brushCell = this;
//                 x.domain(domainByTrait[p.x]);
//                 y.domain(domainByTrait[p.y]);
//                 initScene(['R','R','L','L'], [p.x,p.y], 0, 1)
//             }
//
//         }
//
//         // Highlight the selected circles.
//         function brushmove(p) {
//             var e = d3.brushSelection(this);
//             svg.selectAll("circle").classed("hidden", function (d) {
//                 return !e
//                     ? false
//                     : (
//                         e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
//                         || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
//                     );
//             });
//         }
//
//         // If the brush is empty, select all circles.
//         function brushend() {
//             var e = d3.brushSelection(this);
//             if (e === null) svg.selectAll(".hidden").classed("hidden", false);
//         }
//     });
// //
// // function cross(a, b) {
// //     var c = [], n = a.length, m = b.length, i, j;
// //     for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
// //     // for (j = -1; ++j < m;) for (i = -1; ++i <= j;)  c.push({x: a[i], i: i, y: b[j], j: j});
// //
// //     return c;
// // }
//
//     function cross(a, b) {
//         var c = [], n = a.length, m = b.length, i, j;
//         for (j = -1; ++j < m;) for (i = -1; ++i <= j;) c.push({x: a[i], i: i, y: b[j], j: j});
//         //for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
//         //console.log(c)
//         return c;
//     }
//     slider_separation(0, 0.2593955834802844);
//     slider_intersection(0, 393695090.2041057);
// }
// plot_raw('default')
// initScene(['R'], ['Ca'], 0, 1)


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
            // d3.select('p#value-separation').text(d3v6.format('.3')(val));
        });

    var gSimple = d3v6
        .select('div#slider-separation')
        .append('svg')
        .attr('width', 400)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
    // d3.select('p#value-separation').text((sliderSimple.value()));
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
            // d3.select('p#value-intersection').text(d3v6.format('.3')(val));
        });

    var gSimple = d3v6
        .select('div#slider-intersection')
        .append('svg')
        .attr('width', 400)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
    // d3.select('p#value-intersection').text((sliderSimple.value()));
}


