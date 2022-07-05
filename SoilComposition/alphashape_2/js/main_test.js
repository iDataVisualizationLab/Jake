const w = window.innerWidth;
const h = (w * 9) / 16;

// const data = Array(100)
//     .fill()
//     .map((_, i) => ({ x: (i * w) / 100, y: Math.random() * h }));

// let delaunay = d3.Delaunay.from(
//     data,
//     (d) => d.x,
//     (d) => d.y
// )

let profile_color = {
    'L': d3.schemeCategory10[0],
    'R': d3.schemeCategory10[1],
}

// let profile_color = {
//     0: d3.schemeCategory10[0],
//     1: d3.schemeCategory10[1],
// }

//console.log(profile_color)

let margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 1960 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;

let delaunay
let dots
let delaunay_properties

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

    return [d3.min(dists),d3.max(dists)]
}

// let d_res = find_max_dist(delaunay)
// let d_min = Math.sqrt(d_res[0])
// let d_max = Math.sqrt(d_res[1])
// let d_range = d_max-d_min

let d_res
let d_min
let d_max
let d_range


function adjust_values(min, range, input, input_range){
    return (input / input_range) * range + min
}


function alphashpae_filter(delaunay, input, input_range) {




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

        let _alpha = (input / input_range) * delaunay_properties[d]['d_range'] + delaunay_properties[d]['d_min']

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

    let intersection_area = 0

    let key1 = Object.keys(path_verticies_container)[0]
    let key2 = Object.keys(path_verticies_container)[1]

    for (let i = 0 ; i < path_verticies_container[key1].length; i++){
        for (let j = 0 ; j < path_verticies_container[key2].length; j++){
            let inter = intersect(path_verticies_container[key1][i], path_verticies_container[key2][j])
            if (inter.length != 0){
                intersection_area += d3.polygonArea(inter[0].map(function (d){
                    return [d['x'], d['y']]
                }))
            }

        }
    }
    console.log('intersection area', intersection_area)

    let area = {}

    Object.keys(path_verticies_container_2).forEach(d=>{
        area[d] = 0
        path_verticies_container_2[d].forEach(e=>{
            area[d] += d3.polygonArea(e)
        })
    })
    console.log('alpha-shape areas', area)

    return paths_container
}

