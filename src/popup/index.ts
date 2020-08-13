// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
import chromep from 'chrome-promise';

let changeColor = document.getElementById('changeColor');

chromep.storage.sync.get('color').then((data) => {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = async (element) => {
  let color = (<HTMLInputElement>element.target).value;
  const tabs = await chromep.tabs.query({ active: true, currentWindow: true });
  const results = await chromep.tabs.executeScript(
    tabs[0].id,
    {
      code: '(() => { document.body.style.backgroundColor = "' + color + '"; return document })()'
    }
  );
  alert(results);
  changeColor.innerText = "시발!";
};
