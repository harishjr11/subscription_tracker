// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5500'); // change this to your backend URL if deployed

export default socket;