function draw(paths, points){


    d3.selectAll('.a-shapes').remove()

    // let svg = d3.select("#vis_div")
    //     .append("svg")
    //     .attr("width", w)
    //     .attr("height", h)
    //     .attr("class", "a-shapes");

    Object.keys(paths).forEach(d=>{
        let svg = d3.select("#plot")
            .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr("class", "a-shapes");

        svg.append("g")
            .selectAll(".a_shape")
            .data(paths[d])
            .enter().append('path')
            .attr('d', e=>e)
            .attr('fill', ()=> profile_color[d])
            .style('opacity', 0.75)
            .attr('stroke', 'black')
            .style('stroke-opacity', .125)
            .attr('class','a-shape-paths')
    })

    // let svg = d3.select("#plot")
    //     .append("g")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //     .attr("class", "a-shapes");
    //
    // svg.append("g")
    //     .selectAll(".a_shape")
    //     .data(paths)
    //     .enter().append('path')
    //     .attr('d', d=>d)
    //     .attr('fill', 'gray')
    //     .attr('stroke', 'black')
    //     .attr('class','a-shape-paths')

    // svg.append("g")
    //     .selectAll("circle")
    //     .data(points)
    //     .enter().append("circle")
    //     .attr("r", 3)
    //     .attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });
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


            draw(alphashpae_filter(delaunay, val, ((max-min)-1), dots))

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
//draw(alphashpae_filter(delaunay,0), data)

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

function process_data(data,profiles){

    let elements = new Array(data.length)

    for (let i = 0 ; i < elements.length; i++){
        elements[i] = new Array()
        data[i].columns.forEach(d=> {
            d.includes("Concentration") ? elements[i].push(d.split(" ")[0]) : null
        })
    }

    let el1 = `${elements[0][1]} Concentration`
    let el2 = `${elements[0][2]} Concentration`

    let filtered_data = []

    for (let i = 0; i < data.length; i++){
        let profile_data = data[i].map(function (d){
            let temp_obj = {}
            temp_obj['profile'] = profiles[i]
            temp_obj[el1] = +d[el1]
            temp_obj[el2] = +d[el2]
            return temp_obj
        })
        filtered_data = filtered_data.concat(profile_data)
    }

    console.log(filtered_data)


    // let filtered_data = data[0].map(function (d){
    //     let temp_obj = {}
    //     temp_obj[el1] = +d[el1]
    //     temp_obj[el2] = +d[el2]
    //     return temp_obj
    // })

    plot(filtered_data, el1, el2, profiles)
}

function plot(data, _x, _y, profiles){

    console.log(_x)


    let x_scale = d3.scaleLinear().range([0, width]);
    let y_scale = d3.scaleLinear().range([height, 0]);

    let svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('id', 'plot')
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //x.domain(d3.extent(data, function(d) { return d[_x]; }));
    x_scale.domain([d3.min(data, function(d) { return d[_x]; }), d3.max(data, function(d) { return d[_x]; })])
    y_scale.domain([d3.min(data, function(d) { return d[_y]; }), d3.max(data, function(d) { return d[_y]; })]);

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", d=>d.profile)
        .attr("r", 3)
        .attr("cx", function(d) {return x_scale(d[_x]); })
        .attr("cy", function(d) {return y_scale(d[_y]); })
        .style('fill', d=> profile_color[d.profile]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_scale));

    svg.append("text")  // text label for the x axis
        .attr("x", width/2 )
        .attr("y",  height + 40 )
        .style("text-anchor", "middle")
        .text(_x);

    // Add the Y Axis
    svg.append("g")
       .call(d3.axisLeft(y_scale));

    svg.append("text")  // text label for the y axis
        .style("text-anchor", "middle")
        .attr("x", 0 )
        .attr("y",  0 )
        //.style("text-anchor", "middle")
        .style("transform-origin", "top left")
        .attr("transform", ` translate(-50, ${height/2})  rotate(-90)`)
        //.attr("transform", `translate(0, ${height/2})`)
        .text(_y);

    dots = {}

    profiles.forEach(d=> {
        dots[d] = data.filter(e=> e.profile===d).map(function(d){
                return {x: x_scale(d[_x]), y: y_scale(d[_y])}
        })
    })
    console.log(dots)

    delaunay = {}

    Object.keys(dots).forEach(d=>{
        delaunay[d] = d3.Delaunay.from(
            dots[d],
            (e) => e.x,
            (e) => e.y
        )
    })


    delaunay_properties = {}

    Object.keys(delaunay).forEach(d=> {
        delaunay_properties[d] = {}
        delaunay_properties[d]['d_res'] = find_max_dist(delaunay[d])
        delaunay_properties[d]['d_min'] = Math.sqrt(delaunay_properties[d]['d_res'][0])
        delaunay_properties[d]['d_max'] = Math.sqrt(delaunay_properties[d]['d_res'][1])
        delaunay_properties[d]['d_range'] = delaunay_properties[d]['d_max'] - delaunay_properties[d]['d_min']
    })
    // d_res = find_max_dist(delaunay)
    // d_min = {}
    // d_max = {}
    // d_range = {}
    // Object.keys(delaunay).forEach(d=> )
    // d_min = d3.min([delaunay_properties[profiles[0]]['d_min'],delaunay_properties[profiles[1]]['d_min']])
    // d_max = d3.max([delaunay_properties[profiles[0]]['d_min'],delaunay_properties[profiles[1]]['d_min']])
    // d_range = d_max-d_min
    //
    // console.log(d_min)
    // console.log(d_max)

    draw(alphashpae_filter(delaunay,1000, 1000), dots)
    console.log(delaunay_properties)

}
add_array_equals()

