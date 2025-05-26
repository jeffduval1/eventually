/**
 * 🧪 tests.js
 * Tests unitaires simples pour helpers.js
 * - getTextColor
 * - rgbToHex
 */

import { getTextColor, rgbToHex } from './modules/utils/helpers.js';

// console.log("🧪 Lancement des tests helpers.js...");

let totalTests = 0;
let totalFailures = 0;

function assert(label, result, expected) {
  totalTests++;
  if (result !== expected) {
    totalFailures++;
    console.error(`❌ ${label} = ${result} (attendu : ${expected})`);
  } else {
    // console.log(`✅ ${label} = ${expected}`);
  }
}

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
    assert(`getTextColor(${input})`, result, expected);
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
    assert(`rgbToHex(${input})`, result, expected);
  });
}

// ➡️ Lancement des tests
testGetTextColor();
testRgbToHex();

// console.log(`🧾 Résumé : ${totalTests - totalFailures}/${totalTests} tests réussis.`);
