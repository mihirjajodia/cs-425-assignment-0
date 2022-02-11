import vertexShaderSrc from './vertex.glsl.js';
import fragmentShaderSrc from './fragment.glsl.js';

var gl;
var program;
var vao;
var uniformLoc;
var currColor;
var newColor;
var currTri;
var start;
var data;
var pos;
var col;
var x_test=0;


window.updateTriangles = function() {
    currTri = parseInt(document.querySelector("#triangles").value);
}

window.updateColor = function() {
    if (document.getElementById("check").checked) {
        var r = parseInt(document.querySelector("#sliderR").value)/255.0;
        var g = parseInt(document.querySelector("#sliderG").value)/255.0;
        var b = parseInt(document.querySelector("#sliderB").value)/255.0;
        currColor = [r,g,b,1.0];
    }
}

function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        var info = gl.getShaderInfoLog(shader);
        console.log('Could not compile WebGL program:' + info);
    }
    
    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(program);
        console.log('Could not compile WebGL program:' + info);
    }

    return program;
}

function createBuffer(vertices) {
    var buffer= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    return buffer;
}

function createVAO(posAttribLoc, colorAttribLoc, posBuffer, colorBuffer, posColorBuffer) {
    
    var vao = gl.createVertexArray();

    // Two buffers approach
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posAttribLoc);
    var size = 3; // number of components per attribute
    var type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttribLoc, size, type, false, 0, 0);

    gl.enableVertexAttribArray(colorAttribLoc);
    size = 4;
    type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLoc, size, type, false, 0, 0);

    return vao;
}

function createTriangles(nTriangles) {


    var positions = []
    var colors = []
    var poscolors = [];
    pos=data.positions;
    col=data.colors;
    console.log("check pos: "+pos);
    var a=[];
    var x=0, y=0;
    var ypos=[];
    document.getElementById("triangles").max = (pos.length)/9;

    for(var i = 0; i < pos.length/3; ++i) {

        var pos2=[pos[x], pos[x+1], pos[x+2]];
        var col2=[col[y], col[y+1], col[y+2], col[y+3]];
        colors = colors.concat(col2);
        a[i]=[pos[x], pos[x+1], pos[x+2], col[y], col[y+1], col[y+2], col[y+3]];
        x+=3;
        y+=4;

        var poscolor=a[i];

        poscolors = poscolors.concat(poscolor);
    }
    positions = positions.concat(pos);
    console.log(pos.length);
    console.log(positions.length);
    console.log(positions);

    return {'positions': positions, 'colors': colors, 'poscolors': poscolors};

}

function draw(timestamp) {

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(program);
    
    var s=[col[x_test],col[x_test+1],col[x_test+2],col[x_test+3]];
    gl.uniform4fv(uniformLoc, s);
    x_test+=4;
    gl.bindVertexArray(vao);
    var primitiveType = gl.TRIANGLES;
    var count = 3*currTri; // number of elements (vertices)
    gl.drawArrays(primitiveType, 0, count);

    requestAnimationFrame(draw);
}


window.onChange = function(event) {
    var file = event.target.files[0];
    if (file.type != 'application/json') {
        alert("Invalid file type chosen!");
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        data = JSON.parse(e.target.result);
        console.log(data);
        console.log("CALLED");
        var canvas = document.querySelector("#glcanvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        gl = canvas.getContext("webgl2");
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        currTri = 1;
        var triangles = createTriangles(100);
        console.log(triangles);
        // currColor = [0, 0, 0, 1];
        // newColor = currColor;
        
        var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
        var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
        program = createProgram(vertexShader, fragmentShader);

        var posAttribLoc = gl.getAttribLocation(program, "position");
        var colorAttribLoc = gl.getAttribLocation(program, "color");
        uniformLoc = gl.getUniformLocation(program, 'uColor');

        var posBuffer = createBuffer(triangles['positions']);
        var colorBuffer = createBuffer(triangles['colors']);
        var posColorBuffer = createBuffer(triangles['poscolors']);
        vao = createVAO(posAttribLoc, colorAttribLoc, posBuffer, colorBuffer, posColorBuffer);

        window.requestAnimationFrame(draw);
    };
    reader.readAsText(file);
}