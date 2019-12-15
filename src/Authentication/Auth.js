
import React from 'react';
import Service from '../Services/service';
import CryptoJS from 'crypto-js';

export default class Auth extends React.Component {

    constructor(props) {
        super(props);
        this.services = new Service();
    }

    reconnection() {
        let encrypted_uid = localStorage.getItem('uid');
        let encrypted_email = localStorage.getItem('email');
        let encrypted_username = localStorage.getItem('username');
        let encrypted_latitude = localStorage.getItem('latitude');
        let encrypted_longitude = localStorage.getItem('longitude');

        if (encrypted_uid != null || encrypted_email != null || encrypted_username != null || encrypted_latitude != null || encrypted_longitude != null) {

            var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
            var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var bytes_email = CryptoJS.AES.decrypt(encrypted_email.toString(), 'Location-Sharing');
            var email = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

            var bytes_username = CryptoJS.AES.decrypt(encrypted_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            var data = {
                uid: uid,
                email: email,
                username: username,
                status: false
            }
            this.services.reconnect('Auth', data);
            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'Auth_Status':
                        break;
                    default:
                        break;
                }
            });

        } else {
            this.services.disconnect();

        }
    }

    Authentication() {
        let encrypted_uid = localStorage.getItem('uid');
        let encrypted_email = localStorage.getItem('email');
        let encrypted_username = localStorage.getItem('username');
        
        if (encrypted_uid != null) {
            var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
            var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var bytes_email = CryptoJS.AES.decrypt(encrypted_email.toString(), 'Location-Sharing');
            var email = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

            var bytes_username = CryptoJS.AES.decrypt(encrypted_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            var data = {
                uid: uid,
                email: email,
                username: username,
                status: false
            }

            this.services.senddata('Auth', data);
            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'Auth_Status':
                        break;
                    default:
                        break;
                }
            });
        } else {
            this.services.disconnect();

        }

    }

}