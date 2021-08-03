let profiles = ["R", "S", "L"]
let soilPackages = {RCRA_8_metals: ['As', 'Ba', 'Cd', 'Cr', 'Pb', 'Hg', 'Se', 'Ag'],
    Plant_essentials: ['Ca', 'Cu', 'Fe', 'K', 'Mn', 'S', 'Zn'],
    Pedology: ['Rb'],
    Other: ['Mg', 'Al', 'Si', 'P', 'Ti', 'V', 'Co', 'Ni', 'Sr', 'Y', 'Zr', 'Nb', 'Sn', 'W', 'Th', 'U', 'LE', 'Mo', 'Sb', 'Bi', 'Mo', 'Sb']};
let packages = ['RCRA_8_metals', 'Plant_essentials', 'Pedology', 'Other'];


get_dimensions(profiles[0]);


function checkAll(package){
    if(document.getElementById('All_package'+(package)).checked == false){
        for (let i in soilPackages[packages[package]]){
            document.getElementById(soilPackages[packages[package]][i]).checked = false;
        }
    }
    else{
        for (let i in soilPackages[packages[package]]){
            if(document.getElementById(soilPackages[packages[package]][i]).disabled == false){
                document.getElementById(soilPackages[packages[package]][i]).checked = true;
            }
        }
    }

    get_dimensions(profiles[document.getElementById('framework').value]);
}


function verifyChecked(){
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
    get_dimensions(profiles[document.getElementById('framework').value]);
}

function get_maxmin(profile, dims){
    d3v5.csv("./data/"+profile+".csv", function (d) {

        dims.forEach(e => {
            if (parseFloat(d[e.name]) > e.max){
                e.max = parseFloat(d[e.name]);
                e.min = parseFloat(d[e.name]);
            }
        })
    });

    d3v5.csv("./data/"+profile+".csv", function (d) {
        dims.forEach(e => {
            if (parseFloat(d[e.name]) < e.min){
                e.min = parseFloat(d[e.name]);
            }
        })
    });

    get_readings(profile, dims);

}

function get_dimensions(profile){

    let flag = true;
    let dims = [];
    d3v5.csv("./data/"+profile+".csv", function (d) {
        if (flag){
            for (let i in d){
                if(i.split(' ')[1] === 'Concentration' ){
                    let dim = {name: i, hide: false, min: 1, max: 0}
                    dims.push(dim);
                }
            }
            flag = false;

            //get_readings(profile, dims);

            var myColor = d3v5.scaleSequential().domain([1, dims.length+1])
                .interpolator(d3v5.interpolateRainbow);

            for (let i in dims){
                dims[i]["color"] = d3v5.color(myColor(i));
            }



            get_maxmin(profile, dims)
        }
    });
}

function get_readings(profile, dims){

    let data = d3v5.csv("./data/"+profile+"_normalized.csv", function (d){
        return d;
    });

    let dimObject = {};
    dims.forEach(dim => dimObject[dim.name] = dim);

    for (let i  in packages){
        for (let j in soilPackages[packages[i]]){
            if (document.getElementById(soilPackages[packages[i]][j]).checked == false) {
                dimObject[soilPackages[packages[i]][j]+' Concentration'].noShow = true;
            }
            else if (document.getElementById(soilPackages[packages[i]][j]).checked == true) {
                dimObject[soilPackages[packages[i]][j]+' Concentration'].noShow = false;
            }

        }
    }

    let dimIndexes = [];
    for (let i in dims){
        if (!dims[i].noShow){
            dimIndexes.push(+i)
        }
    }

    data.then(d => {
        for (let i in dims){
            if (dims[i].max === 0) {
                dims[i].hide = true;
            }
        }

        let PCA_input = []
        d.forEach(row => {
            let row_readings = []
            for (let i in dims){
                if (!dims[i].noShow){
                    row_readings.push(parseFloat(row[dims[i].name]));
                }
            }
            PCA_input.push(row_readings);
        })
        if(PCA_input && PCA_input[0] && PCA_input[0].length > 1){
            draw_pca_plot(PCA_input, d, dims, dimIndexes);
        }else{
            //TODO add message / clear svg
            //No dimensions selected
        }

    });
}

