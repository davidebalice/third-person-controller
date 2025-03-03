import React from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Character from "./Character";

const Scene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.1} />
      <Character />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
