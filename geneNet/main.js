

const main = async function(){
    let _data = await d3.tsv('data/hgnc_complete_set.txt')

    _data.forEach(d=>{
        d['Previous Symbols'] = d['prev_symbol'].split('|');
        d['Synonyms'] = d['alias_symbol'].split('|');
        d['Approved Symbol'] = d['symbol'];
        return d;
    });


    // console.log(_data)
    //
    // console.log(_data.filter(d=> d['Previous Symbols'].length > 1))
    //
    // console.log(new Set(_data.map(d=> d.status)))

    let nodes1 = {}
    let nodes2 = {}
    let nodes3 = {}

    _data.forEach(d=>{
        nodes1[d['Approved Symbol']] = {id:d['Approved Symbol'], data:d}
    })

    Object.keys(nodes1).forEach(d=>{
        nodes1[d]['data']['Synonyms'].forEach(e=>{
            if(nodes1[e]){
                nodes2[d] = nodes1[d]
                nodes2[d]['synNodes'] = nodes1[d]['data']['Synonyms'].filter(f=> nodes1[f])
                nodes2[d]['prevNodes'] = nodes1[d]['data']['Previous Symbols'].filter(f=> nodes1[f])
                nodes2[e] = nodes1[e]
                nodes2[e]['synNodes'] = nodes1[e]['data']['Synonyms'].filter(f=> nodes1[f])
                nodes2[e]['prevNodes'] = nodes1[e]['data']['Previous Symbols'].filter(f=> nodes1[f])
            }
        })
        nodes1[d]['data']['Previous Symbols'].forEach(e=>{
            if(nodes1[e]){
                nodes3[d] = nodes1[d]
                nodes3[d]['synNodes'] = nodes1[d]['data']['Synonyms'].filter(f=> nodes1[f])
                nodes3[d]['prevNodes'] = nodes1[d]['data']['Previous Symbols'].filter(f=> nodes1[f])
                nodes3[e] = nodes1[e]
                nodes3[e]['synNodes'] = nodes1[e]['data']['Synonyms'].filter(f=> nodes1[f])
                nodes3[e]['prevNodes'] = nodes1[e]['data']['Previous Symbols'].filter(f=> nodes1[f])
            }
        })
    })


    // Object.keys(nodes1).forEach(d=>{
    //     nodes1[d]['data']['Previous Symbols'].forEach(e=>{
    //         if(nodes1[e]){
    //             nodes3[d] = nodes1[d]
    //             nodes3[d]['prevNodes'] = nodes1[d]['data']['Previous Symbols'].filter(f=> nodes1[f])
    //             nodes3[e] = nodes1[e]
    //             nodes3[e]['prevNodes'] = nodes1[e]['data']['Previous Symbols'].filter(f=> nodes1[f])
    //         }
    //     })
    // })



    let nodes_ = (Object.values(nodes3))

    let nodes = Object.values(nodes2)

    //check if two arrays are identical
    let inside_checker = (arr, target) => target.every(v => arr.includes(v));
    //check if identical array is in 2D array
    let outside_checker = (arr, target) => target.some(r => inside_checker(r, arr))

    let linksObject = {}
    let linksObject_ = {}

    // nodes.forEach(d=>{
    //     d.synNodes.forEach(e=>{
    //         linksObject[([d['id'],nodes2[e]['id']]).sort()] = {
    //             source: d['id'],
    //             target: nodes2[e]['id'],
    //             type: 'synonym',
    //             color:'blue',
    //             bidirectional: outside_checker([d['id'],nodes2[e]['id']], Object.keys(linksObject))
    //         }
    //     })
    // })
    //
    // nodes_.forEach(d=>{
    //     d.prevNodes.forEach(e=>{
    //         linksObject_[([d['id'],nodes3[e]['id']]).sort()] = {
    //             source: d['id'],
    //             target: nodes3[e]['id'],
    //             type: 'prev',
    //             color: 'red',
    //             bidirectional: outside_checker([d['id'],nodes3[e]['id']], Object.keys(linksObject_))
    //         }
    //     })
    // })

    let links_ = []

    nodes.forEach(d=>{
        d.synNodes.forEach(e=>{
            if (d['id'] !== e){
                links_.push({
                    source: d['id'],
                    target: nodes2[e]['id'],
                    type: 'synonym',
                    color:'blue',
                    // bidirectional: outside_checker([d['id'],nodes2[e]['id']], Object.keys(linksObject))
                })
            }
        })
    })

    nodes_.forEach(d=>{
        d.prevNodes.forEach(e=>{
            if (d['id'] !== e){
                links_.push({
                    // source: d['id'],
                    // target: nodes3[e]['id'],
                    source: nodes3[e]['id'],
                    target: d['id'],
                    type: 'prev',
                    color: 'red',
                    // bidirectional: outside_checker([d['id'],nodes3[e]['id']], Object.keys(linksObject_))
                })
            }

        })
    })

    console.log(links_)
    let links = links_

    console.log(links.filter(d=> d.target == 'NAT1'))

    console.log(nodes.find(d=> d.id =='EIF4G2'))
    console.log(nodes.find(d=> d.id =='NAT1'))







    // let links = Object.values(linksObject)

    // console.log(linksObject_)
    // links = links.concat(Object.values(linksObject_))
    // nodes = nodes.concat(Object.values(nodes3))
    nodes = nodes.concat(Object.values(nodes3).filter(d=> !nodes.includes(d)))


    console.log(nodes.filter(d=> d.synNodes.length > 0 || d.prevNodes.length > 0))



    ForceGraph({nodes, links}, {
        nodeId: d => d.id,
        //nodeGroup: d => d.group,
        //nodeTitle: d => `${d.id} (${d.group})`,
        width: 1500,
        height: 1500,
        invalidation: null // a promise to stop the simulation when the cell is re-run
    })





    // console.log(links)
    // console.log(nodes)



    // let t = []
    //
    // _data.filter(d=> d['Synonyms'].length > 0).forEach(d=> t.push(_data.find(e=> e['Approved Symbol'] == d['Approved Symbol'])))
    // console.log(t)


    // console.log(_data.filter(d=> d['Approved Symbol']=="STSL"))

    // let _nodes = data.filter(d=>d['Status'] == 'Approved').map(function(d){
    //     let obj = {
    //         id:d['Approved Symbol'],
    //         data: d,
    //         previousSymbols : d['Previous Symbols'].split(', '),
    //         synonyms: d['Synonyms'].split(', ')
    //     }
    //     return obj
    // })
    //
    // let _links = []
    // _nodes.filter(d=> d.synonyms.length > 0).map(function (e){
    //     e.synonyms.forEach(f=> {_links.push({source: e.id, target: f, value: 1})})
    // })
    // // _nodes.filter(d=> d.previousSymbols.length > 0).map(function (e){
    // //     e.previousSymbols.forEach(f=> {_links.push({source: e.id, target: f, value: 1})})
    // // })
    // console.log(_nodes.filter(d=> d.id == 'BNAC2'))
    //
    // let _data = {nodes: _nodes,
    // links: _links}
    //
    // ForceGraph(_data, {
    //     nodeId: d => d.id,
    //     nodeGroup: d => d.group,
    //     nodeTitle: d => `${d.id} (${d.group})`,
    //     width: 600,
    //     height: 680,
    //     invalidation: null // a promise to stop the simulation when the cell is re-run
    // })
}
main()

