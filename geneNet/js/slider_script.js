let wrapper, container, sliderTrack, sliderOne, sliderTwo, minGap, sliderMaxValue, button, button_div, outer

let display_wrapper, display_min, display_max, display_dash


let min_date, max_date

function slider_init(min, max, min_date_, max_date_) {


    min_date = min_date_
    max_date = max_date_

    display_wrapper = document.createElement('div')
    display_wrapper.style.display = 'flex'
    document.getElementById('sliders').appendChild(display_wrapper)

    display_min = document.createElement('span')
    display_min.innerHTML = new Date(min_date).toLocaleDateString()
    display_wrapper.appendChild(display_min)

    display_dash = document.createElement('span')
    display_dash.innerHTML = '-'
    display_dash.style.padding = '0 10px'
    display_wrapper.appendChild(display_dash)



    display_max = document.createElement('span')
    display_max.innerHTML = new Date(max_date).toLocaleDateString()
    display_wrapper.appendChild(display_max)



    outer = document.createElement('div')
    outer.style.display = 'flex'
    document.getElementById('sliders').appendChild(outer)

    wrapper = document.createElement('div')
    wrapper.className = 'wrapper'
    // wrapper.style.display = 'flex'
    //document.getElementById('sliders').appendChild(wrapper)
    outer.appendChild(wrapper)

    button_div = document.createElement('div')
    button_div.style.padding = '0 10px'
    outer.appendChild(button_div)

    button = document.createElement('button')
    button.style.padding = '0 10px'
    button.innerHTML = '←'
    button.onclick = function (){
        if (sliderOne.style.zIndex > sliderTwo.style.zIndex){
            sliderOne.style.zIndex = sliderOne.style.zIndex -1
            sliderTwo.style.zIndex = sliderTwo.style.zIndex +1
            button.innerHTML = '→'
        }
        else {
            sliderOne.style.zIndex = sliderOne.style.zIndex +1
            sliderTwo.style.zIndex = sliderTwo.style.zIndex -1
            button.innerHTML = '←'
        }

    }
    button_div.appendChild(button)

    container = document.createElement('div')
    container.className = 'container'
    wrapper.appendChild(container)

    sliderTrack = document.createElement('div');
    sliderTrack.className = "slider-track"
    container.appendChild(sliderTrack)

    sliderTwo = document.createElement('input')
    sliderTwo.type = 'range'
    sliderTwo.min = min
    sliderTwo.max = max
    sliderTwo.value = max
    sliderTwo.style.zIndex = '0'
    sliderTwo.id = "slider-2"

    sliderOne = document.createElement('input')
    sliderOne.type = 'range'
    sliderOne.min = min
    sliderOne.max = max
    sliderOne.value = max
    sliderOne.id = "slider-1"
    sliderOne.style.zIndex ='1'
    sliderMaxValue = sliderOne.max;

    minGap = 10;
    sliderOne.addEventListener('input', function () {
        slideOne(sliderOne, sliderTwo);
    }, false)
    sliderTwo.addEventListener('input', function () {
        slideTwo(sliderOne, sliderTwo);
    }, false)
    container.appendChild(sliderOne)
    container.appendChild(sliderTwo)
    slideOne(sliderOne, sliderTwo);
    slideTwo(sliderOne, sliderTwo);
}
// window.onload = function(){
//     init()
// }

function slideOne(s1, s2){
    if(parseInt(s2.value) - parseInt(s1.value) <= minGap){
        s1.value = parseInt(s2.value) - minGap;
    }
    display_min.innerHTML = new Date(min_date + +s1.value).toLocaleDateString()
    fillColor();
}
function slideTwo(s1, s2){
    if(parseInt(s2.value) - parseInt(s1.value) <= minGap){
        s2.value = parseInt(s1.value) + minGap;
    }
    display_max.innerHTML = new Date(min_date + +s2.value).toLocaleDateString()
    fillColor();
}
function fillColor(){
    let percent1 = (sliderOne.value / sliderMaxValue) * 100;
    let percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
}
