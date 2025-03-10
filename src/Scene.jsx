import { PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import Character from "./Character";
import City from "./City";
import Header from "./Header";
import Info from "./Info";
import Preloader from "./Preloader";
import Ui from "./Ui";
import cameraPositions from "./cameraPositions";

const Scene = () => {
  const cameraRef = useRef();
  const [animation, setAnimation] = useState("");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [cameraIndex, setCameraIndex] = useState(0);

  return (
    <>
      {loading && <Preloader />}
      {info && <Info setInfo={setInfo} />}
      <Header setInfo={setInfo} />
        <Ui
          cameraIndex={cameraIndex}
          setCameraIndex={setCameraIndex}
          animation={animation}
          setAnimation={setAnimation}
          uiVisible={uiVisible}
          setUiVisible={setUiVisible}
        />
        <Canvas>
          <PerspectiveCamera
            position={[10, 4, 10]}
            makeDefault
            ref={cameraRef}
          />
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
        </Canvas>
    </>
  );
};

export default Scene;
