let margin = {top:30, bottom:0, left:30, right:0}

let width = 960,
    size = 120,
    padding = 15;

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

let profiles = ['L', 'R', 'S']

let profile_color = {
    'L': d3.schemeCategory10[0],
    'R': d3.schemeCategory10[1],
    'S': d3.schemeCategory10[2],
}

let combinations = []
let dots_container = {}
let delaunay_container = {}
let delaunay_properties_container = {}

let distance_object = {}
let intersection_area_object = {}

let alphashape_data
let default_alpha = 100

function load_data(profiles){
    let promises = []
    profiles.forEach(d=>{promises.push(d3.csv(`data/${d}.csv`))})

    Promise.all(promises
    ).then(function(files) {
        process_data(files,profiles, [])
        profile_correlation_sliders(profiles)
    })

    d3.json(`data/${profiles.sort().join('-')}_calculations.json`).then(d => {
        alphashape_data = d
        display_precalculated_data(default_alpha)
    })

    //.catch(function(err) {
    //     console.error(err)
    // })
}

function change_data(d){
    d3.select('#s1').property("value", 100)
    d3.select(`#s1_value_text`).text(100)
    create_legend(d.split(' ').sort())
    remove_correlation_sliders()
    load_data(d.split(' ').sort())
}
function process_data(data, profiles, ordering){

    let properties = []

    if (ordering.length === 0){
        let elements = new Array(data.length)

        for (let i = 0 ; i < elements.length; i++){
            elements[i] = new Array()
            data[i].columns.forEach(d=> {
                d.includes("Concentration") ? elements[i].push(d.split(" ")[0]) : null
            })
        }
        elements[0].forEach(d=> properties.push(`${d} Concentration`))
    }
    else{
        ordering.forEach(d=> properties.push(`${d} Concentration`))
    }

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
        .attr("transform", function (d, i) {
            return `translate( ${i * size }, ${size * n - (padding/2)})`;

        })
        //.each(function(d) { x.domain(domainByElements[d]); d3.select(this).call(xAxis); });
        .each(function (d, i) {
            x.domain(domainByElements[d]);
            d3.select(this).call(xAxis.tickSize((-size * (n - i))+padding ).tickFormat(d3.format('.1s')));
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
            return `translate( ${(padding/2)}, ${i * size})`;

        })
        .each(function (d, i) {
            y.domain(domainByElements[d]);
            d3.select(this).call(yAxis.tickSize((-size * (i + 1))+padding).tickFormat(d3.format('.1s')));
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
    }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (j = -1; ++j < m;) for (i = -1; ++i <= j;) c.push({x: a[i], i: i, y: b[j], j: j});
        //for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
    }
    calculate_correlation(profiles, filtered_data)
}


let slider_vals = {}

function make_slider(slider_id, target_div_id, min, max, value, step, width, flip, text_description, on_change, scaled, offset){

     let run = () => {
         let val = value
         scaled ? val = (val - offset) / (max-offset-min) : val = (val - offset)
         flip ? val = -val : null
         slider_vals[slider_id] = val
    };run()

    let slider = d3.select(`#${target_div_id}`)
        .append('g')
        .attr('class', `${slider_id}_slider`)

    slider.append('input')
        .attr("type", "range")
        .attr('min', min)
        .attr('max', max)
        .attr('value', value)
        .attr('step', step)
        .style('width', `${width}px`)
        .style('transform', ()=> flip ? `rotate(180deg)`: null)
        .attr('id', `${slider_id}`)
        .on('input', function(){
            let val = d3.select(this).property("value")
            scaled ? val = (val - offset) / (max-offset-min) : val = (val - offset)
            flip ? val = -val : null
            d3.select(`#${slider_id}_value_text`).text(val)
        })
        .on('change', function(){
            let val = d3.select(this).property("value")
            scaled ? val = (val - offset) / (max-offset-min) : val = (val - offset)
            flip ? val = -val : null
            slider_vals[slider_id] = val
            d3.select(`#${slider_id}_value_text`).text(val)
            on_change(val)
        });

    slider.append('p')
        .text(`${text_description}: `)
        .append('span')
        .attr('id', `${slider_id}_value_text`)
        .text(()=> {
            let val = value
            scaled ? val = (val - offset) / (max-offset-min) : val = (val - offset)
            flip ? val = -val : null
            return val
        })
}

function profile_correlation_sliders(profiles){
    profiles.forEach(d=>{
        make_slider(d,'corr_sliders', 0,2000, 2000,1 , 200, true, `${d} Correlation`, filter_correlation, true, 1000)
    })
}

