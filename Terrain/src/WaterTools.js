/**
 * Created by per-oystein on 16.11.2016.
 */

function setUpWater(texturePath) {
    var texture, material, water;

    texture = THREE.ImageUtils.loadTexture(texturePath);

    material = new THREE.MeshLambertMaterial({
        map: texture,

    });
    water = new THREE.Mesh(new THREE.PlaneGeometry(550, 630), material);
    water.material.side = THREE.DoubleSide;
    water.receiveShadow = true;


    water.position.x = 1350;
    water.position.y = 110;
    water.position.z = 200;


    // rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
    // Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
    water.rotation.z = Math.PI / 2;
    water.rotation.x = Math.PI / 2;


    return water;
}