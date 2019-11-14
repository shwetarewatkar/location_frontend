import React, { Component } from 'react';
import axios from 'axios';
import socketIOClient from "socket.io-client";
import { Observable } from 'rxjs';

// Connection URL of socket server 
// const socket = socketIOClient("http://localhost:3001");
const socket = socketIOClient("https://ls.shwetarewatkar.com:3001");

export default class Service extends Component {

    // Connection URL of node server  
    // apiURL = "http://localhost:3000";
    apiURL = "https://ls.shwetarewatkar.com:3000";

    // Globlly Declared invite link
    domail = "https://ls.shwetarewatkar.com/invite?id=";
    shareDomail = "https://ls.shwetarewatkar.com/sharelink";
    // domail = "http://localhost:3002/invite?id=";
    // shareDomail = "http://localhost:3002/sharelink";

    // Reconnection of socket server
    reconnect(e, Data) {
        if (socket == null) {
            return socket.on('connect', () => {
                socket.emit('req', { event: e, data: Data });
            });
        }
    }

    // Node server api for registration
    postdata(data) {
        return axios.post(`${this.apiURL}/location/add`, data);
    }

    // Send request on socket server 
    senddata(e, Data) {
        //send user data over socket 
        console.log("send user data:- ", Data);
        return socket.emit('req', { event: e, data: Data });
    }

    // Receive response from socket server
    getdata() {
        return Observable.create((observer) => {
            socket.on('res', (data) => {
                observer.next(data);
            });
        });
    }

    // OFF all socket server event
    offsocket() {
        return socket.off('res');
    }

    // Disconnect socket
    disconnect() {
        return socket.on('disconnect', (reason) => {
            console.log("disconnected:- ", reason);
        });
    }

}
