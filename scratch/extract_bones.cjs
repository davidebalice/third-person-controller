const fs = require('fs');
const buffer = fs.readFileSync('public/models/EoloAnim/EoloAnim.fbx');
const content = buffer.toString('latin1');
const matches = content.match(/Model::[a-zA-Z0-9_:\-]+/g);
if (matches) {
  fs.writeFileSync('scratch/bones_found.txt', matches.join('\n'));
} else {
  fs.writeFileSync('scratch/bones_found.txt', 'No bones found');
}
