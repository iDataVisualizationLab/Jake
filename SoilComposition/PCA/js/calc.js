import * as parallel from "./parallel.js";

let profiles = ["R", "S", "L"];

let soilPackages = {RCRA_8_metals: ['As', 'Ba', 'Cd', 'Cr', 'Pb', 'Hg', 'Se', 'Ag'],
    Plant_essentials: ['Ca', 'Cu', 'Fe', 'K', 'Mn', 'S', 'Zn'],
    Pedology: ['Rb'],
    Other: ['Mg', 'Al', 'Si', 'P', 'Ti', 'V', 'Co', 'Ni', 'Sr', 'Y', 'Zr', 'Nb', 'Sn', 'W', 'Th', 'U', 'LE', 'Mo', 'Sb', 'Bi', 'Mo', 'Sb']};
let packages = ['RCRA_8_metals', 'Plant_essentials', 'Pedology', 'Other'];

var graphicPCA={margin: {top: 20, right: 10, bottom: 50, left: 50},
    width : function(){return 700 - this.margin.left - this.margin.right},
    height : function(){return 550 - this.margin.top - this.margin.bottom},
    animationTime:1000
}

let colors = {
    "R": "#8F7C00",
    "S": "#C20088",
    "L": "#00998F"
}


init_pca_plot();

export function checkAll(pkg){
    if(document.getElementById('All_package'+(pkg)).checked == false){
        for (let i in soilPackages[packages[pkg]]){
            document.getElementById(soilPackages[packages[pkg]][i]).checked = false;
        }
    }
    else{
        for (let i in soilPackages[packages[pkg]]){
            if(document.getElementById(soilPackages[packages[pkg]][i]).disabled == false){
                document.getElementById(soilPackages[packages[pkg]][i]).checked = true;
            }
        }
    }
    selectProfiles()
}


export function verifyChecked(){
    for (let i  in packages){
        let flag = false;
        for (let j in soilPackages[packages[i]]){
            if (document.getElementById(soilPackages[packages[i]][j]).disabled == false && document.getElementById(soilPackages[packages[i]][j]).checked == false){
                flag = true;
                document.getElementById('All_package'+(i)).checked = false;
                break;
            }
        }
        if (!flag){document.getElementById('All_package'+(i)).checked = true;}
    }
    selectProfiles()
}

function init_pca_plot(){
    // set the dimensions and margins of the graph
    var margin = graphicPCA.margin,
        width = graphicPCA.width(),
        height = graphicPCA.height();

    var svg = d3v5.select("#my_dataviz").select('svg g.pcachart');

    if (svg.empty()) {
        // append the svg object to the body of the page
        var svg = d3v5.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style('position','unset')
            .append("g")
            .attr('class','pcachart')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr('class','xaxis')
            .attr("transform", "translate(0," + height + ")")

        // Add Y axis
        svg.append("g")
            .attr('class','yaxis')

        let defs = svg.append("svg:defs");
    }
}

get_dimensions_3(["R"]);
export function selectProfiles(){

    let profiles = ["R", "S", "L"];

    let locationProfies = ["R", "locS", "L"];
    let selectedProfies = [];
    locationProfies.forEach(function (d){
        if(document.getElementById(d).checked == true){
            selectedProfies.push(d);
        }
    })
    let selectedIndexes = []
    selectedProfies.forEach(d => selectedIndexes.push(profiles[locationProfies.indexOf(d)]))

    get_dimensions_3(selectedIndexes);
}

export function get_dimensions_3(_profiles){

    let dims_3 = {};

    Promise.all(
        // Array.from(_profiles, x => d3v5.csv("./data/"+x+"_normalized.csv"))
        Array.from(_profiles, x => d3v5.csv("./data/"+x+".csv"))
    ).then(function(files) {
        for (let i in files){
            for (let j in files[i][0]){
                if(j.split(' ')[1] === 'Concentration' && ! dims_3.hasOwnProperty(j)){
                    let dim = {name: j, hide: false, min: 1, max: 0, noShow: false}
                    dims_3[j] = (dim)
                }
            }
        }

        var myColor = d3v5.scaleSequential().domain([1, Object.keys(dims_3).length+1])
            .interpolator(d3v5.interpolateRainbow);

        let count = 1

        for (let i in dims_3){
            dims_3[i]["color"] = d3v5.color(myColor(count));
            count++;
        }
        get_maxmin_3(_profiles, dims_3);
    })

}

