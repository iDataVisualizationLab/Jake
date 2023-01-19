let wrapper, container, sliderTrack, sliderOne, sliderTwo, minGap, sliderMaxValue

function init() {



    wrapper = document.createElement('div')
    wrapper.className = 'wrapper'
    document.getElementById('sliders').appendChild(wrapper)

    container = document.createElement('div')
    container.className = 'container'
    wrapper.appendChild(container)

    sliderTrack = document.createElement('div');
    sliderTrack.className = "slider-track"
    container.appendChild(sliderTrack)

    sliderOne = document.createElement('input')
    sliderOne.type = 'range'
    sliderOne.min = "0"
    sliderOne.max = "100"
    sliderOne.value = "30"
    sliderOne.id = "slider-1"
    sliderMaxValue = sliderOne.max;

    sliderTwo = document.createElement('input')
    sliderTwo.type = 'range'
    sliderTwo.min = "0"
    sliderTwo.max = "100"
    sliderTwo.value = "70"
    sliderTwo.id = "slider-1"

    minGap = 0;
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
window.onload = function(){
    init()
}

function slideOne(s1, s2){
    if(parseInt(s2.value) - parseInt(s1.value) <= minGap){
        s1.value = parseInt(s2.value) - minGap;
    }
    fillColor();
}
function slideTwo(s1, s2){
    if(parseInt(s2.value) - parseInt(s1.value) <= minGap){
        s2.value = parseInt(s1.value) + minGap;
    }
    fillColor();
}
function fillColor(){
    let percent1 = (sliderOne.value / sliderMaxValue) * 100;
    let percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
}
