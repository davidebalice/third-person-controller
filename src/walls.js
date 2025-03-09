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


  new THREE.Vector3(-8, 0, 28.4),
  new THREE.Vector3(-8, 0, -29.8),
  new THREE.Vector3(33, 0, 0.1),
  new THREE.Vector3(-49, 0, 0.1),
  new THREE.Vector3(-7.8, 0, 5.4),
  new THREE.Vector3(-23, 0, 16),
  new THREE.Vector3(14.9, 0, -2.8),
  new THREE.Vector3(7.1, 0, -20.2),
  new THREE.Vector3(21.4, 0, -20.2),
  new THREE.Vector3(19.2, 0, 13.7),
  new THREE.Vector3(-15.4, 0, -20.2),
  new THREE.Vector3(6, 0,8.4),
  new THREE.Vector3(6, 0,19.2),
  new THREE.Vector3(1.6, 0,17.5),
  new THREE.Vector3(1.6, 0,10),
  new THREE.Vector3(-39.5, 0,16),
  new THREE.Vector3(-36.5, 0,-8.2),
  new THREE.Vector3(-35.5, 0,-24.4),
  new THREE.Vector3(-30.5, 0,-14.4),
  new THREE.Vector3(-41.5, 0,-14.4),
  new THREE.Vector3(-43.5, 0,-20.4),
  new THREE.Vector3(-28.5, 0,-20.4),
  new THREE.Vector3(-44.2, 0,2),
  new THREE.Vector3(-27.5, 0,2),
  new THREE.Vector3(-14.2, 0,-8.1),
  new THREE.Vector3(-25.6, 0,-8.1),
];

// Definizione delle dimensioni per ciascun muro (variabili per ogni muro)
const wallSizes = [
  new THREE.Vector3(74, 6, 10),
  new THREE.Vector3(74, 6, 10),
  new THREE.Vector3(10, 6, 50),
  new THREE.Vector3(10, 6, 50),
  new THREE.Vector3(10, 6, 28),
  new THREE.Vector3(22, 5, 7),
  new THREE.Vector3(28, 6, 12),
  new THREE.Vector3(12, 6, 13),
  new THREE.Vector3(13, 6, 12.8),
  new THREE.Vector3(17, 6, 11.5),
  new THREE.Vector3(25, 6, 13.1),
  new THREE.Vector3(9.6, 6, 1.1),
  new THREE.Vector3(9.6, 6, 1.1),
  new THREE.Vector3(1.2, 6, 3.5),
  new THREE.Vector3(1.2, 6, 3.5),
  new THREE.Vector3(9, 6, 7),
  new THREE.Vector3(16, 6, 1),
  new THREE.Vector3(16, 6, 1),
  new THREE.Vector3(6, 6, 1),
  new THREE.Vector3(6, 6, 1),
  new THREE.Vector3(1, 6, 12),
  new THREE.Vector3(1, 6, 12),
  new THREE.Vector3(1, 6, 22),
  new THREE.Vector3(2.5, 6, 22),
  new THREE.Vector3(6, 6, 1),
  new THREE.Vector3(6, 6, 1),

];

// Creazione dei muri per la collisione con dimensioni e posizioni diverse
const walls = wallPositions.map((position, index) =>
  createWall(position, wallSizes[index])
);

export default walls;
