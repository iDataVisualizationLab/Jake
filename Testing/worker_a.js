// onmessage = function(e) {
//     console.log('Worker: Message received from main script');
//     const result = e.data[0] * e.data[1];
//     if (isNaN(result)) {
//         postMessage('Please write two numbers');
//     } else {
//         const workerResult = 'Result: ' + result;
//         console.log('Worker: Posting message back to main script');
//         postMessage(workerResult);
//     }
// }

onmessage = function(e) {
    // console.log('Worker: Message received from main script');
    console.log(e)

    let _data = e.data[0]['a']
    let iterations = e.data[1]

    // let result = {}
    // //for (let i = 0; i < iterations; i++){
    //     result[1] = {}
    // //}

    let failures = 0

    for (let i = 0; i < iterations; i++){
        Object.keys(_data).forEach(d =>{
            Math.random() > +_data[d] ? failures+=1 : null
        })

    }
    postMessage(failures)

}