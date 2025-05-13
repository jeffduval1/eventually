import { getTextColor, rgbToHex } from './modules/utils/helpers.js';

console.log("🧪 Lancement des tests helpers.js...");

// 🟢 Test getTextColor
function testGetTextColor() {
    const tests = [
        { input: "#FFFFFF", expected: "black" },
        { input: "#000000", expected: "white" },
        { input: "#FF0000", expected: "white" },
        { input: "#DDDDDD", expected: "black" }
    ];
    tests.forEach(({ input, expected }) => {
        const result = getTextColor(input);
        if (result !== expected) {
            console.error(`❌ getTextColor(${input}) = ${result} (attendu : ${expected})`);
        } else {
            console.log(`✅ getTextColor(${input}) = ${expected}`);
        }
    });
}

// 🟢 Test rgbToHex
function testRgbToHex() {
    const tests = [
        { input: "rgb(255, 255, 255)", expected: "#ffffff" },
        { input: "rgb(0, 0, 0)", expected: "#000000" },
        { input: "rgb(34, 139, 34)", expected: "#228b22" },
        { input: "rgb(128, 0, 128)", expected: "#800080" }
    ];
    tests.forEach(({ input, expected }) => {
        const result = rgbToHex(input).toLowerCase();
        if (result !== expected) {
            console.error(`❌ rgbToHex(${input}) = ${result} (attendu : ${expected})`);
        } else {
            console.log(`✅ rgbToHex(${input}) = ${expected}`);
        }
    });
}

// ➡️ Lancement
testGetTextColor();
testRgbToHex();