function draw_pca_plot(input, data, dims, dimIndexes){

    dims.forEach(d => {
        if(d.max == 0){
            d.hide = true
            document.getElementById(d.name.split(' ')[0]).checked = false;
            document.getElementById(d.name.split(' ')[0]).disabled = true;
        }
        else{
            document.getElementById(d.name.split(' ')[0]).disabled = false;
        }
    });

    let pca = new PCA();
    let matrix = pca.scale(input, true, false);
    let pc = pca.pca(matrix, 2);
    let A = pc[0];  // this is the U matrix from SVD
    let B = pc[1];  // this is the dV matrix from SVD
    let chosenPC = pc[2];   // this is the most value of PCA

    for (let i in A){
        data[i]["PC1"] = A[i][0];
        data[i]["PC2"] = A[i][1];
    }

    for (let i in B){
        dims[dimIndexes[i]]["x"] = B[i][0];
        dims[dimIndexes[i]]["y"] = B[i][1];
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

    for (let i in data){
        data[i]["id"] = i;
    }

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

    // myColor = d3v5.scaleSequential().domain([1, dims.length+1])
    //     .interpolator(d3v5.interpolateRainbow);
    //
    // for (let i in dims){
    //     dims[i]["color"] = d3v5.color(myColor(i));
    // }

    function distance(d){
        return Math.sqrt((d[2]-d[0])*(d[2]-d[0])+(d[3]-d[1])*(d[3]-d[1]));
    }

    let dimsX = [];
    dims.forEach(function (d){
        if (!d.noShow){
            dimsX.push(d.x);
        }
    })

    let dimsY = [];
    dims.forEach(function (d){
        if (!d.noShow){
            dimsY.push(d.y);
        }
    })

    let dimsReshape = []
    for (let i in dimsX){
        dimsReshape.push(distance([x(0), y(0), x(dimsX[i]), y(dimsY[i])]))
    }

    let multiplyBrands = Math.sqrt(d3.min([
        distance([x(0),y(0),x.range()[0],y.range()[0]]),
        distance([x(0),y(0),x.range()[0],y.range()[1]]),
        distance([x(0),y(0),x.range()[1],y.range()[0]]),
        distance([x(0),y(0),x.range()[1],y.range()[1]]),
    ])/d3.max(dimsReshape)/2);

    var line_groups = svg.selectAll(".line_groups")
        .data(dims)
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
        .attr("x2", function (d) {
            if (!d.noShow){
                return x(d.x * multiplyBrands);
            }})
        .attr("y2", function (d) {
            if (!d.noShow){
                return y(d.y * multiplyBrands);
            }})
        .each(function(d) {
            d3v5.select(this).style("stroke", function(d) {return d.color})
                .attr("marker-end", function (d) { return marker(d.color.formatHex())});
            d3v5.select(this.parentNode)
                .append('line')
                .style("stroke-width", 5)
                .style("stroke", "black")
                .style("opacity", "0")
                .attr("x1", x(0))
                .attr("y1", y(0))
                .attr("x2", function (d) {
                    if (!d.noShow){
                        return x(d.x * multiplyBrands);
                    }})
                .attr("y2", function (d) {
                    if (!d.noShow){
                        return y(d.y * multiplyBrands);
                    }})
        })

    line_groups.append('text')
        .attr('text-anchor', 'middle')
        .attr("x", function(d) {
            if (!d.noShow){
                return x(d.x * multiplyBrands);
            }})
        .attr("y", function(d) {
            if (!d.noShow) {
                return y(d.y * multiplyBrands);
            }})
        .text(function (d) {return d.name.split(' ')[0]})
        .style('opacity', '0');

    line_groups.each(function (d){
        if (d.noShow){
            d3v5.select(this).attr('opacity', '0');
        }
        else {d3v5.select(this).attr('opacity', '1')}
    });

    buildParallelChart(dims, []);



    // when a lasso is completed, filter to the points within the lasso polygon
    function handleLassoEnd(lassoPolygon) {
        var selectedPoints = dot_groups.filter(function (d) {
            // note we have to undo any transforms done to the x and y to match with the
            // coordinate system in the svg.
            var x = +d3.select(this).select('circle').attr("cx");// + margin.left;
            var y = +d3.select(this).select('circle').attr("cy");// + margin.top;

            return d3v5.polygonContains(lassoPolygon, [x, y]);
        });

        updateSelected(selectedPoints);
    }

    function updateSelected(selected){
        d3.selectAll('.obs').select('circle').style("fill", 'black');
        if (selected['_groups']){
            let sel = []
            selected['_groups'][0].forEach(d =>{
                d3.select(d).select('circle').style("fill", 'red');
                sel.push(d.__data__.id)
            })
            buildParallelChart(dims, sel);
        }
    }

// reset selected points when starting a new polygon
    function handleLassoStart(lassoPolygon) {
        updateSelected([]);
    }

    var lassoInstance = lasso()
        .on('end', handleLassoEnd)
        .on('start', handleLassoStart);

    svg.call(lassoInstance);

}