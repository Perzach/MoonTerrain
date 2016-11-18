/**
 * Created by Eivind on 07.11.2016.
 */
"use strict";

function setupSkySphere(){

    var radius = 1000000;
    var widthSegments = 16;
    var heightSegments = 16;
    var spaceTexture = THREE.ImageUtils.loadTexture('textures/space.jpg');

    var skySphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    var skySphereMaterial = new THREE.MeshBasicMaterial({ map: spaceTexture});
    var skySphere = new THREE.Mesh(skySphereGeometry, skySphereMaterial);
    skySphere.material.side = THREE.BackSide;

    skySphere.name = "Sky";

    scene.add(skySphere);

    return skySphere;

}