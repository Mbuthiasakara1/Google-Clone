import React from "react";
import Signup from "./Signup";
import Login from "./Login";
import UserProfile from "./Profile";
import Home from "./Home";
import Sidebar from "./Sidebar";
import Drive from "./Drive";
import Trash from "./Trash";

const routes = [
    {
        path: "/home",
        element: <Home />
    
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/profile",
        element: <UserProfile />
    },
    {
        path:'/my-drive',
        element:<Drive />
        
    },
    {
        path:"/sidebar",
        element:<Sidebar/>
    },
    {
        path:"/trash",
        element:<Trash />
    }

]
 

export default routes;