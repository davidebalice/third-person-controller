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

  // Inizializzazione Unificata (Model Setup + Mixer + Actions)
  useEffect(() => {
    if (model && idleAnim && walkAnim) {
      // 1. Setup del Modello (Posizione, Visibilità)
      model.visible = true;
      if (characterRef.current) {
        characterRef.current.rotation.y = Math.atan2(0, -1);
        characterRef.current.position.z = 0;
      }

      // 2. Fix del Rig (Bones) - Solo se non già fatto sul modello in cache
      if (!model.userData.rigFixed) {
        fixRigNames(model);
        refreshBinding(model);
        model.userData.rigFixed = true;
      }

      // 3. Setup Materiali e Riferimenti
      model.traverse((n) => {
        if (n.name === "LeftArm") leftArmRef.current = n;
        if (n.name === "RightArm") rightArmRef.current = n;
        
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.frustumCulled = false;

          if (n.material) {
            n.material.transparent = false;
            n.material.opacity = 1;
            n.material.visible = true;
            n.material.side = THREE.DoubleSide; 

            const isAdam = selectedCharacter.toLowerCase().includes("adamanim.fbx");
            if (isAdam) {
              n.material.roughness = 0.6;
              n.material.metalness = 0.2;
              n.material.emissive = new THREE.Color(0x222222);
              n.material.emissiveIntensity = 0.1;
              n.material.color.set(0xffffff);
            } else {
              n.material.roughness = Math.max(0.3, n.material.roughness * 0.8);
            }
            
            // Texture cleanup
            const textureProps = ["map", "normalMap", "specularMap", "roughnessMap", "metalnessMap", "emissiveMap"];
            textureProps.forEach(prop => {
              if (n.material[prop]) {
                const tex = n.material[prop];
                if (tex.source?.data?.src) {
                  const src = String(tex.source.data.src);
                  if (src.includes("<UDIM>") || src.includes("%3CUDIM%3E") || src.toLowerCase().includes("udim")) {
                    n.material[prop] = null;
                  }
                }
              }
            });
            if (n.material.map) n.material.map.anisotropy = 16;
          }
        }
      });

      // 4. Creazione Mixer e Binding Animazioni
      // Pulizia mixer precedente se esistente
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current.uncacheRoot(model);
      }

      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      const animationFiles = {
        idle: idleAnim, walk: walkAnim, greetings: greetingsAnim, 
        dance: danceAnim, dance2: dance2Anim, run: runAnim, 
        victory: victoryAnim, boxe: boxeAnim, guitar: guitarAnim, 
        jump: jumpAnim, kick: kickAnim, kick2: kick2Anim, 
        roll: rollAnim, flip: flipAnim
      };

      const newActions = {};

      Object.entries(animationFiles).forEach(([name, anim]) => {
        if (anim?.animations?.[0]) {
          const clonedClip = anim.animations[0].clone();
          clonedClip.name = name;

          // Filtro tracce specifiche per Adam
          if (selectedCharacter.includes("AdamAnim.fbx")) {
            clonedClip.tracks = clonedClip.tracks.filter(track => !/Thumb|Index|Middle|Ring|Pinky|Toe|LeftHand/i.test(track.name));
          }
          
          fixAnimationClips([clonedClip]);

          const action = mixer.clipAction(clonedClip);
          newActions[name] = action;

          // Tutte le animazioni ora sono in loop infinito su richiesta dell'utente
          action.loop = THREE.LoopRepeat;
          action.clampWhenFinished = false;
        }
      });

      actionsRef.current = newActions;

      // Azione Iniziale
      if (actionsRef.current.idle) {
        actionsRef.current.idle.reset().play();
        setCurrentAction(actionsRef.current.idle);
      }

      return () => {
        mixer.stopAllAction();
        mixer.uncacheRoot(model);
      };
    }
  }, [model, idleAnim, walkAnim, selectedCharacter]);

  // Funzione per cambiare animazione
  const playAnimation = (actionName) => {
    const action = actionsRef.current[actionName];
    if (action) {
      if (currentAction === action) {
        action.reset().fadeIn(0.2).play();
      } else {
        setCurrentAction(action);
      }
      velocity.current.set(0, 0, 0); 
    }
  };

  useEffect(() => {
    if (animation && animation !== "") {
      playAnimation(animation);
    }
  }, [animation]);

  // Sincronizzazione dell'azione corrente (Fade e Play)
  useEffect(() => {
    if (currentAction && mixerRef.current) {
      // Transizione rapida: fade out delle altre azioni
      Object.values(actionsRef.current).forEach((action) => {
        if (action !== currentAction && action.isRunning()) {
          action.fadeOut(0.1); 
        }
      });

      // Avvio immediato della nuova azione
      currentAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.1) 
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

    let moveX = 0;
    let moveZ = 0;
    if (keysPressed.current["w"] || keysPressed.current["ArrowUp"]) moveZ += speed;
    if (keysPressed.current["s"] || keysPressed.current["ArrowDown"]) moveZ -= speed;
    if (keysPressed.current["a"] || keysPressed.current["ArrowLeft"]) moveX += speed;
    if (keysPressed.current["d"] || keysPressed.current["ArrowRight"]) moveX -= speed;

    velocity.current.set(moveX, 0, moveZ);

    const currentPos = characterRef.current.position.clone();
    
    // Check assex X
    if (moveX !== 0) {
      const nextX = currentPos.x + moveX;
      collisionBox.current.position.set(nextX, currentPos.y + 1, currentPos.z);
      collisionBox.current.updateMatrixWorld(true);
      const characterBoxX = new THREE.Box3().setFromObject(collisionBox.current);
      let collidedX = false;
      for (const wall of walls) {
        if (characterBoxX.intersectsBox(wall)) { collidedX = true; break; }
      }
      if (!collidedX) characterRef.current.position.x = nextX;
    }

    // Check asse Z
    if (moveZ !== 0) {
      const nextZ = currentPos.z + moveZ;
      collisionBox.current.position.set(characterRef.current.position.x, currentPos.y + 1, nextZ);
      collisionBox.current.updateMatrixWorld(true);
      const characterBoxZ = new THREE.Box3().setFromObject(collisionBox.current);
      let collidedZ = false;
      for (const wall of walls) {
        if (characterBoxZ.intersectsBox(wall)) { collidedZ = true; break; }
      }
      if (!collidedZ) characterRef.current.position.z = nextZ;
    }

    // 3. Update Rotazione e animazioni di base
    if (moveX !== 0 || moveZ !== 0) {
      direction.current.set(moveX, 0, moveZ);
      characterRef.current.rotation.y = Math.atan2(moveX, moveZ);
      
      // Se ci stiamo muovendo, interrompiamo eventuali animazioni speciali
      if (animation !== "") {
        setAnimation("");
      }

      if (actionsRef.current.walk && currentAction !== actionsRef.current.walk) {
        setCurrentAction(actionsRef.current.walk);
      }
    } else {
      if (animation === "" && actionsRef.current.idle && currentAction !== actionsRef.current.idle) {
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

    // Ripristino offset braccia per silhouette (fondamentale per Adam)
    if (leftArmRef.current) leftArmRef.current.rotation.z = -0.3;
    if (rightArmRef.current) rightArmRef.current.rotation.z = 0.3;
  });

  return (
    <>
      {/* Character */}
      <primitive 
        ref={characterRef} 
        object={model} 
        scale={0.01} 
        position={[0, selectedCharacter.includes("AdamAnim.fbx") ? 0.3 : 0, 0]} 
        dispose={null}
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