function get_maxmin_3(_profiles, dims_3){

    Promise.all(Array.from(_profiles, x => d3v5.csv("./data/"+x+".csv"))
    ).then(function(files) {
        for (let i in files){
            for (let j in files[i]){
                for (let k in dims_3){
                    if(parseFloat(files[i][j][k]) > dims_3[k].max){
                        dims_3[k].max = parseFloat(files[i][j][k]);
                        dims_3[k].min = parseFloat(files[i][j][k]);
                    }
                }
            }
        }
        for (let i in files){
            for (let j in files[i]){
                for (let k in dims_3){
                    if(parseFloat(files[i][j][k]) < dims_3[k].min){
                        dims_3[k].min = parseFloat(files[i][j][k]);
                    }
                }
            }
        }
        get_readings_3(_profiles, dims_3);
    });
}


function get_readings_3(_profiles, dims_3){

    for (let i in packages){
        for (let j in soilPackages[packages[i]]){
            if (document.getElementById(soilPackages[packages[i]][j]).checked == false) {
                dims_3[soilPackages[packages[i]][j]+' Concentration'].noShow = true;
            }
            else if (document.getElementById(soilPackages[packages[i]][j]).checked == true) {
                dims_3[soilPackages[packages[i]][j]+' Concentration'].noShow = false;
            }
        }
    }

    let dim_ids = [];
    for (let i in dims_3){
        if (!(dims_3[i].noShow)){
            dim_ids.push(dims_3[i]["name"]);
        }
    }

    // Promise.all(Array.from(_profiles, x => d3v5.csv("./data/"+x+"_normalized.csv"))
    Promise.all(Array.from(_profiles, x => d3v5.csv("./data/"+x+".csv"))
    // Promise.all(Array.from(_profiles, x => d3v5.csv("./data/"+x+"_normalized2.csv"))
    ).then(function(files) {
        for (let i in dims_3){
            if (dims_3[i].max === 0) {
                dims_3[i].hide = true;
            }
        }

        let PCA_inputs = []
        for (let i in files){
            let PCA_input = [];
            for (let j in files[i]){
                let row_readings = []
                for (let k in dims_3){
                    if (!dims_3[k].noShow){
                        row_readings.push(parseFloat(files[i][j][k]))
                    }
                }
                PCA_input.push(row_readings);
            }
            PCA_input.pop();
            PCA_inputs.push(PCA_input);
        }

        if(PCA_inputs && PCA_inputs[0][0] && PCA_inputs[0][0].length > 1){
            draw_pca_plot_3(_profiles, PCA_inputs, files, dims_3, dim_ids, false);
        }else{
            //TODO add message / clear svg
            //No dimensions selected
        }
    });
}

