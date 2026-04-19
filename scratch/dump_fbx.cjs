const fs = require('fs');
const buffer = fs.readFileSync('public/models/EoloAnim/EoloAnim.fbx');
const content = buffer.toString('latin1');

// Look for Model and Mesh tags
const models = [];
const modelRegex = /Model: (\d+), "Model::([^"]+)", "([^"]+)"/g;
let match;
while ((match = modelRegex.exec(content)) !== null) {
  models.push({ id: match[1], name: match[2], type: match[3] });
}

fs.writeFileSync('scratch/fbx_structure.txt', JSON.stringify(models, null, 2));
console.log('FBX structure dumped to scratch/fbx_structure.txt');
