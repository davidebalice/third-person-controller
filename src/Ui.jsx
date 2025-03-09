import React from "react";
import animations from "./animations";

const Ui = ({ cameraIndex, setCameraIndex, animation, setAnimation }) => {
  return (
    <>
      <div className="ui">
        <div className="ui-title">Camera</div>
        <div className="ui-body">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="ui-button"
              onClick={() => setCameraIndex(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="ui-title">Animations</div>
        <div className="ui-body">
          {animations &&
            animations.map((item) => (
              <div className="ui-button" onClick={() => setAnimation(item)}>
                {item}
              </div>
            ))}
        </div>
        <div className="ui-title"><a href="https://www.davidebalice.dev" target="_blank">www.davidebalice.dev</a></div>
      </div>
    </>
  );
};

export default Ui;
