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

let profile_color = {
    'L': d3.schemeCategory10[0],
    'R': d3.schemeCategory10[1],
}

let combinations = []
let dots_container = {}
let delaunay_container = {}
let delaunay_properties_container = {}

let distance_object = {}
let intersection_area_object = {}


let _alpha
let _alphahulls = {}
let _intersections = {}

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

    //properties = properties.splice(0,5)


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
                return {x: +_x(f[p.x]), y: +_y(f[p.y])}
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

    //change_alpha(100,100)

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (j = -1; ++j < m;) for (i = -1; ++i <= j;) c.push({x: a[i], i: i, y: b[j], j: j});
        //for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        //console.log(c)
        return c;
    }

    //console.log(dots_container)

    download_all_data()
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
            //change_alpha(val, ((max-min)-1))
            d3.select(`#${slider_id}_value_text`).text(val)
        });

    slider.append('p')
        .text("Alpha: ")
        .append('span')
        .attr('id', `${slider_id}_value_text`)
        .text(value)
}

make_slider('s1',0,100,100,1, 200)

load_data()



function boundary(delaunay, members) {
    const counts = {},
        edges = {},
        result = [];
    let r;

    // Traverse the edges of all member triangles and discard any edges that appear twice.
    members.forEach((member, d) => {
        if (!member) return;
        for (let i = 0; i < 3; i++) {
            var e = [
                delaunay.triangles[3 * d + i],
                delaunay.triangles[3 * d + ((i + 1) % 3)]
            ].sort();
            (edges[e[0]] = edges[e[0]] || []).push(e[1]);
            (edges[e[1]] = edges[e[1]] || []).push(e[0]);
            const k = e.join(":");
            if (counts[k]) delete counts[k];
            else counts[k] = 1;
        }
    });

    while (1) {
        let k = null;
        // Pick an arbitrary starting point on a boundary.
        for (k in counts) break;
        if (k == null) break;
        result.push((r = k.split(":").map(Number)));
        delete counts[k];
        let q = r[1];
        while (q != r[0]) {
            let p = q,
                qs = edges[p],
                n = qs.length;
            for (let i = 0; i < n; i++) {
                q = qs[i];
                let edge = [p, q].sort().join(":");
                if (counts[edge]) {
                    delete counts[edge];
                    r.push(q);
                    break;
                }
            }
        }
    }
    return result;
}


function alphashapefilter(delaunay, alphaSquared) {
    function dist2(p, q) {
        return (
            (delaunay.points[2 * p] - delaunay.points[2 * q]) ** 2 +
            (delaunay.points[2 * p + 1] - delaunay.points[2 * q + 1]) ** 2
        );
    }
    return function(i) {
        let t0 = delaunay.triangles[i * 3 + 0],
            t1 = delaunay.triangles[i * 3 + 1],
            t2 = delaunay.triangles[i * 3 + 2];
        return dist2(t0, t1) < alphaSquared && dist2(t1, t2) < alphaSquared && dist2(t2, t0) < alphaSquared;
    };
}


