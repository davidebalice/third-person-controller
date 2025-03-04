import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Character = ({ cameraRef }) => {
  const model = useFBX("/models/character.fbx");
  const idleAnim = useFBX("/animations/idle.fbx");
  const walkAnim = useFBX("/animations/walk.fbx");

  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const [currentAction, setCurrentAction] = useState(null);
  const modelRef = useRef();
  const velocity = useRef(new THREE.Vector3()); // Velocità del movimento
  const direction = useRef(new THREE.Vector3()); // Direzione del movimento
  const collisionBox = useRef(); //box che avvolge il personaggio e gestirà le collisioni
  const collisionBoxGeometry = new THREE.BoxGeometry(1, 1.8, 1); // Adatta le dimensioni a quelle del tuo personaggio
  const collisionBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000, // Colore rosso per visibilità
    wireframe: true, // Per renderlo visibile come una rete wireframe
  });

  const walls = [
    new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 5, -4)), // Muro invisibile di esempio
    new THREE.Box3(new THREE.Vector3(5, 0, -5), new THREE.Vector3(10, 5, 5)), // Altro muro invisibile
    new THREE.Box3(new THREE.Vector3(-5, 0, 5), new THREE.Vector3(5, 5, 10)), // E un altro
  ];

  const checkCollision = (movement) => {
    const newPosition = modelRef.current.position.clone().add(movement);

    // Crea un Box3 per il personaggio con dimensioni realistiche
    const characterBox = new THREE.Box3().setFromObject(collisionBox.current);

    for (const wall of walls) {
      // Controlla la collisione tra il personaggio e ogni muro
      if (characterBox.intersectsBox(wall)) {
        return true; // Collisione trovata
      }
    }
    return false;
  };

  useEffect(() => {
    if (collisionBox.current && modelRef.current) {
      collisionBox.current.position.copy(modelRef.current.position);
    }
  }, [modelRef.current?.position]);

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

      actionsRef.current.idle.loop = THREE.LoopRepeat; // Loop infinito per idle
      actionsRef.current.walk.loop = THREE.LoopRepeat; // Loop infinito per camminata

      return () => mixer.stopAllAction();
    }
  }, [model, idleAnim, walkAnim]);

  useEffect(() => {
    if (currentAction) {
      // Stop tutte le animazioni e riproduci solo quella corrente
      Object.values(actionsRef.current).forEach((action) => {
        // Fade out lento per evitare T-pose
        if (action !== currentAction) {
          action.fadeOut(0.5); // Impostiamo una dissolvenza di 0.5 secondi
        }
      });

      currentAction
        .reset()
        .fadeIn(0.2) // Inizia l'animazione attuale con fade-in
        .play();
    }
  }, [currentAction]);

  useEffect(() => {
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      if (mixerRef.current) mixerRef.current.update(clock.getDelta());

      if (modelRef.current) {
        modelRef.current.position.add(velocity.current);
        modelRef.current.rotation.y = Math.atan2(
          direction.current.x,
          direction.current.z
        ); // Gira verso la direzione del movimento
      }
    };
    animate();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      let movement = new THREE.Vector3();

      // Gestisci la direzione in base al tasto premuto
      if (event.key === "w" || event.key === "ArrowUp") {
        movement.set(0, 0, 0.05); // Movimento in avanti (positiva Z)
      } else if (event.key === "s" || event.key === "ArrowDown") {
        movement.set(0, 0, -0.05); // Movimento indietro (negativa Z)
      } else if (event.key === "a" || event.key === "ArrowLeft") {
        movement.set(0.05, 0, 0); // Movimento a sinistra (positiva X)
      } else if (event.key === "d" || event.key === "ArrowRight") {
        movement.set(-0.05, 0, 0); // Movimento a destra (negativa X)
      }

      // Controllo collisione
      if (checkCollision(movement)) {
        return; // Se c'è una collisione, non muovere il personaggio
      }

      // Impostiamo la direzione e la velocità
      if (movement.x !== 0) {
        direction.current.set(movement.x > 0 ? 1 : -1, 0, 0); // X positivo o negativo
        velocity.current.set(movement.x, 0, 0);
      } else if (movement.z !== 0) {
        direction.current.set(0, 0, movement.z > 0 ? 1 : -1); // Z positivo o negativo
        velocity.current.set(0, 0, movement.z);
      }

      // Cambia l'animazione solo se non è già in cammino
      if (currentAction !== actionsRef.current.walk) {
        setCurrentAction(actionsRef.current.walk); // Animazione camminata
      }
    };

    const handleKeyUp = (event) => {
      // Stop il movimento quando si rilascia il tasto
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
        // Se il personaggio non si sta muovendo, passa a idle senza glitch
        if (
          velocity.current.length() === 0 &&
          currentAction !== actionsRef.current.idle
        ) {
          setCurrentAction(actionsRef.current.idle); // Cambia a idle senza animazione T
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

  useFrame(() => {
    if (cameraRef.current && modelRef.current) {
      const offset = new THREE.Vector3(0, 10, -11);
      // Verifica se cameraRef è definito prima di tentare di accedere a `lerp`
      if (cameraRef.current) {
        cameraRef.current.position.lerp(
          modelRef.current.position.clone().add(offset),
          0.1
        );
        cameraRef.current.lookAt(modelRef.current.position);
      }
    }
    // Aggiorna la posizione del box di collisione
    if (collisionBox.current && modelRef.current) {
      collisionBox.current.position.copy(modelRef.current.position);
      collisionBox.current.position.set(
        modelRef.current.position.x,
        modelRef.current.position.y + 1,
        modelRef.current.position.z
      );
    }
  });

  return (
    <>
      <primitive ref={modelRef} object={model} scale={0.01} />
      {/* Box di collisione visibile */}
      <mesh
        ref={collisionBox}
        geometry={collisionBoxGeometry}
        material={collisionBoxMaterial}
        position={modelRef.current?.position}
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
