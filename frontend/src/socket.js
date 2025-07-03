// src/socket.js
import { io } from 'socket.io-client';

//const socket = io('https://wee-lemming-harishdemolookinahh-5819fbe3.koyeb.app/'); // change this to your backend URL if deployed

const socket = io('https://wee-lemming-harishdemolookinahh-5819fbe3.koyeb.app/', {
  transports: ['websocket'],
  withCredentials: true, // force WebSocket only
});


export default socket;
