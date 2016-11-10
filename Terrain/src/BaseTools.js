/**
 * Created by Eivind on 08.11.2016.
 */
"use strict";

function setupWholeBase(terrain, objectMaterialLoader) {
    setupBase(terrain, objectMaterialLoader);
    setupRocket(terrain, objectMaterialLoader);
}

function setupBase(terrain, objectMaterialLoader) {

    objectMaterialLoader.load(
        'models/spaceStation/SpaceStation.obj',
        'models/spaceStation/SpaceStation.mtl',
        function (loadedObject) {
            "use strict";
            // Custom function to handle what's supposed to happen once we've loaded the model

            var bbox = new THREE.Box3().setFromObject(loadedObject);
            console.log(bbox);

            var object = loadedObject.clone();

            // We should know where the bottom of our object is
            object.position.y = 1

            object.scale.set(100,100,100);

            object.name = "Base";

            // Setting up shadows for object
            object.traverse( function (node) {
                if(node instanceof THREE.Mesh){
                    node.castShadow = true;
                }
            });

            terrain.add(object);
        }, onProgress, onError);
}

function setupRocket(terrain, objectMaterialLoader) {

    objectMaterialLoader.load(
        'models/rocket/Rocket.obj',
        'models/rocket/Rocket.mtl',
        function (loadedObject) {
            "use strict";
            // Custom function to handle what's supposed to happen once we've loaded the model

            // Boundingbox
            var bbox = new THREE.Box3().setFromObject(loadedObject);
            var object = loadedObject.clone();

            // Doing misc with object. Position, scale and name
            object.position.set(1000, 0, 1000)
            object.scale.set(100,100,100);
            object.name = "Rocket";

            // Setting up shadows for object
            object.traverse( function (node) {
                if(node instanceof THREE.Mesh){
                    node.castShadow = true;
                }
            });

            terrain.add(object);
        }, onProgress, onError);
}