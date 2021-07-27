let elementsList = ["Mg", "Al", "Si", "P", "S", "K", "Ca", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "As", "Se", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Ag", "Cd", "Sn", "Sb", "Ba", "W", "Hg", "Pb", "Bi", "Th", "U", "LE"]

async function calculate() {
    let filePath = "./data/normalized_data.json"

    let result = await fetchData(filePath);

    return result;
}

// async function elements() {
//     let filePath = "./data/elements.json"
//
//     let result = await fetchData(filePath);
//
//     return result;
// }
//
// elements().then(r => console.log(r));

// calculate().then(r => {
//     //console.log(typeof r);
//     //console.log(typeof r[0]);
//     let pca = new PCA();
//     let matrix = pca.scale(r, true, false);
//     console.log("===result===")
//     console.log(matrix);
//     let pc = pca.pca(matrix, 2);
//     let A = pc[0];  // this is the U matrix from SVD
//     let B = pc[1];  // this is the dV matrix from SVD
//     let chosenPC = pc[2];   // this is the most value of PCA
//     //console.log("===chosenPC===")
//     //console.log(chosenPC);
//     //console.log("===A===");
//     //console.log(A);
//     //console.log("===B===");
//     //console.log(B);
//
//     let x_list = [];
//     A.forEach(i => x_list.push(i[0]));
//
//     let y_list = [];
//     A.forEach(i => y_list.push(i[1]));
//
//     //console.log(d3.min(x_list));
//     //console.log(d3.max(x_list));
//
//
//     // set the dimensions and margins of the graph
//     var margin = {top: 10, right: 30, bottom: 30, left: 60},
//     width = 920 - margin.left - margin.right,
//     height = 800 - margin.top - margin.bottom;
//
//     // append the svg object to the body of the page
//     var svg = d3.select("#my_dataviz")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//     var x = d3.scaleLinear()
//         .domain([d3.min(x_list), d3.max(x_list)])
//         .range([ 0, width ]);
//     svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(x));
//
//     // Add Y axis
//     var y = d3.scaleLinear()
//         .domain([d3.min(y_list), d3.max(y_list)])
//         .range([ height, 0]);
//     svg.append("g")
//         .call(d3.axisLeft(y));
//
//     // Add dots
//     svg.append('g')
//         .selectAll("dot")
//         .data(A)
//         .enter()
//         .append("circle")
//         .attr("cx", function (d) {
//             //console.log(x(d[0]));
//             return x(d[0]); } )
//         .attr("cy", function (d) { return y(d[1]); } )
//         .attr("r", 4)
//         .style("fill", "#69b3a2")
//
//     // svg.append("svg:defs").append("svg:marker")
//     //     .attr("id", "arrow")
//     //     .attr("viewBox", "0 -5 10 10")
//     //     .attr('refX', 3)//so that it comes towards the center.
//     //     .attr("markerWidth", 6)
//     //     .attr("markerHeight", 6)
//     //     .attr("orient", "auto")
//     //     .append("svg:path")
//     //     .attr("d", "M0,-5L10,0L0,5");
//
//     var defs = svg.append("svg:defs");
//
//     function marker(color) {
//         defs.append("svg:marker")
//             .attr("id", color.replace("#", ""))
//             .attr("viewBox", "0 -5 10 10")
//             .attr("refX", 0) // This sets how far back it sits, kinda
//             //.attr("refY", 0)
//             .attr("markerWidth", 9)
//             .attr("markerHeight", 9)
//             .attr("orient", "auto")
//             .attr("markerUnits", "userSpaceOnUse")
//             .append("svg:path")
//             .attr("d", "M0,-5L10,0L0,5")
//             .style("fill", color);
//
//         return "url(" + color + ")";
//     };
//
//     var myColor = d3.scaleSequential().domain([1, B.length+1])
//         .interpolator(d3.interpolateRainbow);
//     //svg.selectAll(".secondrow").data(data).enter().append("circle").attr("cx", function(d,i){return 30 + i*60}).attr("cy", 250).attr("r", 19).attr("fill", function(d){return myColor(d) })
//     //console.log(myColor(1));
//
//     let count = 0;
//
//     var groups = svg.selectAll(".groups")
//         .data(B)
//         .enter()
//         .append("g")
//         .attr("class", "dims")
//         .on('mouseover', function(){
//             d3.select(this).select('text').style('opacity', '1');
//         })
//         .on('mouseleave', function(){
//             d3.select(this).select('text').style('opacity', '0');
//         });
//
//     //console.log(groups);
//
//     groups.append('line')
//         .style("stroke-width", 1)
//         //.style("stroke", "black")
//         .attr("x1", x(0))
//         .attr("y1", y(0))
//         .attr("x2", function (d) {return x(d[0]);})
//         .attr("y2", function (d) {return y(d[1]);})
//         .each(function(d) {
//                 var color = d3.color(myColor(count));
//                 d3.select(this).style("stroke", color)
//                     .attr("marker-end", marker(color.formatHex()));
//                 d3.select(this.parentNode)
//                     .append('line')
//                     .style("stroke-width", 10)
//                     .style("stroke", "black")
//                     .style("opacity", "0")
//                     .attr("x1", x(0))
//                     .attr("y1", y(0))
//                     .attr("x2", function (d) {return x(d[0]);})
//                     .attr("y2", function (d) {return y(d[1]);})
//                 //var line = d3.select(this);
//                 //line.style("stroke", color)
//                 //    .attr("marker-end", marker(color.formatHex()));
//                 //line.append('text')//.append('text')
//                 //console.log(d3.select(this.parentNode));
//                 //      .attr('text-anchor', 'middle')
//                 //      .attr("x", function() {return x(d[0])})
//                 //      .attr("y", function() {return y(d[1])})
//                 //      .text(function (){return elementsList[count]});
//                 count += 1;
//             })
//     count = 0;
//     groups.append('text')
//         .attr('text-anchor', 'middle')
//         .attr("x", function(d) {return x(d[0])})
//         .attr("y", function(d) {return y(d[1])})
//         .each(function() {
//             d3.select(this).text(elementsList[count]).style('opacity', '0');
//             count +=1;
//         });
//         //.text(function (){return elementsList[0]});
//
//
//
//     // var g = svg.selectAll("line")
//     //     .data(B)
//     //     .enter()
//     //     .append('g')
//     //
//     // g.append('line')
//     //     .style("stroke-width", 1)
//     //     .attr("x1", x(0))
//     //     .attr("y1", y(0))
//     //     .attr("x2", function (d) {return x(d[0]);})
//     //     .attr("y2", function (d) {return y(d[1]);});
//     //
//     // console.log(d3.selectAll('g'))
//
//
//     // svg.append('g')
//     //     .selectAll("line")
//     //     .data(B)
//     //     .enter()
//     //     .append("line")
//     //     .style("stroke-width", 1)
//     //     .attr("x1", x(0))
//     //     .attr("y1", y(0))
//     //     .attr("x2", function (d) {return x(d[0]);})
//     //     .attr("y2", function (d) {return y(d[1]);})
//     //     //.attr("marker-end","url(#arrow)")
//     //     .each(function(d) {
//     //         var color = d3.color(myColor(count));
//     //         d3.select(this).style("stroke", color)
//     //             .attr("marker-end", marker(color.formatHex()));
//     //         //var line = d3.select(this);
//     //         //line.style("stroke", color)
//     //         //    .attr("marker-end", marker(color.formatHex()));
//     //         //line.append('text')//.append('text')
//     //         //console.log(d3.select(this.parentNode));
//     //         //      .attr('text-anchor', 'middle')
//     //         //      .attr("x", function() {return x(d[0])})
//     //         //      .attr("y", function() {return y(d[1])})
//     //         //      .text(function (){return elementsList[count]});
//     //         count += 1;
//     //     })
//     //     .on('mouseover', function(){ console.log(d3.select(this.parentNode))});
//         // .style("stroke", function (){
//         //     c = d3.color(myColor(count));
//         //     marker(c.formatHex())
//         //     //c = myColor(count);
//         //     count += 1;
//         //     console.log(c.formatHex());
//         //     return c;})
//         // .attr("marker-end", marker(c.formatHex()));
//         // .style("stroke", function (){
//         //     c = myColor(count);
//         //     count += 1;
//         //     return c;})
//     //console.log(d3.selectAll('line'))
//         // .append('text')
//         // .data(B)
//         // .attr('text-anchor', 'middle')
//         // .attr("x", function(d) {return x(d[0])})
//         // .attr("y", function(d) {return y(d[1])})
//         // .text(function (){return elementsList[0]});
//
//
//
//
//     // let solution = r.map((d,i)=>{
//     //     let temp = d3.range(0,2).map(dim=>A[i][chosenPC[dim]]);
//     //     temp.metrics = d3.entries(self.data._class[classKey[i]]);
//     //     temp.name = classKey[i];
//     //     return temp;
//     // });
//     //console.log(r);
// });

let profiles = ["R", "L", "S"]

function get_elements(profile){
    let flag = true;
    let elements = [];
    d3.csv("./data/"+profile+"_normalized.csv", function (d) {
        if (flag){
            for (let i in d){
                if(i.split(' ')[1] === 'Concentration'){
                    elements.push(i.split(' ')[0])
                }
            }
            flag = false;
        }
    });

    let readings = [];
    let ok = d3.csv("./data/"+profile+"_normalized.csv", function (d){
        //let readings = [];
        let row_readings = [];
        for (let i in elements){
            row_readings.push(parseFloat(d[elements[i]+' Concentration']));
            //console.log(elements[i]);
        }
        //console.log(row_readings);
        readings[readings.length]=row_readings;
        //readings.push(row_readings);
        return d;
    });
    ok.then(d => {
        let readings_1 = []
        d.forEach(row =>{
            let row_readings_1 = []
            for (let i in elements){
                row_readings_1.push(parseFloat(row[elements[i]+' Concentration']));
            }
            readings_1.push(row_readings_1);
        })
        console.log(readings_1[0]);
        draw_pca_plot(readings_1);


    });

    console.log(typeof readings);
    console.log(typeof readings[0]);
    //drawPCA(readings);
    //console.log(readings);
    return readings;


}
get_elements(profiles[1]);


function drawPCA(input){
    let pca = new PCA();
    let matrix = pca.scale(input, true, false);
    //console.log("===result===")
    //console.log(matrix);
    let pc = pca.pca(matrix, 2);
    let A = pc[0];  // this is the U matrix from SVD
    let B = pc[1];  // this is the dV matrix from SVD
    let chosenPC = pc[2];
    console.log(matrix)
}



// async function firstFunction(profile){
//     let flag = true;
//     let elements = [];
//     d3.csv("./data/"+profile+"_normalized.csv", function (d) {
//         if (flag){
//             for (let i in d){
//                 if(i.split(' ')[1] === 'Concentration'){
//                     elements.push(i.split(' ')[0])
//                 }
//             }
//             flag = false;
//         }
//     });
//
//     let readings = [];
//     d3.csv("./data/"+profile+"_normalized.csv", function (d){
//         let row_readings = [];
//         for (let i in elements){
//             row_readings.push(parseFloat(d[elements[i]+' Concentration']));
//             //console.log(elements[i]);
//         }
//         //console.log(row_readings);
//         readings.push(row_readings);
//     });
//     //drawPCA(readings);
//     //console.log(readings);
//     return readings;
// };


// async function secondFunction(profile){
//     let result = await firstFunction(profile);
//     return result;
//     // let pca = new PCA();
//     // let matrix = pca.scale(result, true, false);
//     // //console.log("===result===")
//     // //console.log(matrix);
//     // let pc = pca.pca(matrix, 2);
//     // let A = pc[0];  // this is the U matrix from SVD
//     // let B = pc[1];  // this is the dV matrix from SVD
//     // let chosenPC = pc[2];
//     // console.log(matrix)
// };
// secondFunction(profiles[0]).then(r => {
//     console.log(typeof r[0]);
//     let pca = new PCA();
//     let matrix = pca.scale(r, true, false);
//     //console.log("===result===")
//     //console.log(matrix);
//     let pc = pca.pca(matrix, 2);
//     let A = pc[0];  // this is the U matrix from SVD
//     let B = pc[1];  // this is the dV matrix from SVD
//     let chosenPC = pc[2];
//
// });
//drawPCA(readings);












//
//
// async function pca_preprocess_input(profile){
//     await get_elements(profile);
//
//     for (let i in ok){
//         console.log(i);
//         console.log("Hello");
//     }
//     console.log("Hello");
//
// }
//
// //pca_preprocess_input(profiles[0]);
//
// const secondFunction = async () => {
//     const result = await get_elements(profiles[0])
//
//     for (let i in result){
//         console.log(i);
//         console.log("Hello");
//     }
//     // do something else here after firstFunction completes
// }
//
// secondFunction().then(r => {for (let i in r){
//     console.log(i);
//     console.log("Hello");
// }});

function draw_pca_plot(input){
    //console.log(typeof r);
    //console.log(typeof r[0]);
    let pca = new PCA();
    let matrix = pca.scale(input, true, false);
    console.log("===result===")
    console.log(matrix);
    let pc = pca.pca(matrix, 2);
    let A = pc[0];  // this is the U matrix from SVD
    let B = pc[1];  // this is the dV matrix from SVD
    let chosenPC = pc[2];   // this is the most value of PCA
    //console.log("===chosenPC===")
    //console.log(chosenPC);
    //console.log("===A===");
    //console.log(A);
    //console.log("===B===");
    //console.log(B);

    let x_list = [];
    A.forEach(i => x_list.push(i[0]));

    let y_list = [];
    A.forEach(i => y_list.push(i[1]));

    //console.log(d3.min(x_list));
    //console.log(d3.max(x_list));


    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 920 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([d3.min(x_list), d3.max(x_list)])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(y_list), d3.max(y_list)])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(A)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            //console.log(x(d[0]));
            return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attr("r", 4)
        .style("fill", "#69b3a2")

    // svg.append("svg:defs").append("svg:marker")
    //     .attr("id", "arrow")
    //     .attr("viewBox", "0 -5 10 10")
    //     .attr('refX', 3)//so that it comes towards the center.
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("orient", "auto")
    //     .append("svg:path")
    //     .attr("d", "M0,-5L10,0L0,5");

    var defs = svg.append("svg:defs");

    function marker(color) {
        defs.append("svg:marker")
            .attr("id", color.replace("#", ""))
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0) // This sets how far back it sits, kinda
            //.attr("refY", 0)
            .attr("markerWidth", 9)
            .attr("markerHeight", 9)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", color);

        return "url(" + color + ")";
    };

    var myColor = d3.scaleSequential().domain([1, B.length+1])
        .interpolator(d3.interpolateRainbow);
    //svg.selectAll(".secondrow").data(data).enter().append("circle").attr("cx", function(d,i){return 30 + i*60}).attr("cy", 250).attr("r", 19).attr("fill", function(d){return myColor(d) })
    //console.log(myColor(1));

    let count = 0;

    var groups = svg.selectAll(".groups")
        .data(B)
        .enter()
        .append("g")
        .attr("class", "dims")
        .on('mouseover', function(){
            d3.select(this).select('text').style('opacity', '1');
        })
        .on('mouseleave', function(){
            d3.select(this).select('text').style('opacity', '0');
        });

    //console.log(groups);

    groups.append('line')
        .style("stroke-width", 1)
        //.style("stroke", "black")
        .attr("x1", x(0))
        .attr("y1", y(0))
        .attr("x2", function (d) {return x(d[0]);})
        .attr("y2", function (d) {return y(d[1]);})
        .each(function(d) {
            var color = d3.color(myColor(count));
            d3.select(this).style("stroke", color)
                .attr("marker-end", marker(color.formatHex()));
            d3.select(this.parentNode)
                .append('line')
                .style("stroke-width", 10)
                .style("stroke", "black")
                .style("opacity", "0")
                .attr("x1", x(0))
                .attr("y1", y(0))
                .attr("x2", function (d) {return x(d[0]);})
                .attr("y2", function (d) {return y(d[1]);})
            //var line = d3.select(this);
            //line.style("stroke", color)
            //    .attr("marker-end", marker(color.formatHex()));
            //line.append('text')//.append('text')
            //console.log(d3.select(this.parentNode));
            //      .attr('text-anchor', 'middle')
            //      .attr("x", function() {return x(d[0])})
            //      .attr("y", function() {return y(d[1])})
            //      .text(function (){return elementsList[count]});
            count += 1;
        })
    count = 0;
    groups.append('text')
        .attr('text-anchor', 'middle')
        .attr("x", function(d) {return x(d[0])})
        .attr("y", function(d) {return y(d[1])})
        .each(function() {
            d3.select(this).text(elementsList[count]).style('opacity', '0');
            count +=1;
        });
    //.text(function (){return elementsList[0]});



    // var g = svg.selectAll("line")
    //     .data(B)
    //     .enter()
    //     .append('g')
    //
    // g.append('line')
    //     .style("stroke-width", 1)
    //     .attr("x1", x(0))
    //     .attr("y1", y(0))
    //     .attr("x2", function (d) {return x(d[0]);})
    //     .attr("y2", function (d) {return y(d[1]);});
    //
    // console.log(d3.selectAll('g'))


    // svg.append('g')
    //     .selectAll("line")
    //     .data(B)
    //     .enter()
    //     .append("line")
    //     .style("stroke-width", 1)
    //     .attr("x1", x(0))
    //     .attr("y1", y(0))
    //     .attr("x2", function (d) {return x(d[0]);})
    //     .attr("y2", function (d) {return y(d[1]);})
    //     //.attr("marker-end","url(#arrow)")
    //     .each(function(d) {
    //         var color = d3.color(myColor(count));
    //         d3.select(this).style("stroke", color)
    //             .attr("marker-end", marker(color.formatHex()));
    //         //var line = d3.select(this);
    //         //line.style("stroke", color)
    //         //    .attr("marker-end", marker(color.formatHex()));
    //         //line.append('text')//.append('text')
    //         //console.log(d3.select(this.parentNode));
    //         //      .attr('text-anchor', 'middle')
    //         //      .attr("x", function() {return x(d[0])})
    //         //      .attr("y", function() {return y(d[1])})
    //         //      .text(function (){return elementsList[count]});
    //         count += 1;
    //     })
    //     .on('mouseover', function(){ console.log(d3.select(this.parentNode))});
    // .style("stroke", function (){
    //     c = d3.color(myColor(count));
    //     marker(c.formatHex())
    //     //c = myColor(count);
    //     count += 1;
    //     console.log(c.formatHex());
    //     return c;})
    // .attr("marker-end", marker(c.formatHex()));
    // .style("stroke", function (){
    //     c = myColor(count);
    //     count += 1;
    //     return c;})
    //console.log(d3.selectAll('line'))
    // .append('text')
    // .data(B)
    // .attr('text-anchor', 'middle')
    // .attr("x", function(d) {return x(d[0])})
    // .attr("y", function(d) {return y(d[1])})
    // .text(function (){return elementsList[0]});




    // let solution = r.map((d,i)=>{
    //     let temp = d3.range(0,2).map(dim=>A[i][chosenPC[dim]]);
    //     temp.metrics = d3.entries(self.data._class[classKey[i]]);
    //     temp.name = classKey[i];
    //     return temp;
    // });
    //console.log(r);
}