function download_all_data(){


    // let alpha = 100

    function start_worker(alpha){
        let worker = new Worker('js/main_matrix_2_download_data-worker.js')
        worker.postMessage([delaunay_container, combinations, alpha, 100, delaunay_properties_container])
        worker.onmessage = function(e) {
            download(`alpha_${alpha}_data.json`, JSON.stringify(e.data))
            console.log(`${alpha} data downloaded`);
        }
    }



    for (let i = 100; i > 0; i -=5){
        start_worker(i);
        console.log(`Starting worker for alpha: ${i}`)
    }




    // // for (let i = 100; i > 0; i -=10){
    //     let worker = new Worker('js/main_matrix_2_download_data-worker.js')
    //     worker.postMessage([delaunay_container, combinations, alpha, 100, delaunay_properties_container])
    //     worker.onmessage = function(e) {
    //         download(`alpha_${alpha}_data.json`, JSON.stringify(e.data))
    //         console.log('Message received from worker');
    //     }
    // // }



}
//
// function change_alpha(input, input_range){
//     combinations.forEach(d=>{
//         getAlphaHull(delaunay_container[d], d, input, input_range)
//     })
//     //console.log('intersection areas:', intersection_area_object)
//     //console.log('distances:', distance_object)
//
//     _alpha = input
//
//     let download_object = {}
//
//     //download_object['alpha'] = _alpha
//     download_object['alphahulls'] = _alphahulls
//     download_object['intersection_polygons'] = _intersections
//     download_object['intersection_areas'] = intersection_area_object
//     download_object['distances'] = distance_object
//
//     return download_object
//
//     //download(`alpha_${_alpha}.json`, JSON.stringify(download_object))
//
// }
//
// function getAlphaHull(delaunayObject, combination, input, input_range){
//
//     if (combination.split('_x_')[0] === combination.split('_x_')[1]){
//         return
//     }
//
//     let alphahullContainer = {}
//     let pathContainer = {}
//     let profiles = Object.keys(delaunayObject)
//
//     profiles.forEach(d=>{
//         let alpha = (input / input_range) * delaunay_properties_container[combination][d]['d_range'] + delaunay_properties_container[combination][d]['d_min']
//         let alphaSquared = alpha ** 2
//
//         const filter = alphashapefilter(delaunayObject[d], alphaSquared);
//         let alphashape = new Uint8Array(delaunayObject[d].triangles.length / 3).map((_, i) => filter(i))
//         let alphahull = boundary(delaunayObject[d], alphashape)
//
//         function point(i) {
//             return [delaunayObject[d].points[2 * i], delaunayObject[d].points[2 * i + 1]];
//         }
//
//         let alphahull_points = []
//
//         let path = ['']
//         alphahull.forEach(ring => {
//             let hull = []
//             let i = ring[ring.length - 1];
//             path[0] = path[0]+(`M ${point(i)[0]} ${point(i)[1]} `)
//             hull.push({x:+point(i)[0], y:+point(i)[1]})
//             for (const i of ring) {
//                 path[0] = path[0]+(`L ${point(i)[0]} ${point(i)[1]} `)
//                 hull.push({x:+point(i)[0], y:+point(i)[1]})
//             }
//             alphahull_points.push(hull)
//         })
//
//         alphahullContainer[d] = alphahull_points
//         pathContainer[d] = path
//     })
//
//     let intersection_polygons = []
//
//     alphahullContainer[profiles[0]].forEach(d=>{
//         alphahullContainer[profiles[1]].forEach(e=>{
//             let inter = intersect(d, e)
//             if (inter.length != 0){
//                 intersection_polygons.push(inter[0].map(function (d){
//                     return [d['x'], d['y']]
//                 }))
//             }
//         })
//     })
//
//     let intersection_area = 0
//     intersection_polygons.forEach(d=>{
//         intersection_area += Math.abs(d3.polygonArea(d))
//     })
//     intersection_area_object[combination] = intersection_area
//
//     let min_distance = 0
//     if (intersection_area === 0 ){
//         min_distance = Number.MAX_SAFE_INTEGER
//         alphahullContainer[Object.keys(alphahullContainer)[0]].forEach(d=>{
//             alphahullContainer[Object.keys(alphahullContainer)[1]].forEach(e=>{
//                 d.forEach(d2 => {e.forEach(e2=>{
//                     let dist = Math.sqrt(((d2.x - e2.x) ** 2) + ((d2.y - e2.y) ** 2))
//                     dist < min_distance ? min_distance = dist : null
//                 })})
//             })
//         })
//     }
//
//     distance_object[combination] = min_distance
//
//     _alphahulls[combination] = pathContainer
//     _intersections[combination] = intersection_polygons
//
//     //draw_alphahulls(pathContainer, combination)
//     //draw_intersection(intersection_polygons, combination)
// }
//
// function draw_intersection(polygon_points, combination) {
//
//     let svg = d3.select(`.cell.${combination}`)
//         .append("g")
//         .attr("width", width)
//         .attr("height", width)
//         .attr("class", `a-shape ${combination}`);
//
//     polygon_points.forEach(e=>{
//         svg.append('polygon')
//             .data([e.join(' ')])
//             .attr('points', d=>d)
//             .attr('stroke', '#f00')
//             .attr('stroke-width', 3)
//             .attr('fill', 'none')
//             .attr('class', 'polygons');
//     })
// }
//
// function draw_alphahulls(paths, combination){
//
//     console.log(paths)
//
//     d3.selectAll(`.a-shape.${combination}`).remove()
//     Object.keys(paths).forEach(d=>{
//         let svg = d3.select(`.cell.${combination}`)
//             .append("g")
//             .attr("width", width)
//             .attr("height", width)
//             .attr("class", `a-shape ${combination}`);
//
//         svg.append("g")
//             .selectAll(`.a-shape.${combination}`)
//             .data(paths[d])
//             .enter().append('path')
//             .attr('d', e=>e)
//             .attr('fill', ()=> profile_color[d])
//             .style('opacity', 0.75)
//             .attr('stroke', 'black')
//             .style('stroke-opacity', .125)
//             .attr('class','a-shape-paths')
//     })
// }



function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}




// Start file download.
// download("alphashpaes.json","File content");