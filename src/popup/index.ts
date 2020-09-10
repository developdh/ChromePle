// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
import chromep from 'chrome-promise';
import { ChromePle } from "../types";

//import io from 'socket.io-client';

// import { socketioAddr } from "../consts/consts";

// const socket = io(socketioAddr);

// socket.on('connect', function(){});
// socket.on('event', function(data: String){});
// socket.on('disconnect', function(){});
// socket.connect();

const startScript = document.getElementById('startScript');
const drawColor = <HTMLInputElement>document.getElementById("drawColor");
const drawWidth = <HTMLInputElement>document.getElementById("drawWidth");
const drawAlpha = <HTMLInputElement>document.getElementById("drawAlpha");
const eraserMode = <HTMLInputElement>document.getElementById("eraserMode");
const controller = document.getElementById("controller");

chromep.storage.sync.get('color').then((data) => {
  startScript.style.backgroundColor = data.color;
  startScript.setAttribute('value', data.color);
});

async function executeScriptCode(tab : chrome.tabs.Tab, code : string) {
  return (await chromep.tabs.executeScript(
    tab.id,
    { code }
  ))[0];
}

async function isRunning(tab : chrome.tabs.Tab) : Promise<boolean> {
  // const colorValue = drawColor.value; 
  // await executeScriptCode(tab, `window.chromePle.brushData.color = ${parseInt(colorValue.substr(1), 16)}`);

  // const widthValue = drawWidth.value; 
  // await executeScriptCode(tab, `window.chromePle.brushData.width = ${widthValue}`);

  // const alphaValue = parseInt(drawAlpha.value); 
  // await executeScriptCode(tab, `window.chromePle.brushData.alpha = ${alphaValue / 100}`);

  // const newMode : boolean = await executeScriptCode(tab, `window.chromePle.brushData.eraserMode = !window.chromePle.brushData.eraserMode`);
  //     eraserMode.value =  newMode ? "OFF" : "ON";

  return await executeScriptCode(tab, `(() => { return !!window.chromePle; })()`);
}
async function makeController(tab : chrome.tabs.Tab) {
  controller.style.display = "block";
    
  const chromePle : ChromePle = await executeScriptCode(tab, `window.chromePle`);

  drawColor.value = "#"+chromePle.brushData.color.toString(16).padStart(6, "0");
  drawWidth.value = chromePle.brushData.width.toString();
  drawAlpha.value = (chromePle.brushData.alpha*100).toString();
  eraserMode.value = chromePle.brushData.eraserMode ? "OFF" : "ON";
  eraserMode.src = chromePle.brushData.eraserMode ? "OFF" : "ON";
  eraserMode.src = chromePle.brushData.eraserMode ? "./images/on_button.png" : "./images/off_button.png";

  drawColor.addEventListener("change", async () => {
    const colorValue = drawColor.value; 
    await executeScriptCode(tab, `window.chromePle.brushData.color = ${parseInt(colorValue.substr(1), 16)}`);
  });

  drawWidth.addEventListener("change", async () => {
    const widthValue = drawWidth.value; 
    await executeScriptCode(tab, `window.chromePle.brushData.width = ${widthValue}`);
  });

  drawAlpha.addEventListener("change", async () => {
    const alphaValue = parseInt(drawAlpha.value); 
    await executeScriptCode(tab, `window.chromePle.brushData.alpha = ${alphaValue / 100}`);
  });

  eraserMode.addEventListener("click", async () => {
    const newMode : boolean = await executeScriptCode(tab, `window.chromePle.brushData.eraserMode = !window.chromePle.brushData.eraserMode`);
    eraserMode.value =  newMode ? "OFF" : "ON";
    eraserMode.src =  newMode ? "./images/on_button.png" : "./images/off_button.png";
  });
}

async function main() {
  const tab = (await chromep.tabs.query({ active: true, currentWindow: true }))[0];

  if(await isRunning(tab)) {
    await makeController(tab);
  } else {
    //alert("??");
    startScript.addEventListener("click", async () => {

      await chromep.tabs.setZoom(tab.id, 1);
      const tab_innerWidth : number = (await chromep.tabs.executeScript(tab.id, { code: "(() => { return innerWidth })()" }))[0];
      await chromep.tabs.setZoom(tab_innerWidth/1920);

      await executeScriptCode(tab, await (await fetch("./scripts/execute.js")).text());
      await makeController(tab);

      // socket.emit("setUrl", await executeScriptCode(tab, "window.location.hostname"));
      // socket.once("initCanvas", async (initData : {
      //   width : number,
      //   height : number,
      //   dataURL : string
      // }) => {
      //   await executeScriptCode(tab, `window.chromePle = ${JSON.stringify(initData)};`);
      // });
    });    
  }
}



main();