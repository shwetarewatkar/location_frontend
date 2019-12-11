import React from 'react';
import { Link } from 'react-router-dom';
import Service from '../../Services/service';
import CryptoJS from 'crypto-js';
import history from '../../History';

let setuser = false;
let setgroup = false;
let setsetting = false;

export default class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.Class = this.Class.bind(this);
        this.logOut = this.logOut.bind(this);
        this.updateViewState = this.updateViewState.bind(this);
        this.services = new Service();

        this.state = {
            mobileView: false,
            showSidebar: true
        };

    }

    componentDidMount() {
        this.updateViewState();

        if (window.location.pathname === '/user') {
            setuser = true;
            setgroup = false;
            setsetting = false;
        } else if (window.location.pathname === '/groups') {
            setuser = false;
            setgroup = true;
            setsetting = false;
        } else if (window.location.pathname === '/setting') {
            setuser = false;
            setgroup = false;
            setsetting = true;
        }
    }

    updateViewState() {
        if (!this.state.mobileView && document.documentElement.clientWidth < 1024) {
            this.setState({
                mobileView: true,
                showSidebar: false
            });
        } else {
            this.setState({
                mobileView: false,
                showSidebar: true
            });
        }
    }
    
    Class(path) {
        if (path === 'user') {
            setuser = true;
            setgroup = false;
            setsetting = false;
        } else if (path === 'groups') {
            setuser = false;
            setgroup = true;
            setsetting = false;
        } else if (path === 'setting') {
            setuser = false;
            setgroup = false;
            setsetting = true;
        }
    }

    logOut = (e) => {
        let decryptedData_uid = localStorage.getItem('uid');
        var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
        var userid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

        var data = {
            uid: userid
        }

        this.services.senddata('LogoutEvent', data);
        localStorage.setItem('load', '1');
        history.push('/');
    }

    render() {
        return (
            <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
             {/* <ul className={(this.state.showSidebar) ? 'navbar-nav bg-gradient-primary sidebar sidebar-dark' : 'navbar-nav bg-gradient-primary sidebar sidebar-dark collapse'} id="accordionSidebar"> */}
                <Link className="sidebar-brand d-flex align-items-center justify-content-center" to={'/user'}>
                    <div className="sidebar-brand-icon rotate-n-15">
                        <i className="fas fa-compass"></i>
                    </div>
                    <div className="sidebar-brand-text mx-3 dashboard-text">
                        Location Share
                    </div>
                </Link>

                <hr className="sidebar-divider my-0" />

                <li className={(setuser) ? 'nav-item active' : 'nav-item'}>
                    <Link className="nav-link " to={'/user'} onClick={this.Class.bind(this, 'user')}>
                        <i className="fas fa-plus"></i>
                        <span> Add User</span>
                    </Link>
                </li>

                {/* <li className={(setpeople) ? 'nav-item active' : 'nav-item'}>
                    <Link className="nav-link" to={'/people'} onClick={this.Class.bind(this, 'people')}>
                        <i className="fas fa-user"></i>
                        <span> People</span>
                    </Link>
                </li> */}

                <li className={(setgroup) ? 'nav-item active' : 'nav-item'}>
                    <Link className="nav-link" to={'/groups'} onClick={this.Class.bind(this, 'groups')}>
                        <i className="fas fa-users"></i>
                        <span> Groups</span>
                    </Link>
                </li>

                <li className={(setsetting) ? 'nav-item active' : 'nav-item'}>
                    <Link className="nav-link" to={'/setting'} onClick={this.Class.bind(this, 'setting')}>
                        <i className="fas fa-cog"></i>
                        <span> Settings</span>
                    </Link>
                </li>

                <hr className="sidebar-divider" />

                <li className="nav-item">
                    <a className="nav-link btn-hover" onClick={this.logOut}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span> Logout</span>
                    </a>
                </li>

            </ul>
        );
    }
}