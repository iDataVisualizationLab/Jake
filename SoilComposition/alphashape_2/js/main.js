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
console.log(profile_color)

let margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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




load_data()




