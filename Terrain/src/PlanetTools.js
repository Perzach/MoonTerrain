/**
 * Created by per-oystein on 07.11.2016.
 */

function setUpPlanet(radius, xPos, yPos, zPos, texturePath){

    var widthSegments = 32;
    var heightSegments = 32;
    var planetTexture = THREE.ImageUtils.loadTexture(texturePath);

    var planetGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    var planetMaterial = new THREE.MeshBasicMaterial({ map: planetTexture});
    var planet = new THREE.Mesh(planetGeometry, planetMaterial);

    planet.position.x = xPos;
    planet.position.y = yPos;
    planet.position.z = zPos;

    scene.add(planet);

    return planet;

}