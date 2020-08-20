
import { ChromePle, InitData } from "../types";

export {};



declare global {
    interface Window {
        chromePle: ChromePle;
    }
}

interface PenData {
    startX : number,
    startY : number,
    endX : number,
    endY : number,
    radius: number
}

interface DrawData extends PenData {
    rgb: number,
    alpha: number
};

interface EraserDrawData extends PenData {

}


import io from 'socket.io-client';
import { socketioAddr } from "../consts/consts";





window.chromePle = {
    initData: null,
    brushData: {
        color: 0,
        width: 10,
        alpha: 1,
        eraserMode: false
    }
};

const socket = io(socketioAddr);

socket.on('connect', function(){});
socket.on('event', function(data: String){});
socket.on('disconnect', function(){});
socket.connect();

socket.emit("setUrl", window.location.hostname);
socket.once("initCanvas", async (initData : InitData) => {
    initialize(initData);
});

function rgbToRGB(rgb : number) {
    return [rgb>>4*2*2, (rgb>>4*2*1)%(16**2), rgb%(16**2)];
}

function rgbToSharpRGB(rgb : number) {
    return "#" + rgb.toString(16).padStart(6, "0");
}

async function getImage(imagePath : string) : Promise<HTMLImageElement> {
    return new Promise(solve => {
        const image = document.createElement("img");
        image.src = imagePath;
        image.addEventListener("load", e => {
            solve(image);
        });
    });
}

async function initialize(initData : InitData) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = initData.width;
    canvas.height = initData.height;

    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.display = "inline-block";
    canvas.style.zIndex = "99999";

    const image = await getImage(initData.dataURL);
    context.drawImage(image, 0, 0);
    context.lineCap = "round";

    canvas.addEventListener("mousemove", move, false);
    canvas.addEventListener("mousedown", down, false);
    canvas.addEventListener("mouseup", up, false);
    canvas.addEventListener("mouseout", out, false);
    
    let startX = 0, startY = 0;
    let drawing = false;
    function draw(curX : number, curY : number){
        // context.strokeStyle = rgbToSharpRGB(window.chromePle.brushData.color);
        // context.lineWidth = window.chromePle.brushData.width;
        // context.beginPath();
        // context.moveTo(startX, startY);
        // context.lineTo(curX, curY);
        // context.stroke();
        
        if(!window.chromePle.brushData.eraserMode) {
            const drawData : DrawData = {
                startX,
                startY,
                endX: curX,
                endY: curY,
                radius: window.chromePle.brushData.width,
                rgb: window.chromePle.brushData.color,
                alpha: window.chromePle.brushData.alpha
            };
            socket.emit("draw", drawData);
        } else {
            const drawData : EraserDrawData = {
                startX,
                startY,
                endX: curX,
                endY: curY,
                radius: window.chromePle.brushData.width
            };
            socket.emit("erase", drawData);
        }
    }
    function down(e : MouseEvent) {
        const curX = e.offsetX, curY = e.offsetY;
        startX = curX; startY = curY;
        draw(curX, curY);

        drawing = true;
    }

    function up(e : MouseEvent) {
        drawing = false;
    }

    function move(e : MouseEvent) {
        if(!drawing) return;
        const curX = e.offsetX, curY = e.offsetY;
        draw(curX, curY);
        startX = curX; startY = curY;
    }

    function out(e : MouseEvent) { drawing = false; }

    document.body.appendChild(canvas);


    // socket.io로 그리기 정보 받아서 canvas에 그리기
    socket.on("draw", ({
        startX,
        startY,
        endX,
        endY,
        radius,
        rgb,
        alpha
    } : DrawData) => {
        const [ r, g, b ] = rgbToRGB(rgb);
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.lineWidth = radius;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    });
    
    socket.on("erase", ({
        startX,
        startY,
        endX,
        endY,
        radius
    } : DrawData) => {
        context.globalCompositeOperation = "destination-out";
        context.lineWidth = radius;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    });
}