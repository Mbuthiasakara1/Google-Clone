import React from "react";
import App from "../App";
import Signup from "./Signup";

const routes = [
    {
        path: "/",
        element: <App />
    },
    {
        path: "/signup",
        element: <Signup />
    }
]

export default routes;