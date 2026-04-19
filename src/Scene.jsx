import { PerspectiveCamera, Sky, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Character from "./Character";
import City from "./City";
import Header from "./Header";
import Info from "./Info";
import Preloader from "./Preloader";
import Ui from "./Ui";
import cameraPositions from "./cameraPositions";

const Scene = ({ selectedCharacter, setSelectedCharacter }) => {
  const cameraRef = useRef();
  const [animation, setAnimation] = useState("");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [cameraIndex, setCameraIndex] = useState(0);

  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      // Deferiamo il cambio di stato per evitare conflitti durante il render
      const timer = setTimeout(() => setLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [progress]);

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
        selectedCharacter={selectedCharacter}
        setSelectedCharacter={setSelectedCharacter}
      />
      <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}>
        <PerspectiveCamera
          position={[10, 4, 10]}
          makeDefault
          ref={cameraRef}
        />
        <color attach="background" args={["#87CEEB"]} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[2, 12, 2]} 
          intensity={1.0} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <Character
          key={selectedCharacter}
          cameraRef={cameraRef}
          cameraPositions={cameraPositions}
          cameraIndex={cameraIndex}
          setCameraIndex={setCameraIndex}
          animation={animation}
          setAnimation={setAnimation}
          selectedCharacter={selectedCharacter}
        />
        <City />
      </Canvas>
    </>
  );
};

export default Scene;
