import React from "react";

const Ui = ({ cameraIndex, setCameraIndex, animation, setAnimation }) => {
  return (
    <>
      <div onClick={() => setCameraIndex(0)}>1</div>
      <div onClick={() => setCameraIndex(1)}>2</div>
      <div onClick={() => setCameraIndex(2)}>3</div>
      <div onClick={() => setAnimation("greetings")}>greetings</div>
      <div onClick={() => setAnimation("dance")}>dance</div>
      <div onClick={() => setAnimation("dance2")}>dance2</div>
      <div onClick={() => setAnimation("run")}>run</div>
      <div onClick={() => setAnimation("victory")}>victory</div>
      <div onClick={() => setAnimation("boxe")}>boxe</div>
      <div onClick={() => setAnimation("guitar")}>guitar</div>
      <div onClick={() => setAnimation("jump")}>jump</div>
      <div onClick={() => setAnimation("kick")}>kick</div>
      <div onClick={() => setAnimation("kick2")}>kick2</div>
      <div onClick={() => setAnimation("roll")}>roll</div>
      <div onClick={() => setAnimation("flip")}>flip</div>
    </>
  );
};

export default Ui;
