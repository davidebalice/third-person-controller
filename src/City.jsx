import { Environment, useGLTF, useProgress } from "@react-three/drei";
import React, { useEffect } from "react";

export default function City() {
  const city = useGLTF("./models/city.gltf");

  useEffect(() => {
    if (city) {
      city.scene.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true; 
        }
      });
    }
  }, [city]);

  return (
    <>
      <Environment preset="city" />

      <primitive
        object={city.scene}
        position-x={-5}
        position-y={-2.5}
        position-z={-1}
        scale={[0.15, 0.15, 0.15]}
        rotation={[0, 0, 0]}
      ></primitive>
    </>
  );
}
