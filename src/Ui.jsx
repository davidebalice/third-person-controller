import React, { useEffect, useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { RiDeleteBack2Fill } from "react-icons/ri";
import animations from "./animations";

const Ui = ({ setCameraIndex, setAnimation, uiVisible, setUiVisible, selectedCharacter, setSelectedCharacter }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [characterModalVisible, setCharacterModalVisible] = useState(false);

  const characters = [
    { name: "ADAM", path: "/models/AdamAnim/AdamAnim.fbx", role: "WARRIOR", hp: "120", speed: "Medium", desc: "A powerful ancient warrior with great strength.", image: "/assets/adam.jpg" },
    { name: "GENERIC BOY", path: "/models/character.fbx", role: "ASSAULT", hp: "100", speed: "Fast", desc: "A balanced and reliable unit, perfect for standard operations.", image: "/assets/genericboy.jpg" },
    { name: "???", path: "", role: "LOCKED", hp: "???", speed: "???", desc: "Coming soon...", image: "/assets/placeholder.png" },
    { name: "???", path: "", role: "LOCKED", hp: "???", speed: "???", desc: "Coming soon...", image: "/assets/placeholder.png" },
  ];

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

      {characterModalVisible && (
        <div className="premium-overlay">
          <div className="premium-modal">
            <div className="premium-modal-header">
              <h2>CHARACTER SELECTION</h2>
              <div
                className="premium-close-btn"
                onClick={() => setCharacterModalVisible(false)}
              >
                <span>✕</span>
              </div>
            </div>

            <div className="premium-character-grid">
              {characters.map((char, index) => {
                const isSelected = selectedCharacter === char.path;
                return (
                  <div
                    key={index}
                    className={`premium-character-card ${isSelected ? 'active' : ''} ${char.role === 'LOCKED' ? 'locked' : ''}`}
                    onClick={() => {
                      if (char.role === 'LOCKED') return;
                      setSelectedCharacter(char.path);
                      // setCharacterModalVisible(false); // Let user see the selection effect, maybe close manually
                    }}
                  >
                    <div className="premium-card-image" style={{ backgroundImage: `url(${char.image})` }}>
                      {isSelected && <div className="premium-card-badge">DEPLOYED</div>}
                    </div>
                    <div className="premium-card-content">
                      <h3 className="premium-card-name" style={{ textAlign: 'center', marginBottom: '20px' }}>{char.name}</h3>

                      <button className="premium-select-btn">
                        {char.role === 'LOCKED' ? 'LOCKED' : (isSelected ? 'SELECTED' : 'SELECT')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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

        <div className="ui-title">Personaggio</div>
        <div className="ui-body">
          <div
            className="premium-ui-btn"
            onClick={() => setCharacterModalVisible(true)}
          >
            Select Character
          </div>
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
