import {Delaunay} from "https://cdn.skypack.dev/d3-delaunay@6";

const points = [[0, 0], [0, 1], [1, 0], [1, 1]];
const delaunay = Delaunay.from(points);
const voronoi = delaunay.voronoi([0, 0, 960, 500]);

let svg = d3.select("body")
    .append('div')
    .append('canvas')
    .attr('width', 500)
    .attr('height', 500);

delaunay.render("#myCanvas")

console.log(delaunay)