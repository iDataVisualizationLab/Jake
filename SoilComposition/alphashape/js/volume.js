// import * as p_x from '../data/50/50_pos_x.js';
// import * as p_y from '../data/50/50_pos_y.js';
// import * as p_z from '../data/50/50_pos_z.js';
//
// const pos_x = p_x.default;
// const pos_y = p_y.default;
// const pos_z = p_z.default;
let pos_x
let pos_y
let pos_z
let loaded = false
async function init_data(){
    pos_x = await fetchData('data/50/50_pos_x.json')
    pos_y = await fetchData('data/50/50_pos_y.json')
    pos_z = await fetchData('data/50/50_pos_z.json')
}
// init_data()
init_data().then( d=> loaded=true)

let points;

let container = document.getElementById( 'container' );
let container2 = document.getElementById( 'container2' );
let container3 = document.getElementById( 'container3' );
let container4 = document.getElementById( 'container4' );

let containerArr = [container, container2, container3, container4];

let containerInfo =  document.getElementById( 'containerInfo' );
let container2nfo =  document.getElementById( 'container2Info' );
let container3Info =  document.getElementById( 'container3Info' );
let container4Info =  document.getElementById( 'container4Info' );


let containerInfoArr = [containerInfo, container2nfo, container3Info, container4Info]

let containerInfo_2 =  document.getElementById( 'containerInfo_2' );
let container2nfo_2 =  document.getElementById( 'container2Info_2' );
let container3Info_2 =  document.getElementById( 'container3Info_2' );
let container4Info_2 =  document.getElementById( 'container4Info_2' );

let containerInfoArr_2 = [containerInfo_2, container2nfo_2, container3Info_2, container4Info_2]


let scenes = [];
let scene1, scene2, scene3, scene4;
let renderers = [];
let renderer1, renderer2, renderer3, renderer4;
let cameras = [];
let camera1, camera2, camera3, camera4;
let controlsArr = [];
let controls1, controls2, controls3, controls4;
let scenesDefined = false

function defineScenes(){

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
        controls1.addEventListener( 'change', () => {

            camera2.position.copy( camera1.position );
            camera2.rotation.copy( camera1.rotation );
            render();

        } );
        controls2.addEventListener( 'change', () => {

            camera1.position.copy( camera2.position );
            camera1.rotation.copy( camera2.rotation );
            render();

        } );

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

    controls1.addEventListener( 'change', () => {
        camera3.position.copy( camera1.position );
        camera3.rotation.copy( camera1.rotation );
        render();

    } );
    controls2.addEventListener( 'change', () => {

        camera3.position.copy( camera2.position );
        camera3.rotation.copy( camera2.rotation );
        render();

    } );
    controls3.addEventListener( 'change', () => {

        camera1.position.copy( camera3.position );
        camera1.rotation.copy( camera3.rotation );
        render();

    } );
    controls3.addEventListener( 'change', () => {

        camera2.position.copy( camera3.position );
        camera2.rotation.copy( camera3.rotation );
        render();

    } );

    scene4 = new THREE.Scene();
    //scene.background = new THREE.Color( 0x050505 );
    scene4.background = new THREE.Color( '#eeeeee' );
    scene4.fog = new THREE.Fog( 0x050505, 2000, 3500 );
    scenes.push(scene4);
    renderer4 = new THREE.WebGLRenderer();
    renderer4.setSize( containerArr[3].offsetWidth, containerArr[2].offsetHeight );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    renderer4.setPixelRatio( window.devicePixelRatio );
    renderers.push(renderer4)
    camera4 = new THREE.PerspectiveCamera( 45, containerArr[3].offsetWidth / containerArr[3].offsetHeight, 1, 10000 );
    controls4 = new THREE.OrbitControls( camera4, renderer4.domElement )
    camera4.position.z = 500;
    cameras.push(camera4)
    controlsArr.push(controls4);
    controls1.addEventListener( 'change', () => {

        camera4.position.copy( camera1.position );
        camera4.rotation.copy( camera1.rotation );
        render();

    } );
    controls2.addEventListener( 'change', () => {

        camera4.position.copy( camera2.position );
        camera4.rotation.copy( camera2.rotation );
        render();

    } );
    controls3.addEventListener( 'change', () => {

        camera4.position.copy( camera3.position );
        camera4.rotation.copy( camera3.rotation );
        render();

    } );
    controls4.addEventListener( 'change', () => {

        camera1.position.copy( camera4.position );
        camera1.rotation.copy( camera4.rotation );
        render();

    } );
    controls4.addEventListener( 'change', () => {

        camera2.position.copy( camera4.position );
        camera2.rotation.copy( camera4.rotation );
        render();

    } );
    controls4.addEventListener( 'change', () => {

        camera3.position.copy( camera4.position );
        camera3.rotation.copy( camera4.rotation );
        render();

    } );
    scenesDefined = true;

}

function initScene(_profiles, chemical, minVal, maxVal) {

    if (!scenesDefined) {
        defineScenes()
    }
    if (loaded == true) {

        for (let i = 0; i < _profiles.length; i++) {
            initVolume2(_profiles[i], chemical[i % 2], minVal, maxVal, scenes[i], containerArr[i], renderers[i], containerInfoArr[i], containerInfoArr_2[i]);
        }
    } else console.log("not loaded");
}

async function initVolume2(_profile, chemical, minVal, maxVal, _scene, _container, _renderer, _containerInfo, _containerInfo_2) {

    _scene.remove.apply(_scene, _scene.children);
    console.log(chemical)


    let profile = _profile;
    let arr = await fetchData("data/"+profile+"_norm_both/"+profile+"_"+chemical+"_Concentration.json")

    _containerInfo.innerHTML = chemical;
    _containerInfo_2.innerHTML = profile;

    const particles = 125000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    for ( let i = 0; i < particles; i ++ ) {
            if (arr[i] >= minVal && arr[i] <= maxVal){

                if ((Math.pow(pos_x[i] - 25, 2) + Math.pow(pos_z[i] - 25, 2)) < (Math.pow(25, 2))) {
                    const x = (pos_x[i] - 25) * 5;
                    const y = (pos_y[i] - 25) * 5;
                    const z = (pos_z[i] - 25) * 5;

                    positions.push(x, y, z);

                    let color = new THREE.Color(getColor(arr[i]));
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

    console.log(_scene)

    _container.appendChild( _renderer.domElement );

    animate();
}

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
}

function render() {

    const time = Date.now() * 0.0001;

    for (let i = 0; i < renderers.length; i++){
        renderers[i].render(scenes[i], cameras[i])
    }

}


