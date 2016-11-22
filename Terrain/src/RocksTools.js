/**
 * Created by Eivind on 22.11.2016.
 */
"use strict";

var billboards;

function setupInstancedRocks(terrain, objectMaterialLoader, texturePath) {

    // Maximum objects
    var maxObjects = 20;

    objectMaterialLoader.load(
        'models/rocks/rock/rock.obj',
        'models/rocks/rock/rock.mtl',
        function (loadedObject) {
            "use strict";
            // Custom function to handle what's supposed to happen once we've loaded the model

            var bbox = new THREE.Box3().setFromObject(loadedObject);
            console.log(bbox);

            for(var i = 0; i < maxObjects; i++){

                // Make and scale the first object
                var object = loadedObject.clone();
                object.scale.set(randomScale(0.5, 1), randomScale(0.8, 1), randomScale(0.5, 1));
                object.rotation.y = randomRotation();
                object.name = "Model";

                // Setting up shadows for each object
                object.traverse( function (node) {
                    if(node instanceof THREE.Mesh){
                        node.castShadow = true;
                        node.receiveShadow = true;

                    }
                });

                // Make and scale the billboard
                var texture = THREE.ImageUtils.loadTexture(texturePath);
                var objMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    map: texture
                });
                objMaterial.depthTest = false;
                objMaterial.side = THREE.DoubleSide;
                var object2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), objMaterial);
                object2.name = "Billboard";
                object2.receiveShadow = true;

                // Level of detail
                var lod = new THREE.LOD();
                lod.addLevel( object, 0 );
                lod.addLevel( object2, 10000 );

                // Translate and name lod
                lod.scale.set(200 * randomScale(0.5, 2), 200 * randomScale(0.8, 1.2), 200 * randomScale(0.5, 2));
                lod.position.set(1000 + randomPosition(4000), 0, randomPosition(4000));
                lod.name = "RockInstance";

                terrain.add(lod);
            }
        }, onProgress, onError);
}

// Generate random position
function randomPosition(radius) {
    var number = Math.random() * (radius - (-radius)) + (-radius);
    return number;
}

// Generate random scale
function randomScale(min, max) {
    var number = Math.random() * (max - min) + min;
    return number;
}

// Generate random rotation
function randomRotation() {
    var number = Math.random() * 360.0;
    return number;
}