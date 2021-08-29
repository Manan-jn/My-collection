let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 60;
canvas.height = 400;
let socket = io();
let x, y;

//REMAINING:
//ADDING UNDO AND REDO FEATURE TO THE SOCKET CONNECTION

let context = canvas.getContext("2d");
let start_background_color = "white";
context.fillStyle = start_background_color;
context.fillRect(0, 0, canvas.width, canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing = false;

let restore_array = [];
let index = -1;

function change_color(element) {
    draw_color = element.style.background;
}

canvas.addEventListener("touchstart", touchHandlerstart, false);
canvas.addEventListener("touchmove", touchHandlerdraw, false);
canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);

canvas.addEventListener("touchend", stop, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("mouseout", stop, false);

function touchHandlerstart(event) {
    if (event.targetTouches.length == 1) { //one finger touche
        var touch = event.targetTouches[0];
        is_drawing = true;
        context.beginPath();
        // console.dir(touch);
        x = touch.clientX - canvas.offsetLeft;
        y = touch.clientY - canvas.offsetTop;
        context.moveTo(x, y);
        socket.emit('moveTofun', { x, y });
        event.preventDefault();
    }
}
function touchHandlerdraw(event) {
    if (is_drawing) {
        var touch = event.targetTouches[0];
        x = touch.clientX - canvas.offsetLeft;
        y = touch.clientY - canvas.offsetTop;
        context.lineTo(x, y);
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.lineCap = "round";
        context.lineJoin = "round";
        socket.emit('lineTofun', { x, y, draw_color, draw_width });
        context.stroke();
    }
    event.preventDefault();
}

function start(event) {
    is_drawing = true;
    context.beginPath();
    x = event.clientX - canvas.offsetLeft;
    y = event.clientY - canvas.offsetTop;
    context.moveTo(x, y);
    socket.emit('moveTofun', { x, y });
    // console.dir(x);
    // console.dir(y);
    event.preventDefault();
}
//need to pass the starting coordinates to the server first it will broadcast to everyone
//the begin coordinates and then we need to give the lineto coordinates to make the full line

socket.on('startDraw', (data) => {
    x = data.x;
    y = data.y;
    context.beginPath();
    context.moveTo(x, y);
})
function draw(event) {
    if (is_drawing) {
        x = event.clientX - canvas.offsetLeft;
        y = event.clientY - canvas.offsetTop;
        context.lineTo(x, y);
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.lineCap = "round";
        context.lineJoin = "round";
        socket.emit('lineTofun', { x, y, draw_color, draw_width });

        context.stroke();
    }
    event.preventDefault();
}
socket.on('lineDraw', (data) => {
    x = data.x;
    y = data.y;
    context.lineTo(x, y);
    context.strokeStyle = data.draw_color;
    context.lineWidth = data.draw_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
})

function stop(event) {
    if (is_drawing) {
        context.stroke();
        context.closePath();
        is_drawing = false;
    }
    event.preventDefault();

    if (event.type != 'mouseout' || event.type != 'touchend') {

        restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
        index += 1;
    }
}

function clear_canvas() {
    context.fillStyle = start_background_color;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    restore_array = [];
    index = -1;
}

function undo_last() {
    if (index <= 0) {
        clear_canvas();
    }
    else {
        index -= 1;
        restore_array.pop();
        context.putImageData(restore_array[index], 0, 0);
    }
}