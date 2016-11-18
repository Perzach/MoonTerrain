/**
 * Created by per-oystein on 18.11.2016.
 */

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


    var terrainWorkingMaterial = new THREE.MeshPhongMaterial({
        map: surfaceTexture,
        color: 0x888888,
        shininess: 0.1
    });


    var terrainMesh = new HeightMapMesh(heightMapGeometry, terrainWorkingMaterial);
    terrainMesh.name = "terrain";
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    return terrainMesh;
}