function draw2(paths, points) {



    //d3.selectAll('.a-shapes').remove()

    let svg = d3.select("#vis_div")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("class", "a-shapes");

    //Object.keys(paths).forEach(d => {
    // let svg = d3.select("#vis_div")
    //     .append("g")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //     .attr("class", "a-shapes");

    console.log(width)
    console.log(height)

    svg.append("g")
        .selectAll(".a-shape-paths")
        .data(paths)
        .enter().append('path')
        .attr('d', d => d)
        //.attr('fill', () => 'blue')
        .attr('fill', (d) => {
            return d3.schemeCategory10[paths.indexOf(d) % 10]
        })
        .style('opacity', 0.75)
        .attr('stroke', 'black')
        .style('stroke-opacity', .125)
        .attr('class', 'a-shape-paths')

    svg.append("g")
        .selectAll("circle")
        .data(points)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    // })
}



function make_paths(points){

    let points2 = []

    let p3 = {}

    let id = 0

    let paths = []
    points.forEach(d=>{
        console.log(d)
        paths.push(`M ${(d[0][0])} ${(d[0][1])} L ${d[1][0]} ${d[1][1]} L ${d[2][0]} ${d[2][1]} Z`)

        let p = []
        d.forEach(e=>{
            points2.push({x: e[0], y:e[1]})
            p.push({x: e[0], y:e[1]})
        })
        p3[id++] = p
    })

    paths.push(`M ${1010} ${10} L ${1210} ${10} L ${1210} ${210} L ${1010} ${210} Z`)

    //console.log(points2)

    draw2(paths, points2)
    reduce_points(p3, false)

}

let points = [
    [[10,10], [210,10], [210,210]],
    [[10,10], [10,210], [210,210]],
    [[210,10], [410,10], [210,210]],
    [[410,10], [410,210], [210,210]],
    [[210,210], [410,210], [410,410]],
    [[210,210], [410,410], [210,410]],
    [[210,210], [210,410], [10,410]],
    [[10,210], [10,410], [210,210]],
    [[10,410], [210,410], [10,610]],
    [[10,610], [210,610], [210,410]],
    [[10,610], [210,610], [210,810]],
    [[210,610], [210,810], [410,810]],
    [[210,610], [410,610], [410,810]],
    [[410,610], [610,610], [410,810]],
    [[610,610], [610,410], [410,610]],
    [[610,410], [410,410], [410,610]],
    [[410,410], [410,210], [610,410]]
]

make_paths(points)

function add_array_equals(){
    if(Array.prototype.equals)
        console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");// attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
// Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", {enumerable: false});
}

//
// function reduce_points2(p3){
//
// }



function reduce_points(p3, combined){
    console.log(p3)

    let p4 = {...p3}

    let n_p3 = {}
    let id = 0

    let used_j = []
    let used_i = []

    for (let i = parseInt(Object.keys(p3)[0]); i < Object.keys(p3).length; i++){
        for (let j = parseInt(Object.keys(p4)[1]); j < Object.keys(p3).length; j++){

            if ( i!=j  && !used_i.includes(i) && !used_j.includes(j)) {

                let lines_1 = []
                let lines_2 = []

                for (let k = 0; k < p3[i].length; k++) {

                    let to_point = (k+1) === 3 ? 0 : k+1

                    let l1 = {}
                    l1.x1 = p3[i][k].x
                    l1.y1 = p3[i][k].y
                    l1.x2 = p3[i][to_point].x
                    l1.y2 = p3[i][to_point].y
                    lines_1.push(l1)

                    let l2 = {}
                    l2.x1 = p4[j][k].x
                    l2.y1 = p4[j][k].y
                    l2.x2 = p4[j][to_point].x
                    l2.y2 = p4[j][to_point].y
                    lines_2.push(l2)
                }

                let res = []
                let neighbors = false
                for (let k = 0; k < lines_1.length; k++) {
                    for (let l = 1; l < lines_2.length; l++) {
                        if ((lines_1[k].x1 == lines_2[k].x1 && lines_1[k].y1 == lines_2[k].y1 && lines_1[k].x2 == lines_2[k].x2 && lines_1[k].y2 == lines_2[k].y2) || (lines_1[k].x1 == lines_2[k].x2 && lines_1[k].y1 == lines_2[k].y2 && lines_1[k].x2 == lines_2[k].x1 && lines_1[k].y2 == lines_2[k].y1)) {
                            neighbors = true
                        }
                    }
                }
                if (neighbors) {
                    lines_1.forEach(d => {
                        res.some(e => (e.x1 === d.x1 && e.y1 === d.y1 && e.x2 === d.x2 && e.y2 === d.y2) || (e.x1 === d.x2 && e.y1 === d.y2 && e.x2 === d.x1 && e.y2 === d.y1)) ? null : res.push(d)
                    })
                    lines_2.forEach(d => {
                        res.some(e => (e.x1 === d.x1 && e.y1 === d.y1 && e.x2 === d.x2 && e.y2 === d.y2) || (e.x1 === d.x2 && e.y1 === d.y2 && e.x2 === d.x1 && e.y2 === d.y1)) ? null : res.push(d)
                    })
                    used_i.push(i)
                    used_j.push(j)
                    n_p3[id++] = res
                }
            }
        }
    }
    console.log(n_p3)

    let n2_p3 = []

    Object.keys(n_p3).forEach(e=>{
        let n2_p3_2 = []
        n_p3[e].forEach(d=>{
            let _p1 = [d.x1, d.y1]
            let _p2 = [d.x2, d.x1]

            let found_p1 = false
            n2_p3_2.forEach(f=>{
                f.equals(_p1) ? found_p1 = true : null
            })
            found_p1 ? null : n2_p3_2.push(_p1)

            let found_p2 = false
            n2_p3_2.forEach(f=>{
                f.equals(_p2) ? found_p2 = true : null
            })
            found_p2 ? null : n2_p3_2.push(_p2)

        })
        n2_p3.push(n2_p3_2)
    })

    console.log(n2_p3)
    //draw3(polySort(n2_p3))


}


