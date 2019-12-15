import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import alertify from 'alertifyjs';
import Service from '../Services/service';
import CryptoJS from 'crypto-js';

export default class Registration extends Component {

    constructor(props) {
        super(props);

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
        this.removeLocalstorage();

        var load = localStorage.getItem('load');
        if (load) {
            window.location.reload();
            localStorage.removeItem('load');
        }
    }

    componentDidUpdate(prevProps){
        console.log(`Registration location state updates =>Prev Location ${prevProps.latitude},${prevProps.longitude},New Location ${this.props.latitude},${this.props.longitude}`);
    }

    getMyLocation() {
        const location = window.navigator && window.navigator.geolocation
        if (location) {
            location.getCurrentPosition((position) => {
                this.setState({
                    latitude: position.coords.longitude.toString(),
                    longitude: position.coords.latitude.toString(),
                })
                console.log("latitude:- ", position.coords.latitude.toString());
                console.log("longitude:- ", position.coords.longitude.toString());
            }, (error) => {
                console.log("error from location:- ", error);
            })
        }
    }

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

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onChangeRepassword(e) {
        this.setState({
            repassword: e.target.value
        });
    }

    Google_Login = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(result => {
            var user = result.user;
            console.log(" Google_Login registration user data: ", user);

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

    onSubmit(e) {
        e.preventDefault();

        if (this.state.username === '') {
            this.setState({
                errusername: false
            });
        } else {
            this.setState({
                errusername: true
            });
        }

        if (this.state.email === '') {
            this.setState({
                erremail: false
            });
        } else {
            this.setState({
                erremail: true
            });
        }

        if (this.state.password === '') {
            this.setState({
                errpass: false
            });
        } else {
            this.setState({
                errpass: true
            });
        }

        if (this.state.repassword === '') {
            this.setState({
                errrepass: false
            });
        } else {
            if (this.state.repassword === this.state.password) {
                this.setState({
                    errrepass: true
                });
            } else {
                this.setState({
                    errrepass: false
                });
            }
        }

        if (this.state.errusername === true && this.state.erremail === true && this.state.errpass === true && this.state.errrepass === true) {
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(result => {
                var user = result.user;
                console.log(" Email password registration user data: ", user);

                var data = {
                    keyword: "registration",
                    uid: user.uid,
                    email: user.email,
                    username: this.state.username,
                    flag: false,
                    profile: (user.photoURL) ? user.photoURL : ""
                }
                this.services.registrationApi(data).then(res => {
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