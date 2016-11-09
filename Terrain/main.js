/**
 * Created by Eivind on 02.11.2016.
 */
if (!Detector.webgl) {

    Detector.addGetWebGLMessage();
    document.getElementById('container').innerHTML = "";

}

var container, stats;

var camera, controls, scene, renderer;

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

    controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.1;

    setupSkySphere();



    //
    // 

    // Create the sun
    var sun = setUpPlanet(70000, 700000, 180000, -400000, 'textures/sun.jpg');
    scene.add(sun);


    // Create the earth and add to scene
    var earth = setUpPlanet(80000, 200000, 10000, 65000, 'textures/earth.jpg');
    scene.add(earth);


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
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3);

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

    scene.add(directionalLight);


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
    camera.position.set(-worldMapWidth/5, 2*worldMapMaxHeight, 0);
    //camera.lookAt(new THREE.Vector3(0,0,0));



    //
    // Model loading
    // Examples: all loader/* examples on threejs.org/examples
    //

    // There are several other model loaders for other types, just look in Three.js' example folder.

    var objectMaterialLoader = new THREE.OBJMTLLoader();

    //setupInstancedRocks(terrainMesh, objectMaterialLoader);
    //setupTrees(terrainMesh, objectMaterialLoader);
    // Base
    setupBase(terrainMesh, objectMaterialLoader);

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

    composer = new THREE.EffectComposer(renderer);

    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    var bloomPassDefault = new THREE.BloomPass();
    //var bloomPass = new THREE.BloomPass(0.5, 16, 0.5, 512);
    //composer.addPass(bloomPassDefault);

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

    //


    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
    "use strict";
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
}



//

function animate() {
    "use strict";
    requestAnimationFrame(animate);

    // Perform state updates here

    // Call render
    render();
    stats.update();
}

function render() {
    "use strict";
    controls.update(clock.getDelta());
    renderer.clear();
    //renderer.render(scene, camera);
    composer.render();
}

function setupTerrain() {
    "use strict";
    var useRandomHeightMap = false;

    var terrainData;
    var heightMapTexture;

    if (useRandomHeightMap) {
        terrainData = generateHeight(heightMapWidth, heightMapDepth);

        heightMapTexture = THREE.ImageUtils.generateDataTexture(heightMapWidth, heightMapDepth, new THREE.Color(0,0,0));

        for (var i = 0; i < terrainData.length; ++i) {
            heightMapTexture.image.data[i*3 + 0] = terrainData[i];
            heightMapTexture.image.data[i*3 + 1] = terrainData[i];
            heightMapTexture.image.data[i*3 + 2] = terrainData[i];
        }

        heightMapTexture.needsUpdate = true;
    } else {
        var heightMapImage = document.getElementById('heightmap');
        terrainData = getPixelValues(heightMapImage, 'r');
        heightMapWidth = heightMapImage.width;
        heightMapDepth = heightMapImage.height;

        heightMapTexture = THREE.ImageUtils.loadTexture(heightMapImage.src);
    }

    console.log(heightMapWidth, heightMapDepth);

    //
    // Generate terrain geometry and mesh
    //

    var heightMapGeometry = new HeightMapBufferGeometry(terrainData, heightMapWidth, heightMapDepth);
    // We scale the geometry to avoid scaling the node, since scales propagate.
    heightMapGeometry.scale(worldMapWidth, worldMapMaxHeight, worldMapDepth);

    var surfaceTexture = THREE.ImageUtils.loadTexture('textures/moonGravel.jpg');
    surfaceTexture.wrapS = THREE.RepeatWrapping;
    surfaceTexture.wrapT = THREE.RepeatWrapping;
    surfaceTexture.repeat.set(50, 50);

    var terrainMaterialImproved = new THREE.ShaderMaterial({
        // We are reusing vertex shader from MeshBasicMaterial

        defines: {
            'USE_MAP': true
        },

        uniforms: {
            'heightMap': { type: 't', value: heightMapTexture },

            'surface': { type: 't', value: surfaceTexture },

            'grassLevel': { type: 'f', value: 0.1 },
            'rockLevel': { type: 'f', value: 0.6 },
            'snowLevel': { type: 'f', value: 0.8 },

            // Scale the texture coordinates when coloring the terrain
            'terrainTextureScale': { type: 'v2', value: new THREE.Vector2(50, 50) },

            // This is a default offset (first two numbers), and repeat (last two values)
            // Just use the default values to avoid fiddling with the uv-numbers from the vertex-shader
            'offsetRepeat': { type: 'v4', value: new THREE.Vector4(0, 0, 1, 1) }
        },

        vertexShader: THREE.ShaderLib['basic'].vertexShader,
        fragmentShader: document.getElementById('terrain-fshader').textContent,

    });

    var terrainWorking = new THREE.MeshPhongMaterial({
        map: surfaceTexture,
        color: 0x888888,
        shininess: 0.1
    });


    var terrainMesh = new HeightMapMesh(heightMapGeometry, terrainWorking);
    terrainMesh.name = "terrain";
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;

    scene.add(terrainMesh);



    return terrainMesh;
}

