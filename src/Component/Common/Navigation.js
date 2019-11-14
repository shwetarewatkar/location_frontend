// Import require modules

import React from 'react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import $ from "jquery";

export default class Navigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            profile: ''
        }
    }

    componentDidMount() {
        this.userDetails();

        let decryptedData_profile = localStorage.getItem("profile");
        var bytes_profile = CryptoJS.AES.decrypt(decryptedData_profile.toString(), 'Location-Sharing');
        if (bytes_profile.toString(CryptoJS.enc.Utf8)) {
            var get_profile = JSON.parse(bytes_profile.toString(CryptoJS.enc.Utf8));
            this.setState({
                profile: get_profile
            })
        }

        $("#sidebarToggleTop").on("click",function(){
            $(this).parents("#wrapper").find("#accordionSidebar").toggleClass("toggled");
        })
    }

    userDetails() {
        let decryptedData_username = localStorage.getItem('username');
        if (decryptedData_username) {
            var bytes_username = CryptoJS.AES.decrypt(decryptedData_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            this.setState({
                username: username
            })
        }
    }

    render() {
        return (
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3" >
                    <i className="fa fa-bars"></i>
                </button>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to={'/user'} style={{ fontSize: '80%', fontWeight: '400', color: '#858796' }}>
                            Hello, {this.state.username}
                            &nbsp;&nbsp;
                            {
                                (this.state.profile) ?
                                    <img className="img-profile rounded-circle" src={this.state.profile} />
                                    :
                                    <img className="img-profile rounded-circle" src="img/user.png" />
                            }
                        </Link>
                    </li>
                </ul>
            </nav>
        );
    }
}