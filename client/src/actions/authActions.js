import { GET_ERRORS } from './types';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { SET_CURRENT_USER } from './types';

//Register User 
export const registeruser = (userData, history)=> dispatch => {
    axios.post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err => 
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }));
};

// Login - get user token 

export const loginUser = (userData) => dispatch => {
    axios.post('/api/users/login', userData) 
        .then(res => {
            // save to local storage 
            const { token } = res.data;
            // set to local storage
            localStorage.setItem('jwtToken', token);
            //set token to auth header 
            setAuthToken(token);
            //decode token 
            const decoded = jwt_decode(token);
            // set curr user 
            dispatch(setCurrentUser(decoded));
        })
        .catch(err =>{
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        });
};

//set logged in user 
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}