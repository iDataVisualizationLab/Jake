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

let selected_element_color

let volume_settings = {
    concentration_data: {},
    color_data: {},
    profile_data_loaded: {'R': false, 'S': false, 'L': false},
    data_loaded: null,
    resolution: null,
}

let volume_color_options = {
    titles: ['Element Concentration', 'Soil Color'],
    ids:  ['concentration', 'soil_color'],
    selected: 'concentration',
    default_selected: 'concentration'
}

let volume_config = {
    profiles: null,
    dimensions: null,
    filter_min: null,
    filter_max: null,
    resolution: null
}

export function init_volume_config(_profiles, chemical, minVal, maxVal, resolution){
    volume_config.profiles = _profiles
    volume_config.dimensions = chemical
    volume_config.filter_min = minVal
    volume_config.filter_max = maxVal
    volume_config.resolution = resolution
    if(volume_color_options.selected === "concentration"){
        create_element_color_menu(volume_config.dimensions)
    }
    else if(document.querySelector('.element_color')){
        document.querySelectorAll('.element_color').forEach(d=> d.remove())
    }
    init_scene(volume_config)
}

export function update_volume_config(_profiles, chemical, minVal, maxVal, resolution){
    volume_config.profiles = _profiles
    volume_config.dimensions = chemical
    volume_config.filter_min = minVal
    volume_config.filter_max = maxVal
    volume_config.resolution = resolution
    if(volume_color_options.selected === "concentration"){
        create_element_color_menu(volume_config.dimensions)
    }
    else if(document.querySelector('.element_color')){
        document.querySelectorAll('.element_color').forEach(d=> d.remove())
    }
    init_scene(volume_config)
}

export function buildColorMenu() {
    let sel = document.querySelector('.VolumeColor')

    for (let i in volume_color_options['titles']) {
        let newInputAll = document.createElement("input");
        newInputAll.setAttribute("type", "checkbox");
        newInputAll.setAttribute("id", volume_color_options['ids'][i]);
        newInputAll.setAttribute("class", 'volume_color_option');
        newInputAll.checked = volume_color_options['ids'][i] === volume_color_options['default_selected']
        newInputAll.onclick = function () {
            handleVolumeColor(volume_color_options['ids'][i])
        }
        let newLabelAll = document.createElement("label")
        newLabelAll.setAttribute("for", volume_color_options['ids'][i]);
        newLabelAll.innerHTML = volume_color_options['titles'][i]

        sel.appendChild(newInputAll)
        sel.appendChild(newLabelAll)
    }
}

export function handleVolumeColor(sel){
    document.querySelectorAll('.volume_color_option').forEach(d=>{
        d.id != sel ? d.checked = false : volume_color_options['selected'] = sel
    })

    let selection = false
    document.querySelectorAll('.volume_color_option').forEach(d=>{
        d.checked ? selection = true : null
    })
    if (!selection){
        document.querySelector(`#${sel}`).checked = true;
        volume_color_options['selected'] = sel
    }

    if(volume_color_options.selected === "concentration"){
        create_element_color_menu(volume_config.dimensions)
    }
    else if(document.querySelector('.element_color')){
        document.querySelectorAll('.element_color').forEach(d=> d.remove())
    }

    init_scene(volume_config)
}

export async function init_data(resolution, profiles){

    Object.keys(volume_settings.profile_data_loaded).filter(d=> profiles.includes(d)).forEach(e=>{
        if (!volume_settings.profile_data_loaded[e]){
            volume_settings.data_loaded = false
        }
    })

    if (!volume_settings.data_loaded){
        for (const d of profiles) {
            volume_settings.concentration_data[d] = await fetchData(`./data/new/${resolution}x${resolution}x${resolution}/${d}_element_interpolation.json`)
            volume_settings.color_data[d] = await fetchData(`./data/new/${resolution}x${resolution}x${resolution}/${d}_color_interpolation.json`)
            volume_settings.profile_data_loaded[d] = true
        }
        volume_settings.data_loaded = true
    }
    volume_settings.resolution = resolution
}

