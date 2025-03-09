import React from "react";
import { RiCloseCircleFill } from "react-icons/ri";

const Info = ({ setInfo }) => {
  return (
    <>
      <div className="overlay">
        <div className="modal">
          <RiCloseCircleFill onClick={() => setInfo(false)} className="close" />
          <h3>Third person controller</h3>
          Example of third person controller developer in React Three Fiber
          <br />
          Character and animations by Mixamo
          <br />
          Character movement via keys or touch
          <br />
          Collision system between character and walls of the scenario
          <br />
          Animation change between idle and walk
          <br />
          6 different cameras and 12 animations
          <br />
          <br />
          <b>character and animations</b>
          <br />
          <a href="https://www.mixamo.com/" target="_blank">
            https://www.mixamo.com/
          </a>
          <br /> <br />
          <b>city</b>
          <br />
          <a
            href="https://sketchfab.com/3d-models/city-deb4dc75e62346c19c117bf61334eeb5"
            target="_blank"
          >
            https://sketchfab.com/3d-models/city-deb4dc75e62346c19c117bf61334eeb5
          </a>
        </div>
      </div>
    </>
  );
};

export default Info;
