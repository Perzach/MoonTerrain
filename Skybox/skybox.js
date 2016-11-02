"use strict";

let gl;
let program;
let cubeMap;


function configureCubeMap(right, left, up, down, front, back) {

    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, right);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, left);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, up);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, down);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, front);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z ,0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, back);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.LINEAR);

    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);
}


window.onload = function init() {
    let canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Use this object to listen for key inputs
    let keyboardState = new THREEx.KeyboardState();

    // The camera object control's the position and orientation of the... camera
    let camera = new Camera(keyboardState);

    //
    // Set up our models
    //

    camera.setPosition(vec3(0, 0, 0));
    camera.setForwardDirection(vec3(0, 0, 1));

    //var Projection = ortho(-10, 10, -10, 10, -10, 10);
    let Projection = perspective(60, canvas.width/canvas.height, 0.01, 1000);
    let View = camera.getViewMatrix();

    // Generate our cylinder, a higher number will make the approximated cylinder
    // look like a real cylinder
    var cubeData = generateCube();

    var allPoints = [].concat(
        cubeData.points
    );


    // Lets draw a cylinder, a cube and a sphere



    var cubeDraw = {
        numVertices: cubeData.numVertices,

        model: mult(translate(0, 0, 0), scalem(5, 5, 5)),

        uniforms: {
            color: vec4(0, 1, 0, 1),
            mvp: mat4()
        }
    };


    //
    //  Configure WebGL
    //

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);


    var ModelViewProjectionLocation = gl.getUniformLocation(program, "ModelViewProjection");
    var ColorLocation = gl.getUniformLocation(program, "Color");

    /* Load the data into the GPU*/

    var positionBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(allPoints)), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeData.texCoordsArray), gl.STATIC_DRAW );


    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    var front = document.getElementById("front");
    var back  = document.getElementById("back");
    var left  = document.getElementById("left");
    var right = document.getElementById("right");
    var up    = document.getElementById("up");
    var down  = document.getElementById("down");

    //configureTexture(front, back, left, right, up, down, program);


    configureCubeMap(right, left, up, down, front, back);

    //
    // Set up and start the render loop
    //

    var prevTimestamp = 0;

    window.requestAnimationFrame(function step(timestamp) {
        var deltaTimestamp = timestamp - prevTimestamp;
        prevTimestamp = timestamp;

        camera.update(deltaTimestamp);
        View = camera.getViewMatrix();

        var ViewProjection = mult(Projection, View);


        // Construct a "draw command" list
        var drawableObjects = [
            cubeDraw
        ];


        // Update the mvp properties
        for (var i = 0; i < drawableObjects.length; ++i) {
            drawableObjects[i].uniforms.mvp = mult(ViewProjection, drawableObjects[i].model);
        }

        render(drawableObjects, ModelViewProjectionLocation, ColorLocation);

        window.requestAnimationFrame(step);
    });


};

function render(drawableObjects, mvpLocation, colorLocation) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < drawableObjects.length; ++i) {
        var drawableObject = drawableObjects[i];
        gl.uniformMatrix4fv(mvpLocation, false, flatten(drawableObject.uniforms.mvp));
        gl.uniform4fv(colorLocation, new Float32Array(drawableObject.uniforms.color));
        gl.drawArrays(gl.TRIANGLES, drawableObject.offset, drawableObject.numVertices);
    }
}
