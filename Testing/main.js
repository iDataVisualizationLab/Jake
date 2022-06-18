// const first = document.querySelector('#number1');
// const second = document.querySelector('#number2');
//
// const result = document.querySelector('.result');
//
// if (window.Worker) {
//     const myWorker = new Worker("worker_a.js");
//
//     first.onchange = function() {
//         myWorker.postMessage([first.value, second.value]);
//         console.log('Message posted to worker');
//     }
//
//     second.onchange = function() {
//         myWorker.postMessage([first.value, second.value]);
//         console.log('Message posted to worker');
//     }
//
//     myWorker.onmessage = function(e) {
//         result.textContent = e.data;
//         console.log('Message received from worker');
//     }
// } else {
//     console.log('Your browser doesn\'t support web workers.');
// }

let slider_values = {}

function make_slider(slider_id, min, max, value, step, width, text){
    let slider = d3.select("#sliders")
        .append('g')
        .attr('class', slider_id)

    slider.append('input')
        .attr("type", "range")
        .attr('min', min)
        .attr('max', max)
        .attr('value', value)
        .attr('step', step)
        .style('width', `${width}px`)
        .on('input', function(){
            let val = d3.select(this).property("value")
            d3.select(`#${slider_id}_value_text`).text(val)
            slider_values[slider_id] = val
        });

    slider.append('p')
        .text(`${text}: `)
        .append('span')
        .attr('id', `${slider_id}_value_text`)
        .text(value)


}

make_slider('s1',0,1000000,0,1, 400, 'Iterations')

function getRandomIntInclusive(min, max) {
    return Math.random() * (max - min) + min;
}

let data = {};

let simulation_type = ['a', 'b']

function generate_data(){
    data = {}

    simulation_type.forEach(d=>{
        data[d] = {}
        for (let i = 0; i < 300; i++){
            data[d][i] = {}
            data[d][i] = getRandomIntInclusive(0.9, 1)
            data[d][i] = getRandomIntInclusive(0.7, 1)
        }
    })
}
generate_data()

async function end_timer_original(start){
    const end = new Date()
    d3.select('#original_span_rt').text(`${(end-start) / 1000} Seconds`)

}

async function end_timer_worker(start){
    const end = new Date()
    d3.select('#worker_span_rt').text(`${(end-start) / 1000} Seconds`)

}

function start_simulation_workers() {

    const start = new Date();

    let iterations = slider_values['s1']

    const myWorker_a = new Worker("worker_a.js");
    const myWorker_b = new Worker("worker_b.js");


    myWorker_a.postMessage([data, iterations])
    myWorker_b.postMessage([data, iterations])

    // let result = {}
    let finished = {'a': false, 'b': false}

    myWorker_a.onmessage = function (e) {
        console.log('Message received from worker');
        // result['a'] = e.data
        d3.select('#worker_span_a').text(`${((1 - e.data/(iterations*Object.keys(data['a']).length))*100).toFixed(3)}%`)

        finished['a'] = true
        if (finished['a'] && finished['b']){
            end_timer_worker(start)
        }

    }

    myWorker_b.onmessage = function (e) {
        console.log('Message received from worker');
        //result['b'] = e.data
        d3.select('#worker_span_b').text(`${((1 - e.data/(iterations*Object.keys(data['b']).length))*100).toFixed(3)}%`)
        finished['b'] = true
        if (finished['a'] && finished['b']){
            end_timer_worker(start)
        }
    }



}



function start_simulation(){

    const start = new Date();


    let iterations = +slider_values['s1']

    console.log(data)

    // let result = {}
    // // for (let i = 0; i < iterations; i++){
    //     result[1] = {}
    //     simulation_type.forEach(d=> {
    //         result[1][d] = {}
    //     })
    // // }

    let failures = {}
    failures['a'] = 0
    failures['b'] = 0

    for (let i = 0; i < iterations; i++){
        simulation_type.forEach(d => {
            Object.keys(data[d]).forEach(e =>{
                Math.random() > +data[d][e] ? failures[d]+=1 : null
            })
        })
    }



    d3.select('#original_span_a').text(`${((1 - failures['a']/(iterations*Object.keys(data['a']).length))*100).toFixed(3)}%`)
    d3.select('#original_span_b').text(`${((1 - failures['b']/(iterations*Object.keys(data['b']).length))*100).toFixed(3)}%`)

    end_timer_original(start)

}



