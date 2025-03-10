import React, { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { RiDeleteBack2Fill } from "react-icons/ri";
import animations from "./animations";

const Ui = ({ setCameraIndex, setAnimation, uiVisible, setUiVisible }) => {
  const [isMoving, setIsMoving] = useState(false);

  const handleClick = (key) => {
    // Simula il "keydown"
    if (!isMoving) {
      const event = new KeyboardEvent("keydown", {
        key: key,
        code: `Key${key.toUpperCase()}`,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true,
      });

      window.dispatchEvent(event);
      setIsMoving(true);
    }
  };

  const handleRelease = (key) => {
    // Simula il "keyup"
    const event = new KeyboardEvent("keyup", {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
    });

    window.dispatchEvent(event);
    setIsMoving(false);
  };

  return (
    <>
      <IoMdArrowDropright className="open" onClick={() => setUiVisible(true)} />

      <div className="controls">
        <button
          onTouchStart={() => handleClick("w")}
          onTouchEnd={() => handleRelease("w")}
        >
          ↑
        </button>
        <button
          onTouchStart={() => handleClick("a")}
          onTouchEnd={() => handleRelease("a")}
        >
          ←
        </button>
        <button
          onTouchStart={() => handleClick("d")}
          onTouchEnd={() => handleRelease("d")}
        >
          →
        </button>
        <button
          onTouchStart={() => handleClick("s")}
          onTouchEnd={() => handleRelease("s")}
        >
          ↓
        </button>
      </div>

      <div className={`ui ${!uiVisible && "close"}`}>
        <div className="ui-title spacebetween">
          <div>
            <RiDeleteBack2Fill
              className="back"
              onClick={() => setUiVisible(false)}
            />
          </div>
          <div>Camera</div>
          <div></div>
        </div>
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
        <div className="ui-title">
          <a href="https://www.davidebalice.dev" target="_blank">
            www.davidebalice.dev
          </a>
        </div>
      </div>
    </>
  );
};

export default Ui;
