let margin = {top:30, bottom:0, left:30, right:0}

let width = 960,
    size = 120,
    padding = 10;

let x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

let y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

let xAxis = d3.axisBottom()
    .scale(x)
    .ticks(4);


let yAxis = d3.axisLeft()
    .scale(y)
    .ticks(4);

let profile_color = {
    'L': d3.schemeCategory10[0],
    'R': d3.schemeCategory10[1],
}


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

    let filtered_data = []

    for (let i = 0; i < data.length; i++){
        let profile_data = data[i].map(function (d){
            let temp_obj = {}
            temp_obj['profile'] = profiles[i]
            properties.forEach(e=>{
                temp_obj[e] = +d[e]
            })
            return temp_obj
        })
        filtered_data = filtered_data.concat(profile_data)
    }
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

        let paths = ['']
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
                paths[0] = paths[0]+( `M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`)

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

        // console.log(paths)

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

    d3.selectAll(`.a-shape.${combination}`).remove()

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
}

async function plot_raw(profiles, filtered_data, elements) {
    if (d3.selectAll('.plots')){
        d3.selectAll('.plots').remove();
    }

    let domainByElements = {}

    let n = elements.length;

    elements.forEach(function (d) {
        domainByElements[d] = d3.extent(filtered_data, function (e) {
            return +e[d];
        });
    });

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

    svg.selectAll(".y.axis")
        .data(elements)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function (d, i) {
            //return "translate(0," + (i * size) +")";
            return `translate( ${(padding/2)}, ${i * size})`;

        })
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
        .attr("class", "cell")
        .attr("transform", function (d) {
            return `translate(${d.i * size},${d.j * size})`;
        })
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
            .style("fill", function (d) {
                return profile_color[d.profile];
            });

        let profiles = [... new Set(filtered_data.map(d=> d.profile))]

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

    }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (j = -1; ++j < m;) for (i = -1; ++i <= j;) c.push({x: a[i], i: i, y: b[j], j: j});
        //for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        //console.log(c)
        return c;
    }
}

function change_alpha(input, input_range){
    combinations.forEach(d=>{
        draw(alphashpae_filter(delaunay_container[d], d, input, input_range), d)
    })
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
            change_alpha(val, ((max-min)-1))
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


