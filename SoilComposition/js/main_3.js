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
//
// let container, stats;
//
// let camera, scene, renderer, controls;
//
// let points;
//
// let volconfig;
//
//
// //let positions = [];
//
//
//
// init();
// buildVol();
// //animate();
//
// function init() {
//
//     container = document.getElementById( 'container' );
//
//     camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
//     //camera.position.z = 2750;
//     camera.position.z = 1000;
//
//     scene = new THREE.Scene();
//     //scene.background = new THREE.Color( 0x050505 );
//     scene.background = new THREE.Color( 0x252525 );
//     scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
//
//     renderer = new THREE.WebGLRenderer();
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( window.innerWidth, window.innerHeight );
//
//     container.appendChild( renderer.domElement );
//
//     controls = new OrbitControls( camera, renderer.domElement );
//     controls.addEventListener( 'change', render );
//     controls.target.set( 0, 0, 0);
//     controls.minZoom = 0.5;
//     controls.maxZoom = 4;
//     controls.update();
//
//
//     stats = new Stats();
//     container.appendChild( stats.dom );
//
//
//     window.addEventListener( 'resize', onWindowResize );
//
//     volconfig = { Density: 0, size: 12.5, spacing: 2.5}// clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
//     const gui = new GUI();
//     gui.add( volconfig, 'Density', 0, 1, 0.001 ).onChange( buildVol );
//     gui.add( volconfig, 'size', 1, 12.5, .1 ).onChange( buildVol );
//     gui.add( volconfig, 'spacing', 0, 10, .1 ).onChange( buildVol );
//
// }
//
// function buildVol(){
//
//     scene.remove(points);
//     //console.log(val);
//
//     const particles = 1000000;
//
//     const geometry = new THREE.BufferGeometry();
//
//     const positions = [];
//     const colors = [];
//
//     const color = new THREE.Color();
//     const low_color = new THREE.Color(0xffffe6);
//     const high_color = new THREE.Color(0xcc0000);
//
//     for ( let i = 0; i < particles; i ++ ) {
//
//         // positions
//         if (val_t[i] >= volconfig.Density) {
//             if ((Math.pow(pos_x[i] - 50, 2) + Math.pow(pos_z[i] - 50, 2)) < (Math.pow(50, 2))) {
//                 const x = (pos_x[i] - 50) * volconfig.spacing;
//                 const y = (pos_y[i] - 50) * volconfig.spacing;
//                 const z = (pos_z[i] - 50) * volconfig.spacing;
//
//                 positions.push(x, y, z);
//
//                 color.lerpColors(low_color, high_color, val_t[i]);
//
//
//                 colors.push(color.r, color.g, color.b);
//             }
//
//         }
//
//     }
//
//     geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
//     geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
//
//     geometry.computeBoundingSphere();
//
//
//     //const material = new THREE.PointsMaterial( { size: 12.5, vertexColors: true } );
//     const material = new THREE.PointsMaterial( { size: volconfig.size , vertexColors: true } );
//
//     points = new THREE.Points( geometry, material );
//     scene.add( points );
//
//     render();
//
// }
//
//
// // function update(){
// //     console.log(volconfig.Density)
// //     //console.log(val)
// //
// // }
//
// function onWindowResize() {
//
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//
//     renderer.setSize( window.innerWidth, window.innerHeight );
//
// }
//
//
// function animate() {
//
//     requestAnimationFrame( animate );
//
//     render();
//     stats.update();
//
// }
//
// function render() {
//
//     // const time = Date.now() * 0.0001;
//     //
//     // points.rotation.x = time * 0.25;
//     // points.rotation.y = time * 0.5;
//
//     renderer.render( scene, camera );
//
// }


// function initmodels(){
//
//     scene = new THREE.Scene();
//
//     const geometry = new THREE.BoxGeometry( 2, 2, 2 );
//     const material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
//     //const texture = new THREE.TextureLoader().load('textures/crate.gif')
//     //const material = new THREE.MeshBasicMaterial( {map: texture} );
//
//     let cube = new THREE.Mesh( geometry, material );
//     scene.add( cube );
//
// }
//
// let scene = document.querySelector('a-scene').object3D;
//
// // let el = document.querySelector('#foo').object3D;
//
// const geometry = new THREE.BoxGeometry( 2, 2, 2 );
// const material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
//     //const texture = new THREE.TextureLoader().load('textures/crate.gif')
//     //const material = new THREE.MeshBasicMaterial( {map: texture} );
//
// let cube = new THREE.Mesh( geometry, material );
// // cube.name = 'ok'
// // el.setObject3D('mesh', cube);
// // cube.name = 'ok'
// scene.add( cube );
//
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