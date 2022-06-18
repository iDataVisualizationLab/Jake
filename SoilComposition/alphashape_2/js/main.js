const w = window.innerWidth;
const h = (w * 9) / 16;

const data = Array(100)
    .fill()
    .map((_, i) => ({ x: (i * w) / 100, y: Math.random() * h }));

let delaunay = d3.Delaunay.from(
    data,
    (d) => d.x,
    (d) => d.y
)

// function alphashapefilter(delaunay, alpha) {
//     const asq = alpha ** 2;
//     function dist2(p, q) {
//         return (
//             (delaunay.points[2 * p] - delaunay.points[2 * q]) ** 2 +
//             (delaunay.points[2 * p + 1] - delaunay.points[2 * q + 1]) ** 2
//         );
//     }
//     return function(i) {
//         let t0 = delaunay.triangles[i * 3 + 0],
//             t1 = delaunay.triangles[i * 3 + 1],
//             t2 = delaunay.triangles[i * 3 + 2];
//         return dist2(t0, t1) < asq && dist2(t1, t2) < asq && dist2(t2, t0) < asq;
//     };
// }

// function boundary(delaunay, members) {
//     const counts = {},
//         edges = {},
//         result = [];
//     let r;
//
//     // Traverse the edges of all member triangles and discard any edges that appear twice.
//     members.forEach((member, d) => {
//         if (!member) return;
//         for (let i = 0; i < 3; i++) {
//             var e = [
//                 delaunay.triangles[3 * d + i],
//                 delaunay.triangles[3 * d + ((i + 1) % 3)]
//             ].sort();
//             (edges[e[0]] = edges[e[0]] || []).push(e[1]);
//             (edges[e[1]] = edges[e[1]] || []).push(e[0]);
//             const k = e.join(":");
//             if (counts[k]) delete counts[k];
//             else counts[k] = 1;
//         }
//     });
//
//     while (1) {
//         let k = null;
//         // Pick an arbitrary starting point on a boundary.
//         for (k in counts) break;
//         if (k == null) break;
//         result.push((r = k.split(":").map(Number)));
//         delete counts[k];
//         let q = r[1];
//         while (q != r[0]) {
//             let p = q,
//                 qs = edges[p],
//                 n = qs.length;
//             for (let i = 0; i < n; i++) {
//                 q = qs[i];
//                 let edge = [p, q].sort().join(":");
//                 if (counts[edge]) {
//                     delete counts[edge];
//                     r.push(q);
//                     break;
//                 }
//             }
//         }
//     }
//     return result;
// }


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

        // dists.push(dist_squ(p0, p1))
        // dists.push(dist_squ(p1, p2))
        // dists.push(dist_squ(p2, p0))

        dists.push(d3.max([dist_squ(p0, p1),dist_squ(p1, p2),dist_squ(p2, p0)]))
        // if (dist_squ(p0, p1) < alpha_squ && dist_squ(p1, p2) < alpha_squ && dist_squ(p2, p0) < alpha_squ) {
        //     paths.push(`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`)
        // }
    }
    return [d3.min(dists),d3.max(dists)]
}

let d_res = find_max_dist(delaunay)
let d_min = Math.sqrt(d_res[0])
let d_max = Math.sqrt(d_res[1])
let d_range = d_max-d_min
//
// console.log(d_max)
//
// console.log(Math.sqrt(res[0]))
// console.log(Math.sqrt(res[1]))
//
// console.log(Math.sqrt(res[1])-Math.sqrt(res[0]))

function adjust_values(min, range, input, input_range){
    return (input / input_range) * range + min
}


function alphashpae_filter(delaunay, alpha) {
    let alpha_squ = alpha * alpha

    function dist_squ(a, b) {
        let dx = a[0] - b[0]
        let dy = a[1] - b[1]
        return dx * dx + dy * dy
    }

    let paths = []
    const {points, triangles} = delaunay;

    for (let i = 0; i < triangles.length; i++) {
        const t0 = triangles[i * 3 + 0];
        const t1 = triangles[i * 3 + 1];
        const t2 = triangles[i * 3 + 2];

        const p0 = [points[t0 * 2], points[t0 * 2 + 1]]
        const p1 = [points[t1 * 2], points[t1 * 2 + 1]]
        const p2 = [points[t2 * 2], points[t2 * 2 + 1]]

        if (dist_squ(p0, p1) < alpha_squ && dist_squ(p1, p2) < alpha_squ && dist_squ(p2, p0) < alpha_squ) {
            paths.push(`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`)
        }
    }
    return paths;
}

function draw(paths, points){

    d3.select('.a-shapes').remove()

    let svg = d3.select("#vis_div")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "a-shapes");

    // svg.append("g")
    //     .selectAll("circle")
    //     .data(points)
    //     .enter().append("circle")
    //     .attr("r", 3)
    //     .attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });

    svg.append("g")
        .selectAll(".a_shape")
        .data(paths)
        .enter().append('path')
        .attr('d', d=>d)
        .attr('fill', 'gray')
        .attr('stroke', 'black')
        .attr('class','a-shape-paths')

    svg.append("g")
        .selectAll("circle")
        .data(points)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
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
            draw(alphashpae_filter(delaunay,adjust_values(d_min, d_range, val, max-min)), data)
            // console.log(adjust_values(d_min, d_range, val, max-min))
            d3.select(`#${slider_id}_value_text`).text(val)
        });

    slider.append('p')
        .text("Alpha: ")
        .append('span')
        .attr('id', `${slider_id}_value_text`)
        .text(value)


}

make_slider('s1',0,1000,0,1, 200)
draw(alphashpae_filter(delaunay,0), data)

// function create_slider(num, _min, _max, _default, _class){
//     let sliderContainer = d3
//         .select('#sliders')
//         .append('div')
//         .attr('id', 'slider'+num)
//         .attr('class', '_slider')
//
//     let sliderValue = d3.select('#slider'+num)
//         .append('p')
//         .attr('id', "heading"+num)
//         .attr('class', _class)
//         .append('span')
//         .text(function(){
//             if (num === 'Percentage'){
//                 return 'Heat Exchanger '+num+' Increase : '
//             }
//             else{ return num+ ': ' }
//         })
//         //.text(num+': ')
//         .append('span')
//         .attr("id","value"+num)
//         .text(function(){
//             if (num === 'Percentage'){
//                 return _default+' %'
//             }
//             else{ return _default }
//         });
//
//     let sliderSimple = d3
//         .sliderBottom()
//         .min(_min)
//         .max(_max)
//         .width(300)
//         //.tickFormat(d3.format('.2%'))
//         .ticks(5)
//         .default(_default)
//         .on('onchange', val => {
//             console.log(val)
//         });
//
//     let gSimple = d3
//         .select('#slider'+num)
//         .append('svg')
//         .attr("id", "slider"+num+'svg')
//         // .attr('class', _class)
//         .attr('width', 400)
//         .attr('height', 75)
//         .append('g')
//         .attr('transform', 'translate(30,30)');
//
//     gSimple.call(sliderSimple);
// }

// draw(alphashpae_filter(delaunay,350), data)
// draw(alphashpae_filter(delaunay,320), data)

// create_slider(1,1,10,1,'a')