function setupInstancedRocks(terrain, objectMaterialLoader) {
    "use strict";
    var maxNumObjects = 2000;
    var spreadCenter = new THREE.Vector3(0.1*worldMapWidth, 0, 0.2*worldMapDepth);
    var spreadRadius = 0.2*worldMapWidth;
    //var geometryScale = 30;

    var minHeight = 0.2*worldMapMaxHeight;
    var maxHeight = 0.6*worldMapMaxHeight;
    var maxAngle = 30 * Math.PI / 180;

    var scaleMean = 50;
    var scaleSpread = 20;
    var scaleMinimum = 1;

    var generatedAndValidPositions = generateRandomData(maxNumObjects,
        //generateGaussPositionAndCorrectHeight.bind(null, terrain, spreadCenter, spreadRadius),
        // The previous is functionally the same as
        function() {
            return generateGaussPositionAndCorrectHeight(terrain, spreadCenter, spreadRadius)
        },

        // If you want to accept every position just make function that returns true
        positionValidator.bind(null, terrain, minHeight, maxHeight, maxAngle)
    );
    var translationArray = makeFloat32Array(generatedAndValidPositions);

    var generatedAndValidScales = generateRandomData(generatedAndValidPositions.length,

        // Generator function
        function() { return Math.abs(scaleMean + randomGauss()*scaleSpread); },

        // Validator function
        function(scale) { return scale > scaleMinimum; }
    );
    var scaleArray = makeFloat32Array(generatedAndValidScales);

    // Lots of other possibilities, eg: custom color per object, objects changing (requires dynamic
    // InstancedBufferAttribute, see its setDynamic), but require more shader magic.
    var translationAttribute = new THREE.InstancedBufferAttribute(translationArray, 3, 1);
    var scaleAttribute = new THREE.InstancedBufferAttribute(scaleArray, 1, 1);

    var instancedMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge(
            //THREE.UniformsLib['lights'],
            {
                color: {type: "c", value: new THREE.Color(Math.random(), Math.random(), Math.random())}
            }
        ),
        vertexShader: document.getElementById("instanced-vshader").textContent,
        fragmentShader: THREE.ShaderLib['basic'].fragmentShader,

        //lights: true
    });

    objectMaterialLoader.load(
        'models/rocks/rock1/Rock1.obj',
        'models/rocks/rock1/Rock1.mtl',
        function (loadedObject) {
            "use strict";
            // Custom function to handle what's supposed to happen once we've loaded the model

            // Extract interesting object (or modify the model in a 3d program)
            var object = loadedObject.children[1].clone();

            // Traverse the model objects and replace their geometry with an instanced copy
            // Each child in the geometry with a custom color(, and so forth) will be drawn with a
            object.traverse(function(node) {
                if (node instanceof THREE.Mesh) {
                    console.log('mesh', node);

                    var oldGeometry = node.geometry;

                    node.geometry = new THREE.InstancedBufferGeometry();

                    // Copy the the prevoius geometry
                    node.geometry.fromGeometry(oldGeometry);

                    // Associate our generated values with named attributes.
                    node.geometry.addAttribute("translate", translationAttribute);
                    node.geometry.addAttribute("scale", scaleAttribute);

                    //node.geometry.scale(geometryScale, geometryScale, geometryScale);

                    // A hack to avoid custom making a boundary box
                    node.frustumCulled = false;

                    // Set up correct material. We must replace whatever has been set with a fitting material
                    // that can be used for instancing.
                    var oldMaterial = node.material;
                    console.log('material', oldMaterial);

                    node.material = instancedMaterial.clone();
                    if ("color" in oldMaterial) {
                        node.material.uniforms['diffuse'] = {
                            type: 'c',
                            value: oldMaterial.color
                        };
                    }
                }
            });

            var bbox = new THREE.Box3().setFromObject(object);

            // We should know where the bottom of our object is
            object.position.y -= bbox.min.y;

            object.name = "RockInstanced";

            terrain.add(object);
        }, onProgress, onError);
}