function create_element_color_menu(elements){

    selected_element_color = elements[0]

    if(document.querySelector('.element_color')){
        document.querySelectorAll('.element_color').forEach(d=> d.remove())
    }

    let sel = document.querySelector('#container')

    let newMenu = document.createElement("select")
    newMenu.setAttribute('id', 'element_color')
    newMenu.setAttribute('class', 'element_color')
    newMenu.onchange = function (){
        selected_element_color = newMenu.options[newMenu.selectedIndex].value
        init_scene(volume_config)
    }
    newMenu.style.position = 'absolute'
    newMenu.style.transform = 'translate( 60px, 0px)'
    newMenu.style.zIndex = 999

    let newLabel = document.createElement("label")
    newLabel.setAttribute('for', 'element_color')
    newLabel.setAttribute('class', 'element_color')
    newLabel.style.position = 'absolute'
    newLabel.style.transform = 'translate( 0px, 0px)'
    newLabel.style.zIndex = 999
    newLabel.innerHTML = 'Color For:'

    for (const d of elements){
        let newOption = document.createElement("option")
        newOption.setAttribute('value' ,d)
        newOption.innerHTML = d
        newMenu.appendChild(newOption)
    }
    sel.appendChild(newLabel)
    sel.appendChild(newMenu)
}

function create_scenes(){
    switch (scenes.length){
        case 0:
            scene1 = new THREE.Scene();
            scene1.background = new THREE.Color( '#eeeeee' );
            scene1.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene1);
            renderer1 = new THREE.WebGLRenderer();
            renderer1.setSize( containerArr[0].offsetWidth, containerArr[0].offsetHeight );
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
            scene2.background = new THREE.Color( '#eeeeee' );
            scene2.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene2);
            renderer2 = new THREE.WebGLRenderer();
            renderer2.setSize( containerArr[1].offsetWidth, containerArr[1].offsetHeight );
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
            scene3.background = new THREE.Color( '#eeeeee' );
            scene3.fog = new THREE.Fog( 0x050505, 2000, 3500 );
            scenes.push(scene3);
            renderer3 = new THREE.WebGLRenderer();
            renderer3.setSize( containerArr[2].offsetWidth, containerArr[2].offsetHeight );
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

export function init_scene(volume_config){
    Object.keys(volume_settings.profile_data_loaded).filter(d=> volume_config.profiles.includes(d)).forEach(e=>{
        if (!volume_settings.profile_data_loaded[e]){
            volume_settings.data_loaded = false
        }
    })

    if (volume_config.profiles.length > scenes.length){
        create_scenes()
    }
    if(volume_config.profiles.length < scenes.length){
        containerArr[volume_config.profiles.length].removeChild(containerArr[volume_config.profiles.length].children[1]);
        containerArr[volume_config.profiles.length].children[0].innerHTML = '';
        scenes.pop();
        cameras.pop();
        controlsArr.pop();
        renderers.pop();
    }


    if(!volume_settings.data_loaded || volume_settings.resolution !== volume_config.resolution){
        init_data(volume_config.resolution, volume_config.profiles).then(()=>{
            for (let i = 0; i < volume_config.profiles.length; i++){
                initVolume2(volume_config.profiles[i], volume_config, scenes[i], containerArr[i], renderers[i], containerInfoArr[i])//.then(()=>create_element_color_menu(config.dimensions));
            }
        })

    }
    else{
        for (let i = 0; i < volume_config.profiles.length; i++){
            initVolume2(volume_config.profiles[i], volume_config, scenes[i], containerArr[i], renderers[i], containerInfoArr[i])//.then(()=> create_element_color_menu(config.dimensions));
        }
    }
}


