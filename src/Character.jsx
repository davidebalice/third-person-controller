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
  const lowerPath = selectedCharacter.toLowerCase();
  const isAdam = lowerPath.includes("adamanim");
  const isLucky = lowerPath.includes("luckyanim");
  const isEolo = lowerPath.includes("eoloanim");

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

  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const characterRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3(0, 0, -1));
  const collisionBox = useRef();
  const collisionBoxGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.4);
  const collisionBoxMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    wireframe: true,
  });

  const fixRigNames = (obj) => {
    if (!obj) return;
    const boneMapping = {
      "pelvis": "Hips", "hips": "Hips", "spine": "Spine", "spine_01": "Spine",
      "spine_02": "Spine1", "spine_03": "Spine2", "neck_01": "Neck", "neck": "Neck",
      "head": "Head", "clavicle_l": "LeftShoulder", "shoulder_l": "LeftShoulder",
      "upperarm_l": "LeftArm",
      "arm_l": "LeftForeArm",
      "lowerarm_l": "LeftForeArm",
      "forearm_l": "LeftForeArm",
      "hand_l": "LeftHand",
      "clavicle_r": "RightShoulder",
      "shoulder_r": "RightShoulder",
      "upperarm_r": "RightArm",
      "arm_r": "RightForeArm",
      "lowerarm_r": "RightForeArm",
      "forearm_r": "RightForeArm",
      "hand_r": "RightHand",
      "thigh_l": "LeftUpLeg", "upleg_l": "LeftUpLeg", "calf_l": "LeftLeg",
      "leg_l": "LeftLeg", "foot_l": "LeftFoot", "ball_l": "LeftToeBase",
      "thigh_r": "RightUpLeg", "upleg_r": "RightUpLeg", "calf_r": "RightLeg",
      "leg_r": "RightLeg", "foot_r": "RightFoot", "ball_r": "RightToeBase"
    };

    obj.traverse((n) => {
      if (n.name) {
        const oldName = n.name;
        // Rimuove QUALSIASI prefisso (es. Character1_mixamorig:Hips -> Hips)
        // Prendiamo l'ultima parte dopo l'ultimo colonna o underscore se presente
        let newName = n.name;
        if (newName.includes(":")) {
          newName = newName.split(":").pop();
        } else if (newName.includes("_") && !newName.toLowerCase().includes("spine") && !newName.toLowerCase().includes("neck")) {
          // Attenzione a non rompere spine_01 o neck_01
          // Per Mixamo di solito il prefisso è prima del primo underscore dopo mixamorig
        }
        
        // Pulizia standard dei prefissi noti
        newName = newName.replace(/^(mixamorig\d*|FBXASC\d*|Armature|Character|node)[:_]?/i, "");

        const mappedName = boneMapping[newName.toLowerCase()];
        if (mappedName) newName = mappedName;
        if (oldName !== newName) n.name = newName;
      }
    });
  };

  const refreshBinding = (obj) => {
    if (!obj) return;
    obj.traverse((n) => {
      if (n.isSkinnedMesh) {
        n.updateMatrixWorld(true);
        if (n.skeleton) n.bind(n.skeleton, n.matrixWorld);
      }
    });
  };

  const fixAnimationClips = (clips) => {
    if (!clips) return;
    clips.forEach((clip) => {
      clip.tracks.forEach((track) => {
        // Rimuove aggressivamente ogni prefisso dal track name (es. mixamorig:Hips -> Hips)
        if (track.name.includes(":")) {
          track.name = track.name.split(":").pop();
        }
        track.name = track.name.replace(/mixamorig\d*[:_]?/g, "");
      });
    });
  };

  useEffect(() => {
    if (model && idleAnim && walkAnim) {
      model.visible = true;
      if (characterRef.current) {
        characterRef.current.rotation.y = Math.atan2(0, -1);
        characterRef.current.position.z = 0;
      }

      if (!model.userData.rigFixed) {
        fixRigNames(model);
        refreshBinding(model);
        model.userData.rigFixed = true;
      }

      model.traverse((n) => {
        if (n.name === "LeftArm") leftArmRef.current = n;
        if (n.name === "RightArm") rightArmRef.current = n;

        if (n.isMesh || n.isSkinnedMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.frustumCulled = false;
          if (n.material) {
            n.material.transparent = false;
            n.material.opacity = 1;
            n.material.visible = true;
            n.material.side = THREE.DoubleSide;
            if (isAdam) {
              n.material.roughness = 0.6;
              n.material.metalness = 0.2;
              n.material.emissive = new THREE.Color(0x222222);
              n.material.emissiveIntensity = 0.1;
              n.material.color.set(0xffffff);
            } else {
              n.material.roughness = Math.max(0.3, n.material.roughness * 0.8);
            }
          }
        }
      });

      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      const animationFiles = {
        idle: idleAnim, walk: walkAnim, greetings: greetingsAnim, dance: danceAnim,
        dance2: dance2Anim, run: runAnim, victory: victoryAnim, boxe: boxeAnim,
        guitar: guitarAnim, jump: jumpAnim, kick: kickAnim, kick2: kick2Anim,
        roll: rollAnim, flip: flipAnim
      };

      const newActions = {};
      Object.entries(animationFiles).forEach(([name, anim]) => {
        if (anim?.animations?.[0]) {
          const clonedClip = anim.animations[0].clone();
          clonedClip.name = name;
          if (isAdam || isLucky || isEolo) {
             clonedClip.tracks = clonedClip.tracks.filter(track => !/Thumb|Index|Middle|Ring|Pinky|Toe|LeftHand|RightHand/i.test(track.name));
          }
          fixAnimationClips([clonedClip]);
          const action = mixer.clipAction(clonedClip);
          newActions[name] = action;
          action.loop = THREE.LoopRepeat;
        }
      });

      actionsRef.current = newActions;
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

  const playAnimation = (actionName) => {
    const action = actionsRef.current[actionName];
    if (action) {
      if (currentAction === action) action.reset().fadeIn(0.2).play();
      else setCurrentAction(action);
      velocity.current.set(0, 0, 0);
    }
  };

  useEffect(() => {
    if (animation && animation !== "") playAnimation(animation);
  }, [animation]);

  useEffect(() => {
    if (currentAction && mixerRef.current) {
      Object.values(actionsRef.current).forEach((action) => {
        if (action !== currentAction && action.isRunning()) action.fadeOut(0.1);
      });
      currentAction.reset().fadeIn(0.1).play();
    }
  }, [currentAction]);

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

  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (!characterRef.current || !collisionBox.current) return;

    let moveX = 0, moveZ = 0;
    if (keysPressed.current["w"] || keysPressed.current["ArrowUp"]) moveZ += speed;
    if (keysPressed.current["s"] || keysPressed.current["ArrowDown"]) moveZ -= speed;
    if (keysPressed.current["a"] || keysPressed.current["ArrowLeft"]) moveX += speed;
    if (keysPressed.current["d"] || keysPressed.current["ArrowRight"]) moveX -= speed;

    velocity.current.set(moveX, 0, moveZ);
    const currentPos = characterRef.current.position.clone();

    if (moveX !== 0) {
      const nextX = currentPos.x + moveX;
      collisionBox.current.position.set(nextX, currentPos.y + 1, currentPos.z);
      collisionBox.current.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(collisionBox.current);
      let col = false;
      for (const wall of walls) { if (box.intersectsBox(wall)) { col = true; break; } }
      if (!col) characterRef.current.position.x = nextX;
    }

    if (moveZ !== 0) {
      const nextZ = currentPos.z + moveZ;
      collisionBox.current.position.set(characterRef.current.position.x, currentPos.y + 1, nextZ);
      collisionBox.current.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(collisionBox.current);
      let col = false;
      for (const wall of walls) { if (box.intersectsBox(wall)) { col = true; break; } }
      if (!col) characterRef.current.position.z = nextZ;
    }

    if (moveX !== 0 || moveZ !== 0) {
      direction.current.set(moveX, 0, moveZ);
      characterRef.current.rotation.y = Math.atan2(moveX, moveZ);
      if (animation !== "") setAnimation("");
      if (actionsRef.current.walk && currentAction !== actionsRef.current.walk) setCurrentAction(actionsRef.current.walk);
    } else {
      if (animation === "" && actionsRef.current.idle && currentAction !== actionsRef.current.idle) setCurrentAction(actionsRef.current.idle);
    }

    if (cameraRef.current) {
      const offset = new THREE.Vector3(cameraPositions[cameraIndex].position[0], cameraPositions[cameraIndex].position[1], cameraPositions[cameraIndex].position[2]);
      cameraRef.current.position.lerp(characterRef.current.position.clone().add(offset), 0.1);
      cameraRef.current.lookAt(characterRef.current.position);
    }

    // MANUALE OVERRIDE ARMS
    if (isAdam) {
      if (leftArmRef.current) leftArmRef.current.rotation.z = -0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 0.3;
    } else if (isLucky) {
      if (leftArmRef.current) leftArmRef.current.rotation.z = -0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 0.15;
    }
  });

  return (
    <>
      <primitive
        ref={characterRef}
        object={model}
        scale={(isEolo || isLucky) ? 0.0085 : 0.01}
        position={[0, isAdam ? 0.05 : 0, 0]}
        dispose={null}
      />
      <mesh ref={collisionBox} geometry={collisionBoxGeometry} material={collisionBoxMaterial} visible={false} />
      {walls.map((wall, index) => (
        <mesh key={index} position={new THREE.Vector3((wall.min.x + wall.max.x) / 2, 1, (wall.min.z + wall.max.z) / 2)} visible={true}>
          <boxGeometry args={[wall.max.x - wall.min.x, 2, wall.max.z - wall.min.z]} />
          <meshBasicMaterial color="blue" transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
};

export default Character;
