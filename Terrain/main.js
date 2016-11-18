/**
 * Created by Eivind on 02.11.2016.
 */
if (!Detector.webgl) {

    Detector.addGetWebGLMessage();
    document.getElementById('container').innerHTML = "";

}

var container, stats;

var camera, controls, scene, renderer;

var helmetObj;

var terrainMesh;

var composer;

var heightMapWidth = 512, heightMapDepth = 512;

var worldMapWidth = 100 * heightMapWidth;
var worldMapDepth = 100 * heightMapDepth;
var worldMapMaxHeight = 2500;

var clock = new THREE.Clock();

var cubeMap;

window.onload = function () {
    "use strict";
    init();
    animate();
};

function init() {
    "use strict";

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e7);
    camera.name = 'camera';




    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcbcdcf, 0, 2000000);

    controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 1500;
    controls.lookSpeed = 0.2;

    setupSkySphere();





    //
    // Planets
    //

    // Create the sun
    var sun = setUpPlanet(70000, 700000, 180000, -400000, 'textures/sun.jpg', 'textures/sunBump.jpg', "Sun");
    var sunNode = new THREE.Object3D();
    sunNode.name = "SunNode";
    scene.add(sunNode);

    sunNode.add(sun);


    // Create the earth and add to scene
    var earth = setUpPlanet(80000, 200000, 10000, 65000, 'textures/earth.jpg', 'textures/earthBump.jpg', "Earth");
    scene.add(earth);

    // WATER
    var water = setUpWater('textures/water.png');
    scene.add(water);

    //Helmet
    helmetObj = setUpHelmet();
    scene.add(helmetObj);


    //
    // Lights
    //

    // create a point light and set it as a child of the sun
    // This light is only for making the sun glow.
    var pointLight = new THREE.PointLight(0xFFFFFF, 2);
    sun.add(pointLight);

    // Dragging light out from sun in order to make sun glow.
    pointLight.position.x = pointLight.position.x - 300000;
    pointLight.position.y = pointLight.position.y - 65000;
    pointLight.position.z = pointLight.position.z + 200000;


    // This is the light from the sun.
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2);
    var sunLightNode = new THREE.Object3D();
    sunLightNode.name = "SunLightNode";

    // Setup for position and shadows.
    directionalLight.position.set(10000, 3500, -6000);
    directionalLight.castShadow = true;
    directionalLight.shadowDarkness = 0.5;
    directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;
    directionalLight.shadowBias = 0.0001;
    directionalLight.shadowCameraRight = 10000;
    directionalLight.shadowCameraLeft = -10000;
    directionalLight.shadowCameraTop = 10000;
    directionalLight.shadowCameraBottom = -10000;
    directionalLight.shadowCameraFar = 25000;

    scene.add(sunLightNode);
    sunLightNode.add(directionalLight);


    // Needed for materials using phong shading
    var ambientLight = new THREE.AmbientLight(new THREE.Color(0.4, 0.4, 0.4));
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);



    //
    // Height map generation/extraction
    //

    terrainMesh = setupTerrain();

    //
    // Some other updates
    //

    //camera.position.y = terrainMesh.getHeightAtPoint(camera.position) + 500;
    camera.position.set(-worldMapWidth/10, 0.5*worldMapMaxHeight, 0);
    //camera.lookAt(new THREE.Vector3(0,0,0));



    //
    // Model loading
    // Examples: all loader/* examples on threejs.org/examples
    //

    // There are several other model loaders for other types, just look in Three.js' example folder.

    var objectMaterialLoader = new THREE.OBJMTLLoader();


    // Base
    setupWholeBase(terrainMesh, objectMaterialLoader);

    //
    // Generate random positions for some number of boxes
    // Used in instancing. Better examples:
    //  * http://threejs.org/examples/#webgl_buffergeometry_instancing_dynamic
    //  * http://threejs.org/examples/#webgl_buffergeometry_instancing_billboards
    //

    //
    // Set up renderer and postprocessing
    //

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    // Transparency-problem is solved in this line
    renderer.sortObjects = false;

    composer = new THREE.EffectComposer(renderer);

    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Fill/replace with more postprocess passes
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(effectCopy);


    //
    // Make the renderer visible py associating it with the document.
    //

    container.innerHTML = "";

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
    "use strict";
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
}



// Animate
function animate() {
    "use strict";
    requestAnimationFrame(animate);

    // Perform state updates here
    var axis = new THREE.Vector3(0.0, 1.0, 0);
    var rotSpeed = 0.001;
    scene.getChildByName("Earth").rotateOnAxis(axis , rotSpeed);
    scene.getChildByName("Sky").rotateOnAxis(axis , rotSpeed);
    scene.getChildByName("SunNode").rotateOnAxis(axis , rotSpeed);
    scene.getChildByName("SunLightNode").rotateOnAxis(axis , rotSpeed);

    // Place helmet on camera
    helmetObj.position.set(camera.position.x, camera.position.y, camera.position.z);

    // Call render
    render();
    stats.update();
}

// Takes input for toggeling the helmet on and off
function handleKeyDown(event) {
    if (event.keyCode === 72) { //72 is "h"
        toggleHelmet(helmetObj);
    }
}
window.addEventListener('keydown', handleKeyDown, false);


// Render
function render() {
    "use strict";
    controls.update(clock.getDelta());

    renderer.clear();
    //renderer.render(scene, camera);
    composer.render();
}


function onProgress(xhr) {
    "use strict";
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
}

function onError(xhr) {
    "use strict";
}