function draw3(polygon_points, points) {



    //d3.selectAll('.a-shapes').remove()
    let svg = d3.select(".a-shapes")
    //
    // let svg = d3.select("#vis_div")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //     .attr("class", "a-shapes");

    //Object.keys(paths).forEach(d => {
    // let svg = d3.select("#vis_div")
    //     .append("g")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //     .attr("class", "a-shapes");

    // polygon_points.forEach(e=>{
    //    svg.append('polygon')
    //        .data([e.join(' ')])
    //        .attr('points', d=>d)
    //        .attr('stroke', '#f00')
    //        .attr('fill', 'none')
    //        .attr('class', 'polygons');
    // })

    polygon_points.forEach(e=>{
        svg.append('polygon')
            .data([polygon_points.join(' ')])
            .attr('points', d=>d)
            .attr('stroke', '#f00')
            .attr('fill', 'none')
            .attr('class', 'polygons');
    })

       // svg.append('polygon')
       //     .data([polygon_points[1].join(' ')])
       //     .attr('points', d=>d)
       //     .attr('stroke', '#f00')
       //     .attr('fill', 'none')
       //     .attr('class', 'polygons');





    // console.log(width)
    // console.log(height)
    //
    // svg.append("g")
    //     .selectAll(".a-shape-paths")
    //     .data(paths)
    //     .enter().append('path')
    //     .attr('d', d => d)
    //     //.attr('fill', () => 'blue')
    //     .attr('fill', (d) => {
    //         return d3.schemeCategory10[paths.indexOf(d) % 10]
    //     })
    //     .style('opacity', 0.75)
    //     .attr('stroke', 'black')
    //     .style('stroke-opacity', .125)
    //     .attr('class', 'a-shape-paths')
    //
    // svg.append("g")
    //     .selectAll("circle")
    //     .data(points)
    //     .enter().append("circle")
    //     .attr("r", 3)
    //     .attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });
    // // })
}





