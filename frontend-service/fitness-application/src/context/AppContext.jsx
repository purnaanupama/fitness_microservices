import React, { createContext, useState } from 'react'
import { AppConstants } from '../utils/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export const AppContext = createContext();


export const AppContextProvider = (props) =>{
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(null)
    const navigate = useNavigate();

    //Get User Profile
    const getUserData = async () => {
        try {
           const response = await axios.get(`${AppConstants.BACKEND_URL}/api/users/profile`, { withCredentials: true });
           if(response.status === 200){
              setUserData(response.data); 
              console.log(response.data);
              setIsLoggedIn(true);
           } else {
            toast.error(`Error : ${response.data.error}`, {
                className: "custom-toast",
                });
              console.error("Auth error:", response.data.error);
           }
        } catch (error) {
           if(error.response.data.error == "Unauthorized"){
            navigate("/login");
            return;
           }
           toast.error(`Error : ${error.response.data.error}`, {
            className: "custom-toast",
            });
             
        }
    }

    const contextValue = {
       backendURL:AppConstants.BACKEND_URL,
       isLoggedIn,
       setIsLoggedIn,
       userData,
       setUserData,
       getUserData
    }
    return(
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    )
}