/**
 * Load and insert multiple copies of a tree, that is not instanced
 * @param terrain
 * @param objectMaterialLoader
 */
function setupTrees(terrain, objectMaterialLoader) {
    "use strict";
    var maxNumObjects = 200;
    var spreadCenter = new THREE.Vector3(-0.2*worldMapWidth, 0, -0.2*worldMapDepth);
    var spreadRadius = 0.1*worldMapWidth;
    //var geometryScale = 30;

    var minHeight = 0.05*worldMapMaxHeight;
    var maxHeight = 0.3*worldMapMaxHeight;
    var maxAngle = 30 * Math.PI / 180;

    var scaleMean = 100;
    var scaleSpread = 40;
    var scaleMinimum = 10;

    var generatedAndValidPositions = generateRandomData(maxNumObjects,
        generateGaussPositionAndCorrectHeight.bind(null, terrain, spreadCenter, spreadRadius),
        // The previous is functionally the same as
        // function() {
        //      return generateGaussPositionAndCorrectHeight(terrain, spreadCenter, spreadRadius)
        // }

        // If you want to accept every position just make function that returns true
        positionValidator.bind(null, terrain, minHeight, maxHeight, maxAngle),

        // How many tries to generate positions before skipping it?
        5
    );

    var generatedAndValidScales = generateRandomData(generatedAndValidPositions.length,

        // Generator function
        function() { return Math.abs(scaleMean + randomGauss()*scaleSpread); },

        // Validator function
        function(scale) { return scale > scaleMinimum; }
    );

    var numObjects = generatedAndValidPositions.length;

    objectMaterialLoader.load(
        'models/lowPolyTree/lowpolytree.obj',
        'models/lowPolyTree/lowpolytree.mtl',
        function (loadedObject) {
            "use strict";
            // Custom function to handle what's supposed to happen once we've loaded the model

            var bbox = new THREE.Box3().setFromObject(loadedObject);
            console.log(bbox);

            for (var i = 0; i < numObjects; ++i) {
                var object = loadedObject.clone();

                // We should know where the bottom of our object is
                object.position.copy(generatedAndValidPositions[i]);
                object.position.y -= bbox.min.y*generatedAndValidScales[i];

                object.scale.set(
                    generatedAndValidScales[i],
                    generatedAndValidScales[i],
                    generatedAndValidScales[i]
                );

                object.name = "LowPolyTree";

                terrain.add(object);
            }
        }, onProgress, onError);
}

function generateGaussPositionAndCorrectHeight(terrain, center, radius) {
    "use strict";
    var pos = randomGaussPositionMaker(center, radius);
    //var pos = randomUniformPositionMaker(center, radius);
    return terrain.computePositionAtPoint(pos);
}

function positionValidator(terrain, minHeight, maxHeight, maxAngle, candidatePos) {
    "use strict";

    var normal = terrain.computeNormalAtPoint(candidatePos);
    var notTooSteep = true;

    var angle = normal.angleTo(new THREE.Vector3(0, 1, 0));
    //var maxAngle = 30 * Math.PI/180;

    if (angle > maxAngle) {
        notTooSteep = false;
    }

    var withinTerrainBoundaries = terrain.withinBoundaries(candidatePos);
    var withinHeight = (candidatePos.y >= minHeight) && (candidatePos.y <= maxHeight);

    return withinTerrainBoundaries && withinHeight && notTooSteep;
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