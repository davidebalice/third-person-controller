import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import walls from "./walls";

const Character = ({ cameraRef }) => {
  // Caricamento del modello e delle animazioni
  const touchStartRef = useRef(null);
  const speed = 0.05;
  const [blockedUp, setBlockedUp] = useState(false);
  const [blockedDown, setBlockedDown] = useState(false);
  const [blockedLeft, setBlockedLeft] = useState(false);
  const [blockedRight, setBlockedRight] = useState(false);
  const model = useFBX("/models/character.fbx");
  const idleAnim = useFBX("/animations/idle.fbx");
  const walkAnim = useFBX("/animations/walk.fbx");
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const [currentAction, setCurrentAction] = useState(null);
  const characterRef = useRef();
  const velocity = useRef(new THREE.Vector3()); // Velocità del movimento
  const direction = useRef(new THREE.Vector3()); // Direzione del movimento
  const collisionBox = useRef(); // Box di collisione
  const collisionBoxGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.2); // Dimensioni box collisione
  const collisionBoxMaterial = new THREE.MeshBasicMaterial({
    transparent: true, // Abilita la trasparenza
    opacity: 1,
    wireframe: true, // Per visualizzare la rete wireframe
  });

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
    if (!characterRef.current) return;

    // Aggiorna la collision box
    collisionBox.current.updateMatrixWorld(true);
    const characterBox = new THREE.Box3().setFromObject(collisionBox.current);

    let isBlocked = { up: false, down: false, left: false, right: false };

    for (const wall of walls) {
      if (characterBox.intersectsBox(wall)) {
        if (direction.current.z > 0) isBlocked.up = true;
        if (direction.current.z < 0) isBlocked.down = true;
        if (direction.current.x > 0) isBlocked.left = true;
        if (direction.current.x < 0) isBlocked.right = true;
      }
    }

    setBlockedUp(isBlocked.up);
    setBlockedDown(isBlocked.down);
    setBlockedLeft(isBlocked.left);
    setBlockedRight(isBlocked.right);

    // Se bloccato, ferma il movimento
    if (isBlocked.up || isBlocked.down || isBlocked.left || isBlocked.right) {
      velocity.current.set(0, 0, 0);
    }
  });

  // Gestione dei movimenti con i tasti
  useEffect(() => {
    const handleKeyDown = (event) => {
      let movement = new THREE.Vector3();

      // Imposta la direzione in base al tasto premuto
      if (!blockedUp && (event.key === "w" || event.key === "ArrowUp")) {
        movement.set(0, 0, speed); // Movimento in avanti (positiva Z)
      } else if (
        !blockedDown &&
        (event.key === "s" || event.key === "ArrowDown")
      ) {
        movement.set(0, 0, -speed); // Movimento indietro (negativa Z)
      } else if (
        !blockedLeft &&
        (event.key === "a" || event.key === "ArrowLeft")
      ) {
        movement.set(speed, 0, 0); // Movimento a sinistra (positiva X)
      } else if (
        !blockedRight &&
        (event.key === "d" || event.key === "ArrowRight")
      ) {
        movement.set(-speed, 0, 0); // Movimento a destra (negativa X)
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
        //actionsRef.current.walk.reset().fadeIn(0.2).play();
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
      //const offset = new THREE.Vector3(0, 10, -11);

      //offset test
      const offset = new THREE.Vector3(0, 4, -9);

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

      if (direction.current.z > 0) {
        console.log("sopra");

        collisionBox.current.position.set(
          characterRef.current.position.x,
          characterRef.current.position.y + 1,
          characterRef.current.position.z + 0.4
        );
        const scaleX = 0.5;
        const scaleY = 1;
        const scaleZ = 1;
        collisionBox.current.scale.set(scaleX, scaleY, scaleZ);
      }

      if (direction.current.z < 0) {
        console.log("sotto");
        collisionBox.current.position.set(
          characterRef.current.position.x,
          characterRef.current.position.y + 1,
          characterRef.current.position.z - 0.4
        );
        const scaleX = 0.5;
        const scaleY = 1;
        const scaleZ = 1;
        collisionBox.current.scale.set(scaleX, scaleY, scaleZ);
      }

      if (direction.current.x < 0) {
        console.log("destra");
        collisionBox.current.position.set(
          characterRef.current.position.x - 0.4,
          characterRef.current.position.y + 1,
          characterRef.current.position.z
        );
        const scaleX = 0.5;
        const scaleY = 1;
        const scaleZ = 1;
        collisionBox.current.scale.set(scaleX, scaleY, scaleZ);
      }

      if (direction.current.x > 0) {
        console.log("sinistra");
        collisionBox.current.position.set(
          characterRef.current.position.x + 0.4,
          characterRef.current.position.y + 1,
          characterRef.current.position.z
        );
        const scaleX = 0.5;
        const scaleY = 1;
        const scaleZ = 1;
        collisionBox.current.scale.set(scaleX, scaleY, scaleZ);
      }
    }
  });

  // 💡 AGGIUNGI SUPPORTO TOUCH 💡
  useEffect(() => {
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        touchStartRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (event) => {
      if (!touchStartRef.current || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      let movement = new THREE.Vector3();

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 20 && !blockedRight) {
          movement.set(-speed, 0, 0);
        } else if (deltaX < -20 && !blockedLeft) {
          movement.set(speed, 0, 0);
        }
      } else {
        if (deltaY > 20 && !blockedDown) {
          movement.set(0, 0, -speed);
        } else if (deltaY < -20 && !blockedUp) {
          movement.set(0, 0, speed);
        }
      }

      velocity.current.set(movement.x, 0, movement.z);
      direction.current.set(movement.x, 0, movement.z);

      if (currentAction !== actionsRef.current.walk) {
        setCurrentAction(actionsRef.current.walk);
      }
    };

    const handleTouchEnd = () => {
      velocity.current.set(0, 0, 0);
      if (currentAction !== actionsRef.current.idle) {
        setCurrentAction(actionsRef.current.idle);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentAction, blockedUp, blockedDown, blockedLeft, blockedRight]);

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
