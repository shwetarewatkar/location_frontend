// Import require modules

import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import Service from '../../Services/service';
import Auth from '../../Authantication/Auth';
import firebase from 'firebase';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';


export default class Setting extends React.Component {

    // Declare constructor 

    constructor(props) {
        super(props);

        // Declare state variables, methods, firebase configration and class objects for use this page

        this.services = new Service();
        this.auth = new Auth();

        this.onSubmit = this.onSubmit.bind(this);
        this.onAccountSubmit = this.onAccountSubmit.bind(this);
        this.onDeleteAccountPop = this.onDeleteAccountPop.bind(this);
        this.onCloseModel = this.onCloseModel.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeRepassword = this.onChangeRepassword.bind(this);

        this.state = {
            deletepopupshow: false,
            email: '',
            erremail: true,
            password: '',
            errpass: true,
            repassword: '',
            errrepass: true,
            showforgot: false
        }

        // var config = {
        //     apiKey: "AIzaSyBLE5yO7ozj753lTC22A94OuTsLYvZGnpE",
        //     authDomain: "location-sharing-31142.firebaseapp.com",
        //     databaseURL: "https://location-sharing-31142.firebaseio.com",
        //     projectId: "location-sharing-31142",
        //     storageBucket: "gs://location-sharing-31142.appspot.com/"
        // };

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

        let decryptedData_flage = localStorage.getItem('flage');

        if (decryptedData_flage) {
            this.setState({
                showforgot: true
            })
            this.state.showforgot = true;
        } else {
            this.setState({
                showforgot: false
            })
            this.state.showforgot = false;
        }

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

    onSubmit(e) {
        e.preventDefault();

        if (this.state.email == '') {
            this.setState({
                erremail: false
            });
            this.state.erremail = false;
        } else {

            let decryptedData_email = localStorage.getItem('email');
            var bytes_email = CryptoJS.AES.decrypt(decryptedData_email.toString(), 'Location-Sharing');
            var localemail = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

            if (localemail == this.state.email) {
                this.setState({
                    erremail: true
                });
                this.state.erremail = true;
            } else {
                this.setState({
                    erremail: false
                });
                this.state.erremail = false;
                alertify.error("Entered Email Is Not Exist !");
            }
        }

        if (this.state.erremail == true) {

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
                                this.setState({
                                    email: ''
                                })
                                this.services.offsocket();
                                // this.props.history.push('/');

                            }).catch(function (error) {
                                alertify.error(error.message);
                                this.services.offsocket();
                            });

                        } else {
                            alertify.error("Email is not exist");
                            this.services.offsocket();
                        }

                        break;
                }
            });

        }
    }

    onDeleteAccountPop() {
        this.setState({
            deletepopupshow: true
        })
        this.state.deletepopupshow = true;
    }

    onAccountSubmit(e) {
        e.preventDefault();

        let decryptedData_uid = localStorage.getItem('uid');
        var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
        var userid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

        var data = {
            uid: userid
        }

        this.services.senddata('DeleteAccount', data);
        this.services.getdata().subscribe((res) => {

            switch (res.event) {
                case 'AccountDeleted':
                    this.props.history.push('/');
                    var user = firebase.auth().currentUser;
                    user.delete().then(function () {
                        this.props.history.push('/');
                    }).catch(function (error) {
                        console.log(error);
                    });
                    break;
            }
        });

    }

    onCloseModel() {
        this.setState({
            deletepopupshow: false,
        })
        this.state.deletepopupshow = false;
    }

    // Render HTML page and return it
    render() {
        return (

            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">

                        <Navigation />

                        <div className="container-fluid">

                            <div className="row">
                                <div className="col-xl-12">
                                    <div className="card shadow mb-4">
                                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                            <h6 className="m-0 font-weight-bold text-primary">Settings</h6>
                                        </div>
                                        <div className="card-body">
                                            <nav>

                                                {
                                                    (this.state.showforgot) ?
                                                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                                            <a className="nav-item nav-link active" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Account</a>
                                                        </div>
                                                        :

                                                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                                            <a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Change</a>
                                                            <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Account</a>
                                                        </div>
                                                }


                                            </nav>


                                            {
                                                (this.state.showforgot) ?

                                                    <div className="tab-content" id="nav-tabContent">
                                                        <div className="tab-pane fade show active" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                            <div className="col-xl-3">
                                                                <form className="user" >
                                                                    <br />
                                                                    <button type="button" onClick={this.onDeleteAccountPop} className="btn btn-danger">Delete Account</button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    :


                                                    <div className="tab-content" id="nav-tabContent">
                                                        <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                                                            <div className="row">
                                                                <div className="col-xl-3">
                                                                    <form className="user" onSubmit={this.onSubmit}>
                                                                        <br />
                                                                        <div className="form-group">
                                                                            <label>Email Address</label>
                                                                            {
                                                                                (this.state.erremail) ?
                                                                                    <input type="email" value={this.state.email} onChange={this.onChangeEmail} className="form-control" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email Address..." />
                                                                                    :
                                                                                    <input type="email" style={{ border: '1px solid red' }} value={this.state.email} onChange={this.onChangeEmail} className="form-control" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email Address..." />
                                                                            }

                                                                        </div>
                                                                        <button type="submit" className="btn btn-primary btn-block" style={{ color: 'white' }}>
                                                                            Confirm
                                                                        </button>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                            <div className="row">
                                                                <div className="col-xl-3">
                                                                    <form className="user">
                                                                        <br />
                                                                        <button type="button" onClick={this.onDeleteAccountPop} className="btn btn-danger">Delete Account</button>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delete account confirmation model */}

                        <div className={(this.state.deletepopupshow) ? 'modal fade show disblock' : 'modal fade disnone'} id="newgroup" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">

                                <div className="modal-content">
                                    <form onSubmit={this.onAccountSubmit}>
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalCenterTitle">Delete Your Account</h5>
                                            <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            Are You Sure You Want To Delete ?
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                            <button type="submit" className="btn btn-danger">Delete</button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>
                        {
                            (this.state.deletepopupshow) ? <div className="modal-backdrop fade show"></div> : ''
                        }

                    </div>

                    <Footer />

                </div>
            </div>

        );
    }

}