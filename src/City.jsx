import { Environment, useGLTF, useProgress } from "@react-three/drei";
import React, { useEffect } from "react";

export default function City() {
  const city = useGLTF("./models/city.gltf");

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
        castShadow
      ></primitive>
    </>
  );
}
