import * as THREE from '../lib/threejs/three.module.js';

import * as p_x from '../data/50/50_pos_x.js';
import * as p_y from '../data/50/50_pos_y.js';
import * as p_z from '../data/50/50_pos_z.js';

const pos_x = p_x.default;
const pos_y = p_y.default;
const pos_z = p_z.default;

let scene = document.querySelector('#mainScene').object3D;
let points;
let line;

let initialized = false;

export function initBuild(_profiles, chemical, valueMin, valueMax){

    let scene = document.querySelector('#mainScene').object3D;

    if (initialized){
        let sceneEl = document.querySelector('#mainScene');
        sceneEl.querySelectorAll(".graduation").forEach(d => d.remove());
        sceneEl.querySelectorAll(".graduation2").forEach(d => d.remove());
        sceneEl.querySelectorAll(".image").forEach(d => d.remove());
        sceneEl.querySelectorAll(".label").forEach(d => d.remove());
        scene.children.forEach(d => (d.name == "wire") ? scene.remove(d) : null);
        scene.children.forEach(d => (d.name == "volume") ? scene.remove(d) : null);
    }


    switch (_profiles.length){
        case 1:
            scene.children.forEach(d => (d.name == "volume") ? scene.remove(d): null);
            scene.children.forEach(d => (d.name == "wire") ? scene.remove(d): null);
            initReferences(_profiles[0], 0);
            build(_profiles[0], chemical, valueMin, valueMax, 0);
            break
        case 2:
            scene.children.forEach(d => (d.name == "volume") ? scene.remove(d): null);
            scene.children.forEach(d => (d.name == "wire") ? scene.remove(d): null);
            for (let i in _profiles){
                let xOffset = (i*200)-100;
                initReferences(_profiles[i], xOffset);
                build(_profiles[i], chemical, valueMin, valueMax, xOffset);
            }

            break
        case 3:
            scene.children.forEach(d => (d.name == "volume") ? scene.remove(d): null);
            scene.children.forEach(d => (d.name == "wire") ? scene.remove(d): null);
            for (let i in _profiles){
                let xOffset = (i*200)-200;
                initReferences(_profiles[i], xOffset);
                build(_profiles[i], chemical, valueMin, valueMax, xOffset);
            }
            break
    }

    initialized = true;

}

function initReferences(profile, xOffset){
    createWireframe(xOffset);
    renderDepthGradation(xOffset);
    addImage(profile,xOffset)
}



export async function build(profile, chemical, valueMin, valueMax, xOffset){

    let sceneEl = document.querySelector('#mainScene')

    const label = document.createElement('a-entity');
    label.setAttribute("class", "label");
    label.setAttribute('text', {value: profile, height: '500', width: '500', color:'black', align: 'center', zOffset: '0'})
    label.setAttribute('position', (xOffset).toString()+', 85, 0')
    sceneEl.appendChild(label);


    let filePath = "./data/"+profile+"/50_"+chemical+"_Concentration_t.json"

    arr = await fetchData(filePath);

    scene = document.querySelector('#mainScene').object3D;

    const particles = 125000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    const color = new THREE.Color();
    const low_color = new THREE.Color(0xffffe6);
    const high_color = new THREE.Color(0xcc0000);

    for ( let i = 0; i < particles; i ++ ) {

        // positions
        if (arr[i] >= valueMin && arr[i] <= valueMax) {
            if ((Math.pow(pos_x[i] - 25, 2) + Math.pow(pos_z[i] - 25, 2)) < (Math.pow(25, 2))) {
                const x = (pos_x[i] - 25) * 2.5;
                const y = (pos_y[i] - 25) * 2.5;
                const z = (pos_z[i] - 25) * 2.5;

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

    points.position.x = xOffset;
    points.name = "volume";
    scene.add(points)
}

let sceneEl = document.querySelector('#mainScene')

function createWireframe(xOffset){

    const geometry = new THREE.CylinderGeometry( 63.75, 63.75, 127.5, 32 );
    const wireframe = new THREE.WireframeGeometry( geometry );
    const material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    line = new THREE.LineSegments( wireframe , material );
    line.material.depthTest = false;
    line.material.opacity = .0125;
    line.material.transparent = true;

    line.name = "wire";


    line.position.x = xOffset;
    scene.add( line );
}

function renderDepthGradation(xOffset){
    const depthLine = document.createElement('a-entity');
    depthLine.setAttribute("class", "graduation");
    depthLine.setAttribute('line', {start: (70+xOffset).toString()+' -63.75 0', end: (70+xOffset).toString()+' 63.75 0', color: 'black'});
    sceneEl.appendChild(depthLine)
    let i;

    for(i = 0; i<11; i++){
        const text = document.createElement('a-entity');
        text.setAttribute('text', {value: (i*10).toString()+' cm', height: '250', width: '250', color:'black', align: 'left', zOffset: '.75'})
        text.setAttribute('position', (200+xOffset).toString()+', '+(63.75 - ((i/10)*127.5)).toString()+', 0')
        depthLine.appendChild(text);

        const mark = document.createElement('a-entity');
        mark.setAttribute('line', {start: (70+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' 0', end: (72.5+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' 0', color: 'black'});
        depthLine.appendChild(mark);

        const lineThrough = document.createElement('a-entity');
        lineThrough.setAttribute('line', {start: (-70+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' 0', end: (70+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' 0', color: 'black', opacity: '.125'});
        depthLine.appendChild(lineThrough);
    }

    const depthLine2 = document.createElement('a-entity');
    depthLine2.setAttribute('line', {start: (0+xOffset).toString()+' -63.75 -70', end: (0+xOffset).toString()+' 63.75 -70', color: 'black'});
    depthLine2.setAttribute("class", "graduation2");
    sceneEl.appendChild(depthLine2)

    for(i = 0; i<11; i++){
        const text = document.createElement('a-entity')
        text.setAttribute('text', {value: (i*10).toString()+' cm', height: '250', width: '250', color:'black', align: 'left'})
        text.setAttribute('position', (0+xOffset).toString()+', '+(63.75 - ((i/10)*127.5)).toString()+', -200')
        text.setAttribute('rotation', '0 90 0');
        depthLine2.appendChild(text);

        const mark = document.createElement('a-entity');
        mark.setAttribute('line', {start: (0+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' -70', end: (0+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' -72.5', color: 'black'});
        depthLine2.appendChild(mark);

        const lineThrough = document.createElement('a-entity');
        lineThrough.setAttribute('line', {start: (0+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' -70', end: (0+xOffset).toString()+' '+(63.75 - ((i/10)*127.5)).toString()+' 70', color: 'black', opacity: '.125'});
        depthLine2.appendChild(lineThrough);
    }
}

function addImage(profile, xOffset){
    const imgTest = document.createElement('a-image');
    imgTest.setAttribute("class", "image");
    imgTest.setAttribute("src", "#"+profile+"-image");
    imgTest.setAttribute("width","128");
    imgTest.setAttribute("height", "128");
    imgTest.setAttribute("rotation", "-90 0 0");
    imgTest.setAttribute("position", (0+xOffset).toString()+" 66 0");
    sceneEl.appendChild(imgTest)
}
