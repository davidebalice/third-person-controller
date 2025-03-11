import React, { useEffect, useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { RiDeleteBack2Fill } from "react-icons/ri";
import animations from "./animations";

const Ui = ({ setCameraIndex, setAnimation, uiVisible, setUiVisible }) => {
  const [isMoving, setIsMoving] = useState(false);

  //funzione che rileva se il dispositivo è touch
  const useIsTouchDevice = () => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
      const checkTouch = () => {
        setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
      };

      checkTouch();
      window.addEventListener("resize", checkTouch);
      return () => window.removeEventListener("resize", checkTouch);
    }, []);

    return isTouch;
  };

  const isTouchDevice = useIsTouchDevice();

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
      {!uiVisible && (
        <>
          <div className="openContainer">
            <IoMdArrowDropright
              className="open"
              onClick={() => setUiVisible(true)}
            />
          </div>
        </>
      )}

      <div className={`controls ${isTouchDevice && "open"}`}>
        <button
          onTouchStart={() => handleClick("w")}
          onTouchEnd={() => handleRelease("w")}
          className="controlsButtons buttonUp"
        />

        <button
          onTouchStart={() => handleClick("s")}
          onTouchEnd={() => handleRelease("s")}
          className="controlsButtons buttonDown"
        />

        <button
          onTouchStart={() => handleClick("a")}
          onTouchEnd={() => handleRelease("a")}
          className="controlsButtons buttonLeft"
        />
        <button
          onTouchStart={() => handleClick("d")}
          onTouchEnd={() => handleRelease("d")}
          className="controlsButtons buttonRight"
        />
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
              <div
                className="ui-button"
                onClick={() => setAnimation(item)}
                key={item}
              >
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
