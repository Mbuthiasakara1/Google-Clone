import React from "react";
import App from "../App";
import Signup from "./Signup";
import Login from "./Login";

const routes = [
    {
        path: "/",
        element: <App />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/login",
        element: <Login />
    }
]

export default routes;