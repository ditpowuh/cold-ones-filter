import * as ReactDOM from "react-dom/client";
import {StrictMode} from "react";

import {ReactLenis} from "lenis/react";

import "lenis/dist/lenis.css";
import "./globals.css";

import App from "./App.tsx";

const lenisOptions = {
  autoRaf: true,
  stopInertiaOnNavigate: true,
  autoToggle: true, anchors: true,
  allowNestedScroll: true,
  naiveDimensions: true
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactLenis root options={lenisOptions}>
      <App/>
    </ReactLenis>
  </StrictMode>
);
