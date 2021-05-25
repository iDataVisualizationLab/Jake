import * as THREE from '../lib/threejs/three.module.js';
import Stats from '../lib/threejs/stats.module.js';

import {GUI} from '../lib/threejs/dat.gui.module.js';
import { OrbitControls } from '../lib/threejs/OrbitControls2.js';

import * as p_x from '../data/100/100_pos_x.js';
import * as p_y from '../data/100/100_pos_y.js';
import * as p_z from '../data/100/100_pos_z.js';
import * as ca_t from '../data/100/100_Ca_Concentration_t.js';

const pos_x = p_x.default;
const pos_y = p_y.default;
const pos_z = p_z.default;

const val_t = ca_t.default;

let scene;
let points;

function buildVol(){

    //scene.remove(points);
    //console.log(val);

    scene = document.querySelector('#mainScene').object3D;

    const particles = 1000000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    const color = new THREE.Color();
    const low_color = new THREE.Color(0xffffe6);
    const high_color = new THREE.Color(0xcc0000);

    for ( let i = 0; i < particles; i ++ ) {

        // positions
        if (val_t[i] >= value) {
            if ((Math.pow(pos_x[i] - 50, 2) + Math.pow(pos_z[i] - 50, 2)) < (Math.pow(50, 2))) {
                const x = (pos_x[i] - 50) * 2.5;
                const y = (pos_y[i] - 50) * 2.5;
                const z = (pos_z[i] - 50) * 2.5;

                positions.push(x, y, z);

                color.lerpColors(low_color, high_color, val_t[i]);


                colors.push(color.r, color.g, color.b);
            }

        }

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();


    //const material = new THREE.PointsMaterial( { size: 12.5, vertexColors: true } );
    const material = new THREE.PointsMaterial( { size: 12.5 , vertexColors: true } );

    points = new THREE.Points( geometry, material );
    //points.object3D.scale.set(.01, .01, .01);
    //points.name('objPoints');
    //points.scale.set(.1,.1,.1)
    scene.add( points );

    //render();

}

var value = 0;

var sceneEl = document.querySelector('#mainScene')

var cameraControlButton;
var valuePlusButton;
var valueMinusButton;
var volumeRendererButton;
var renderText;
var valup;
var valueInfo;
var plusText;
var minusText;
var valueText;
var valueTextPlane;

var wsZ = true;

function renderControlButton(){
    cameraControlButton = document.createElement('a-sphere')
    cameraControlButton.setAttribute('position', '200 0 0');
    cameraControlButton.setAttribute('radius', '25');
    cameraControlButton.setAttribute('material', {color: 'red'});
    sceneEl.appendChild(cameraControlButton);
    cameraControlButton.addEventListener('click', function (){
        if (wsZ == true){
            document.querySelector('#mainCamera').setAttribute('wasd-controls', {wsAxis: 'y', wsInverted: 'true'});
            wsZ = false;
            cameraControlButton.setAttribute('material', {color: 'blue'});
        }
        else{
            document.querySelector('#mainCamera').setAttribute('wasd-controls', {wsAxis: 'z', wsInverted: 'false'});
            cameraControlButton.setAttribute('material', {color: 'red'});
            wsZ = true;
        }
    })

}
renderControlButton();

function renderValuePlusButton(){
    valuePlusButton = document.createElement('a-box')
    valuePlusButton.setAttribute('position', '-200 100 0');
    valuePlusButton.setAttribute('scale', '40 40 5');
    valuePlusButton.setAttribute('material', {color: 'red'});
    sceneEl.appendChild(valuePlusButton);
    valuePlusButton.addEventListener('mousedown', function (){
        if (value <= .9){
            value += .1;
            console.log(value)
            updateValueInfoPos()
        }
    })
    plusText = document.createElement('a-entity')
    plusText.setAttribute('text', {value: '+ 0.1', height: '10', width: '7', color:'black', align: 'center', zOffset: '.75'})
    valuePlusButton.appendChild(plusText);
}
renderValuePlusButton();

function renderValueMinusButton(){
    valueMinusButton = document.createElement('a-box')
    valueMinusButton.setAttribute('position', '-200 -100 0');
    valueMinusButton.setAttribute('scale', '40 40 5');
    valueMinusButton.setAttribute('material', {color: 'red'});
    sceneEl.appendChild(valueMinusButton);
    valueMinusButton.addEventListener('mousedown', function (){
        if (value >= .1){
            value -= .1;
            console.log(value)
            updateValueInfoPos()
        }
    })
    minusText = document.createElement('a-entity')
    minusText.setAttribute('text', {value: '- 0.1', height: '10', width: '7', color:'black', align: 'center', zOffset: '.75'})
    valueMinusButton.appendChild(minusText);
}
renderValueMinusButton();

function renderVolumeRendererButton() {
    volumeRendererButton = document.createElement('a-box')
    volumeRendererButton.setAttribute('position', '0 200 0');
    volumeRendererButton.setAttribute('scale', '60 30 5');
    volumeRendererButton.setAttribute('material', {color: 'red'});
    sceneEl.appendChild(volumeRendererButton);
    volumeRendererButton.addEventListener('click', function () {
        buildVol();
    })
    renderText = document.createElement('a-entity')
    renderText.setAttribute('text', {value: 'Render', height: '10', width: '7', color:'black', align: 'center', zOffset: '.75'})
    volumeRendererButton.appendChild(renderText);
}

renderVolumeRendererButton();

function renderValueInfo() {
    valueInfo = document.createElement('a-box')
    valueInfo.setAttribute('position', '-200 -79 0');
    valueInfo.setAttribute('scale', '40 1 5');
    valueInfo.setAttribute('material', {color: 'blue'});
    sceneEl.appendChild(valueInfo);
    valueTextPlane = document.createElement('a-entity')
    valueTextPlane.setAttribute('geometry', {primitive: 'plane', width: '50', height: '50'});
    valueTextPlane.setAttribute('material', {opacity: '0'});
    let place = 159*value-79;
    valueTextPlane.setAttribute('position', '-250 -79 0');
    sceneEl.appendChild(valueTextPlane);
    valueText = document.createElement('a-entity')
    valueText.setAttribute('text', {value: value.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.1'})
    valueTextPlane.appendChild(valueText)

}

renderValueInfo()

function updateValueInfoPos() {
    let place = 159*value-79;
    let str = '-200 '+place.toString()+' 0';
    valueInfo.setAttribute('position', '-200 '+place.toString()+' 0');
    valueTextPlane.setAttribute('position', '-250 '+place.toString()+' 0');
    valueText.setAttribute('text', {value: value.toFixed(2).toString(), height: '400', width: '400', color:'black', align: 'center', zOffset: '.1'})


}
