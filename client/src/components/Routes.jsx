import React from "react";
import App from "../App";
import Signup from "./Signup";
import Login from "./Login";
import UserProfile from "./Profile";

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
    },
    {
        path: "/profile",
        element: <UserProfile />
    }

]

export default routes;