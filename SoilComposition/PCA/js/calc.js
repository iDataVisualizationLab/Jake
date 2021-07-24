let profiles = ["R", "L", "S"]



function get_elements(profile){
    let flag = true;
    let elements = [];
    d3v5.csv("./data/"+profile+"_normalized.csv", function (d) {
        if (flag){
            for (let i in d){
                if(i.split(' ')[1] === 'Concentration'){
                    elements.push(i.split(' ')[0])
                }
            }
            flag = false;
            makeFeatureList(elements, profile);
        }
    });

    // let test = d3v5.csv("./data/"+profile+"_normalized.csv", function (d) { return d })
    //
    // test.then(d => {
    //     if (flag){
    //         for (let i in d){
    //             if(i.split(' ')[1] === 'Concentration'){
    //                 elements.push(i.split(' ')[0])
    //             }
    //         }
    //         flag = false;
    //     }
    // });

    //console.log(elements);



    let ok = d3v5.csv("./data/"+profile+"_normalized.csv", function (d){
        return d;
    });
    ok.then(d => {
        let readings = []
        d.forEach(row =>{
            let row_readings = []
            for (let i in elements){
                row_readings.push(parseFloat(row[elements[i]+' Concentration']));
            }
            readings.push(row_readings);
        })
        draw_pca_plot(readings, d);
    });
    //
    // for (let i in elements){
    //     console.log(elements[i])
    // }
    //
    // elements.forEach(d => {console.log(d)})

    return elements;


}
let elementsList = get_elements(profiles[0]);


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
//
//
// async function listing() {
//
//     return await get_elements(profiles[0]);
// }
//
// listing().then(d => {console.log(d)})

function draw_pca_plot(input, data){
    console.log(data);
    let pca = new PCA();
    let matrix = pca.scale(input, true, false);
    let pc = pca.pca(matrix, 2);
    let A = pc[0];  // this is the U matrix from SVD
    let B = pc[1];  // this is the dV matrix from SVD
    let chosenPC = pc[2];   // this is the most value of PCA

    for (let i in A){
        data[i]["PC1"] = A[i][0];
        data[i]["PC2"] = A[i][1];
        //console.log(data[i]);
    }

    let x_list = [];
    A.forEach(i => x_list.push(i[0]));

    let y_list = [];
    A.forEach(i => y_list.push(i[1]));

    d3v5.select("div#my_dataviz").selectAll("svg").remove();

    // set the dimensions and margins of the graph
    var margin = {top: 200, right: 130, bottom: 130, left: 210},
        width = 920 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3v5.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3v5.scaleLinear()
        .domain([d3v5.min(x_list), d3v5.max(x_list)])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v5.axisBottom(x));

    // Add Y axis
    var y = d3v5.scaleLinear()
        .domain([d3v5.min(y_list), d3v5.max(y_list)])
        .range([ height, 0]);
    svg.append("g")
        .call(d3v5.axisLeft(y));

    // Add dots
    // svg.append('g')
    //     .selectAll("dot")
    //     .data(A)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function (d) {
    //         //console.log(x(d[0]));
    //         return x(d[0]); } )
    //     .attr("cy", function (d) { return y(d[1]); } )
    //     .attr("r", 4)
    //     .style("fill", "#69b3a2")

    var dot_groups = svg.selectAll(".dot_groups")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "obs");
        // .on('mouseover', function(){
        //     d3v5.select(this).select('text').style('opacity', '1');
        // })
        // .on('mouseleave', function(){
        //     d3v5.select(this).select('text').style('opacity', '0');
        //});

    dot_groups.append("circle")
        .attr("cx", function (d) { return x(d["PC1"]); } )
        .attr("cy", function (d) { return y(d["PC2"]); } )
        .attr("r", 3)
        //.style("fill", "#69b3a2")
        .style("fill", "black")
        .on('mouseover', function(){
            //d3v5.select(this.parentNode).select('text').style('opacity', '1');
            d3v5.select(this.parentNode).append("text")
                .attr('text-anchor', 'left')
                .attr("x", function(d) {return (x(d["PC1"])+20)})
                .attr("y", function(d) {return (y(d["PC2"]))})
                .text(function (d) {return 'Location: ' + d["Location"].toString()});
            d3v5.select(this.parentNode).append("text")
                .attr('text-anchor', 'left')
                .attr("x", function(d) {return (x(d["PC1"])+20)})
                .attr("y", function(d) {return (y(d["PC2"])+15)})
                .text(function (d) {return 'Depth: ' + d["Sample ID"].toString()});
            d3v5.select(this.parentNode).selectAll('text').raise();

        })
        .on('mouseleave', function(){
            //d3v5.select(this.parentNode).select('text').style('opacity', '0');
            d3v5.select(this.parentNode).selectAll('text').remove();
        });

    // dot_groups.append("text")
    //     .attr('text-anchor', 'middle')
    //     .attr("x", function(d) {return x(d[0])})
    //     .attr("y", function(d) {return y(d[1])})
    //     .text(function (d) {return d[0].toString() + '\n' + d[1].toString()})
    //     .style('opacity', '0');






    let defs = svg.append("svg:defs");

    function marker(color) {
        defs.append("svg:marker")
            .attr("id", color.replace("#", ""))
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("markerWidth", 9)
            .attr("markerHeight", 9)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", color);

        return "url(" + color + ")";
    };

    var myColor = d3v5.scaleSequential().domain([1, B.length+1])
        .interpolator(d3v5.interpolateRainbow);

    let count = 0;

    var line_groups = svg.selectAll(".line_groups")
        .data(B)
        .enter()
        .append("g")
        .attr("class", "dims")
        .on('mouseover', function(){
            d3v5.select(this).select('text').style('opacity', '1');
        })
        .on('mouseleave', function(){
            d3v5.select(this).select('text').style('opacity', '0');
        });

    line_groups.append('line')
        .style("stroke-width", 1)
        .attr("x1", x(0))
        .attr("y1", y(0))
        .attr("x2", function (d) {return x(d[0]);})
        .attr("y2", function (d) {return y(d[1]);})
        .each(function(d) {
            var color = d3v5.color(myColor(count));
            d3v5.select(this).style("stroke", color)
                .attr("marker-end", marker(color.formatHex()));
            d3v5.select(this.parentNode)
                .append('line')
                .style("stroke-width", 5)
                .style("stroke", "black")
                .style("opacity", "0")
                .attr("x1", x(0))
                .attr("y1", y(0))
                .attr("x2", function (d) {return x(d[0]);})
                .attr("y2", function (d) {return y(d[1]);})
            count += 1;
        })
    count = 0;
    line_groups.append('text')
        .attr('text-anchor', 'middle')
        .attr("x", function(d) {return x(d[0])})
        .attr("y", function(d) {return y(d[1])})
        .each(function() {
            d3v5.select(this).text(elementsList[count]).style('opacity', '0');
            count +=1;
        });
}