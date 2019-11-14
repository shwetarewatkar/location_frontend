
// Import Require Modules

import React, { Component } from 'react';
import Service from '../Services/service';
import CryptoJS from 'crypto-js';
import alertify from 'alertifyjs';

export default class Auth extends React.Component {

    constructor(props) {
        super(props);
        this.services = new Service();
    }

    // Authantication Function connect to Socket
    reconnection() {
        // Get Localstorage Value For Reconnect to Socket

        let decryptedData_uid = localStorage.getItem('uid');
        let decryptedData_email = localStorage.getItem('email');
        let decryptedData_username = localStorage.getItem('username');
        let decryptedData_latitude = localStorage.getItem('latitude');
        let decryptedData_longitude = localStorage.getItem('longitude');

        if (decryptedData_uid != null || decryptedData_email != null || decryptedData_username != null || decryptedData_latitude != null || decryptedData_longitude != null) {

            var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
            var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var bytes_email = CryptoJS.AES.decrypt(decryptedData_email.toString(), 'Location-Sharing');
            var email = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

            var bytes_username = CryptoJS.AES.decrypt(decryptedData_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            var data = {
                uid: uid,
                email: email,
                username: username,
                latitude: decryptedData_latitude,
                longitude: decryptedData_longitude,
                status: false
            }

            // reConnect Socket Event Auth And Get Response on Auth_Status Event
            this.services.reconnect('Auth', data);
            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'Auth_Status':
                        break;
                }
            });

        } else {
            // Disconnect Socket If User Removes Localstorage Value
            this.services.disconnect();

        }
    }

    // Authantication Function connect to Socket
    authantication() {
        // Get Localstorage Value For connect to Socket
        let decryptedData_uid = localStorage.getItem('uid');
        let decryptedData_email = localStorage.getItem('email');
        let decryptedData_username = localStorage.getItem('username');
        let decryptedData_latitude = localStorage.getItem('latitude');
        let decryptedData_longitude = localStorage.getItem('longitude');

        if (decryptedData_uid != null || decryptedData_email != null || decryptedData_username != null || decryptedData_latitude != null || decryptedData_longitude != null) {

            var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
            var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var bytes_email = CryptoJS.AES.decrypt(decryptedData_email.toString(), 'Location-Sharing');
            var email = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

            var bytes_username = CryptoJS.AES.decrypt(decryptedData_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            var data = {
                uid: uid,
                email: email,
                username: username,
                latitude: decryptedData_latitude,
                longitude: decryptedData_longitude,
                status: false
            }

            // Connect Socket Event Auth And Get Response on Auth_Status Event
            this.services.senddata('Auth', data);
            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'Auth_Status':
                        break;
                }
            });
        } else {
            // Disconnect Socket If User Remove Localstorage Value 
            this.services.disconnect();

        }

    }

}