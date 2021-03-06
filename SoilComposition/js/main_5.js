import * as THREE from '../lib/threejs/three.module.js';

import * as p_x from '../data/100/100_pos_x.js';
import * as p_y from '../data/100/100_pos_y.js';
import * as p_z from '../data/100/100_pos_z.js';

const pos_x = p_x.default;
const pos_y = p_y.default;
const pos_z = p_z.default;

let scene;
let points;
let wireframeRendered = false;

let elements = ["Mg","Al","Si","P","S","K","Ca","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","As","Rb","Sr","Y","Zr","Nb","Cd","Sn","Ba","W","Hg","Pb","Th","U","LE","RI","DI"]//,"SR"]

async function build(chemical){

    let filePath = "./data/100/100_"+chemical+"_Concentration_t.json"

    arr = await fetchData(filePath);

    scene = document.querySelector('#mainScene').object3D;
    scene.remove(points)

    const particles = 1000000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    const color = new THREE.Color();
    const low_color = new THREE.Color(0xffffe6);
    const high_color = new THREE.Color(0xcc0000);

    for ( let i = 0; i < particles; i ++ ) {

        // positions
        if (arr[i] >= valueMin && arr[i] <= valueMax) {
            if ((Math.pow(pos_x[i] - 50, 2) + Math.pow(pos_z[i] - 50, 2)) < (Math.pow(50, 2))) {
                const x = (pos_x[i] - 50) * 2.5;
                const y = (pos_y[i] - 50) * 2.5;
                const z = (pos_z[i] - 50) * 2.5;

                positions.push(x, y, z);

                let color = new THREE.Color(getColor(arr[i]));

                colors.push(color.r, color.g, color.b);
            }

        }

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial( { size: 12.5, vertexColors: true, opacity:1 } );

    points = new THREE.Points( geometry, material );
    scene.add( points );

    if (!wireframeRendered){
        createWireframe();
        renderDepthGradation();
        wireframeRendered = true;
    }

    document.querySelector('#volumeImage').setAttribute('visible', 'true');
}

let sceneEl = document.querySelector('#mainScene')

let cameraControlButton;
let valuePlusButton1;
let valuePlusButton2;
let valueMinusButton1;
let valueMinusButton2;

let valueInfo;
let valueTextMin;
let valueTextPlaneMin;
let valueTextMax;
let valueTextPlaneMax;
let minText;
let maxText;

let valueMin = 0;
let valueMax = 1;
let valueMinSelectButton;
let valueMaxSelectButton;
let valueMinSelected = true;
let valueMaxSelected = false;
let valueDiff = valueMax-valueMin;
let axisControlText1;
let axisControlText2;

let wsZ = true;

let buttonColor = '#C0C0C0';
let buttonHighlightedColor = '#808080';
let selectedButtonColor = '#dbb039';
let controlPanelColor = '#ffcfc7';
let fillBarColor = '#000000';

let selectedChemical = 'Ca';
let chemicalText;

let chemButtons = [];
let chemButtonsText = [];

function renderChemicalText(){
    chemicalText = document.createElement('a-entity')
    chemicalText.setAttribute('text', {value: 'Chemical: '+selectedChemical, height: 325, width: 325, color: 'black', align: 'center'});
    chemicalText.setAttribute('position', '-275 40 -6');
    sceneEl.appendChild(chemicalText);
}
renderChemicalText();

function updateChemicalText(){
    chemicalText.setAttribute('text', {value: 'Chemical: '+selectedChemical});
}

function renderControlButton(){
    cameraControlButton = document.createElement('a-box')
    cameraControlButton.setAttribute('position', '-273.5 -10 0');
    cameraControlButton.setAttribute('scale', '60 35 2');
    cameraControlButton.setAttribute('material', {color: buttonColor});
    sceneEl.appendChild(cameraControlButton);
    cameraControlButton.addEventListener('mouseenter', function (){
        cameraControlButton.setAttribute('material', {color: buttonHighlightedColor});
    })
    cameraControlButton.addEventListener('mouseleave', function (){
        cameraControlButton.setAttribute('material', {color: buttonColor});
    })
    cameraControlButton.addEventListener('click', function (){
        if (wsZ == true){
            document.querySelector('#mainCamera').setAttribute('wasd-controls', {wsAxis: 'y', wsInverted: 'true'});
            wsZ = false;
            axisControlText1.setAttribute('text', {value: 'W/S: Y axis', height: 325, width: 325, color: 'black', align: 'center'});
        }
        else{
            document.querySelector('#mainCamera').setAttribute('wasd-controls', {wsAxis: 'z', wsInverted: 'false'});
            axisControlText1.setAttribute('text', {value: 'W/S: Z axis', height: 325, width: 325, color: 'black', align: 'center'});
            wsZ = true;
        }
    })
    const cameraControlButtonText = document.createElement('a-entity')
    cameraControlButtonText.setAttribute('text', {value: 'Change\nW/S', height: '4', width: '5', color:'black', align: 'center', zOffset: '2'})
    cameraControlButton.appendChild(cameraControlButtonText);

}
renderControlButton();

function renderValueMinSelectButton(){
    valueMinSelectButton = document.createElement('a-box')
    valueMinSelectButton.setAttribute('position', '-350 -100 0');
    valueMinSelectButton.setAttribute('scale', '35 35 2');
    valueMinSelectButton.setAttribute('material', {color: selectedButtonColor});
    sceneEl.appendChild(valueMinSelectButton);
    valueMinSelectButton.addEventListener('mouseenter', function (){
        valueMinSelectButton.setAttribute('material', {color: buttonHighlightedColor});
    })
    valueMinSelectButton.addEventListener('mouseleave', function (){
        if (valueMinSelected){
            valueMinSelectButton.setAttribute('material', {color: selectedButtonColor});
        }
        else valueMinSelectButton.setAttribute('material', {color: buttonColor});
    })
    valueMinSelectButton.addEventListener("click", function (){
        if (valueMaxSelected){
            valueMinSelected = true;
            valueMaxSelected = false;
            valueMinSelectButton.setAttribute('material', {color: selectedButtonColor});
            valueMaxSelectButton.setAttribute('material', {color: buttonColor});
        }
    })
    minText = document.createElement('a-entity')
    minText.setAttribute('text', {value: 'Min', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valueMinSelectButton.appendChild(minText);
}
renderValueMinSelectButton()

function renderValueMaxSelectButton(){
    valueMaxSelectButton = document.createElement('a-box')
    valueMaxSelectButton.setAttribute('position', '-350 100 0')
    valueMaxSelectButton.setAttribute('scale', '35 35 2');
    valueMaxSelectButton.setAttribute('material', {color: buttonColor});
    valueMaxSelectButton.addEventListener('mouseenter', function (){
        valueMaxSelectButton.setAttribute('material', {color: buttonHighlightedColor});
    })
    valueMaxSelectButton.addEventListener('mouseleave', function (){
        if (valueMaxSelected){
            valueMaxSelectButton.setAttribute('material', {color: selectedButtonColor});
        }
        else valueMaxSelectButton.setAttribute('material', {color: buttonColor});
    })
    sceneEl.appendChild(valueMaxSelectButton);
    valueMaxSelectButton.addEventListener("click", function (){
        if (valueMinSelected){
            valueMaxSelected = true;
            valueMinSelected = false;
            valueMaxSelectButton.setAttribute('material', {color: selectedButtonColor});
            valueMinSelectButton.setAttribute('material', {color: buttonColor});
        }
    })
    maxText = document.createElement('a-entity')
    maxText.setAttribute('text', {value: 'Max', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valueMaxSelectButton.appendChild(maxText);

}
renderValueMaxSelectButton()

function renderValuePlusButton1(){
    valuePlusButton1 = document.createElement('a-box')
    valuePlusButton1.setAttribute('position', '-300 100 0');
    valuePlusButton1.setAttribute('scale', '35 35 2');
    valuePlusButton1.setAttribute('material', {color: buttonColor});
    valuePlusButton1.addEventListener('mouseenter', function (){
        valuePlusButton1.setAttribute('material', {color: buttonHighlightedColor});
    })
    valuePlusButton1.addEventListener('mouseleave', function (){
        valuePlusButton1.setAttribute('material', {color: buttonColor});
    })
    sceneEl.appendChild(valuePlusButton1);
    valuePlusButton1.addEventListener('mousedown', function (){
        if (valueMaxSelected){
            if (valueMax <= .9){
                valueMax += .1;
                updateValueInfoPos()
            }

        }
        else if (valueMinSelected){
            if (valueMin+.1 < valueMax){
                if (valueMin <= .9){
                    valueMin += .1;
                    updateValueInfoPos()
                }
            }

        }
    })
    const plusText = document.createElement('a-entity')
    plusText.setAttribute('text', {value: '+ 0.1', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valuePlusButton1.appendChild(plusText);
}
renderValuePlusButton1();

function renderValuePlusButton2(){
    valuePlusButton2 = document.createElement('a-box')
    valuePlusButton2.setAttribute('position', '-250 100 0');
    valuePlusButton2.setAttribute('scale', '35 35 2');
    valuePlusButton2.setAttribute('material', {color: buttonColor});
    sceneEl.appendChild(valuePlusButton2);
    valuePlusButton2.addEventListener('mouseenter', function (){
        valuePlusButton2.setAttribute('material', {color: buttonHighlightedColor});
    })
    valuePlusButton2.addEventListener('mouseleave', function (){
        valuePlusButton2.setAttribute('material', {color: buttonColor});
    })
    valuePlusButton2.addEventListener('mousedown', function (){
        if (valueMaxSelected){
            if (valueMax <= .99){
                valueMax += .01;
                updateValueInfoPos()
            }

        }
        else if (valueMinSelected){
            if (valueMin+.01 < valueMax){
                if (valueMin <= .99){
                    valueMin += .01;
                    updateValueInfoPos()
                }
            }

        }
    })
    const plusText = document.createElement('a-entity')
    plusText.setAttribute('text', {value: '+ 0.01', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valuePlusButton2.appendChild(plusText);
}
renderValuePlusButton2();

function renderValueMinusButton1(){
    valueMinusButton1 = document.createElement('a-box')
    valueMinusButton1.setAttribute('position', '-300 -100 0');
    valueMinusButton1.setAttribute('scale', '35 35 2');
    valueMinusButton1.setAttribute('material', {color: buttonColor});
    valueMinusButton1.addEventListener('mouseenter', function (){
        valueMinusButton1.setAttribute('material', {color: buttonHighlightedColor});
    })
    valueMinusButton1.addEventListener('mouseleave', function (){
        valueMinusButton1.setAttribute('material', {color: buttonColor});
    })
    sceneEl.appendChild(valueMinusButton1);
    valueMinusButton1.addEventListener('mousedown', function (){
        if (valueMaxSelected){
            if (valueMax-.1 > valueMin){
                if (valueMax >= .1){
                    valueMax -= .1;
                    updateValueInfoPos()
                }
            }
        }
        else if (valueMinSelected){
            if (valueMin >= .1){
                valueMin -= .1;
                updateValueInfoPos()
            }

        }
    })
    const minusText = document.createElement('a-entity')
    minusText.setAttribute('text', {value: '- 0.1', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valueMinusButton1.appendChild(minusText);
}

renderValueMinusButton1();

function renderValueMinusButton2(){
    valueMinusButton2 = document.createElement('a-box')
    valueMinusButton2.setAttribute('position', '-250 -100 0');
    valueMinusButton2.setAttribute('scale', '35 35 2');
    valueMinusButton2.setAttribute('material', {color: buttonColor});
    valueMinusButton2.addEventListener('mouseenter', function (){
        valueMinusButton2.setAttribute('material', {color: buttonHighlightedColor});
    })
    valueMinusButton2.addEventListener('mouseleave', function (){
        valueMinusButton2.setAttribute('material', {color: buttonColor});
    })
    sceneEl.appendChild(valueMinusButton2);
    valueMinusButton2.addEventListener('mousedown', function (){
        if (valueMaxSelected){
            if (valueMax-.01 > valueMin){
                if (valueMax >= .01){
                    valueMax -= .01;
                    updateValueInfoPos()
                }
            }
        }
        else if (valueMinSelected){
            if (valueMin >= .01){
                valueMin -= .01;
                updateValueInfoPos()
            }

        }
    })
    const minusText = document.createElement('a-entity')
    minusText.setAttribute('text', {value: '- 0.01', height: '10', width: '7', color:'black', align: 'center', zOffset: '2'})
    valueMinusButton2.appendChild(minusText);
}

renderValueMinusButton2();

function renderValueInfo() {
    valueInfo = document.createElement('a-box')
    valueInfo.setAttribute('position', '-350 '+((valueDiff/2)).toString()+' 0');
    valueInfo.setAttribute('scale', '35 '+(valueDiff*165).toString()+' 2');
    valueInfo.setAttribute('material', {color: fillBarColor});
    sceneEl.appendChild(valueInfo);
    valueTextPlaneMin = document.createElement('a-entity')
    valueTextPlaneMin.setAttribute('geometry', {primitive: 'plane', width: '50', height: '50'});
    valueTextPlaneMin.setAttribute('material', {opacity: '0'});
    valueTextPlaneMin.setAttribute('position', '-390 -82.5 0');
    sceneEl.appendChild(valueTextPlaneMin);
    valueTextMin = document.createElement('a-entity')
    valueTextMin.setAttribute('text', {value: valueMin.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.2'})
    valueTextPlaneMin.appendChild(valueTextMin)
    valueTextPlaneMax = document.createElement('a-entity')
    valueTextPlaneMax.setAttribute('geometry', {primitive: 'plane', width: '50', height: '50'});
    valueTextPlaneMax.setAttribute('material', {opacity: '0'});
    valueTextPlaneMax.setAttribute('position', '-390 82.5 0');
    sceneEl.appendChild(valueTextPlaneMax);
    valueTextMax = document.createElement('a-entity')
    valueTextMax.setAttribute('text', {value: valueMax.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.2'})
    valueTextPlaneMax.appendChild(valueTextMax)

}

renderValueInfo()

function updateValueInfoPos() {
    let pos = (((valueMax*165+ valueMin*165)/2)-82.5).toString();
    let placeMax = (165*valueMax) - 82.5;
    let placeMin = (165*valueMin) - 82.5;
    valueDiff = valueMax-valueMin
    valueInfo.setAttribute('position', '-350 '+pos+' 0');
    valueInfo.setAttribute('scale', '35 '+(valueDiff*165).toString()+' 2');
    valueTextPlaneMin.setAttribute('position', '-390 '+placeMin.toString()+' 0');
    valueTextMin.setAttribute('text', {value: valueMin.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.2'})
    valueTextPlaneMax.setAttribute('position', '-390 '+placeMax.toString()+' 0');
    valueTextMax.setAttribute('text', {value: valueMax.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.2'})
    build(selectedChemical);

}

function createWireframe(){
    scene = document.querySelector('#mainScene').object3D;
    const geometry = new THREE.CylinderGeometry( 127.5, 127.5, 255, 64 );
    const wireframe = new THREE.WireframeGeometry( geometry );
    const material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    const line = new THREE.LineSegments( wireframe , material );
    line.material.depthTest = false;
    line.material.opacity = .0125;
    line.material.transparent = true;
    scene.add( line );
}

function renderDepthGradation(){
    const depthLine = document.createElement('a-entity');
    depthLine.setAttribute('line', {start: '140 -127.5 0', end: '140 127.5 0', color: 'black'});
    sceneEl.appendChild(depthLine)
    let i;

    for(i = 0; i<11; i++){
        const text = document.createElement('a-entity');
        text.setAttribute('text', {value: (i*10).toString()+' cm', height: '250', width: '250', color:'black', align: 'left', zOffset: '.75'})
        text.setAttribute('position', '270, '+(127.5 - ((i/10)*255)).toString()+', 0')
        depthLine.appendChild(text);

        const mark = document.createElement('a-entity');
        mark.setAttribute('line', {start: '140 '+(127.5 - ((i/10)*255)).toString()+' 0', end: '145 '+(127.5 - ((i/10)*255)).toString()+' 0', color: 'black'});
        depthLine.appendChild(mark);

        const lineThrough = document.createElement('a-entity');
        lineThrough.setAttribute('line', {start: '-140 '+(127.5 - ((i/10)*255)).toString()+' 0', end: '140 '+(127.5 - ((i/10)*255)).toString()+' 0', color: 'black', opacity: '.125'});
        sceneEl.appendChild(lineThrough);
    }

    const depthLine2 = document.createElement('a-entity');
    depthLine2.setAttribute('line', {start: '0 -127.5 -140', end: '0 127.5 -140', color: 'black'});
    sceneEl.appendChild(depthLine2)

    for(i = 0; i<11; i++){
        const text = document.createElement('a-entity')
        text.setAttribute('text', {value: (i*10).toString()+' cm', height: '250', width: '250', color:'black', align: 'left'})
        text.setAttribute('position', '0, '+(127.5 - ((i/10)*255)).toString()+', -270')
        text.setAttribute('rotation', '0 90 0');
        depthLine2.appendChild(text);

        const mark = document.createElement('a-entity');
        mark.setAttribute('line', {start: '0 '+(127.5 - ((i/10)*255)).toString()+' -140', end: '0 '+(127.5 - ((i/10)*255)).toString()+' -145', color: 'black'});
        depthLine2.appendChild(mark);

        const lineThrough = document.createElement('a-entity');
        lineThrough.setAttribute('line', {start: '0 '+(127.5 - ((i/10)*255)).toString()+' -140', end: '0 '+(127.5 - ((i/10)*255)).toString()+' 140', color: 'black', opacity: '.125'});
        sceneEl.appendChild(lineThrough);
    }
}

function renderControlPanel(){
    const controlPanel = document.createElement('a-box')
    controlPanel.setAttribute('position', '-300 5 -10');
    controlPanel.setAttribute('scale', '250 340 2');
    controlPanel.setAttribute('material', {color: controlPanelColor});
    //controlPanel.setAttribute('rotation', '0, -30, 0')
    sceneEl.appendChild(controlPanel);
    const controlText = document.createElement('a-entity');
    controlText.setAttribute('text', {value: 'Controls', height: 400, width: 400, color: 'black', align: 'center'});
    controlText.setAttribute('position', '-300 145 -6');
    //controlText.setAttribute('rotation', '0, -30, 0');
    sceneEl.appendChild(controlText);
    axisControlText1 = document.createElement('a-entity');
    axisControlText1.setAttribute('text', {value: 'W/S: Z axis', height: 325, width: 325, color: 'black', align: 'center'});
    axisControlText1.setAttribute('position', '-275 -45 -6');
    sceneEl.appendChild(axisControlText1);
    axisControlText2 = document.createElement('a-entity');
    axisControlText2.setAttribute('text', {value: 'A/D: X axis', height: 325, width: 325, color: 'black', align: 'center'});
    axisControlText2.setAttribute('position', '-275 -65 -6');
    sceneEl.appendChild(axisControlText2);
}
renderControlPanel();

build(selectedChemical);

function createChemicalMenu(){
    let i;
    console.log(elements.length);
    for (i = 0; i < elements.length; i++){
        const elementButton = document.createElement('a-box')
        //elementButton.setAttribute('position', (350+(i*40)).toString()+' -100 0');
        let row;
        if (i < 7){
            row = 1;
        }
        if (i >= 7 & i < 14){
            row = 2;
        }
        if (i >= 14 & i < 21){
            row = 3;
        }
        if (i >= 21 & i < 28){
            row = 4;
        }
        if (i >= 28 & i < 36){
            row = 5;
        }
        let col = i % 7;
        elementButton.setAttribute('position', (200+(row*40)).toString()+' '+(100-(col*40)).toString()+' 0');
        elementButton.setAttribute('scale', '35 35 2');
        elementButton.setAttribute('material', {color: buttonColor});
        elementButton.name = elements[i];
        sceneEl.appendChild(elementButton);
        chemButtons.push(elementButton);
        elementButton.addEventListener('mouseenter', function (){
            elementButton.setAttribute('material', {color: buttonHighlightedColor});
        })
        elementButton.addEventListener('mouseleave', function (){
            elementButton.setAttribute('material', {color: buttonColor});
        })
        elementButton.addEventListener("click", function (){
            selectedChemical = elementButton.name;
            build(selectedChemical);
            updateChemicalText();
        })
        const elementText = document.createElement('a-entity')
        elementText.setAttribute('text', {value: elements[i], height: '10', width: '7', color:'black', align: 'center', zOffset: '1.5'})
        chemButtonsText.push(elementText);
        elementButton.appendChild(elementText);
    }
}
createChemicalMenu();