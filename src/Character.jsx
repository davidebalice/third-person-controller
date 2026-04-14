import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import walls from "./walls";

const Character = ({
  cameraRef,
  cameraPositions,
  cameraIndex,
  setCameraIndex,
  animation,
  setAnimation,
  selectedCharacter
}) => {
  const touchStartRef = useRef(null);
  const speed = 0.05;
  const [currentAction, setCurrentAction] = useState(null);
  
  // Tracking dei tasti premuti con ref per evitare stale state
  const keysPressed = useRef({});

  // Caricamento del modello del personaggio
  const model = useFBX(selectedCharacter);
  //caricamento animazioni
  const idleAnim = useFBX("/animations/idle.fbx");
  const walkAnim = useFBX("/animations/walk.fbx");
  const greetingsAnim = useFBX("/animations/greetings.fbx");
  const danceAnim = useFBX("/animations/dance.fbx");
  const dance2Anim = useFBX("/animations/dance2.fbx");
  const runAnim = useFBX("/animations/run.fbx");
  const victoryAnim = useFBX("/animations/victory.fbx");
  const boxeAnim = useFBX("/animations/boxe.fbx");
  const guitarAnim = useFBX("/animations/guitar.fbx");
  const jumpAnim = useFBX("/animations/jump.fbx");
  const kickAnim = useFBX("/animations/kick.fbx");
  const kick2Anim = useFBX("/animations/kick2.fbx");
  const rollAnim = useFBX("/animations/roll.fbx");
  const flipAnim = useFBX("/animations/flip.fbx");
  //
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const characterRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const velocity = useRef(new THREE.Vector3()); // Velocità del movimento
  const direction = useRef(new THREE.Vector3(0, 0, -1)); // Direzione del movimento
  const collisionBox = useRef(); // Box di collisione
  const collisionBoxGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.4); // Dimensioni box collisione
  //box collisione che avvolte il character
  const collisionBoxMaterial = new THREE.MeshBasicMaterial({
    transparent: true, // Abilita la trasparenza
    opacity: 0,
    wireframe: true, // Per visualizzare la rete wireframe
  });

  // Helper per slegare le animazioni dal prefisso mixamorig (rimuove mixamorig, mixamorig6, ecc.)
  const fixRigNames = (obj) => {
    if (!obj) return;
    obj.traverse((n) => {
      if (n.name) {
        n.name = n.name.replace(/^mixamorig\d*[:_]?/, "");
      }
    });
  };

  // Funzione per rinfrescare il binding della mesh dopo aver rinominato le ossa
  const refreshBinding = (obj) => {
    if (!obj) return;
    obj.traverse((n) => {
      if (n.isSkinnedMesh) {
        // Forza l'aggiornamento della matrice e riapplica il binding
        n.updateMatrixWorld(true);
        if (n.skeleton) {
          n.bind(n.skeleton, n.matrixWorld);
        }
      }
    });
  };

  const fixAnimationClips = (clips) => {
    if (!clips) return;
    clips.forEach((clip) => {
      clip.tracks.forEach((track) => {
        // Rimuove globalmente il prefisso mixamorig (es. mixamorig6:Hips -> Hips)
        // Il flag 'g' assicura che venga rimosso anche se appare più volte nel path
        track.name = track.name.replace(/mixamorig\d*[:_]?/g, "");
      });
    });
  };

  // Caricamento e configurazione delle animazioni del modello
  useEffect(() => {
    if (model) {
      fixRigNames(model);
      refreshBinding(model);
      
      // Store arm references and brighten materials
      model.traverse((n) => {
        if (n.name === "LeftArm") leftArmRef.current = n;
        if (n.name === "RightArm") rightArmRef.current = n;
        
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          if (n.material) {
            // Se è Adam, rendiamo le texture più "brillanti" e vivaci
            if (selectedCharacter.includes("AdamAnim.fbx")) {
              n.material.roughness = 0.7;
              n.material.metalness = 0.1;
              // Un leggero emissivo per il "bagliore" richiesto, ma molto ridotto
              n.material.emissive = new THREE.Color(0x111111);
              n.material.emissiveIntensity = 0.5;
              // Scuriamo leggermente il colore base per rendere le texture "poco poco più scure"
              n.material.color.set(0xcccccc); 
            } else {
              // Per gli altri personaggi, un miglioramento più leggero
              n.material.roughness = Math.max(0.3, n.material.roughness * 0.8);
            }
            
            if (n.material.map) {
                n.material.map.anisotropy = 16;
            }
          }
        }
      });
    }
    if (model && idleAnim && walkAnim) {
      const allAnims = [
        idleAnim, walkAnim, greetingsAnim, danceAnim, dance2Anim,
        runAnim, victoryAnim, boxeAnim, guitarAnim, jumpAnim,
        kickAnim, kick2Anim, rollAnim, flipAnim
      ];

      allAnims.forEach(anim => {
        if (anim && anim.animations) {
          // CLONIAMO le animazioni per evitare conflitti tra personaggi
          anim.animations = anim.animations.map(clip => {
            const newClip = clip.clone();
            if (selectedCharacter.includes("AdamAnim.fbx")) {
              newClip.tracks = newClip.tracks.filter(track => {
                return !/Thumb|Index|Middle|Ring|Pinky|Toe|LeftHand/i.test(track.name);
              });
            }
            fixAnimationClips([newClip]);
            return newClip;
          });
        }
      });

      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      actionsRef.current = {
        idle: mixer.clipAction(idleAnim.animations[0]),
        walk: mixer.clipAction(walkAnim.animations[0]),
        greetings: mixer.clipAction(greetingsAnim.animations[0]),
        dance: mixer.clipAction(danceAnim.animations[0]),
        dance2: mixer.clipAction(dance2Anim.animations[0]),
        run: mixer.clipAction(runAnim.animations[0]),
        victory: mixer.clipAction(victoryAnim.animations[0]),
        boxe: mixer.clipAction(boxeAnim.animations[0]),
        guitar: mixer.clipAction(guitarAnim.animations[0]),
        jump: mixer.clipAction(jumpAnim.animations[0]),
        kick: mixer.clipAction(kickAnim.animations[0]),
        kick2: mixer.clipAction(kick2Anim.animations[0]),
        roll: mixer.clipAction(rollAnim.animations[0]),
        flip: mixer.clipAction(flipAnim.animations[0]),
      };

      setCurrentAction(actionsRef.current.idle);
      actionsRef.current.idle.play();

      actionsRef.current.idle.loop = THREE.LoopRepeat;
      actionsRef.current.walk.loop = THREE.LoopRepeat;

      return () => mixer.stopAllAction();
    }
  }, [model, idleAnim, walkAnim]);

  //funzione per cambiare animazione
  const playAnimation = (actionName) => {
    if (actionsRef.current[actionName]) {
      setCurrentAction(actionsRef.current[actionName]);
      velocity.current.set(0, 0, 0); 
    }
  };

  useEffect(() => {
    if (animation !== "") {
      playAnimation(animation);
    }
  }, [animation]);

  // Gestione del cambiamento di animazione
  useEffect(() => {
    if (currentAction) {
      Object.values(actionsRef.current).forEach((action) => {
        if (action !== currentAction) {
          action.fadeOut(0.5); 
        }
      });

      currentAction
        .reset()
        .fadeIn(0.2) 
        .play();
    }
  }, [currentAction]);

  // Gestione Input real-time
  useEffect(() => {
    const handleKeyDown = (e) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main Logic Loop (Movement + Collision + Animation State)
  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (!characterRef.current || !collisionBox.current) return;

    // 1. Calcolo movimento desiderato dai tasti
    let moveX = 0;
    let moveZ = 0;
    if (keysPressed.current["w"] || keysPressed.current["ArrowUp"]) moveZ += speed;
    if (keysPressed.current["s"] || keysPressed.current["ArrowDown"]) moveZ -= speed;
    if (keysPressed.current["a"] || keysPressed.current["ArrowLeft"]) moveX += speed;
    if (keysPressed.current["d"] || keysPressed.current["ArrowRight"]) moveX -= speed;

    // Aggiornamento velocità interna
    velocity.current.set(moveX, 0, moveZ);

    // 2. Gestione collisioni a scorrimento (Sliding)
    const currentPos = characterRef.current.position.clone();
    
    // Check assex X
    if (moveX !== 0) {
      const nextX = currentPos.x + moveX;
      collisionBox.current.position.set(nextX, currentPos.y + 1, currentPos.z);
      collisionBox.current.updateMatrixWorld(true);
      const characterBoxX = new THREE.Box3().setFromObject(collisionBox.current);
      
      let collidedX = false;
      for (const wall of walls) {
        if (characterBoxX.intersectsBox(wall)) {
          collidedX = true;
          break;
        }
      }
      if (!collidedX) {
        characterRef.current.position.x = nextX;
      }
    }

    // Check asse Z
    if (moveZ !== 0) {
      const nextZ = characterRef.current.position.z + moveZ;
      collisionBox.current.position.set(characterRef.current.position.x, currentPos.y + 1, nextZ);
      collisionBox.current.updateMatrixWorld(true);
      const characterBoxZ = new THREE.Box3().setFromObject(collisionBox.current);
      
      let collidedZ = false;
      for (const wall of walls) {
        if (characterBoxZ.intersectsBox(wall)) {
          collidedZ = true;
          break;
        }
      }
      if (!collidedZ) {
        characterRef.current.position.z = nextZ;
      }
    }

    // 3. Update Rotazione
    if (moveX !== 0 || moveZ !== 0) {
      direction.current.set(moveX, 0, moveZ);
      characterRef.current.rotation.y = Math.atan2(moveX, moveZ);
      
      // Update animation to walk
      if (currentAction !== actionsRef.current.walk && animation === "") {
        setCurrentAction(actionsRef.current.walk);
        setAnimation("");
      }
    } else {
      // Update animation to idle if no movement and not playing a special animation
      if (currentAction !== actionsRef.current.idle && animation === "") {
        setCurrentAction(actionsRef.current.idle);
      }
    }

    // 4. Update Camera
    if (cameraRef.current) {
      const offset = new THREE.Vector3(
        cameraPositions[cameraIndex].position[0],
        cameraPositions[cameraIndex].position[1],
        cameraPositions[cameraIndex].position[2]
      );
      cameraRef.current.position.lerp(
        characterRef.current.position.clone().add(offset),
        0.1
      );
      cameraRef.current.lookAt(characterRef.current.position);
    }

    // Sync arm references (micro-animations)
    if (leftArmRef.current) leftArmRef.current.rotation.z = -0.3;
    if (rightArmRef.current) rightArmRef.current.rotation.z = 0.3;
  });

  //posizione e rotazione iniziale del character
  useEffect(() => {
    setTimeout(() => {
      if (characterRef.current) {
        characterRef.current.position.z -= 0.01;
        characterRef.current.rotation.y = Math.atan2(0, -1);
      }
    }, 700);
  }, []);

  return (
    <>
      {/* Character */}
      <primitive 
        ref={characterRef} 
        object={model} 
        scale={0.01} 
        position={[0, selectedCharacter.includes("AdamAnim.fbx") ? 0.3 : 0, 0]} 
      />
      {/* Box di collisione (invisibile ma usato per i calcoli) */}
      <mesh
        ref={collisionBox}
        geometry={collisionBoxGeometry}
        material={collisionBoxMaterial}
        visible={false}
      />
      {/* Visualizzazione muri per debug (opzionale, attualmente invisibili) */}
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
          <meshBasicMaterial color="blue" transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
};

export default Character;
