const fs = require('fs');
const buffer = fs.readFileSync('public/models/EoloAnim/EoloAnim.fbx');
const content = buffer.toString('binary');
const regex = /Model::(\w+)/g;
let match;
const bones = new Set();
while ((match = regex.exec(content)) !== null) {
  bones.add(match[1]);
}
console.log(Array.from(bones).join('\n'));
