importScripts('../lib/d3v7.js');
importScripts('../js/intersection.js');

onmessage = function(e) {

    let delaunay_container = e.data[0]
    let combinations = e.data[1]
    let input = e.data[2]
    let input_range = e.data[3]

    let delaunay_properties_container = e.data[4]

    let distance_object = {}
    let intersection_area_object = {}
    let _alphahull_paths = {}
    let _alphahull_points = {}
    let _intersections = {}

    process(combinations).then(()=> {
        let download_object = {}
        download_object['alpha'] = input
        download_object['alphahull_paths'] = _alphahull_paths
        //download_object['alphahull_points'] = _alphahull_points
        download_object['intersection_polygons'] = _intersections
        distance_object['intersection_areas'] = intersection_area_object
        download_object['distances'] = distance_object

        postMessage(download_object)
    }).catch((error) => {
        console.log(error);
    });


    async function process(combinations){
        combinations.forEach(d => {
            if (d.split('_x_')[0] != d.split('_x_')[1]){
                getAlphaHull(delaunay_container[d], d, input, input_range).then(e=> {
                    console.log(d,e)
                    find_intersection_and_distance(e,d)
                })
            }
        })

    }

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

    async function getAlphaHull(delaunayObject, combination, input, input_range){

        let alphahullContainer = {}
        let pathContainer = {}
        let profiles = Object.keys(delaunayObject)

        profiles.forEach(d=>{
            let alpha = (input / input_range) * delaunay_properties_container[combination][d]['d_range'] + delaunay_properties_container[combination][d]['d_min']
            let alphaSquared = alpha ** 2

            const filter = alphashapefilter(delaunayObject[d], alphaSquared);
            let alphashape = new Uint8Array(delaunayObject[d].triangles.length / 3).map((_, i) => filter(i))
            let alphahull = boundary(delaunayObject[d], alphashape)

            function point(i) {
                return [delaunayObject[d].points[2 * i], delaunayObject[d].points[2 * i + 1]];
            }

            let alphahull_points = []

            let path = ['']
            alphahull.forEach(ring => {
                let hull = []
                let i = ring[ring.length - 1];
                path[0] = path[0]+(`M ${point(i)[0]} ${point(i)[1]} `)
                hull.push({x:+point(i)[0], y:+point(i)[1]})
                for (const i of ring) {
                    path[0] = path[0]+(`L ${point(i)[0]} ${point(i)[1]} `)
                    hull.push({x:+point(i)[0], y:+point(i)[1]})
                }
                alphahull_points.push(hull)
            })

            alphahullContainer[d] = alphahull_points
            pathContainer[d] = path
        })

        _alphahull_points[combination] = alphahullContainer
        _alphahull_paths[combination] = pathContainer

        return alphahullContainer
    }

    async function find_intersection_and_distance(alphahullContainer, combination) {

        let profiles = Object.keys(alphahullContainer)

        let intersection_polygons = []
        let intersection_area = 0
        let min_distance = 0

        //console.log(combination)
        //console.log(alphahullContainer[profiles[0]])
        //console.log(alphahullContainer[profiles[1]])

        let area_calculation_error = false

        if (alphahullContainer[profiles[0]].length != 0 && alphahullContainer[profiles[1]].length !=0){
            alphahullContainer[profiles[0]].forEach(d => {
                alphahullContainer[profiles[1]].forEach(e => {
                    let inter
                    try {
                        inter = intersect(d, e)
                        if (inter.length != 0) {
                            intersection_polygons.push(inter[0].map(function (d) {
                                return [d['x'], d['y']]
                            }))
                        }
                    }
                    catch(err) {
                        area_calculation_error = true
                        //console.error(err)
                    }
                })
            })
        }



        intersection_polygons.forEach(d => {
            intersection_area += Math.abs(d3.polygonArea(d))
        })
        intersection_area_object[combination] = intersection_area


        if (intersection_area === 0) {
            min_distance = Number.MAX_SAFE_INTEGER
            alphahullContainer[Object.keys(alphahullContainer)[0]].forEach(d => {
                alphahullContainer[Object.keys(alphahullContainer)[1]].forEach(e => {
                    d.forEach(d2 => {
                        e.forEach(e2 => {
                            let dist = Math.sqrt(((d2.x - e2.x) ** 2) + ((d2.y - e2.y) ** 2))
                            dist < min_distance ? min_distance = dist : null
                        })
                    })
                })
            })
        }





        distance_object[combination] = min_distance
        _intersections[combination] = intersection_polygons

        if (area_calculation_error){
            intersection_area_object[combination] = 'error'
        }





    }
}
