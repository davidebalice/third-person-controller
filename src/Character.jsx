import { useFBX } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Character = () => {
  const model = useFBX("/models/character.fbx");
  const idleAnim = useFBX("/animations/idle.fbx");
  const walkAnim = useFBX("/animations/walk.fbx");

  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const [currentAction, setCurrentAction] = useState(null);
  const modelRef = useRef();
  const velocity = useRef(new THREE.Vector3()); // Velocità del movimento
  const direction = useRef(new THREE.Vector3()); // Direzione del movimento

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
        modelRef.current.rotation.y = Math.atan2(direction.current.x, direction.current.z); // Gira verso la direzione del movimento
      }
    };
    animate();
  }, []);


  





  useEffect(() => {
    const handleKeyDown = (event) => {
      // Movimento e rotazione
      if (event.key === "w" || event.key === "ArrowUp") {
        // Spostamento in avanti
        if (velocity.current.z === 0 || direction.current.z !== 1) {
          direction.current.set(0, 0, 1); // Direzione avanti (positiva Z)
          velocity.current.set(0, 0, 0.05); // Velocità
          if (currentAction !== actionsRef.current.walk) {
            setCurrentAction(actionsRef.current.walk); // Animazione camminata
          }
        }
      } else if (event.key === "s" || event.key === "ArrowDown") {
        // Spostamento indietro
        if (velocity.current.z === 0 || direction.current.z !== -1) {
          direction.current.set(0, 0, -1); // Direzione indietro (negativa Z)
          velocity.current.set(0, 0, -0.05); // Velocità
          if (currentAction !== actionsRef.current.walk) {
            setCurrentAction(actionsRef.current.walk); // Animazione camminata
          }
        }
      } else if (event.key === "a" || event.key === "ArrowLeft") {
        // Spostamento a sinistra
        if (velocity.current.x === 0 || direction.current.x !== -1) {
          direction.current.set(-1, 0, 0); // Direzione sinistra (negativa X)
          velocity.current.set(-0.05, 0, 0); // Velocità
          if (currentAction !== actionsRef.current.walk) {
            setCurrentAction(actionsRef.current.walk); // Animazione camminata
          }
        }
      } else if (event.key === "d" || event.key === "ArrowRight") {
        // Spostamento a destra
        if (velocity.current.x === 0 || direction.current.x !== 1) {
          direction.current.set(1, 0, 0); // Direzione destra (positiva X)
          velocity.current.set(0.05, 0, 0); // Velocità
          if (currentAction !== actionsRef.current.walk) {
            setCurrentAction(actionsRef.current.walk); // Animazione camminata
          }
        }
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
        if (velocity.current.length() === 0 && currentAction !== actionsRef.current.idle) {
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
  

  
  

  return model ? (
    <primitive ref={modelRef} object={model} scale={0.01} />
  ) : null;
};

export default Character;