// function reduce_points(p3, combined){
//     if (combined === 0){
//         console.log(p3)
//         return
//     }
//
//     //console.log(p3)
//
//     let res2 = []
//
//     let p4 = [...p3]
//
//     let _combined = 0
//
//     console.log(p3)
//
//     for (let i = 0; i < p3.length; i++){
//         for (let j = 1; j < p4.length; j++){
//
//             let common = 0
//             let res = []
//
//             for (let k=0 ; k< p3[i].length; k++){
//                 for (let l = 0; l < p4[i].length; l++){
//                     p3[i][k].x == p4[j][l].x && p3[i][k].y == p4[j][l].y ? common++ : null
//                 }
//             }
//
//             if (common == 2){
//                 // p3[i].forEach(d=> res.push(d))
//                 // p4[j].forEach(d=> res.includes(d) ? null : res.push(d))
//                 p3[i].forEach(d=>{
//                     res.some(e => e.x === d.x && e.y === d.y) ? null : res.push(d)
//                 })
//                 p4[j].forEach(d=>{
//                     res.some(e => e.x === d.x && e.y === d.y) ? null : res.push(d)
//                 })
//                 res2.push(res)
//                 _combined++
//             }
//         }
//     }
//
//     res2.forEach(d=>{
//         d.sort((a, b) => (a.x > b.x) ? 1 : -1)
//     })
//
//
//
//     //
//     // let res2_del = []
//     //
//     // for (let i = 0; i < res2.length; i++){
//     //     for (let j = 1; j < res2.length; j++){
//     //         hashCode(JSON.stringify(res2[i])) === hashCode(JSON.stringify(res2[j])) ? res2_del.push([i,j]) : null
//     //     }
//     // }
//     //
//     // console.log(res2_del)
//     //
//     console.log(res2)
//
//
//
//
//     // res2.forEach(d=>{
//     //     res2.forEach(e=>{
//     //         hashCode(JSON.stringify(e)) === hashCode(JSON.stringify(d)) ? delete res2[d] : null
//     //     })
//     // })
//     //
//     // console.log(res2)
//     //reduce_points(res2, _combined)
// }
//
// function hashCode(string){
//     var hash = 0;
//     for (var i = 0; i < string.length; i++) {
//         var code = string.charCodeAt(i);
//         hash = ((hash<<5)-hash)+code;
//         hash = hash & hash; // Convert to 32bit integer
//     }
//     return hash;
// }


//
// let points2 = points
//
// let points3 = []
//
//
// for (let i = 0; i < points.length; i++){
//     for (let j = 1; j < points2.length; j++){
//
//         // Warn if overriding existing method
//
//
//         // points[i].forEach(d=>{
//         //     console.log(d === points2[j][0], d === points2[j][1], d === points2[j][2])
//         // })
//         //console.log(points[i])
//        // console.log(points2[j])
//
//         let common = 0
//         for (let k= 0 ; k < points[i].length; k++){
//             for (let l = 0; l < points2[j].length; l++){
//                 points[i][k].equals(points2[j][l]) ? common++ : null
//                 //console.log(points[i][k], points2[j][l])
//             }
//         }
//
//         if (common == 2){
//             points3.push([... new Set(points[i].concat(points2[j]))])
//         }
//
//     }
// }
// console.log(points3)
//
//
//
//
// let check = [1,2,3]
//
// let check2 = [1,2,3]
//
// console.log(check.equals(check2))


function squaredPolar(point, centre) {
    return [
        Math.atan2(point[1]-centre[1], point[0]-centre[0]),
        (point[0]-centre[0])**2 + (point[1]-centre[1])**2 // Square of distance
    ];
}

// Main algorithm:
function polySort(points) {
    // Get "centre of mass"
    let centre = [points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length];

    // Sort by polar angle and distance, centered at this centre of mass.
    for (let point of points) point.push(...squaredPolar(point, centre));
    points.sort((a,b) => a[2] - b[2] || a[3] - b[3]);
    // Throw away the temporary polar coordinates
    for (let point of points) point.length -= 2;
    return points
}

// let points2 = [[10,10],[200,200],[100,400],[400,250],[300,400],[20,300], [300,100]];
// //
// //
// //
// // //console.log(polySort(points2))
// //
// // // draw3(polySort(points2))
// // // draw3(points2)
//
let points3 = []
//
points.forEach(d=>{
    d.forEach(e=> points3.push(e)

        // d.forEach(e=> points3.some(f => (f[0] === e[0] && f[1] === e[1])) ? null : points3.push(e)
    )
})
//
//
// points3 = polySort(points3)
//
//
// for (let i = 0; i < points3.length; i++){
//
// }
//



// console.log(points3)
draw3(polySort(points3))