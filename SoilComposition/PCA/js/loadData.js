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
    return arr
}