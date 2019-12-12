// Import require modules

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import Service from '../Services/service';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';

// Declare globle variables for use this page only

var map,infoWindow;

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
            apiKey: "AIzaSyAmMZ1vHju7_xZwAwdXpb8NZWB4dyqInbI",
            authDomain: "geoshare-4cb74.firebaseapp.com",
            databaseURL: "https://geoshare-4cb74.firebaseio.com",
            projectId: "geoshare-4cb74",
            storageBucket: "geoshare-4cb74.appspot.com"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }

    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount() {

        this.getMyLocation();
        this.removeLocalstorage();

        var load = localStorage.getItem('load');
        if (load) {
            window.location.reload();
            localStorage.removeItem('load');
        }
    }
    componentDidUpdate(prevProps){
        console.log(`Login location state updates =>Prev Location ${prevProps.latitude},${prevProps.longitude},New Location ${this.props.latitude},${this.props.longitude}`);
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
        localStorage.removeItem("flag");
        localStorage.removeItem("profile");

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
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
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
            
            var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
            localStorage.setItem("latitude", latitude.toString());

            var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
            localStorage.setItem("longitude", longitude.toString());

            var data = {
                keyword: "googlelogin",
                uid: user.uid,
                email: user.email,
                username: user.displayName,
                flag: true,
                profile: (user.photoURL) ? user.photoURL : ""
            }


            this.services.registrationApi(data).then(res => {
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

                    var flag = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].flag), 'Location-Sharing');
                    localStorage.setItem("flag", flag.toString());

                    var profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].profile), 'Location-Sharing');
                    localStorage.setItem("profile", profile.toString());
                    
                    var getGroupKeyData = {
                        uid: uid
                    }
                    this.services.senddata('getGroupKeys', getGroupKeyData);
                    this.services.getdata().subscribe((res) =>{
                        switch (res.event) {
                            case 'getGroupKeysResponse':
                                console.log("getGroupkey",res.data);
                                if(res.data){
                                    console.log("grpKey_info",res.data);
                                    localStorage.setItem("gkeys",JSON.stringify(res.data).toString());
                                    this.props.history.push('/user');
                                }
                                break;
                            default:
                                break;
                        }
                    });

                } else {

                    alertify.success(res.data.message);

                    let uid = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].uid), 'Location-Sharing');
                    localStorage.setItem("uid", uid.toString());

                    let email = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].email), 'Location-Sharing');
                    localStorage.setItem("email", email.toString());

                    let username = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].username), 'Location-Sharing');
                    localStorage.setItem("username", username.toString());

                    let invitecode = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].invitecode), 'Location-Sharing');
                    localStorage.setItem("invitecode", invitecode.toString());

                    let flag = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].flag), 'Location-Sharing');
                    localStorage.setItem("flag", flag.toString());

                    let profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.userdata[0].profile), 'Location-Sharing');
                    localStorage.setItem("profile", profile.toString());

                    let getGroupKeyData = {
                        uid: uid
                    }
                    this.services.senddata('getGroupKeys', getGroupKeyData);
                    this.services.getdata().subscribe((res) =>{
                        switch (res.event) {
                            case 'getGroupKeysResponse':
                                console.log("getGroupkey",res.data);
                                if(res.data){
                                    console.log("grpKey_info",res.data);
                                    localStorage.setItem("gkeys",JSON.stringify(res.data).toString());
                                    this.props.history.push('/user');
                                }
                                break;
                            default:
                                break;
                        }
                    });
                }
            });


        }).catch(error => {
            alertify.error(error.message);
        });


    }

    // Declare onSubmit method for login using email and password.

    onSubmit(e) {
        e.preventDefault();

        if (this.state.email === '') {
            this.setState({
                erremail: false
            });
            // this.state.erremail = false;
        } else {
            this.setState({
                erremail: true
            });
            // this.state.erremail = true;
        }

        if (this.state.password === '') {
            this.setState({
                errpass: false
            });
            // this.state.errpass = false;
        } else {
            this.setState({
                errpass: true
            });
            // this.state.errpass = true;
        }

        if (this.state.erremail === true && this.state.errpass === true) {

            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(result => {

                var user = result.user;

                var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
                localStorage.setItem("latitude", latitude.toString());

                var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
                localStorage.setItem("longitude", longitude.toString());

                var data = {
                    uid: user.uid,
                    email: user.email,
                    username: user.username,
                    status: true
                }

                console.log("frontend call:- ", data);

                this.services.senddata('Auth', data);
                this.services.getdata().subscribe((res) => {
                    switch (res.event) {
                        case 'Auth_Status':
                            console.log("Auth_status",res);
                            if (res.data.user_status) {

                                

                                var email = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.email), 'Location-Sharing');
                                localStorage.setItem("email", email.toString());

                                var username = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.username), 'Location-Sharing');
                                localStorage.setItem("username", username.toString());

                                var invitecode = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.invitecode), 'Location-Sharing');
                                localStorage.setItem("invitecode", invitecode.toString());

                                var profile = CryptoJS.AES.encrypt(JSON.stringify(res.data.user_details.profile), 'Location-Sharing');
                                localStorage.setItem("profile", profile.toString());
                                
                                var uid = CryptoJS.AES.encrypt(JSON.stringify(user.uid), 'Location-Sharing');
                                localStorage.setItem("uid", uid.toString());
                                
                                var getGroupKeyData = {
                                    uid: uid.toString()
                                }

                                this.services.senddata('getGroupKeys', getGroupKeyData);
                                this.services.getdata().subscribe((res) =>{
                                    switch (res.event) {
                                        case 'getGroupKeysResponse':
                                            console.log("getGroupkey",res.data);
                                            if(res.data){
                                                console.log("grpKey_info",res.data);
                                                localStorage.setItem("gkeys",JSON.stringify(res.data).toString());
                                                if (window.location.pathname === '/') {
                                                    this.props.history.push('/user');
                                                    alertify.success("Login Successfully");
                                                }
                                            }
                                            break; 
                                        default:
                                            break;
                                    }
                                });
                            }

                            break;
                        default:
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
