/**
 * Created by Eivind on 07.11.2016.
 */
"use strict";

function setupSkySphere(){

    var radius = 500000;
    var widthSegments = 16;
    var heightSegments = 16;
    var spaceTexture = THREE.ImageUtils.loadTexture('textures/space.jpg');

    var skySphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    // Create our sun's material, making it a Phong material so it supports light.
    var skySphereMaterial = new THREE.MeshBasicMaterial({ map: spaceTexture});
    var skySphere = new THREE.Mesh(skySphereGeometry, skySphereMaterial);
    skySphere.material.side = THREE.DoubleSide;

    scene.add(skySphere);

    return skySphere;

}