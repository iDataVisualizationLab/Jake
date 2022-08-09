import * as parallel from "./parallel.js";

let soilPackages = {RCRA_8_metals: ['As', 'Ba', 'Cd', 'Cr', 'Pb', 'Hg', 'Se', 'Ag'],
    Plant_essentials: ['Ca', 'Cu', 'Fe', 'K', 'Mn', 'S', 'Zn'],
    Pedology: ['RI', 'DI', 'SR', 'Rb'],
    Other: ['Mg', 'Al', 'Si', 'P', 'Ti', 'V', 'Co', 'Ni', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Sn', 'W', 'Bi', 'Th', 'U', 'LE', 'Sb']};

let defaultChecked = {
    RCRA_8_metals: true,
    Plant_essentials: true,
    Pedology: false,
    Other: false
}

const graphicPCA={margin: {top: 30, right: 10, bottom: 50, left: 50},
    width : function(){return 700 - this.margin.left - this.margin.right},
    height : function(){return 550 - this.margin.top - this.margin.bottom},
    animationTime:1000
}

let profile_color = {
    "R": "#8F7C00",
    "S": "#C20088",
    "L": "#00998F"
}
function buildMenu(){

    let count = 0
    for (let i in soilPackages){
        let temp_selection = document.querySelector(`.${i}`)

        let newInputAll = document.createElement("input");
        newInputAll.setAttribute("type", "checkbox");
        newInputAll.setAttribute("id", `All_package${count}`);
        newInputAll.checked = defaultChecked[i]
        newInputAll.onclick = function () {
            checkAll(Object.keys(soilPackages).indexOf(i))
        }

        let newLabelAll = document.createElement("label")
        newLabelAll.setAttribute("for", `All_package${count}`);
        newLabelAll.innerHTML = 'All'

        temp_selection.appendChild(newInputAll)
        temp_selection.appendChild(newLabelAll)

        for(let j in soilPackages[i]){
            let newInput = document.createElement("input");
            newInput.setAttribute("type", "checkbox");
            newInput.setAttribute("id", soilPackages[i][j]);
            newInput.checked = defaultChecked[i]
            newInput.onclick = function (){
                verifyChecked()
            }

            let newLabel = document.createElement("label")
            newLabel.setAttribute("for", soilPackages[i][j]);
            newLabel.innerHTML = soilPackages[i][j]

            temp_selection.appendChild(newInput)
            temp_selection.appendChild(newLabel)
        }
        count++
    }

    let temp_selection = document.querySelector(`.locationProfile`)

    Object.keys(profile_color).forEach(d=>{
        let newInput = document.createElement("input");
        newInput.setAttribute("type", "checkbox");
        newInput.setAttribute("id", `loc${d}`);
        newInput.onclick = function (){
            selectProfiles()
        }

        let newLabel = document.createElement("label")
        newLabel.setAttribute("for", `loc${d}`);
        newLabel.innerHTML = d

        temp_selection.appendChild(newInput)
        temp_selection.appendChild(newLabel)
    })
    document.querySelector('#locR').checked = true
}

buildMenu()
init_pca_plot();

export function checkAll(pkg){
    console.log('All_package'+(pkg))
    if(document.getElementById('All_package'+(pkg)).checked == false){
        for (let i in soilPackages[Object.keys(soilPackages)[pkg]]){
            document.getElementById(soilPackages[Object.keys(soilPackages)[pkg]][i]).checked = false;
        }
    }
    else{
        for (let i in soilPackages[packages[pkg]]){
            if(document.getElementById(soilPackages[Object.keys(soilPackages)[pkg]][i]).disabled == false){
                document.getElementById(soilPackages[Object.keys(soilPackages)[pkg]][i]).checked = true;
            }
        }
    }
    selectProfiles()
}


export function verifyChecked(){
    for (let i  in Object.keys(soilPackages)){
        let flag = false;
        for (let j in soilPackages[Object.keys(soilPackages)[i]]){
            if (document.getElementById(soilPackages[Object.keys(soilPackages)[i]][j]).disabled == false && document.getElementById(soilPackages[Object.keys(soilPackages)[i]][j]).checked == false){
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
            .attr('class', 'pca_svg')
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

    let locationProfies = ["locR", "locS", "locL"];
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

export async function get_dimensions_3(_profiles){

    let dimensions = new Object()

    let profile_dims = {}
    _profiles.forEach(d=> profile_dims[d] = {})

    Promise.all(
        Array.from(_profiles, x => d3v5.csv(`./data/${x}-processed.csv`))
    ).then(function(files) {
        let allData = []
        for (let i in files) {
            allData = allData.concat(files[i])
        }

        for (let j in allData[0]){
            if(j.split(' ')[1] === 'Concentration' && ! dimensions.hasOwnProperty(j)){
                let arr = allData.map(d=> +d[j])
                let ext = (d3.extent(arr))
                let dim = {name: j, hide: false, min: ext[0], max: ext[1], noShow: false}

                dimensions[j] = (dim)
            }
        }


        for(let i = 0 ; i < Object.keys(profile_dims).length; i++){


            let dim = {min: 0, max: 100}
            profile_dims[Object.keys(profile_dims)[i]]['Sample ID'] = dim


            Object.keys(dimensions).forEach(d=>{
                let arr = files[i].map(e=> +e[d])
                let ext = (d3.extent(arr))
                let dim = {min: ext[0], max: ext[1]}


                profile_dims[Object.keys(profile_dims)[i]][d] = dim
            })
        }

        var myColor = d3v5.scaleSequential().domain([1, Object.keys(dimensions).length+1])
            .interpolator(d3v5.interpolateRainbow);

        for (let i = 0; i < Object.keys(dimensions).length; i++){
            dimensions[Object.keys(dimensions)[i]]["color"] = d3v5.color(myColor(i+1));
        }

        let dim_ids

        async function update_dimensions(){
            for (let i in Object.keys(soilPackages)){
                for (let j in soilPackages[Object.keys(soilPackages)[i]]){
                    if (document.getElementById(soilPackages[Object.keys(soilPackages)[i]][j]).checked == false) {
                        dimensions[soilPackages[Object.keys(soilPackages)[i]][j]+' Concentration'].noShow = true;
                    }
                    else if (document.getElementById(soilPackages[Object.keys(soilPackages)[i]][j]).checked == true) {
                        dimensions[soilPackages[Object.keys(soilPackages)[i]][j]+' Concentration'].noShow = false;
                    }
                }
            }

            dim_ids = [];


            for (let i in dimensions){
                if (!(dimensions[i].noShow)){
                    dim_ids.push(dimensions[i]["name"]);
                }
                if (dimensions[i].max === 0) {
                    dimensions[i].hide = true;
                }
            }

        }

        update_dimensions().then(()=>{
            let PCA_inputs = []
            for (let i in files){
                let PCA_input = [];
                for (let j in files[i]){
                    let row_readings = []
                    for (let k in dimensions){
                        if (!dimensions[k].noShow){
                            row_readings.push(parseFloat(files[i][j][k]))
                        }
                    }
                    PCA_input.push(row_readings);
                }
                PCA_input.pop();
                PCA_inputs.push(PCA_input);
            }

            if(PCA_inputs && PCA_inputs[0][0] && PCA_inputs[0][0].length > 1){
                draw_pca_plot_3(_profiles, PCA_inputs, files, dimensions, dim_ids, false, profile_dims);
            }else{
                //TODO add message / clear svg
                //No dimensions selected
            }

        })

    })
}

async function draw_pca_plot_3(_profiles, inputs, data, dims_3, dim_ids, reCal, profile_dims){

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
                    data_2[i]["color"] = profile_color[_profiles[0]];
                }
                break;
            case 2:
                for (let i in data_2){
                    data_2[i]["selected"] = false;
                    if (i < data[0].length){
                        data_2[i]["id"] = _profiles[0] + i;
                        data_2[i]["profile"] = _profiles[0];
                        data_2[i]["color"] = profile_color[_profiles[0]];
                    }
                    else{
                        data_2[i]["id"] = _profiles[1] + (i - data[0].length);
                        data_2[i]["profile"] = _profiles[1];
                        data_2[i]["color"] = profile_color[_profiles[1]];
                    }
                }
                break;
            case 3:
                for (let i in data_2){
                    data_2[i]["selected"] = false;
                    if (i < data[0].length){
                        data_2[i]["id"] = _profiles[0] + i;
                        data_2[i]["profile"] = _profiles[0];
                        data_2[i]["color"] = profile_color[_profiles[0]];
                    }
                    else if (i >= data[0].length && i < (data[1].length + data[0].length)){
                        data_2[i]["id"] = _profiles[1] + (i - data[0].length);
                        data_2[i]["profile"] = _profiles[1];
                        data_2[i]["color"] = profile_color[_profiles[1]];
                    }
                    else{
                        data_2[i]["id"] = _profiles[2] + (i - (data[0].length + data[1].length));
                        data_2[i]["profile"] = _profiles[2];
                        data_2[i]["color"] = profile_color[_profiles[2]];
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

    //let dim_list = [];//d3.entries(dims_2);
    //Object.keys(dims_3).forEach(dim=> dim_list.push(dims_3[dim]));

    let dim_list = Object.values(dims_3)

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

    parallel.buildParallelChart(_profiles, dim_list, sorted_dims, data_2, [], profile_dims);

    function build_legend(profiles){
        if (d3.select('.legend')){
            d3.select('.legend').remove()
        }

        let chart = d3.select('.pca_svg')
        let legend = chart.append('g')
            .attr('class', 'legend')

        let horizontal_spacing = 40
        let left_margin = 50
        let padding = 5
        let size = 15

        for (let i in profiles){
            legend.append('rect')
                .attr('width', `${size}px`)
                .attr('height', `${size}px`)
                .attr('x', `${ (left_margin) + (padding) +  horizontal_spacing * i}px `)
                .attr('y', `${padding}px`)
                .attr('fill', () => profile_color[profiles[i]])

            legend.append('text')
                .attr('x', `${(left_margin) + (padding*2) + size +  horizontal_spacing * i}px `)
                .attr('y', `${padding}px`)
                .attr('dy', '1em')
                .text(profiles[i])
        }
    }
    build_legend(_profiles)



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
            parallel.buildParallelChart(_profiles, dim_list, sorted_dims, data_2, sel, profile_dims);

            console.log(data_2)
        }
    }

// reset selected points when starting a new polygon
    function handleLassoStart(lassoPolygon) {
        updateSelected([]);
    }

}