export async function initVolume2(profile, volume_config, _scene, _container, _renderer, _containerInfo) {


    let chemical = [...volume_config.dimensions]
    let minVal = [...volume_config.filter_min[profile]]
    let maxVal = [...volume_config.filter_max[profile]]

    //console.log(chemical.indexOf(selected_element_color))

    _scene.clear();

    //let profile = _profile;

    let valsArr = []
    let depthActive = false
    let minDepth
    let maxDepth
    let depthRange

    if (chemical.includes('Depth')){
        depthActive = true
        minDepth = minVal[0]
        maxDepth = maxVal[0]
        chemical.splice(0, 1)
        minVal.splice(0,1)
        maxVal.splice(0,1)
        depthRange = (d3.extent(volume_settings.concentration_data[profile]['y'])[1] +1) - d3.extent(volume_settings.concentration_data[profile]['y'])[0]
        minDepth = depthRange - (minDepth * depthRange)
        maxDepth = depthRange - (maxDepth * depthRange)
    }

    for (const i of chemical){
        if (Object.keys(volume_settings.concentration_data[profile]).includes(`${i} Concentration`)){
            valsArr.push(volume_settings.concentration_data[profile][`${i} Concentration`])
        }
        else{
            let blank = new Array(Math.pow(volume_config.resolution, 3)).fill(-1)
            valsArr.push(blank)
        }
    }
    _containerInfo.innerHTML = `${profile}: ${chemical} `

    const particles = Math.pow(volume_config.resolution, 3)
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    if (volume_color_options['selected'] === 'concentration'){
        for ( let i = 0; i < particles; i ++ ) {
            if ((Math.pow(volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2), 2) + Math.pow(volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2), 2)) < (Math.pow((volume_config.resolution/2), 2))) {
                let p2 = new Array(chemical.length).fill(false)
                let v2 = []
                for (let j in chemical){
                    if (valsArr[j][i] >= minVal[j] && valsArr[j][i] <= maxVal[j]){
                        v2.push(valsArr[j][i])
                        p2[j] = true
                    }

                }
                if (!p2.includes(false)){
                    if (depthActive && volume_settings.concentration_data[profile]['y'][i] >= maxDepth && volume_settings.concentration_data[profile]['y'][i] <= minDepth){
                        const x = (volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2)) * 5;
                        const y = (volume_settings.concentration_data[profile]['y'][i] - (volume_config.resolution/2)) * 5;
                        const z = (volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2)) * 5;
                        positions.push(x, y, z);
                        // let color = new THREE.Color(getColor((v2.reduce((a, b) => a + b)) / v2.length ));
                            let color = new THREE.Color(getColor(v2[chemical.indexOf(selected_element_color)+1]));

                        colors.push(color.r, color.g, color.b);
                    }
                    else if(!depthActive){
                        const x = (volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2)) * 5;
                        const y = (volume_settings.concentration_data[profile]['y'][i] - (volume_config.resolution/2)) * 5;
                        const z = (volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2)) * 5;
                        positions.push(x, y, z);
                        // let color = new THREE.Color(getColor((v2.reduce((a, b) => a + b)) / v2.length ));
                        let color = new THREE.Color(getColor(v2[chemical.indexOf(selected_element_color)]));
                        colors.push(color.r, color.g, color.b);
                    }
                }
            }
        }
    }
    else if (volume_color_options['selected'] === 'soil_color'){
        for ( let i = 0; i < particles; i ++ ) {
            if ((Math.pow(volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2), 2) + Math.pow(volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2), 2)) < (Math.pow((volume_config.resolution/2), 2))) {
                let p2 = new Array(chemical.length).fill(false)
                let v2 = []
                for (let j in chemical){
                    if (valsArr[j][i] >= minVal[j] && valsArr[j][i] <= maxVal[j]){
                        v2.push(valsArr[0][i])
                        p2[j] = true
                    }

                }
                if (!p2.includes(false)){
                    if (depthActive && volume_settings.concentration_data[profile]['y'][i] >= maxDepth && volume_settings.concentration_data[profile]['y'][i] <= minDepth){
                        const x = (volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2)) * 5;
                        const y = (volume_settings.concentration_data[profile]['y'][i] - (volume_config.resolution/2)) * 5;
                        const z = (volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2)) * 5;
                        positions.push(x, y, z);
                        let color = new THREE.Color(`rgb(${Math.round(volume_settings.color_data[profile]['R'][i]*255)}, ${Math.round(volume_settings.color_data[profile]['G'][i]*255)}, ${Math.round(volume_settings.color_data[profile]['B'][i]*255)})`)
                        colors.push(color.r, color.g, color.b);
                    }
                    else if(!depthActive){
                        const x = (volume_settings.concentration_data[profile]['x'][i] - (volume_config.resolution/2)) * 5;
                        const y = (volume_settings.concentration_data[profile]['y'][i] - (volume_config.resolution/2)) * 5;
                        const z = (volume_settings.concentration_data[profile]['z'][i] - (volume_config.resolution/2)) * 5;
                        positions.push(x, y, z);
                        let color = new THREE.Color(`rgb(${Math.round(volume_settings.color_data[profile]['R'][i]*255)}, ${Math.round(volume_settings.color_data[profile]['G'][i]*255)}, ${Math.round(volume_settings.color_data[profile]['B'][i]*255)})`)
                        colors.push(color.r, color.g, color.b);

                    }
                }
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
    const wireframe = new THREE.WireframeGeometry( geometry_c );

    const wire = new THREE.LineSegments( wireframe );
    wire.material.depthTest = false;
    wire.material.opacity = 0.025;
    wire.material.transparent = true;
    wire.material.color = new THREE.Color(0x000000)

    wire.position.y = offset
    _scene.add( wire );
    _scene.add( points );

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
        './lib/threejs/font.json',

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

// function onWindowResize() {
//     camera.aspect = container.offsetWidth / container.offsetHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize( container.offsetWidth, container.offsetHeight );
// }


function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    const time = Date.now() * 0.0001;
    for (let i = 0; i < renderers.length; i++){
        renderers[i].render(scenes[i], cameras[i])
    }
}


