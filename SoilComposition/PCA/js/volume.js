
//import * as THREE from './lib/threejs/three.module.js';

import Stats from '../lib/threejs/stats.module.js';
//import * as Orbit from './lib/threejs/OrbitControls.module.js';

// import * as ca_x from '../data/test/Ca_Concentration_x2.js';
// import * as ca_y from '../data/test/Ca_Concentration_y2.js';
// import * as ca_z from '../data/test/Ca_Concentration_z2.js';
// import * as ca_t from '../data/test/Ca_Concentration_t2.js';
//
// const pos_x = ca_x.default;
// const pos_y = ca_y.default;
// const pos_z = ca_z.default;

//const val_t = ca_t.default;

import * as p_x from '../data/50/50_pos_x.js';
import * as p_y from '../data/50/50_pos_y.js';
import * as p_z from '../data/50/50_pos_z.js';

const pos_x = p_x.default;
const pos_y = p_y.default;
const pos_z = p_z.default;

//let container, stats;

let camera, scene, renderer;

let points;

let controls;

let rendererSet = false;
let sceneSet = false;

let container = document.getElementById( 'container' );
let container2 = document.getElementById( 'container2' );
let container3 = document.getElementById( 'container3' );

let containerArr = [container, container2, container3];

//initVolume();
//animate();
let scenes = [];
let scene1,scene2,scene3;
let renderers = [];
let renderer1, renderer2, renderer3;
let cameras = [];
let camera1, camera2, camera3;
let controlsArr = [];
let controls1, controls2, controls3;

function createScenes(){
    switch (scenes.length){
        case 0:
            scene1 = new THREE.Scene();
            //scene.background = new THREE.Color( 0x050505 );
            scene1.background = new THREE.Color( '#eeeeee' );
            scene1.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene1);
            renderer1 = new THREE.WebGLRenderer();
            renderer1.setSize( containerArr[0].offsetWidth, containerArr[0].offsetHeight );
            // renderer.setSize( window.innerWidth, window.innerHeight );
            renderer1.setPixelRatio( window.devicePixelRatio );
            renderers.push(renderer1)
            camera1 = new THREE.PerspectiveCamera( 45, containerArr[0].offsetWidth / containerArr[0].offsetHeight, 1, 10000 );
            controls1 = new THREE.OrbitControls( camera1, renderer1.domElement )
            camera1.position.z = 500;
            cameras.push(camera1)
            controlsArr.push(controls1);
            break;
        case 1:
            scene2 = new THREE.Scene();
            //scene.background = new THREE.Color( 0x050505 );
            scene2.background = new THREE.Color( '#eeeeee' );
            scene2.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene2);
            renderer2 = new THREE.WebGLRenderer();
            renderer2.setSize( containerArr[1].offsetWidth, containerArr[1].offsetHeight );
            // renderer.setSize( window.innerWidth, window.innerHeight );
            renderer2.setPixelRatio( window.devicePixelRatio );
            renderers.push(renderer2)
            camera2 = new THREE.PerspectiveCamera( 45, containerArr[1].offsetWidth / containerArr[1].offsetHeight, 1, 10000 );
            controls2 = new THREE.OrbitControls( camera2, renderer2.domElement )
            camera2.position.z = 500;
            cameras.push(camera2)
            controlsArr.push(controls2);
        case 2:
            scene3 = new THREE.Scene();
            //scene.background = new THREE.Color( 0x050505 );
            scene3.background = new THREE.Color( '#eeeeee' );
            scene3.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene3);
            renderer3 = new THREE.WebGLRenderer();
            renderer3.setSize( containerArr[2].offsetWidth, containerArr[2].offsetHeight );
            // renderer.setSize( window.innerWidth, window.innerHeight );
            renderer3.setPixelRatio( window.devicePixelRatio );
            renderers.push(renderer3)
            camera3 = new THREE.PerspectiveCamera( 45, containerArr[2].offsetWidth / containerArr[2].offsetHeight, 1, 10000 );
            controls3 = new THREE.OrbitControls( camera3, renderer3.domElement )
            camera3.position.z = 500;
            cameras.push(camera3)
            controlsArr.push(controls3);
            break;
    }
}

