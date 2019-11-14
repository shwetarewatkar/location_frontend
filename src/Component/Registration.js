import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import alertify from 'alertifyjs';
import Service from '../Services/service';
import CryptoJS from 'crypto-js';

export default class Registration extends Component {

    constructor(props) {
        super(props);

        // state variables, methods, firebase configuration and class objects
        this.services = new Service();
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeRepassword = this.onChangeRepassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getMyLocation = this.getMyLocation.bind(this);
        this.Google_Login = this.Google_Login.bind(this);

        this.state = {
            username: '',
            errusername: true,
            email: '',
            erremail: true,
            password: '',
            errpass: true,
            repassword: '',
            errrepass: true,
            latitude: '',
            longitude: ''
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

    componentDidMount() {
        this.getMyLocation();
    }

    //getMyLocation() to get current latitude and longitude of user
    getMyLocation() {
        const location = window.navigator && window.navigator.geolocation
        if (location) {
            location.getCurrentPosition((position) => {
                this.setState({
                    latitude: position.coords.longitude.toString(),
                    longitude: position.coords.latitude.toString(),
                })
            }, (error) => {
                console.log("error from location:- ", error);
            })
        }
    }

    //onChangeUsername() to set value of username
    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    //onChangeEmail() to set value of email
    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    //onChangePassword() to set value of password
    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    //onChangeRepassword() to set value of repassword
    onChangeRepassword(e) {
        this.setState({
            repassword: e.target.value
        });
    }

    //Google_Login() for login with google popup open and login
    Google_Login = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(result => {
            // var token = result.credential.accessToken;
            var user = result.user;
            console.log("user data:- ", user);
            
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

                   this.props.history.push('/user');

                }
            });


        }).catch(error => {
            alertify.error(error.message);
        });


    }

    //onSubmit() to register new user account
    onSubmit(e) {
        e.preventDefault();

        if (this.state.username == '') {
            this.setState({
                errusername: false
            });
            this.state.errusername = false;
        } else {
            this.setState({
                errusername: true
            });
            this.state.errusername = true;
        }

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

        if (this.state.repassword == '') {
            this.setState({
                errrepass: false
            });
            this.state.errrepass = false;
        } else {

            if (this.state.repassword == this.state.password) {
                this.setState({
                    errrepass: true
                });
                this.state.errrepass = true;
            } else {
                this.setState({
                    errrepass: false
                });
                this.state.errrepass = false;
            }
        }

        if (this.state.errusername == true && this.state.erremail == true && this.state.errpass == true && this.state.errrepass == true) {
            //firebase athentication
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(result => {
                var user = result.user;

                var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
                var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');

                var data = {
                    keyword: "registration",
                    uid: user.uid,
                    email: user.email,
                    username: this.state.username,
                    flage: false,
                    latitude: longitude.toString(),
                    longitude: latitude.toString(),
                    plain_lat: this.state.longitude,
                    plain_long: this.state.latitude,
                    profile: (user.photoURL) ? user.photoURL : ""
                }

                this.services.postdata(data).then(res => {
                    if (res.data.status) {
                        alertify.success(res.data.message);
                        this.props.history.push('/');
                    } else {
                        alertify.error(res.data.message);
                    }
                });
            }).catch(error => {
                alertify.error(error.message);
            });
        }
    }

    render() {
        return (
            <div className="container">
                <div className="card o-hidden border-0 shadow-lg my-5">
                    <div className="card-body p-0">
                        <div className="row">
                            <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>
                            <div className="col-lg-7">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-4">Create Account</h1>
                                    </div>
                                    <form className="user" onSubmit={this.onSubmit}>
                                        <div className="form-group">
                                            {
                                                (this.state.errusername) ?
                                                    <input type="text" value={this.state.username} 
                                                        onChange={this.onChangeUsername} className="form-control form-control-user" 
                                                        id="exampleFirstName" placeholder="Username" 
                                                    />
                                                    :
                                                    <input type="text" style={{ border: '1px solid red' }} value={this.state.username} 
                                                        onChange={this.onChangeUsername} className="form-control form-control-user" 
                                                        id="exampleFirstName" placeholder="Username" 
                                                    />
                                            }
                                        </div>
                                        <div className="form-group">
                                            {
                                                (this.state.erremail) ?
                                                    <input type="email" value={this.state.email} 
                                                        onChange={this.onChangeEmail} className="form-control form-control-user" 
                                                        id="exampleInputEmail" placeholder="Email Address" 
                                                    />
                                                    :
                                                    <input type="email" style={{ border: '1px solid red' }} 
                                                        value={this.state.email} onChange={this.onChangeEmail} className="form-control form-control-user" 
                                                        id="exampleInputEmail" placeholder="Email Address" 
                                                    />
                                            }
                                        </div>
                                        <div className="form-group">
                                            {
                                                (this.state.errpass) ?
                                                    <input type="password" value={this.state.password} 
                                                        onChange={this.onChangePassword} className="form-control form-control-user" 
                                                        id="exampleInputPassword" placeholder="Password" 
                                                    />
                                                    :
                                                    <input type="password" style={{ border: '1px solid red' }} value={this.state.password} 
                                                        onChange={this.onChangePassword} className="form-control form-control-user" 
                                                        id="exampleInputPassword" placeholder="Password" 
                                                    />
                                            }
                                        </div>
                                        <div className="form-group">
                                            {
                                                (this.state.errrepass) ?
                                                    <input type="password" value={this.state.repassword} 
                                                        onChange={this.onChangeRepassword} className="form-control form-control-user" 
                                                        id="exampleRepeatPassword" placeholder="Confirm Password" 
                                                    />
                                                    :
                                                    <input type="password" style={{ border: '1px solid red' }} value={this.state.repassword} 
                                                    onChange={this.onChangeRepassword} className="form-control form-control-user" 
                                                    id="exampleRepeatPassword" placeholder="Confirm Password" 
                                                    />
                                            }

                                        </div>
                                        <button type="submit" className="btn btn-primary btn-user btn-block">
                                            Register Account
                                        </button>
                                        <hr />
                                        <button onClick={this.Google_Login} type="button" 
                                            className="btn btn-google btn-user btn-block" 
                                            style={{ background: '#ea4335', color: 'white' }}>
                                            <i className="fab fa-google fa-fw"></i> 
                                            Login with Google
                                        </button>
                                    </form>
                                    <hr />
                                    <div className="text-center">
                                        <Link className="small" to={'/'}>Already have an account? Login!</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

}