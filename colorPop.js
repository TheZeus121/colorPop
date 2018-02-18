"use strict";
// Mr. JPrograms is the creator of this idea. See: https://www.khanacademy.org/computer-programming/color-pop/6416482056208384

// global constants
const s = 1; // node width and height
const clrOff = 0.05; // 0 to 1, how much the color can change between nodes

// global variables
let canvas;
let cols;
let rows;
let ctx;
let filled;
let list = new DoublyLinkedList();
let nodeProg = 0;
let loopId = 0;

const Node = (x, y, r, g, b) => {
    return {
        x: x,
        y: y,
        r: r,
        g: g,
        b: b,
        prev: null,
        next: null
    };
};
const rand = max => Math.random() * max | 0;
const constrain = (v, min, max) => (v < min ? min : (v > max ? max : v));
const srgbToLinear = c => c > .04045 ? Math.pow((c + 0.055) / (1 + 0.055), 2.4) : c / 12.92;
const linearToSrgb = c => c > .0031308 ? (1 + 0.055) * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
const adjustColor = cc => constrain(Math.round(linearToSrgb(srgbToLinear(cc / 255) + Math.random() * clrOff * 2 - clrOff) * 255), 0, 255);
const coord = x => (x == 0) * -1 + (x == 2) * 1;
const setNode = a => {
    ctx.fillStyle = `rgb(${a.r = adjustColor(a.r)}, ${a.g = adjustColor(a.g)}, ${a.b = adjustColor(a.b)})`;
    ctx.fillRect(a.x * s, a.y * s, s, s);
    for (let n = 0; n < 4; n++) {
        const px = a.x + coord(n);
        const py = a.y + coord(n + 3 & 3);
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
            const index = px + py * cols;
            const byte = index >> 3;
            const bit = 1 << (index & 7);
            if (!(filled[byte] & bit)) {
                list.push(Node(px, py, a.r, a.g, a.b));
                filled[byte] |= bit;
            }
        }
    }
};
const loop = () => {
    nodeProg += list.length / (2 * Math.PI);
    while (nodeProg > 1 && list.length > 0) {
        nodeProg--;
        setNode(list.remove(list.get(rand(list.length))));
    }
    if (list.length) loopId = requestAnimationFrame(loop);
};
const reset = (x, y) => {
    // if there is already a loop running, stop it
    if (loopId) {
        cancelAnimationFrame(loopId);
        loopId = 0;
    }
    list = new DoublyLinkedList();
    nodeProg = 0;
    
    cols = (canvas.width = innerWidth) / s;
    rows = (canvas.height = innerHeight) / s;
    ctx = canvas.getContext("2d");
    
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    filled = new Uint8Array(Math.ceil(cols * rows / 8));
    if (!x) x = rand(rows);
    if (!y) y = rand(rows);
    setNode(Node(x, y, rand(256), rand(256), rand(256)));
    loop();
};
const click = ev => {
    if (ev.button != 0) {
        reset(ev.clientX / s, ev.clientY / s);
    } else {
        setNode(Node(ev.clientX / s, ev.clientY / s, rand(256), rand(256), rand(256)));
    }
};
const init = () => {
    canvas = document.getElementById("canvas");
    canvas.addEventListener("mousedown", click);
    reset();
};

document.addEventListener("DOMContentLoaded", init);
