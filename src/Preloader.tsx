import React from "react";
import { useProgress } from "@react-three/drei";
import logo from "../public/assets/textures/logoWhite.png";
import "./style.css";

const Preloader = () => {
  const { progress } = useProgress();

  return (
    <div className="preloader">
      <img src={logo} className="logoPreloader" />
      <div className="spinner"></div>
    </div>
  );
};

export default Preloader;
