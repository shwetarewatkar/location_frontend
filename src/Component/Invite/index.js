import React from 'react';
import Sidebar from '../Common/Sidebar';
import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import Service from '../../Services/service';
import Auth from '../../Authentication/Auth';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';

export default class Invite extends React.Component {

    constructor(props) {
        super(props);
        this.services = new Service();
        this.auth = new Auth();
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeInviteCode = this.onChangeInviteCode.bind(this);
        this.onChangeGroup = this.onChangeGroup.bind(this);

        this.state = {
            otherid: '',
            uid: '',
            gid: '',
            groups: []
        }

        let decryptedData_uid = localStorage.getItem('uid');
        if(decryptedData_uid == null){
            this.props.history.push('/');
        }
    }

    componentDidMount = () => {
        this.auth.Authentication();
        this.auth.reconnection();
        let params = (new URL(document.location)).searchParams;
        let id = params.get('id')
        let decryptedData_invite = localStorage.getItem('invitecode');
        if (decryptedData_invite) {
            var bytes_invite = CryptoJS.AES.decrypt(decryptedData_invite.toString(), 'Location-Sharing');
            var invite = JSON.parse(bytes_invite.toString(CryptoJS.enc.Utf8));
            if (invite == id) {
                this.props.history.push('/');
            } else {
                this.setState({
                    otherid: id
                })
                this.services.senddata('GetGroupsList', '');
                this.services.getdata().subscribe((res) => {
                    switch (res.event) {
                        case 'GroupList':
                            this.setState({
                                groups: res.data
                            })
                        break;
                    }
                });

                let decryptedData_uid = localStorage.getItem('uid');
                var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
                var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));
                this.setState({
                    uid: uid
                })
            }
        }
    }

    onChangeGroup(e) {
        this.setState({
            gid: e.target.value
        });
    }

    onChangeInviteCode(e) {
        this.setState({
            otherid: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        var data = {
            uid: this.state.uid,
            GroupId: this.state.gid,
            InviteCode: this.state.otherid
        };

        this.services.senddata('AddMember', data);
        this.services.getdata().subscribe((res) => {
            switch (res.event) {
                case 'AddMemebrResp':
                    alertify.success("Add Successfully");
                    this.props.history.push('/user');
                break;
            }
        });
    }
    
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
                                            <h6 className="m-0 font-weight-bold text-primary">Invite Your Friends</h6>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={this.onSubmit}>
                                                <div className="row">
                                                    <div className="col-xl-3">
                                                        <label>Groups</label>
                                                        <div className="form-group">
                                                            <select className="form-control" onChange={this.onChangeGroup}>
                                                                <option value="">Select Group</option>
                                                                {
                                                                    this.state.groups ?
                                                                        this.state.groups.map(function (obj, i) {
                                                                            return (

                                                                                <option value={obj._id}>{obj.groupname}</option>
                                                                            )
                                                                        }, this)
                                                                        : ''
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-3">
                                                        <label>Invite Code</label>
                                                        <div className="form-group">
                                                            <input type="text" value={this.state.otherid} onChange={this.onChangeInviteCode} className="form-control" placeholder="Enter Invite Code" />
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-1">
                                                        <br />
                                                        <button type="submit" className="btn btn-primary btn-user btn-block" style={{ color: 'white', marginTop: '6px' }}>
                                                            ADD
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}