function remove_correlation_sliders(){
    Object.keys(slider_vals).splice(1).forEach(d=>{
        d3.select(`.${d}_slider`).remove()
        delete slider_vals[d]
    })
}


function filter_correlation(){

    console.log(d3.selectAll('.cell').style('opacity', 1))

    Object.keys(correlation_object).forEach(d=>{
        Object.keys(correlation_object[d]).forEach(e=>{
            if (correlation_object[d][e] < slider_vals[d]){
                d3.select(`.cell.${e}`).style('opacity', .25)
            }
        })
    })
}


function display_precalculated_data(alpha){

    let combinations = Object.keys(alphashape_data[alpha]['alphahull_paths'])

    combinations.forEach(d=>{
        draw_alphahulls(alphashape_data[alpha]['alphahull_paths'][d], d)
        alphashape_data[alpha]['intersection_polygons'][d] !== 'error' ? draw_intersection(alphashape_data[alpha]['intersection_polygons'][d], d) : display_calculation_error(d)
    })
}


function draw_intersection(polygon_points, combination) {

    let svg = d3.select(`.cell.${combination}`)
        .append("g")
        .attr("width", size)
        .attr("height", size)
        .attr("class", `a-shape ${combination}`);

    polygon_points.forEach(e=>{
        svg.append('polygon')
            .data([e.join(' ')])
            .attr('points', d=>d)
            .attr('stroke', '#f00')
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .attr('class', 'polygons');
    })
}

function draw_alphahulls(paths, combination){

    d3.selectAll(`.a-shape.${combination}`).remove()
    Object.keys(paths).forEach(d=>{
        let svg = d3.select(`.cell.${combination}`)
            .append("g")
            .attr("width", size)
            .attr("height", size)
            .attr("class", `a-shape ${combination}`);

        svg.append("g")
            .selectAll(`.a-shape.${combination}`)
            .data(paths[d])
            .enter().append('path')
            .attr('d', e=>e)
            .attr('fill', ()=> profile_color[d])
            .style('opacity', 0.75)
            .attr('stroke', 'black')
            .style('stroke-opacity', .125)
            .attr('class','a-shape-paths')
    })
}

function display_calculation_error(combination){

    let svg = d3.select(`.cell.${combination}`)
            .append("g")
            .attr("width", size)
            .attr("height", size)
            .attr("class", `a-shape ${combination}`)

    svg.append("text")
        .attr("x", size - padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .attr('text-anchor' , 'end')
        .text('Error')
        .style('fill', '#f00')
        .style("font", "10px times");
}


function create_legend(profiles){

    d3.select('.legend').remove()

    let width = 200
    let height = 50

    let squ_size = 15
    let group_width = 40

    let padding = 2.5

    let svg = d3.select('#legend')
        .append('svg')
        .attr('class', 'legend')
        .attr('width', width)
        .attr('height', squ_size)
        .attr('transform', `translate(20,0)`)

    for (let i = 0; i < profiles.length ; i++){

        let g = svg.append('g')
            .attr('width', width)
            .attr('height', squ_size)
            .attr('transform', `translate(${(padding * i) + (group_width * i)},0)`)

        g.append('rect')
            .attr('width', squ_size)
            .attr('height', squ_size)
            .attr('fill',profile_color[profiles[i]])

        g.append('text')
            .attr("x", squ_size + padding)
            .attr("y", squ_size)
            .attr("dy", "-.125em")
            .attr('text-anchor' , 'start')
            .text(profiles[i])
            //.style('fill', '#000')
            .style("font", "14px times");

    }
}

let correlation_object

function calculate_correlation(profiles, data){

    let corr = {}

    profiles.forEach(d=>{
        corr[d] = {}

        let data_p = data.filter(e=> e.profile === d)
        let keys_p = Object.keys(data_p[0]).filter(d=> d != 'profile')

        for (let i = 0; i < keys_p.length ; i++){
            for (let j = 1; j < keys_p.length; j++){
                if (i !== j){
                    let d1 = data_p.map(e=> +e[keys_p[i]])
                    let d2 = data_p.map(e=> +e[keys_p[j]])
                    corr[d][`${keys_p[i].split(' ')[0]}_x_${keys_p[j].split(' ')[0]}`] = (spearson.correlation.pearson(d1, d2, true))
                }
            }
        }
    })
    correlation_object = corr
}

load_data(profiles)
make_slider('s_1','sliders', 10,100, default_alpha,5,200, false, 'Alpha', display_precalculated_data, false , 0)
create_legend(profiles)