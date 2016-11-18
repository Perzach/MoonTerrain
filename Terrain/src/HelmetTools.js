/**
 * Created by Eivind on 18.11.2016.
 */

function setUpHelmet() {

    // Setting up the helmet geometry and material
    var helmet = new THREE.SphereGeometry(200, 16, 16);
    var helmetMat = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 0.3,
        color: new THREE.Color(0.0, 0.0, 1.0)
    });

    // Making the helmet object
    var helmetObj = new THREE.Mesh(helmet, helmetMat);
    helmetObj.material.side = THREE.DoubleSide;

    // Returning it
    return helmetObj;
}

// Toggles the helmet on and of with the material opacity
function toggleHelmet(helmet){
    if(helmet.material.opacity == 0.0){
        helmet.material.opacity = 0.3;
    }
    else {
        helmet.material.opacity = 0.0;
    }
}