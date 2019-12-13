// Import require modules

import React from 'react';
import Service from '../../Services/service';
import Auth from '../../Authantication/Auth';
import User from '../User/index';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';


export default class Sharelink extends React.Component {

    // Declare constructor 

    constructor(props) {
        super(props);


        this.services = new Service();
        this.auth = new Auth();
        this.user = new User();

        this.onAddInGroup = this.onAddInGroup.bind(this);
        this.onRejectGroup = this.onRejectGroup.bind(this);
        this.sendLocationData = this.sendLocationData.bind(this);

        this.state = {
            gid: '',
            uname: '',
            suid: '',
            gname: '',
            longitude: '',
            latitude: ''
        }

    }

    sendLocationData() {

        const location = window.navigator && window.navigator.geolocation

        if (location) {

            location.getCurrentPosition((position) => {

                this.setState({
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                })
                
                // console.log("new lat, long:- ", this.state.latitude, this.state.longitude);
                // console.log("current lat, long:- ", current_latchar, current_longchar);
        // console.log("Send Location!");

            let encrypted_uid = localStorage.getItem('uid');
            if (!encrypted_uid) {
                return false;
            }
            var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
            var userid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
            localStorage.setItem("latitude", latitude);

            var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
            localStorage.setItem("longitude", longitude);

        // update location on server
        // ************************ sending location start *****************************        

            var groupkeys = JSON.parse(localStorage.getItem("gkeys"));
            console.log("gkeys in senddata",groupkeys);

            var data_update = [];
            // encrypt with gkeys
            // var groupkeysSize = Object.keys(groupkeys).length;
            
            for(var i=0;i<groupkeys.length;i++){

                var cur_gkey = groupkeys[i].gkey;

                //gkey is encrypted => decrypt gkey 
                var bytes_gkey = CryptoJS.AES.decrypt(cur_gkey.toString(),'Location-Sharing');
                var decrypted_gkey = JSON.parse(bytes_gkey.toString(CryptoJS.enc.Utf8));
                console.log("[SEND_LOCATION] decrypted_gkey: ",decrypted_gkey);

                let local_latitude = localStorage.getItem('latitude');
                let bytes_latitude = CryptoJS.AES.decrypt(local_latitude.toString(), 'Location-Sharing');
                let current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));

                let local_longitude = localStorage.getItem('longitude');
                let bytes_longitude = CryptoJS.AES.decrypt(local_longitude, 'Location-Sharing');
                let current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));

                console.log("current_latchar, current_longchar",current_latchar,current_longchar);

                var latitude = CryptoJS.AES.encrypt(JSON.stringify(current_latchar), decrypted_gkey);
                var longitude = CryptoJS.AES.encrypt(JSON.stringify(current_longchar), decrypted_gkey);
                console.log("[SEND_LOCATION] encrypted lat, long: ",latitude.toString(), longitude.toString());

                var blatitude = CryptoJS.AES.decrypt(latitude.toString(), decrypted_gkey);
                var clatchar = JSON.parse(blatitude.toString(CryptoJS.enc.Utf8));
                
                var blongitude = CryptoJS.AES.decrypt(longitude.toString(), decrypted_gkey);
                var clongchar = JSON.parse(blongitude.toString(CryptoJS.enc.Utf8));

                console.log("[SEND_LOCATION] decrypted: ",clatchar,clongchar);

                var data = {
                    uid: userid,
                    gid: groupkeys[i].gid,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    kv:groupkeys[i].kv,
                    cd: new Date()
                }
                data_update.push(data);
            }
            this.services.senddata('UpdateLocation', data_update);
        // ************************ sending location complete*****************************
            });
        }
        
    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount = () => {
        const location = window.navigator && window.navigator.geolocation
        if (location) {
            location.getCurrentPosition((position) => {
                this.setState({
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                })
            let encrypted_uid = localStorage.getItem('uid');
            if (!encrypted_uid) {
                return false;
            }
            var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
            var userid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

            var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
            localStorage.setItem("latitude", latitude);

            var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
            localStorage.setItem("longitude", longitude)
            })
        }

        this.auth.authantication();
        this.auth.reconnection();

        let params = (new URL(document.location)).searchParams;
        var modify_name = params.get('name');
        let puname = modify_name.replace('_', ' ');


        var sdata = {
            shareid: params.get('shareid')
        }

        this.services.senddata('getGroupData', sdata);
        this.services.getdata().subscribe(async (res) => {
            switch (res.event) {
                case 'getGroupData':

                    console.log("get all group data:- ", res.data);

                    this.setState({
                        gid: res.data[0]._id,
                        uname: puname,
                        suid: res.data[0].uid,
                        gname: res.data[0].groupname
                    })

                    let decryptedData_username = localStorage.getItem('username');
                    if (decryptedData_username) {
                        var bytes_username = CryptoJS.AES.decrypt(decryptedData_username.toString(), 'Location-Sharing');
                        var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

                        if (username === puname) {
                            this.props.history.push('/');
                        } else {
                            console.log("differ");
                        }
                    } else {
                        this.props.history.push('/');
                    }

                    break;
                default:
                    break;
            }
        });
    }

    componentDidUpdate(){
        console.log("state updated",this.state);
    }

    onAddInGroup() {

        // let decryptedData_invitecode = localStorage.getItem('invitecode');
        // var bytes_invitecode = CryptoJS.AES.decrypt(decryptedData_invitecode.toString(), 'Location-Sharing');
        // var invitcode = JSON.parse(bytes_invitecode.toString(CryptoJS.enc.Utf8));
        let encrypted_uid = localStorage.getItem('uid');
        var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
        var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

        var data = {
            uid: uid,
            GroupId: this.state.gid
            // InviteCode: invitcode
        };
        
        this.services.senddata('AddMember', data);
            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'AddMemebrResp':
                        if (res.data.error) {
                            alertify.error(res.data.error);
                        } else {
                            console.log("Addmember respose success")
                            var getGroupKeyData = {
                                uid: encrypted_uid
                            }
                            this.services.senddata('getGroupKeys', getGroupKeyData);
                                this.services.getdata().subscribe((res) =>{
                                    switch (res.event) {
                                        case 'getGroupKeysResponse':
                                            console.log("getGroupkey",res.data);
                                            if(res.data){
                                                console.log("grpKey_info",res.data);
                                                localStorage.setItem("gkeys",JSON.stringify(res.data).toString());
                                                // send location to new and other groups
                                                this.sendLocationData();
    
                                                console.log("[AddMemberResp] Location sent to newly joined group!")
                                                this.props.history.push('/user');
                                            }
                                            break; 
                                        default:
                                            break;
                                    }
                            });
                            
                        }
                        break;
                }
            });
            alertify.success("Join successfully");
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
                                        {this.state.uname} send you invite to join '{this.state.gname}' group?
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