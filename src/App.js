import React from "react";
import "./App.css";
import AnnotationTool from "./components/AnnotationTool";

const App = () => {
  return (
    <div className="App">
      <h1>Labelbox Web App</h1>
      <AnnotationTool />
    </div>
  );
};

export default App;
