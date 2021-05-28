//
// const file = String.raw`Ca`
//
//
// function importData(file){
//     const path = String.raw`../data/100/100_`+file+`_Concentration_t.js`
//     import * as data from '${path}';
//     const valData = data.default;
// }
//
// console.log(importData(file));

// filePath = "./data/100/100_Ca_Concentration_t.json"
//
// var arr;
//
// function importFile(filePath){
//     fetch(filePath)
//     // fetch("./data/100/100_Ca_Concentration_t.json")
//         .then(res => res.json())
//         .then(data => arr = data);
// }
//
//
// importFile(filePath);
// console.log(arr);

//filePath = "./data/100/100_Ca_Concentration_t.json"

async function fetchData(path) {
    try {
        const response = await fetch(path, {
            method: 'GET',
            //credentials: 'same-origin'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}
let arr;

async function get(){
    arr = await fetchData(filePath);
    //console.log(arr);
    return arr
}
//let test = await get();

console.log(arr);
//console.log(arr);
