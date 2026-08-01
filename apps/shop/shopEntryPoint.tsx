import "./index.css";
import ShopApp from "./shopApp.tsx";
import {createRoot} from "react-dom/client";
import {env} from "@coreModule/helpers/env.ts";

void env;

createRoot(document.getElementById("root")!).render(<ShopApp />);
