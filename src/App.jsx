import React from "react";
import Scene from "./Scene";
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Scene />
    </ErrorBoundary>
  );
};

export default App;
