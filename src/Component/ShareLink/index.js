// Import require modules

import React from 'react';
import Sidebar from '../Common/Sidebar';
import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import Service from '../../Services/service';
import Auth from '../../Authantication/Auth';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';


export default class Sharelink extends React.Component {

    // Declare constructor 

    constructor(props) {
        super(props);

        this.services = new Service();
        this.auth = new Auth();

        this.onAddInGroup = this.onAddInGroup.bind(this);
        this.onRejectGroup = this.onRejectGroup.bind(this);

        this.state = {
            gid: '',
            uname: '',
            suid: ''
        }
    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount = () => {

        this.auth.authantication();
        this.auth.reconnection();

        let params = (new URL(document.location)).searchParams;
        var puname = params.get('name');

        this.setState({
            gid: params.get('id'),
            uname: params.get('name'),
            suid: params.get('sid')
        })

        let decryptedData_username = localStorage.getItem('username');
        if (decryptedData_username) {
            var bytes_username = CryptoJS.AES.decrypt(decryptedData_username.toString(), 'Location-Sharing');
            var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

            if (username == puname) {
                this.props.history.push('/');
            } else {
                console.log("different");
            }
        } else {
            this.props.history.push('/');
        }

    }

    onAddInGroup() {
        let decryptedData_invitecode = localStorage.getItem('invitecode');
        var bytes_invitecode = CryptoJS.AES.decrypt(decryptedData_invitecode.toString(), 'Location-Sharing');
        var invitcode = JSON.parse(bytes_invitecode.toString(CryptoJS.enc.Utf8));

        var data = {
            uid: this.state.suid,
            GroupId: this.state.gid,
            InviteCode: invitcode
        };

        this.services.senddata('AddMember', data);
        alertify.success("Joined successfully");
        this.props.history.push('/user');
    }

    onRejectGroup = () => {
        this.props.history.push('/user');
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xl-4"></div>
                    <div className="col-xl-4">
                        <br />
                        <div className="modal-content">
                            <form>
                                <div className="modal-body">
                                    <p style={{ fontSize: '20px', textAlign: 'center' }}>
                                        {this.state.uname} sent you invite to join '{this.state.uname}' group?
                                    </p>
                                </div>
                                <div style={{ padding: '10px', textAlign: 'center' }}>
                                    <button type="button" onClick={this.onAddInGroup} className="btn btn-success">Accept</button>
                                    &nbsp;&nbsp;
                                    <button type="button" onClick={this.onRejectGroup} className="btn btn-danger" >Reject</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-xl-4"></div>
                </div>
            </div>
        );
    }
}