// Import require modules

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import Service from '../Services/service';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';

// Declare globle variables for use this page only

var map, marker, infoWindow, bounds;
var pos = []
var markers = [];

class Login extends Component {

    // Declare constructor

    constructor(props) {
        super(props);

        // Declare state variables, methods, firebase configuration and class objects for use this page

        this.services = new Service();
        this.Google_Login = this.Google_Login.bind(this);
        this.getMyLocation = this.getMyLocation.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            latitude: '',
            longitude: '',
            email: '',
            erremail: true,
            password: '',
            errpass: true,
            showAlert: false
        }

        var config = {
            apiKey: "AIzaSyBLE5yO7ozj753lTC22A94OuTsLYvZGnpE",
            authDomain: "location-sharing-31142.firebaseapp.com",
            databaseURL: "https://location-sharing-31142.firebaseio.com",
            projectId: "location-sharing-31142",
            storageBucket: "gs://location-sharing-31142.appspot.com/"
        };

        // var config = {
        //     apiKey: "AIzaSyAmMZ1vHju7_xZwAwdXpb8NZWB4dyqInbI",
        //     authDomain: "geoshare-4cb74.firebaseapp.com",
        //     databaseURL: "https://geoshare-4cb74.firebaseio.com",
        //     projectId: "geoshare-4cb74",
        //     storageBucket: "geoshare-4cb74.appspot.com"
        // };

        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }

    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount() {

        this.getMyLocation();
        this.removeLocalstorage();

        // var locs = [["U2FsdGVkX18w43rdL+IT7LOvY5eY/u7dq4SLod2bU1I=", "U2FsdGVkX185uOgLSY2FG9zejjAKRdO2wP7KYS9Csps="], 
        //    ["U2FsdGVkX1/DvNxKXdLmdSQWc0P/XBDwZ+UZoLOcMRE=", "U2FsdGVkX19PwZxbLBzAwOMoJJvBmhbBOxbstDsyojQ="], 
        //    ["U2FsdGVkX1+8sTHFueQPWKNVBejM+Z7s30BPnZ+f1lU=", "U2FsdGVkX19lh83juxwAfnVlgmRGJ2E9Y7FLS1m8Yg0="],
        //    ["U2FsdGVkX1/Uo8yTy1nMnH2I5beV6exTHbxjjzGWY+o=","U2FsdGVkX1/T3SqrPzJXicmTOKN1piCRCxmjBrXam3U="],
        //     ["U2FsdGVkX1/IoDyWtSzY1muKtwHVjdD9EYPjaspuzkk=", "U2FsdGVkX1+zvK8foCKGZiZxvVepibpm7Mrmbj1m3t0="],
        //     ["U2FsdGVkX1+aqkQfrscepEeSyG2xhMDyjyuQcXzB3ks=", "U2FsdGVkX1+Z2i2COlwpS2kVreqhApOFncem6mSvUMY="]];

        //     ["U2FsdGVkX1+sGubRoR+tppjFrzSq0gVXu6SeYslUrMs=", "U2FsdGVkX19uTorns8pHyxUbJDkh1nU4ZQU28CihVbk="]];
        //     ["U2FsdGVkX1/G3Zbpm3bUn9A/+8G5IJxptAQJN0KWCEA=", "U2FsdGVkX1/BDFPLL6eT6B3YRfG63Ww5S2Zk5KDu8Hg="]];
        //     ["U2FsdGVkX1+pmrvlw0B0Ljq9fGhqiiCsCBX0CSiVFz8=", "U2FsdGVkX19k1BX+WPWndF9o4BDP2WD0GXA95lSA5rs="]];
        //     ["U2FsdGVkX1+lO4rrPKMQMSNedzKM7mGYjl8F/kr/WcE=", "U2FsdGVkX19plHTkpiLIYrgk5i9XYpEsL94zoBd8aiw="]];
        //     ["U2FsdGVkX1/T14zys74ashuy0pTzDa9Lf72gKOBH7qw=", "U2FsdGVkX19vhZOLQnLmTbLR46YD1chX4+72DWJf+sw="]];
        //     ["U2FsdGVkX19Tl0nrozej+xjyS6ObdVnQJAr8YtQloYk=", "U2FsdGVkX19NvYexN6U1XXWOlOgKNLNpFXgraECWJvI="]];
        //     ["U2FsdGVkX1+sGubRoR+tppjFrzSq0gVXu6SeYslUrMs=", "U2FsdGVkX19uTorns8pHyxUbJDkh1nU4ZQU28CihVbk="]];

        // var gid = "U2FsdGVkX185u3gmljGHNPnX9JxkoFzlZyj7cYQYGKt7lGNxXfaxjwPfsIPNFAPR";
        // var lt = "21.1716";
        // var ln = "72.9628";
        // var latitude = CryptoJS.AES.encrypt(JSON.stringify(lt), gid);
        // var longitude = CryptoJS.AES.encrypt(JSON.stringify(ln), gid);
        // console.log("latitude new user:- ", latitude.toString());
        // console.log("longitude new user:- ", longitude.toString());


        // var gid = "U2FsdGVkX185u3gmljGHNPnX9JxkoFzlZyj7cYQYGKt7lGNxXfaxjwPfsIPNFAPR";
        // var decryptedData_lat = "U2FsdGVkX1838gkloFTvFPtwkFH42fWjhHVzaEgyN2Y=";
        // var bytes_lat = CryptoJS.AES.decrypt(decryptedData_lat.toString(), 'Location-Sharing');
        // var get_lat = JSON.parse(bytes_lat.toString(CryptoJS.enc.Utf8));

        // console.log("latitudesadadas:- ", get_lat);

       

        var load = localStorage.getItem('load');
        if (load) {
            window.location.reload();
            localStorage.removeItem('load');
        }


    }

    // Declare onChangeEmail for set value of email

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    // Declare onChangePassword for set value of password

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    // Declare removeLocalstorage for remove all localstorage value

    removeLocalstorage() {
        localStorage.removeItem("uid");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("invitecode");
        localStorage.removeItem("latitude");
        localStorage.removeItem("longitude");
        localStorage.removeItem("flage");
    }

    // Declare handleLocationError method for when any kid of location related error is occur at that time that method handled current location

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    // Declare getMyLocation method for get current latitude and longitude of user

    getMyLocation() {

        const location = window.navigator && window.navigator.geolocation

        if (location) {
            this.setState({ showAlert: false })
            location.getCurrentPosition((position) => {
                this.setState({
                    latitude: position.coords.longitude.toString(),
                    longitude: position.coords.latitude.toString(),
                })
                console.log("latitude:- ", position.coords.latitude.toString());
                console.log("longitude:- ", position.coords.longitude.toString());
            }, (error) => {
                this.setState({ showAlert: true });
            })
        } else {
            this.setState({ showAlert: true });
            this.handleLocationError(false, infoWindow, map.getCenter());
        }

    }

    // Declare Google_Login method for login with google popup open and login

    Google_Login = () => {

        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(result => {

            // var token = result.credential.accessToken;
            var user = result.user;

            console.log("user datat:- ", user);

            var alllatchar = this.state.latitude.split('.');
            var latchar = alllatchar[0] + "." + alllatchar[1].substring(0, 4);

            var alllongchar = this.state.longitude.split('.');
            var longchar = alllongchar[0] + "." + alllongchar[1].substring(0, 4);

            var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
            localStorage.setItem("latitude", latitude.toString());

            var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
            localStorage.setItem("longitude", longitude.toString());

            var data = {
                keyword: "googlelogin",
                uid: user.uid,
                email: user.email,
                username: user.displayName,
                flage: true,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                plain_lat: this.state.latitude,
                plain_long: this.state.longitude,
                profile: (user.photoURL) ? user.photoURL : ""
                // lat: latchar,
                // long: longchar
            }


            this.services.postdata(data).then(res => {
                if (res.data.status) {
                    alertify.success(res.data.message);

                    var uid = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].uid), 'Location-Sharing');
                    localStorage.setItem("uid", uid.toString());

                    var email = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].email), 'Location-Sharing');
                    localStorage.setItem("email", email.toString());

                    var username = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].username), 'Location-Sharing');
                    localStorage.setItem("username", username.toString());

                    var invitecode = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].invitecode), 'Location-Sharing');
                    localStorage.setItem("invitecode", invitecode.toString());

                    var flage = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].flage), 'Location-Sharing');
                    localStorage.setItem("flage", flage.toString());

                    var profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].profile), 'Location-Sharing');
                    localStorage.setItem("profile", profile.toString());

                    // var latitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].latitude), 'Location-Sharing');
                    // localStorage.setItem("latitude", latitude.toString());

                    // var longitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].longitude), 'Location-Sharing');
                    // localStorage.setItem("longitude", longitude.toString());

                    this.props.history.push('/user');

                } else {

                    alertify.success(res.data.message);

                    var uid = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].uid), 'Location-Sharing');
                    localStorage.setItem("uid", uid.toString());

                    var email = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].email), 'Location-Sharing');
                    localStorage.setItem("email", email.toString());

                    var username = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].username), 'Location-Sharing');
                    localStorage.setItem("username", username.toString());

                    var invitecode = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].invitecode), 'Location-Sharing');
                    localStorage.setItem("invitecode", invitecode.toString());

                    var flage = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].flage), 'Location-Sharing');
                    localStorage.setItem("flage", flage.toString());

                    var profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].profile), 'Location-Sharing');
                    localStorage.setItem("profile", profile.toString());

                    // var latitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].latitude), 'Location-Sharing');
                    // localStorage.setItem("latitude", latitude.toString());

                    // var longitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].longitude), 'Location-Sharing');
                    // localStorage.setItem("longitude", longitude.toString());

                    this.props.history.push('/user');
                }
            });


        }).catch(error => {
            alertify.error(error.message);
        });


    }

    // Declare onSubmit method for login using email and password.

    onSubmit(e) {
        e.preventDefault();

        if (this.state.email == '') {
            this.setState({
                erremail: false
            });
            this.state.erremail = false;
        } else {
            this.setState({
                erremail: true
            });
            this.state.erremail = true;
        }

        if (this.state.password == '') {
            this.setState({
                errpass: false
            });
            this.state.errpass = false;
        } else {
            this.setState({
                errpass: true
            });
            this.state.errpass = true;
        }

        if (this.state.erremail == true && this.state.errpass == true) {

            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(result => {

                var user = result.user;

                var alllatchar = this.state.longitude.split('.');
                var latchar = alllatchar[0] + "." + alllatchar[1].substring(0, 4);

                var alllongchar = this.state.latitude.split('.');
                var longchar = alllongchar[0] + "." + alllongchar[1].substring(0, 4);

                var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
                localStorage.setItem("latitude", latitude.toString());

                var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
                localStorage.setItem("longitude", longitude.toString());

                var data = {
                    uid: user.uid,
                    email: user.email,
                    username: user.username,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    status: true,
                    plain_lat: this.state.longitude,
                    plain_long: this.state.latitude,
                    profile: (user.photoURL) ? user.photoURL : ""
                    // latitude: latchar,
                    // longitude: longchar
                }

                console.log("frontend call:- ", data);

                this.services.senddata('Auth', data);
                this.services.getdata().subscribe((res) => {
                    switch (res.event) {
                        case 'Auth_Status':

                            if (res.data.user_status) {

                                var uid = CryptoJS.AES.encrypt(JSON.stringify(user.uid), 'Location-Sharing');
                                localStorage.setItem("uid", uid.toString());

                                var email = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.email), 'Location-Sharing');
                                localStorage.setItem("email", email.toString());

                                var username = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.username), 'Location-Sharing');
                                localStorage.setItem("username", username.toString());

                                var invitecode = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.invitecode), 'Location-Sharing');
                                localStorage.setItem("invitecode", invitecode.toString());

                                var profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.profile), 'Location-Sharing');
                                localStorage.setItem("profile", profile.toString());

                                // var latitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.latitude), 'Location-Sharing');
                                // localStorage.setItem("latitude", latitude.toString());

                                // var longitude = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.longitude), 'Location-Sharing');
                                // localStorage.setItem("longitude", longitude.toString());

                                if (window.location.pathname == '/') {
                                    this.props.history.push('/user');
                                    alertify.success("Login Successfully");
                                }

                            }

                            break;
                    }
                });



            }).catch(error => {
                alertify.error(error.message);
            });

        }

    }

    // Render HTML page and return it

    render() {
        return (

            <div className="container">

                {/* This popup is user for when user can not allow location popup in browser at that time display this popup */}

                {
                    this.state.showAlert === true ?
                        <div className="alertNavigator">
                            <div className="maErrorBlock">
                                <i class="fas fa-exclamation-triangle" style={{ color: 'rgb(234, 67, 53)', fontSize: '50px' }}></i>
                                <h2>Please allow location permission</h2>
                                <h2>from your site settings.</h2>
                            </div>
                        </div>
                        :
                        ''
                }

                {/* END */}

                {/* Login HTML Page */}

                <div className="row justify-content-center">

                    <div className="col-xl-10 col-lg-12 col-md-9">

                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-4">Location Sharing</h1>
                                            </div>
                                            <form className="user" onSubmit={this.onSubmit}>
                                                <div className="form-group">
                                                    {
                                                        (this.state.erremail) ?
                                                            <input type="email" value={this.state.email} onChange={this.onChangeEmail} className="form-control form-control-user" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email Address..." />
                                                            :
                                                            <input type="email" style={{ border: '1px solid red' }} value={this.state.email} onChange={this.onChangeEmail} className="form-control form-control-user" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email Address..." />
                                                    }
                                                </div>
                                                <div className="form-group">
                                                    {
                                                        (this.state.errpass) ?
                                                            <input type="password" value={this.state.password} onChange={this.onChangePassword} className="form-control form-control-user" id="exampleInputPassword" placeholder="Password" />
                                                            :
                                                            <input type="password" style={{ border: '1px solid red' }} value={this.state.password} onChange={this.onChangePassword} className="form-control form-control-user" id="exampleInputPassword" placeholder="Password" />
                                                    }
                                                </div>

                                                <button type="submit" className="btn btn-primary btn-user btn-block" style={{ color: 'white' }}>
                                                    Login
                                                </button>
                                                <br />
                                                <div className="row">
                                                    <div className="col-md-6 col-xs-12" style={{ textAlign: 'center' }}>
                                                        <Link className="small" to={'/registration'}>Create an Account!</Link>
                                                    </div>
                                                    <div className="col-md-6 col-xs-12" style={{ textAlign: 'center' }}>
                                                        <Link className="small" to={'/confirm'}>Forgot Password</Link>
                                                    </div>
                                                </div>

                                                <hr />
                                                <button onClick={this.Google_Login} type="button" className="btn btn-google btn-user btn-block" style={{ background: '#ea4335', color: 'white' }}>
                                                    <i className="fab fa-google fa-fw"></i> Login with Google
                                                </button>
                                                {/* <button type="button" className="btn btn-facebook btn-user btn-block" style={{ background: '#3b5998', color: 'white' }}>
                                                    <i className="fab fa-facebook-f fa-fw"></i> Login with Facebook
                                                </button> */}
                                            </form>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* END */}

            </div>
        );
    }

}

export default Login;
