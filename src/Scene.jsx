import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import Character from "./Character";
import City from "./City";

const Scene = () => {
  const cameraRef = useRef();

  return (
    <Canvas shadow>
      <PerspectiveCamera position={[10, 4, 10]} makeDefault ref={cameraRef} />
      <Sky
        distance={1000}
        sunPosition={[100, 100, 100]}
        turbidity={10}
        rayleigh={1}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.1} />
      <Character cameraRef={cameraRef} />
      <City />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
