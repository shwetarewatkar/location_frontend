import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import Service from '../Services/service';
import alertify from 'alertifyjs';

export default class Forgot extends Component {

    // Declare constructor 

    constructor(props) {
        super(props);

        // Declare state variables, methods, firebase configuration and class objects for use this page

        this.services = new Service();
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            email: '',
            erremail: true
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
        this.removeLocalstorage();
    }

    // Declare onChangeEmail method for set value of email

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    // Declare removeLocalstorage method for remove all localstorage value

    removeLocalstorage() {
        localStorage.removeItem("uid");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("invitecode");
        localStorage.removeItem("latitude");
        localStorage.removeItem("longitude");
        localStorage.removeItem("gkeys");
    }

    // Declare onSubmit method for send mail confirmation and change password link

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

        if (this.state.erremail === true) {

            var data = {
                uid: "",
                email: this.state.email
            }

            this.services.senddata('CheckUserByEmail', data);
            this.services.getdata().subscribe((res) => {

                switch (res.event) {
                    case 'EmailExsists':

                        if (res.data.Exists) {

                            firebase.auth().sendPasswordResetEmail(this.state.email).then(() => {

                                alertify.success("Check mail! ,Password reset email sent to " + this.state.email);
                                this.props.history.push('/');

                            }).catch(function (error) {
                                alertify.error(error.message);
                            });

                        } else {
                            alertify.error("Email is not exist");
                            this.services.offsocket();
                        }

                        break;
                    default:
                        break;
                }
            });



        }

    }

    // Render HTML page and return it

    render() {
        return (
            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-xl-10 col-lg-12 col-md-9">

                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-4">Email Confirmation</h1>
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
                                                <button type="submit" className="btn btn-primary btn-user btn-block" style={{ color: 'white' }}>
                                                    Confirm
                                                </button>
                                                <hr />
                                                <div className="text-center">
                                                    <Link className="small" to={'/'}>Already have an account? Login!</Link>
                                                </div>
                                            </form>

                                        </div>
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