function ForceGraph({
                        nodes, // an iterable of node objects (typically [{id}, …])
                        links // an iterable of link objects (typically [{source, target}, …])
                    }, {
                        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
                        nodeGroup, // given d in nodes, returns an (ordinal) value for color
                        nodeGroups, // an array of ordinal values representing the node groups
                        nodeTitle, // given d in nodes, a title string
                        nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
                        nodeStroke = "#fff", // node stroke color
                        nodeStrokeWidth = 1.5, // node stroke width, in pixels
                        nodeStrokeOpacity = 1, // node stroke opacity
                        nodeRadius = 5, // node radius, in pixels
                        nodeStrength,
                        linkSource = ({source}) => source, // given d in links, returns a node identifier string
                        linkTarget = ({target}) => target, // given d in links, returns a node identifier string
                        linkType = ({type}) => type,
                        linkStroke = ({color}) => color,
                        // linkBidirectional = ({bidirectional}) => bidirectional,
                        // linkStroke = "#999", // link stroke color
                        linkStrokeOpacity = 0.6, // link stroke opacity
                        linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
                        linkStrokeLinecap = "round", // link stroke linecap
                        linkStrength,
                        colors = d3.schemeTableau10, // an array of color strings, for the node groups
                        width = 640, // outer width, in pixels
                        height = 400, // outer height, in pixels
                        invalidation // when this promise resolves, stop the simulation
                    } = {}) {
    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    const LType = d3.map(links, linkType).map(intern);
    const LC = d3.map(links, linkStroke).map(intern);
    // const LD = d3.map(links, linkBidirectional).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    // const C = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
    links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i], type: LType[i], color: LC[i]}));
    console.log(links)

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);


    const div = d3.select("#div_main")
    const svg = div.append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");



    // function marker(color) {
    //     defs.append("svg:marker")
    //         .attr("id", color.replace("#", ""))
    //         .attr("viewBox", "0 -5 10 10")
    //         .attr("refX", 0)
    //         .attr("markerWidth", 9)
    //         .attr("markerHeight", 9)
    //         .attr("orient", "auto")
    //         .attr("markerUnits", "userSpaceOnUse")
    //         .append("svg:path")
    //         .attr("d", "M0,-5L10,0L0,5")
    //         .style("fill", color);
    //
    //     return "url(" + color + ")";
    // };

    let defs = svg.append("svg:defs");

    function m(color){
        defs.append("svg:marker")
            .attr("id", `${color}_arrow`)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "8")
            .attr("markerHeight", "8")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "12")
            .attr("refY", "6")
            .attr("orient", "auto")
            .append("svg:path")
            // .attr("d", "M0,-5L10,0L0,5")
            .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")

            .style("fill", color);
        return `url(#${color}_arrow)`
    }

    // <marker
    //     id="arrow"
    //     markerUnits="strokeWidth"
    //     markerWidth="12"
    //     markerHeight="12"
    //     viewBox="0 0 12 12"
    //     refX="6"
    //     refY="6"
    //     orient="auto">
    //     <path d="M2,2 L10,6 L2,10 L6,6 L2,2" style="fill: #f00;"></path>
    // </marker>

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", d=>d.color)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
        .attr("marker-end",(d)=>m(d.color));
    // .each(function() {
        //      d3.select(this).style("stroke", function(d) {return d.color})
        //     .attr("marker-end", function (d) { return marker(d.color.formatHex())})
        // });

    // d3.selectAll("line")
    //     .each(function() {
    //          d3.select(this).style("stroke", function(d) {return d.color})
    //         .attr("marker-end", function (d) { return marker(d.color.formatHex())})
    //     });

    // svg.append("svg:defs").append("svg:marker")
    //     .attr("id", "triangle")
    //     .attr("refX", 15)
    //     .attr("refY", -1.5)
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("orient", "auto")
    //     .append("path")
    //     .attr("d", "M 0 -5 10 10")
    //     .style("stroke", "black");







    if (W) link.attr("stroke-width", ({index: i}) => W[i]);

    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", nodeRadius)
        .call(drag(simulation));

    // const link = svg.append("g")
    //     .selectAll("line")
    //     .data(links)
    //     .join("line")
    //     .attr("stroke", d=>d.color)
    //     .attr("stroke-opacity", linkStrokeOpacity)
    //     .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
    //     .attr("stroke-linecap", linkStrokeLinecap)
    //     .attr("marker-end",()=>m());

    if (G) node.attr("fill", ({index: i}) => color(G[i]));
    if (T) node.append("title").text(({index: i}) => T[i]);

    // Handle invalidation.
    if (invalidation != null) invalidation.then(() => simulation.stop());

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return Object.assign(svg.node(), {scales: {color}});
}