export async function initScene(_profiles, chemical, minVal, maxVal){

    //console.log(scenes.length)

    if (_profiles.length > scenes.length){
        createScenes()
    }
    // console.log(scenes.length)

    else if(_profiles.length < scenes.length){
        containerArr[_profiles.length].removeChild(containerArr[_profiles.length].firstChild)
        scenes.pop();
        cameras.pop();
        controlsArr.pop();
        renderers.pop();
    }

    for (let i = 0; i < _profiles.length; i++){
        initVolume2(_profiles[i], chemical, minVal, maxVal, scenes[i], containerArr[i], renderers[i]);
    }

    // switch (_profiles.length){
    //     case 1:
    //         initVolume2(_profiles[0], chemical, minVal, maxVal, scenes[0], containerArr[0], renderers[0]);
    //         break;
    //
    //     case 2:
    //         for (let i = 0; i < _profiles.length; i++){
    //             //console.log("hello")
    //             initVolume2(_profiles[i], chemical, minVal, maxVal, scenes[i], containerArr[i], renderers[i]);
    //         }
    // }
}

export async function initVolume2(_profile, chemical, minVal, maxVal, _scene, _container, _renderer) {

    //console.log(camera1.aspect)

    //console.log(containerArr[0].offsetWidth, containerArr[0].offsetHeight);

    _scene.remove.apply(_scene, _scene.children);
    //camera = new THREE.PerspectiveCamera( 45, _container.offsetWidth / _container.offsetHeight, 1, 10000 );
    //controls = new THREE.OrbitControls( camera, _renderer.domElement )

    //camera.position.z = 500;

    let profile = _profile;

    let filePath = "./data/"+profile+"/50_"+chemical+"_Concentration_t.json"

    let val_t = await fetchData(filePath);

    const particles = 125000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    const color = new THREE.Color();
    const low_color = new THREE.Color(0xffffe6);
    const high_color = new THREE.Color(0xcc0000);

    for ( let i = 0; i < particles; i ++ ) {

        if (val_t[i] >= minVal && val_t[i] <= maxVal){

            if ((Math.pow(pos_x[i] - 25, 2) + Math.pow(pos_z[i] - 25, 2)) < (Math.pow(25, 2))) {
                const x = (pos_x[i] - 25) * 5;
                const y = (pos_y[i] - 25) * 5;
                const z = (pos_z[i] - 25) * 5;

                positions.push(x, y, z);

                let color = new THREE.Color(getColor(val_t[i]));
                colors.push(color.r, color.g, color.b);
            }
        }
    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial( { size: 30, vertexColors: true } );

    points = new THREE.Points( geometry, material );
    _scene.add( points );

    //console.log(_container);
    //console.log(_container.children);

    _container.appendChild( _renderer.domElement );


    //stats = new Stats();
    //container.appendChild( stats.dom );

    //window.addEventListener( 'resize', onWindowResize );

    animate();
}


// export async function initVolume(_profiles, chemical, minVal, maxVal) {
//
//
//     if(!rendererSet){
//         renderer = new THREE.WebGLRenderer();
//         renderer.setSize( container.offsetWidth, container.offsetHeight );
//         // renderer.setSize( window.innerWidth, window.innerHeight );
//         renderer.setPixelRatio( window.devicePixelRatio );
//         rendererSet = true;
//     }
//     if(!sceneSet){
//         scene = new THREE.Scene();
//         //scene.background = new THREE.Color( 0x050505 );
//         scene.background = new THREE.Color( '#eeeeee' );
//         scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
//         sceneSet = true;
//     }
//     scene.remove.apply(scene, scene.children);
//
//     // renderer = new THREE.WebGLRenderer();
//     // renderer.setSize( container.offsetWidth, container.offsetHeight );
//     // // renderer.setSize( window.innerWidth, window.innerHeight );
//     // renderer.setPixelRatio( window.devicePixelRatio );
//     // document.body.appendChild( renderer.domElement );
//     //scene = new THREE.Scene();
//     //scene.background = new THREE.Color( 0x050505 );
//     //scene.background = new THREE.Color( '#eeeeee' );
//     //scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
//     // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
//     camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 1, 10000 );
//     controls = new THREE.OrbitControls( camera, renderer.domElement )
//     // controls.minPolarAngle = Math.PI/2;
//     // controls.maxPolarAngle = Math.PI/2;
//
//     //camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
//     //camera.position.z = 2750;
//     camera.position.z = 500;
//
//     let profile = _profiles[0];
//
//     let filePath = "./data/"+profile+"/50_"+chemical+"_Concentration_t.json"
//
//     let val_t = await fetchData(filePath);
//
//
//
//
//     // scene = new THREE.Scene();
//     // scene.background = new THREE.Color( 0x050505 );
//     // scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
//
//     const particles = 125000;
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
//     // const n = 200, n2 = n / 2; // particles spread in the cube
//
//
//
//     for ( let i = 0; i < particles; i ++ ) {
//
//         if (val_t[i] >= minVal && val_t[i] <= maxVal){
//
//         if ((Math.pow(pos_x[i] - 25, 2) + Math.pow(pos_z[i] - 25, 2)) < (Math.pow(25, 2))) {
//             const x = (pos_x[i] - 25) * 5;
//             const y = (pos_y[i] - 25) * 5;
//             const z = (pos_z[i] - 25) * 5;
//
//             // if (val_t[i] >= minVal && val_t[i] <= maxVal){
//                 positions.push(x, y, z);
//
//                 let color = new THREE.Color(getColor(val_t[i]));
//                 //color.lerpColors(low_color,high_color, val_t[i]);
//
//                 colors.push(color.r, color.g, color.b);
//             }
//
//             // positions.push(x, y, z);
//             //
//             // let color = new THREE.Color(getColor(val_t[i]));
//             // //color.lerpColors(low_color,high_color, val_t[i]);
//             //
//             // colors.push(color.r, color.g, color.b);
//         }
//
//         // positions
//         //
//         // const x = (pos_x[i]-25)*20;
//         // const y = (pos_y[i]-25)*20;
//         // const z = (pos_z[i]-25)*20;
//         //
//         // positions.push( x, y, z );
//
//         // colors
//
//         // const vx = ( x / n ) + 0.5;
//         // const vy = ( y / n ) + 0.5;
//         // const vz = ( z / n ) + 0.5;
//
//         // color.lerpColors(low_color,high_color, val_t[i]);
//         //
//         //
//         // colors.push( color.r, color.g, color.b );
//
//     }
//
//     geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
//     geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
//
//     geometry.computeBoundingSphere();
//
//
//     const material = new THREE.PointsMaterial( { size: 30, vertexColors: true } );
//
//     points = new THREE.Points( geometry, material );
//     scene.add( points );
//
//
//     //renderer = new THREE.WebGLRenderer();
//     //renderer.setPixelRatio( window.devicePixelRatio );
//     //renderer.setSize( window.innerWidth, window.innerHeight );
//
//
//
//
//     container.appendChild( renderer.domElement );
//
//
//     //stats = new Stats();
//     //container.appendChild( stats.dom );
//
//
//     //window.addEventListener( 'resize', onWindowResize );
//
//     animate();
//
//
// }

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth, container.offsetHeight );

}


function animate() {

    // setTimeout( function() {
    //
    //     requestAnimationFrame( animate );
    //
    //     render();
    //
    // }, 1000 / 10 );

    requestAnimationFrame( animate );

    render();
    //stats.update();

}

function render() {

    const time = Date.now() * 0.0001;

    //renderer1.render( scene1, camera1 );

    for (let i = 0; i < renderers.length; i++){
        renderers[i].render(scenes[i], cameras[i])
    }
    //renderers[0].render(scenes[0], cameras[0])

    // switch (renderers.length){
    //     case 1:
    //         renderer1.render( scene1, camera1 );
    //         break;
    //     case 2:
    //         renderer1.render( scene1, camera1 );
    //         renderer2.render( scene2, camera2 );
    //         break
    //     case 3:
    //         renderer1.render( scene1, camera1 );
    //         renderer2.render( scene2, camera2 );
    //         renderer3.render( scene3, camera3 );
    //         break
    // }

}