async function draw_pca_plot_3(_profiles, inputs, data, dims_3, dim_ids, reCal){

    let PCA_input = []
    let PCA_input2 = []
    let data_2

    inputs.forEach(d => PCA_input = PCA_input.concat(d));

    if (!reCal){
        data_2 = []
        data.forEach(d => data_2 = data_2.concat(d));
        for (let i = 0; i < data_2; i++){
            data_2[i]["hide"] = false;
            data_2[i]["index"] = i;
        }
    }
    else{
        data_2 = data
    }

    for (let i = 0; i < PCA_input.length; i++){
        if (!data_2[i]["hide"]){
            PCA_input2.push(PCA_input[i])
        }
    }


    let pca = new PCA();
    let matrix

    if (!reCal){
        // matrix = pca.scale(PCA_input, true, false);
        matrix = pca.scale(PCA_input, true, true);
    }
    // else {matrix = pca.scale(PCA_input2, true, false);}
    else {matrix = pca.scale(PCA_input2, true, true);}


    let pc = pca.pca(matrix, 2);
    let A = pc[0];  // this is the U matrix from SVD
    let B = pc[1];  // this is the dV matrix from SVD
    let chosenPC = pc[2];   // this is the most value of PCA

    let hiddenCount = 0;

    for (let i = 0; i < data_2.length; i++){
        if (!data_2[i].hide){
            data_2[i]["PC1"] = A[i - hiddenCount][0];
            data_2[i]["PC2"] = A[i - hiddenCount][1];
        }
        else{
            hiddenCount++
            data_2[i]["PC1"] = 0;
            data_2[i]["PC2"] = 0;
        }

    }

    // for (let i in A){
    //     data_2[i]["PC1"] = A[i][0];
    //     data_2[i]["PC2"] = A[i][1];
    //     // data_2[i]["hide"] = false;
    //     // data_2[i]["index"] = count++;
    // }

    for (let i in B){
        dims_3[dim_ids[i]]["x"] = B[i][0];
        dims_3[dim_ids[i]]["y"] = B[i][1];
    }

    for (let i in dims_3){
        if (dims_3[i]["x"] == 0 & dims_3[i]["y"] == 0){
            dims_3[i].hide = true;
        }
        else{
            if(dims_3[i].max != 0){
                dims_3[i].hide = false;
            }
        }
    }

    let x_list = [];
    A.forEach(i => x_list.push(i[0]));

    let y_list = [];
    A.forEach(i => y_list.push(i[1]));


    let _dims = []
    for (let i in dims_3){
        if (dims_3[i]["x"]){
            _dims.push(dims_3[i])
        }
    }

    _dims.sort((a, b) => (
        Math.sqrt(Math.pow(a.x,2) + Math.pow(a.y,2)) < Math.sqrt(Math.pow(b.x,2) + Math.pow(b.y,2))
    ) ? 1 : -1)

    let sorted_dims = []
    for (let i in _dims){
        sorted_dims.push(_dims[i]["name"])
    }

    if (!reCal){
        switch (_profiles.length){
            case 1:
                for (let i in data_2){
                    data_2[i]["id"] = _profiles[0] + i;
                    data_2[i]["selected"] = false;
                    data_2[i]["profile"] = _profiles[0];
                    data_2[i]["color"] = colors[_profiles[0]];
                }
                break;
            case 2:
                for (let i in data_2){
                    data_2[i]["selected"] = false;
                    if (i < data[0].length){
                        data_2[i]["id"] = _profiles[0] + i;
                        data_2[i]["profile"] = _profiles[0];
                        data_2[i]["color"] = colors[_profiles[0]];
                    }
                    else{
                        data_2[i]["id"] = _profiles[1] + (i - data[0].length);
                        data_2[i]["profile"] = _profiles[1];
                        data_2[i]["color"] = colors[_profiles[1]];
                    }
                }
                break;
            case 3:
                for (let i in data_2){
                    data_2[i]["selected"] = false;
                    if (i < data[0].length){
                        data_2[i]["id"] = _profiles[0] + i;
                        data_2[i]["profile"] = _profiles[0];
                        data_2[i]["color"] = colors[_profiles[0]];
                    }
                    else if (i >= data[0].length && i < (data[1].length + data[0].length)){
                        data_2[i]["id"] = _profiles[1] + (i - data[0].length);
                        data_2[i]["profile"] = _profiles[1];
                        data_2[i]["color"] = colors[_profiles[1]];
                    }
                    else{
                        data_2[i]["id"] = _profiles[2] + (i - (data[0].length + data[1].length));
                        data_2[i]["profile"] = _profiles[2];
                        data_2[i]["color"] = colors[_profiles[2]];
                    }
                }
                break;
        }
    }

    var width = graphicPCA.width(),
        height = graphicPCA.height();
    var svg = d3v5.select('.pcachart');


    // Add X axis
    var x = d3v5.scaleLinear()
        .domain([d3v5.min(x_list), d3v5.max(x_list)])
        .range([ 0, width ]);
    svg.select("g.xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v5.axisBottom(x));
    // svg.append("text")
    //     .attr("class", "x label")
    //     .attr("text-anchor", "center")
    //     .attr("x", width/2)
    //     .attr("y", height + 35)
    //     .text("PC1");

    // Add Y axis
    var y = d3v5.scaleLinear()
        .domain([d3v5.min(y_list), d3v5.max(y_list)])
        .range([ height, 0]);
    svg.select("g.yaxis")
        .call(d3v5.axisLeft(y));
    // svg.append("text")
    //     .attr("class", "y label")
    //     .attr("text-anchor", "center")
    //     .attr("x", -65)
    //     .attr("y", height/2)
    //     //.attr("dy", ".75em")
    //     //.attr("transform", "rotate(-90)")
    //     .text("PC2");



    var lassoInstance = lasso()
        .on('end', handleLassoEnd)
        .on('start', handleLassoStart);

    svg.call(lassoInstance);

    var dot_groups = svg.selectAll(".dot_group")
        .data(data_2, d=>d.id)
        .join(
            enter => {
                const gdot = enter.append("g")
                    .attr("class", "dot_group")
                    .attr('transform',d=>`translate(${[x(d["PC1"]),y(d["PC2"])]})`);

                gdot.append("text")
                    .attr('text-anchor', 'left')
                    .attr("x", "20")
                    .attr("y", "0")
                    .text(function (d) {return 'Location: ' + d["Location"].toString()})
                    .attr("display", "none");

                gdot.append("text")
                    .attr('text-anchor', 'left')
                    .attr("x", "20")
                    .attr("y", "15")
                    .text(function (d) {return 'Depth: ' + d["Sample ID"].toString()})
                    .attr("display", "none");

                gdot.on("mouseover", function (){
                        d3v5.select(this).selectAll("text").attr("display", null);
                    })
                    .on("mouseleave", function (){
                        d3v5.select(this).selectAll("text").attr("display", "none");
                    });

                gdot.append("circle")
                    .attr("r", 3)
                    .style("fill", d => d.color)
                return gdot;
            },
            update => update
                .call(update => update.transition().duration(graphicPCA.animationTime)
                    .attr('display', d=> d.hide ? 'none': null)
                    .attr('transform',d=>`translate(${[x(d["PC1"]),y(d["PC2"])]})`)),

            exit => exit
                .call(exit => exit.remove())
                    //.remove())
        );


    d3v5.selectAll(".dot_group").on("contextmenu", function (d, i) {
        d3v5.event.preventDefault();
        d["hide"] = true;
        draw_pca_plot_3(_profiles, inputs, data_2, dims_3, dim_ids, true);

    });

    let removedData = [];

    data_2.forEach(d => d.hide ? removedData.push(d) : null)

    let header = document.getElementById("removedHeader");
    if (removedData.length != 0){
        header.style.display = null;
    }else{
        header.style.display = "none";
    }

    var table = d3.select("#removed")
        .html("")
        .selectAll(".row")
        .data(removedData)
        .enter().append("div")
        .on("click", function (d, i) {
            d["hide"] = false
            draw_pca_plot_3(_profiles, inputs, data_2, dims_3, dim_ids, true);
            })

    table
        .append("span")
        .attr("class", "color-block")

    table
        .append("span")
        .text(function(d) { return d.id; })

    let defs = svg.select("defs");

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

    let dimsX = [];
    for (let i in dims_3){
        if(!(dims_3[i]["noShow"]) && !dims_3[i]["hide"]){
            dimsX.push(dims_3[i]["x"])
        }
    }

    let dimsY = [];
    for (let i in dims_3){
        if(!(dims_3[i]["noShow"]) && !dims_3[i]["hide"]){
            dimsY.push(dims_3[i]["y"])
        }
    }

    function distance(d){
        return Math.sqrt((d[2]-d[0])*(d[2]-d[0])+(d[3]-d[1])*(d[3]-d[1]));
    }

    let dimsReshape = []
    for (let i in dimsX){
        dimsReshape.push(distance([x(0), y(0), x(dimsX[i]), y(dimsY[i])]))
    }

    let multiplyBrands = Math.sqrt(d3v5.min([
        distance([x(0),y(0),x.range()[0],y.range()[0]]),
        distance([x(0),y(0),x.range()[0],y.range()[1]]),
        distance([x(0),y(0),x.range()[1],y.range()[0]]),
        distance([x(0),y(0),x.range()[1],y.range()[1]]),
    ])/d3v5.max(dimsReshape)/2);

    let dim_list = [];//d3.entries(dims_2);
    Object.keys(dims_3).forEach(dim=> dim_list.push(dims_3[dim]));

    dim_list.forEach(d => {while (
        d["x"]* multiplyBrands > d3v5.max(x_list) ||
        d["x"]* multiplyBrands < d3v5.min(x_list) ||
        d["y"]* multiplyBrands > d3v5.max(y_list) ||
        d["y"]* multiplyBrands < d3v5.min(y_list)
        ){
            multiplyBrands = multiplyBrands * .99;
    }})

    var line_groups = svg.selectAll(".line_group")
        .data(dim_list, d=>d.name)
        .join(
            enter => {
                const gline = enter.append("g")
                    .attr("class", "line_group")
                    .style('display',d=>(d.noShow || d.hide || d.y===undefined || d.x===undefined)?'none':null);

                gline.append("text")
                    .attr('display', 'none')
                    .attr('text-anchor', 'left')
                    .attr("x", function (d){return x(d.x * multiplyBrands)})
                    .attr("y", function (d){return y(d.y * multiplyBrands)})
                    .text(function (d) {return d["name"].toString()});

                gline.append("line")
                    .style("stroke-width", 1)
                    .attr("x1", function (d){
                        return x(0);
                    })
                    .attr("y1", function (d) {
                        return y(0);
                    })
                    .attr("x2", function (d){
                        return x(d.x * multiplyBrands);
                    })
                    .attr("y2", function (d) {
                        return y(d.y * multiplyBrands);
                    })
                    .each(function(d) {
                        d3v5.select(this).style("stroke", function(d) {return d.color})
                            .attr("marker-end", function (d) { return marker(d.color.formatHex())})
                    })
                    .on('mouseover', function(){
                        d3v5.select(this.parentNode).select('text').attr("display", null)
                    })
                    .on('mouseleave', function (){d3v5.select(this.parentNode).select('text').attr("display", "none")});
            },
            update => update
                .call(update => update.style('display',d=>(d.noShow || d.hide || d.y===undefined || d.x===undefined)?'none':null)
                    .transition().duration(graphicPCA.animationTime)
                    .select("line")
                    .attr("x1", x(0))
                    .attr("y1", y(0))
                    .attr("x2", function (d){
                        return x(d.x * multiplyBrands);
                    })
                    .attr("y2", function (d) {
                        return y(d.y * multiplyBrands);
                    }))
                .call(update => update.style('display',d=>(d.noShow || d.hide || d.y===undefined || d.x===undefined)?'none':null)
                    .transition().duration(graphicPCA.animationTime)
                    .select('text')
                    .attr("x", function (d){return x(d.x * multiplyBrands)})
                    .attr("y", function (d){return y(d.y * multiplyBrands)})
                ),
            exit => exit
                .call(exit => exit.transition().duration(graphicPCA.animationTime)
                    .remove())

        )

    parallel.buildParallelChart(_profiles, dim_list, sorted_dims, data_2, []);

    // when a selected.length === data.length is completed, filter to the points within the lasso polygon
    function handleLassoEnd(lassoPolygon) {
        var selectedPoints = dot_groups.filter(function (d) {
            var _x = +x(d["PC1"]);
            var _y = +y(d["PC2"]);
            return d3v5.polygonContains(lassoPolygon, [_x, _y]);
        });

        updateSelected(selectedPoints);
    }

    function updateSelected(selected){
        d3.selectAll('.dot_group').select('circle')
            .style("opacity", 1);
        if (selected['_groups']){
            d3.selectAll('.dot_group').select('circle')
                .style("opacity", .25);
            let sel = []
            selected['_groups'][0].forEach(d =>{
                d3.select(d).select('circle').style("opacity", 1);
                d.__data__["selected"] = true;
                sel.push(d.__data__.id)
            })
            if (!sel.length){
                d3.selectAll('.dot_group').select('circle')
                    .each(d => d["selected"] = false)
                    .style("opacity", 1);
            }
            parallel.buildParallelChart(_profiles, dim_list, sorted_dims, data_2, sel);
        }
    }

// reset selected points when starting a new polygon
    function handleLassoStart(lassoPolygon) {
        updateSelected([]);
    }

}


