let colors5 = ["#4A8FC2", "#A6C09D", "#FAFA7C", "#EC9248", "#D63128"];
const colorQuantiles = [0.2, 0.4, 0.6, 0.8, 1.0];
const continuousColorScale = new d3v5.scaleLinear().domain(colorQuantiles.map(d=>d-colorQuantiles[0])).range(colors5);

function getColor(val){
    return continuousColorScale(val);
}
