/**
 * Created by per-oystein on 07.11.2016.
 */

function setUpPlanet(radius, xPos, yPos, zPos, texturePath, bumpPath, name){

    var widthSegments = 32;
    var heightSegments = 32;
    var planetTexture = THREE.ImageUtils.loadTexture(texturePath);
    var planetBump = THREE.ImageUtils.loadTexture(bumpPath);

    var planetGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    var planetMaterial = new THREE.MeshPhongMaterial({
        map: planetTexture,
        bumpMap: planetBump,
        bumpScale  :  1000,
    });
    var planet = new THREE.Mesh(planetGeometry, planetMaterial);

    planet.position.x = xPos;
    planet.position.y = yPos;
    planet.position.z = zPos;

    planet.name = name;

    return planet;

}

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