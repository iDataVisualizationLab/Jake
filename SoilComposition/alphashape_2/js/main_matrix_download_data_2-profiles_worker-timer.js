onmessage = async function(e) {

    let worker_stats = e.data[0]
    let limit = e.data[1]*1000

    let latest_start = 0

    Object.keys(worker_stats).forEach(d=>{
        worker_stats[d]['start_time'] > latest_start ? latest_start = worker_stats[d]['start_time'] : null
    })

    setTimeout(() => {postMessage([true])}, limit);
}
