import React from "react";

const Header = ({ setInfo }) => {
  return (
    <>
      <div className="header">
        <div>
          <img src="./public/assets/textures/logo.png" className="dbLogo" />
        </div>
        <div className="headerDx">
          <img
            src="./public/assets/textures/info.png"
            className="githubLogo"
            onClick={() => setInfo(true)}
          />
          <a
            href="https://github.com/davidebalice/third-person-controller"
            target="_blank"
          >
            <img
              src="./public/assets/textures/github.png"
              className="githubLogo"
            />
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
