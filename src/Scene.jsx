import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import Character from "./Character";
import City from "./City";
import Preloader from "./Preloader";
import Ui from "./Ui";

const Scene = () => {
  const cameraRef = useRef();
  const [animation, setAnimation] = useState("");
  const [loading, setLoading] = useState(true);
  const cameraPositions = [
    { position: [0, 10, -11], label: "Camera 1" },
    { position: [0, 50, -11], label: "Camera 2" },
    { position: [0, 4, -9], label: "Camera 3" },
  ];
  //    { position: [0, 10, 20], label: "Camera 1" },

  const [cameraIndex, setCameraIndex] = useState(0);

  return (
    <>
      {loading && <Preloader />}
      <Ui
        cameraIndex={cameraIndex}
        setCameraIndex={setCameraIndex}
        animation={animation}
        setAnimation={setAnimation}
      />
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
        <Character
          cameraRef={cameraRef}
          cameraPositions={cameraPositions}
          cameraIndex={cameraIndex}
          setCameraIndex={setCameraIndex}
          animation={animation}
          setAnimation={setAnimation}
        />
        <City setLoading={setLoading} />
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default Scene;
