/**
 * Created by per-oystein on 16.11.2016.
 */

function setUpWater(texturePath) {
    var texture, material, plane;

    texture = THREE.ImageUtils.loadTexture(texturePath);

    material = new THREE.MeshLambertMaterial({map: texture});
    plane = new THREE.Mesh(new THREE.PlaneGeometry(550, 630), material);
    plane.material.side = THREE.DoubleSide;
    plane.position.x = 1350;
    plane.position.y = 110;
    plane.position.z = 200;


    // rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
    // Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
    plane.rotation.z = Math.PI / 2;
    plane.rotation.x = Math.PI / 2;


    return plane;
}