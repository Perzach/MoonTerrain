/**
 * Created by Eivind on 08.11.2016.
 */
function setupBase(terrain, objectMaterialLoader) {
    "use strict";

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

            //object.castShadow = true;
            //object.receiveShadow = true;

            object.traverse( function (node) {
                if(node instanceof THREE.Mesh){
                    node.castShadow = true;
                }
            });

            terrain.add(object);
        }, onProgress, onError);
}