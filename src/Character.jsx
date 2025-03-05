import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import walls from "./walls";

const Character = ({ cameraRef }) => {
  // Caricamento del modello e delle animazioni
  const [blockedUp, setBlockedUp] = useState(false);
  const [blockedDown, setBlockedDown] = useState(false);
  const [blockedLeft, setBlockedLeft] = useState(false);
  const [blockedRight, setBlockedRight] = useState(false);
  const model = useFBX("/models/character.fbx");
  const idleAnim = useFBX("/animations/idle.fbx");
  const walkAnim = useFBX("/animations/walk.fbx");

  // Riferimenti e stati
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const [currentAction, setCurrentAction] = useState(null);
  const characterRef = useRef();
  const velocity = useRef(new THREE.Vector3()); // Velocità del movimento
  const direction = useRef(new THREE.Vector3()); // Direzione del movimento
  const collisionBox = useRef(); // Box di collisione
  const collisionBoxGeometry = new THREE.BoxGeometry(0.7, 1.8, 0.5); // Dimensioni realistiche del personaggio
  const collisionBoxMaterial = new THREE.MeshBasicMaterial({
    transparent: true, // Abilita la trasparenza
    opacity: 1,
    wireframe: true, // Per visualizzare la rete wireframe
  });

  // Funzione per il controllo delle collisioni
  const checkCollision = (movement) => {
    // Crea un Box3 per il personaggio
    const characterBox = new THREE.Box3().setFromObject(collisionBox.current);

    // Verifica la collisione con ciascun muro
    for (const wall of walls) {
      if (characterBox.intersectsBox(wall)) {
        return true; // Collisione trovata
      }
    }
    return false; // Nessuna collisione
  };

  /*
  const checkCollision = (movement) => {
    if (!characterRef.current) {
      console.error("Character reference not defined.");
      return false;
    }
    if (!walls || walls.length === 0) {
      console.error("No walls to check collision.");
      return false;
    }

    // Crea un raggio dalla posizione del personaggio nella direzione del movimento
    const rayOrigin = new THREE.Vector3().copy(characterRef.current.position);
    const rayDirection = new THREE.Vector3().copy(movement).normalize();

    // Crea il raycaster con origine e direzione
    const raycaster = new THREE.Raycaster(rayOrigin, rayDirection, 0, 1); // 0 per la distanza minima e 1 per la distanza massima
    const intersects = raycaster.intersectObjects(walls);

    return intersects.length > 0; // Se il raggio colpisce un muro, ritorna true
  };
*/
  // Imposta la posizione del box di collisione ogni volta che cambia la posizione del modello
  useEffect(() => {
    if (collisionBox.current && characterRef.current) {
      collisionBox.current.position.copy(characterRef.current.position);
    }
  }, [characterRef.current?.position]);

  const resetBlock = () => {
    setBlockedUp(false);
    setBlockedDown(false);
    setBlockedLeft(false);
    setBlockedRight(false);
  };

  // Caricamento e configurazione delle animazioni del modello
  useEffect(() => {
    if (model && idleAnim && walkAnim) {
      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      actionsRef.current = {
        idle: mixer.clipAction(idleAnim.animations[0]),
        walk: mixer.clipAction(walkAnim.animations[0]),
      };

      setCurrentAction(actionsRef.current.idle);
      actionsRef.current.idle.play();
      actionsRef.current.walk.play();

      actionsRef.current.idle.loop = THREE.LoopRepeat; // Loop per idle
      actionsRef.current.walk.loop = THREE.LoopRepeat; // Loop per camminata

      return () => mixer.stopAllAction();
    }
  }, [model, idleAnim, walkAnim]);

  // Gestione del cambiamento di animazione
  useEffect(() => {
    if (currentAction) {
      // Ferma tutte le animazioni e riproduce quella corrente
      Object.values(actionsRef.current).forEach((action) => {
        if (action !== currentAction) {
          action.fadeOut(0.5); // Fade-out per evitare glitch
        }
      });

      currentAction
        .reset()
        .fadeIn(0.2) // Fade-in per l'animazione attuale
        .play();
    }
  }, [currentAction]);

  // Funzione per l'animazione e aggiornamento delle posizioni
  useEffect(() => {
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      if (mixerRef.current) mixerRef.current.update(clock.getDelta());

      if (characterRef.current) {
        characterRef.current.position.add(velocity.current);
        characterRef.current.rotation.y = Math.atan2(
          direction.current.x,
          direction.current.z
        ); // Rotazione verso la direzione del movimento
      }
    };
    animate();
  }, []);

  useFrame(() => {
    let movement = new THREE.Vector3();
    movement.set(velocity.current.x, velocity.current.y, velocity.current.z);

    if (direction.current.z > 0) {
      console.log("sopra");
      // Il player si sta muovendo avanti (sopra)
      if (checkCollision(new THREE.Vector3(0, 0, 1))) {
        setBlockedUp(true);
      } else {
        if (blockedDown) {
          resetBlock();
        }
      }
    }

    if (direction.current.z < 0) {
      console.log("sotto");
      // Il player si sta muovendo indietro (sotto)
      if (checkCollision(new THREE.Vector3(0, 0, -1))) {
        console.log("collisione sotto");
        setBlockedDown(true);
      } else {
        if (blockedUp) {
          resetBlock();
        }
      }
    }

    if (direction.current.x < 0) {
      console.log("destra");
      // Il player si sta muovendo a destra
      if (checkCollision(new THREE.Vector3(1, 0, 0))) {
        console.log("collsiione destra");
        setBlockedRight(true);
      } else {
        if (blockedLeft) {
          resetBlock();
        }
      }
    }

    if (direction.current.x > 0) {
      // Il player si sta muovendo a sinistra
      console.log("sinistra");
      if (checkCollision(new THREE.Vector3(-1, 0, 0))) {
        console.log("collsiione sinistra");
        setBlockedLeft(true);
        console.log("collision");
      } else {
        if (blockedRight) {
          resetBlock();
        }
      }
    }

    // Gestione animazioni
    if (
      (movement.x !== 0 || movement.z !== 0) &&
      currentAction !== actionsRef.current.walk
    ) {
      setCurrentAction(actionsRef.current.walk);
    } else if (
      movement.x === 0 &&
      movement.z === 0 &&
      currentAction !== actionsRef.current.idle
    ) {
      setCurrentAction(actionsRef.current.idle);
    }
  });

  // Gestione dei movimenti con i tasti
  useEffect(() => {
    const handleKeyDown = (event) => {
      let movement = new THREE.Vector3();

      // Imposta la direzione in base al tasto premuto
      if (!blockedUp && (event.key === "w" || event.key === "ArrowUp")) {
        movement.set(0, 0, 0.05); // Movimento in avanti (positiva Z)
      } else if (
        !blockedDown &&
        (event.key === "s" || event.key === "ArrowDown")
      ) {
        movement.set(0, 0, -0.05); // Movimento indietro (negativa Z)
      } else if (
        !blockedLeft &&
        (event.key === "a" || event.key === "ArrowLeft")
      ) {
        movement.set(0.05, 0, 0); // Movimento a sinistra (positiva X)
      } else if (
        !blockedRight &&
        (event.key === "d" || event.key === "ArrowRight")
      ) {
        movement.set(-0.05, 0, 0); // Movimento a destra (negativa X)
      }

      // Controllo delle collisioni

      if (checkCollision(movement)) {
        const keyUpEvent = new KeyboardEvent("keyup", { key: event.key });
        window.dispatchEvent(keyUpEvent);
      }

      // Imposta la direzione e la velocità
      if (movement.x !== 0) {
        direction.current.set(movement.x > 0 ? 1 : -1, 0, 0); // Movimento orizzontale
        velocity.current.set(movement.x, 0, 0);
      } else if (movement.z !== 0) {
        direction.current.set(0, 0, movement.z > 0 ? 1 : -1); // Movimento verticale
        velocity.current.set(0, 0, movement.z);
      }

      // Cambia l'animazione in camminata
      if (currentAction !== actionsRef.current.walk) {
        setCurrentAction(actionsRef.current.walk); // Animazione camminata
      }
    };

    const handleKeyUp = (event) => {
      // Ferma il movimento quando si rilascia il tasto
      if (
        event.key === "w" ||
        event.key === "ArrowUp" ||
        event.key === "s" ||
        event.key === "ArrowDown" ||
        event.key === "a" ||
        event.key === "ArrowLeft" ||
        event.key === "d" ||
        event.key === "ArrowRight"
      ) {
        velocity.current.set(0, 0, 0); // Ferma il movimento
        // Cambia a idle quando non si sta più muovendo
        if (
          velocity.current.length() === 0 &&
          currentAction !== actionsRef.current.idle
        ) {
          setCurrentAction(actionsRef.current.idle); // Cambia a idle
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentAction]);

  // Aggiorna la posizione della camera e del box di collisione
  useFrame(() => {
    if (cameraRef.current && characterRef.current) {
      //offset camera top
      //const offset = new THREE.Vector3(0, 50, -11);
      //offset camera scene
      const offset = new THREE.Vector3(0, 10, -11);
      if (cameraRef.current) {
        cameraRef.current.position.lerp(
          characterRef.current.position.clone().add(offset),
          0.1
        );
        cameraRef.current.lookAt(characterRef.current.position);
      }
    }

    if (collisionBox.current && characterRef.current) {
      collisionBox.current.position.copy(characterRef.current.position);
      collisionBox.current.position.set(
        characterRef.current.position.x,
        characterRef.current.position.y + 1,
        characterRef.current.position.z
      );
    }
  });

  return (
    <>
      <primitive ref={characterRef} object={model} scale={0.01} />
      {/* Box di collisione visibile */}
      <mesh
        ref={collisionBox}
        geometry={collisionBoxGeometry}
        material={collisionBoxMaterial}
        position={characterRef.current?.position}
      />
      {walls.map((wall, index) => (
        <mesh
          key={index}
          position={
            new THREE.Vector3(
              (wall.min.x + wall.max.x) / 2,
              1,
              (wall.min.z + wall.max.z) / 2
            )
          }
          visible={true}
        >
          <boxGeometry
            args={[wall.max.x - wall.min.x, 2, wall.max.z - wall.min.z]}
          />
          <meshBasicMaterial color="blue" transparent opacity={0.2} />
        </mesh>
      ))}
    </>
  );
};

export default Character;
