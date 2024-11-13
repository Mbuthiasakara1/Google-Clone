import React from "react";
import App from "../App";
import Signup from "./Signup";
import Login from "./Login";
import UserProfile from "./Profile";
import Home from "./Home";
import Sidebar from "./Sidebar";
import Container from "./Container";

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
    },
    {
        path:'/home',
        element:<Home />
    },
    {
        path:'/my-drive',
        element:<Container />
    },
    {
        path:"/sidebar",
        element:<Sidebar/>
    }

]
 

export default routes;