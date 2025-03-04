import { Environment, useGLTF } from "@react-three/drei";


export default function City({}) {
  const city = useGLTF("./models/city.gltf");
/*
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setLoading(false);
    }
  }, [progress]);
*/
  return (
    <>
      <Environment preset="warehouse" />

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



