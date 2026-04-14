import React, { useState } from "react";
import Scene from "./Scene";

const App = () => {
  const [selectedCharacter, setSelectedCharacter] = useState("/models/AdamAnim/AdamAnim.fbx");

  return <Scene selectedCharacter={selectedCharacter} setSelectedCharacter={setSelectedCharacter} />;
};

export default App;
