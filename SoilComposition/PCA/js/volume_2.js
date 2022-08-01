import * as p_x from '../data/50/50_pos_x.js';
import * as p_y from '../data/50/50_pos_y.js';
import * as p_z from '../data/50/50_pos_z.js';

const pos_x = p_x.default;
const pos_y = p_y.default;
const pos_z = p_z.default;

let points;

let container = document.getElementById( 'container' );
let container2 = document.getElementById( 'container2' );
let container3 = document.getElementById( 'container3' );

let containerArr = [container, container2, container3];

let containerInfo =  document.getElementById( 'containerInfo' );
let container2nfo =  document.getElementById( 'container2Info' );
let container3Info =  document.getElementById( 'container3Info' );

let containerInfoArr = [containerInfo, container2nfo, container3Info]

let scenes = [];
let scene1,scene2,scene3;
let renderers = [];
let renderer1, renderer2, renderer3;
let cameras = [];
let camera1, camera2, camera3;
let controlsArr = [];
let controls1, controls2, controls3;


let volumeData
let dataLoaded = false
let res


export async function init_data(resolution, profile){

    if (!dataLoaded){

        let path = `./data/new/${resolution}x${resolution}x${resolution}/${profile}_element_interpolation.json`
        volumeData = await fetchData(path)
        dataLoaded = true

        res = resolution
    }
}

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
            camera1.position.z = 550;
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
            camera2.position.z = 550;
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
            break;
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
            camera3.position.z = 550;
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
            break;
    }
}

export function initScene(_profiles, chemical, minVal, maxVal, resolution){

    if (_profiles.length > scenes.length){
        createScenes()
    }
    if(_profiles.length < scenes.length){
        containerArr[_profiles.length].removeChild(containerArr[_profiles.length].children[1]);
        containerArr[_profiles.length].children[0].innerHTML = '';
        scenes.pop();
        cameras.pop();
        controlsArr.pop();
        renderers.pop();
    }

    if(!dataLoaded || res !== resolution){
        init_data(resolution, 'R').then(()=>{
            for (let i = 0; i < _profiles.length; i++){
                initVolume2(_profiles[i], chemical, minVal, maxVal, scenes[i], containerArr[i], renderers[i], containerInfoArr[i], resolution);
            }
        })

    }
    else{
        for (let i = 0; i < _profiles.length; i++){
            initVolume2(_profiles[i], chemical, minVal, maxVal, scenes[i], containerArr[i], renderers[i], containerInfoArr[i], resolution);
        }
    }
}

export async function initVolume2(_profile, chemical, minVal, maxVal, _scene, _container, _renderer, _containerInfo, resolution) {


    // _scene.remove.apply(_scene, _scene.children);

    _scene.clear();

    let profile = _profile;

    //let filePath = "./data/"+profile+"/50_"+chemical+"_Concentration_t.json"

    let valsArr = []

    for (const i of chemical){
        //let path = "./data/"+profile+"/50_"+i+"_Concentration_t.json"
        //let arr = await fetchData(path)
        valsArr.push(volumeData[`${i} Concentration`])
    }

    _containerInfo.innerHTML = `${profile}: ${chemical} `

    const particles = Math.pow(resolution, 3)


    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];

    console.log('x',pos_x)
    console.log('y',pos_y)
    console.log('z',pos_z)
    console.log(volumeData)

    for ( let i = 0; i < particles; i ++ ) {
        if ((Math.pow(volumeData['x'][i] - (resolution/2), 2) + Math.pow(volumeData['z'][i] - (resolution/2), 2)) < (Math.pow((resolution/2), 2))) {

            let p2 = new Array(chemical.length).fill(false)
            let v2 = []

            for (let j in chemical){
                if (valsArr[j][i] >= minVal[j] && valsArr[j][i] <= maxVal[j]){
                    // if ((Math.pow(pos_x[i] - 25, 2) + Math.pow(pos_z[i] - 25, 2)) < (Math.pow(25, 2))) {
                    //     const x = (pos_x[i] - 25) * 5;
                    //     const y = (pos_y[i] - 25) * 5;
                    //     const z = (pos_z[i] - 25) * 5;
                    //
                    //     positions.push(x, y, z);
                    //
                    //     let color = new THREE.Color(getColor(valsArr[j][i]));
                    //     colors.push(color.r, color.g, color.b);
                    v2.push(valsArr[0][i])
                    p2[j] = true
                    //}
                }
            }

            if (!p2.includes(false)){
                const x = (volumeData['x'][i] - (resolution/2)) * 5;
                const y = (volumeData['y'][i] - (resolution/2)) * 5;
                const z = (volumeData['z'][i] - (resolution/2)) * 5;

                positions.push(x, y, z);

                let color = new THREE.Color(getColor((v2.reduce((a, b) => a + b)) / v2.length ));
                colors.push(color.r, color.g, color.b);
            }

        }
    }


    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial( { size: 25, vertexColors: true } );

    points = new THREE.Points( geometry, material );

    let height = 255
    let radius = 130
    let offset = -3

    const geometry_c = new THREE.CylinderGeometry( radius, radius, height, 32 );
    //const material_c = new THREE.MeshBasicMaterial( {color: 0x000000} );
    //const cylinder = new THREE.Mesh( geometry2, material2 );

    const wireframe = new THREE.WireframeGeometry( geometry_c );

    const wire = new THREE.LineSegments( wireframe );
    wire.material.depthTest = false;
    wire.material.opacity = 0.025;
    wire.material.transparent = true;
    wire.material.color = new THREE.Color(0x000000)

    wire.position.y = offset

    _scene.add( wire );

    _scene.add( points );
    // _scene.add( cylinder );

//GRADUATIONS
    const material_l = new THREE.LineBasicMaterial( { color: 0x000000 } );
    const points_l = [];
    points_l.push( new THREE.Vector3( radius, -(height/2) + offset, 0 ) );
    points_l.push( new THREE.Vector3( radius, (height/2) + offset, 0 ) );
    const geometry_l = new THREE.BufferGeometry().setFromPoints( points_l );
    const line = new THREE.Line( geometry_l, material_l );
    _scene.add( line );

    for (let i = 0; i < 11; i++){
        const points_g = [];
        points_g.push( new THREE.Vector3( radius, ((height) * (i / 10)) - (height/2) + offset, 0 ) );
        points_g.push( new THREE.Vector3( radius+10, ((height) * (i / 10)) - (height/2)+ offset, 0 ) );
        const geometry_g = new THREE.BufferGeometry().setFromPoints( points_g );
        const line_g = new THREE.Line( geometry_g, material_l );

        _scene.add( line_g );
    }

    const loader = new THREE.FontLoader();
    const font = loader.load(
        // resource URL
        '../lib/threejs/font.json',

        // onLoad callback
        function ( font ) {
            // do something with the font
            make_text(font);
        },

        // onProgress callback
        function ( xhr ) {
            //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.log( 'An error happened' );
        }
    );

    function make_text(font){
        let text_y_offset = -6
        for (let i = 0; i < 11; i++){
            const geometry_t = new THREE.TextGeometry( `${(10 - i) * 10} cm`, {
                font: font,
                size: 7,
                height: 1,
            } );

            var textMaterial = new THREE.MeshPhongMaterial(
                { color: 0xff0000, specular: 0xffffff }
            );

            var mesh = new THREE.Mesh( geometry_t, textMaterial );
            mesh.position.x = radius+11
            mesh.position.y = ((height) * (i / 10)) - (height/2) + text_y_offset
            _scene.add( mesh );
        }
    }

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


