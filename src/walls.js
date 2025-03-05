import * as THREE from "three";

// Funzione per creare una Box3 con dimensioni e posizioni diverse
const createWall = (position, size) => {
  const min = position
    .clone()
    .add(new THREE.Vector3(-size.x / 2, -size.y / 2, -size.z / 2));
  const max = position
    .clone()
    .add(new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2));
  return new THREE.Box3(min, max);
};

// Definizione delle posizioni per ciascun muro
const wallPositions = [
  new THREE.Vector3(-8, 0, 5),
  new THREE.Vector3(-23, 0, 16),
  new THREE.Vector3(14.5, 0, -3.2),
  new THREE.Vector3(7.2, 0, -20.2),
  new THREE.Vector3(21.2, 0, -20.2),
  new THREE.Vector3(19.2, 0, 13.2),


];

// Definizione delle dimensioni per ciascun muro (variabili per ogni muro)
const wallSizes = [
  new THREE.Vector3(12, 6, 28),
  new THREE.Vector3(22, 5, 7),
  new THREE.Vector3(28, 6, 13),
  new THREE.Vector3(13, 6, 13),
  new THREE.Vector3(13, 6, 13),
  new THREE.Vector3(17, 6, 12),
];

// Creazione dei muri per la collisione con dimensioni e posizioni diverse
const walls = wallPositions.map((position, index) =>
  createWall(position, wallSizes[index])
);

export default walls;
