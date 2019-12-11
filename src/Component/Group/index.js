// Import require modules

import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import Service from '../../Services/service';
import Auth from '../../Authantication/Auth';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';
import moment from 'moment';

// Declare globle variables to use this page

var map, marker, infoWindow, bounds, flightPath;
var pos = [];
var lineData = [];

export default class Groups extends React.Component {

    // Declare constructor 

    constructor(props) {
        super(props);

        // Declare state variables, methods and class objects for use this page

        this.state = {
            groups: [],
            members: [],
            uid: '',
            gid: '',
            groupName: '',
            rmid: '',
            invitecode: '',
            errcode: true,
            groupname: '',
            errgname: true,
            disgmembershow: false,
            groupmodelshow: false,
            groupdeletemodelshow: false,
            addnewgroupmodelshow: false,
            removegroupmodelshow: false,
            disdetail: false,
            userupdatedata: [],
            shoesharelinkmodel: false,
            sharetxtlink: '',
            showmap: false
        }

        this.services = new Service();
        this.auth = new Auth();

        this.onChangeInviteCode = this.onChangeInviteCode.bind(this);
        this.onJoinSubmit = this.onJoinSubmit.bind(this);
        this.onGroupSubmit = this.onGroupSubmit.bind(this);
        this.onChangeGroupName = this.onChangeGroupName.bind(this);
        this.delgroupdata = this.delgroupdata.bind(this);
        this.onCloseModel = this.onCloseModel.bind(this);
        this.onCloseMemberModel = this.onCloseMemberModel.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onAddNewGroup = this.onAddNewGroup.bind(this);
        this.onRemoveDeleteSubmit = this.onRemoveDeleteSubmit.bind(this);
        this.getsharelink = this.getsharelink.bind(this);
        this.onChangeShareTxtLink = this.onChangeShareTxtLink.bind(this);
        this.gethistory = this.gethistory.bind(this);
        this.onCloseMemberHistory = this.onCloseMemberHistory.bind(this);

    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount() {
        this.auth.authantication();
        this.auth.reconnection();
        this.getAllGroups();
        setTimeout(() => {
            map = new window.google.maps.Map(document.getElementById('map'), {
                zoom: 11
            });
            bounds = new window.google.maps.LatLngBounds();
            this.getAllLocations();
        }, 1000)
    }

    // Declare getAllGroups method for get all group of user

    getAllGroups() {

        let decryptedData_uid = localStorage.getItem('uid');
        var bytes_uid = CryptoJS.AES.decrypt(decryptedData_uid.toString(), 'Location-Sharing');
        var uid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

        this.setState({
            uid: uid
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

    }

    // Declare onChange event for set value of invitecode

    onChangeInviteCode(e) {
        this.setState({
            invitecode: e.target.value
        });
    }

    // Declare onChange event for set value of sharelink

    onChangeShareTxtLink(e) {
        this.setState({
            sharetxtlink: e.target.value
        });
    }

    // Declare onChange event for set value of groupname

    onChangeGroupName(e) {
        this.setState({
            groupname: e.target.value
        });
    }

    // Declare onJoinSubmit method for add user to our group

    onJoinSubmit(e) {
        e.preventDefault();

        if (this.state.invitecode == '') {
            this.setState({
                errcode: false
            });
            this.state.errcode = false;
        } else {
            this.setState({
                errcode: true
            });
            this.state.errcode = true;
        }

        if (this.state.errcode == true) {

            var data = {
                uid: this.state.uid,
                GroupId: this.state.gid,
                InviteCode: this.state.invitecode
            };

            this.services.senddata('AddMember', data);

            this.setState({
                invitecode: '',
                groupmodelshow: false
            })
            this.state.groupmodelshow = false;

            this.services.getdata().subscribe((res) => {
                switch (res.event) {
                    case 'AddMemebrResp':

                        if (res.data.error) {
                            alertify.error(res.data.error);
                            this.services.offsocket();
                        } else {
                            alertify.success("Join successfully");
                            this.services.offsocket();
                        }

                        break;
                }
            });

        }

    }

    // Declare onGroupSubmit method for add new group

    onGroupSubmit(e) {
        e.preventDefault();

        let encrypted_lat = localStorage.getItem('latitude');
        // var bytes_lat = CryptoJS.AES.decrypt(decryptedData_lat.toString(), 'Location-Sharing');
        // var get_lat = JSON.parse(bytes_lat.toString(CryptoJS.enc.Utf8));

        let encrypted_long = localStorage.getItem('longitude');
        // var bytes_long = CryptoJS.AES.decrypt(decryptedData_long.toString(), 'Location-Sharing');
        // var get_long = JSON.parse(bytes_long.toString(CryptoJS.enc.Utf8));

        if (this.state.groupname == '') {
            this.setState({
                errgname: false
            });
            this.state.errgname = false;
        } else {
            this.setState({
                errgname: true
            });
            this.state.errgname = true;
        }

        if (this.state.errgname == true) {

            var data = {
                uid: this.state.uid,
                GroupName: this.state.groupname,
                latitude: encrypted_lat,
                longitude: encrypted_long,
            }

            this.services.senddata('AddGroup', data);
            this.setState({
                groupname: '',
                addnewgroupmodelshow: false
            })
            this.addnewgroupmodelshow = false;
            alertify.success("Add Successfully");

            let encrypted_uid = localStorage.getItem('uid');
            var getGroupKeyData = {
                uid: encrypted_uid.toString()
            }
            this.services.senddata('getGroupKeys', getGroupKeyData);
            this.services.getdata().subscribe((res) =>{
                switch (res.event) {
                    case 'getGroupKeysResponse':
                        console.log("getGroupkey",res.data);
                        if(res.data){
                            console.log("grpKey_info",res.data);
                            localStorage.setItem("gkeys",JSON.stringify(res.data).toString());
                        }
                        break; 
                    default:
                        break;
                }
            });
        }


    }

    // Declare delgroupdata method for open confirmation model to delete group

    delgroupdata(id) {

        this.setState({
            gid: id,
            groupdeletemodelshow: true
        })

        this.state.groupdeletemodelshow = true;

    }

    // Declare onDeleteSubmit method for delete group

    onDeleteSubmit(e) {

        e.preventDefault();

        var data = {
            uid: this.state.uid,
            groupId: this.state.gid
        }

        this.services.senddata('DeleteGroup', data);
        this.setState({
            gid: '',
            groupdeletemodelshow: false
        })
        this.state.groupdeletemodelshow = false;
        alertify.success("Deleted Successfully");

    }

    // Declare getgroupdata method for add member in group on model

    getgroupdata(id, name) {
        this.setState({
            gid: id,
            groupName: name,
            groupmodelshow: true
        })

        this.state.groupmodelshow = true;
        console.log("flage for open popup:- ", this.state.groupmodelshow);
    }

    // Declare getsharelink method for invite this group for add user

    getsharelink(id, name, shareid) {

        let decryptedData_name = localStorage.getItem('username');
        var bytes_name = CryptoJS.AES.decrypt(decryptedData_name.toString(), 'Location-Sharing');
        var username = JSON.parse(bytes_name.toString(CryptoJS.enc.Utf8));

        let modify_name = username.replace(' ', '_');

        this.setState({
            gid: id,
            groupName: name,
            shoesharelinkmodel: true,
            sharetxtlink: this.auth.services.shareDomail + '?shareid=' + shareid + '&name=' + modify_name
        })
        this.state.shoesharelinkmodel = true;
    }

    // Declare onGetdata method for list member of group on model

    onGetdata(id, name) {

        this.setState({
            gid: id,
            groupName: name,
            disgmembershow: true
        })

        this.state.disgmembershow = true;

        var data = {
            uid: this.state.uid,
            GroupId: id
        }

        this.services.senddata('GetMemeberList', data);
        this.services.getdata().subscribe((res) => {
            switch (res.event) {
                case 'GroupMemberList':
                    this.setState({
                        members: res.data.MemberList
                    })
                    break;
            }
        });

    }

    // Declare getdetail method for get details of lat, long of member on model

    getdetail(id) {

        this.setState({
            disdetail: true
        })
        this.state.disdetail = true;

        console.log("flage for open model:- ", this.state.disdetail);

        var data = {
            uid: id,
            gid: this.state.gid
        }

        this.setState({
            userupdatedata: []
        });

        console.log("req for latlong data:- ", data);


        this.services.senddata('getHistory', data);
        this.services.getdata().subscribe(async (res) => {
            switch (res.event) {
                case 'getHistory':
                    var finaldata = this.removeDuplicates(res.data, 'lat');

                    console.log("get all location:- ", finaldata);

                    this.setState({
                        userupdatedata: finaldata
                    });

                    this.services.offsocket();

                    break;
            }
        });

        // this.services.senddata('userDetails', data);
        // this.services.getdata().subscribe((res) => {
        //     switch (res.event) {
        //         case 'userDetails':

        //             console.log("response data:- ", res.data);

        //             this.setState({
        //                 userupdatedata: res.data
        //             })
        //             let userArray = []
        //             for (var i = 0; i < res.data.length; i++) {
        //                 let decryptedData_lat = res.data[i].latitude;
        //                 var bytes_lat = CryptoJS.AES.decrypt(decryptedData_lat.toString(), 'Location-Sharing');
        //                 var lat = JSON.parse(bytes_lat.toString(CryptoJS.enc.Utf8))

        //                 let decryptedData_long = res.data[i].longitude;
        //                 var bytes_long = CryptoJS.AES.decrypt(decryptedData_long.toString(), 'Location-Sharing');
        //                 var long = JSON.parse(bytes_long.toString(CryptoJS.enc.Utf8));

        //                 var timestamp = res.data[i].cd;
        //                 let obj = {
        //                     lat: parseFloat(lat).toFixed(4),
        //                     long: parseFloat(long).toFixed(4),
        //                     cd: timestamp
        //                 }
        //                 userArray.push(obj)
        //             }

        //             this.setState({
        //                 userupdatedata: userArray
        //             });

        //             console.log("set array:- ", userArray);

        //             break;
        //     }
        // });

    }

    // Declare onRemoveMember method for open confirmation model of remove member

    onRemoveMember(rmid) {

        this.setState({
            removegroupmodelshow: true,
            disgmembershow: false,
            rmid: rmid
        })

        this.state.removegroupmodelshow = true;
        this.state.disgmembershow = false;

    }

    // Declare onRemoveDeleteSubmit method for remove member from group

    onRemoveDeleteSubmit(e) {
        e.preventDefault();

        var data = {
            uid: this.state.uid,
            GroupId: this.state.gid,
            RmId: this.state.rmid,
            removegroupmodelshow: false
        }


        this.services.senddata('RemoveMember', data);
        this.state.removegroupmodelshow = false;
        alertify.success("Remove Successfully");

        // this.services.getdata().subscribe((res) => {
        //     switch (res.event) {
        //         case 'GroupMemberList':
        //             this.setState({
        //                 members: res.data
        //             })
        //             break;
        //     }
        // });


    }

    // Declare onAddNewGroup method for open model of add new group

    onAddNewGroup() {
        this.setState({
            addnewgroupmodelshow: true
        })
        this.state.addnewgroupmodelshow = true;
    }

    // Declare onCloseModel method for close all model

    onCloseModel() {
        this.setState({
            disgmembershow: false,
            groupmodelshow: false,
            groupdeletemodelshow: false,
            addnewgroupmodelshow: false,
            removegroupmodelshow: false,
            disdetail: false,
            shoesharelinkmodel: false
        })
        this.state.disgmembershow = false;
        this.state.groupmodelshow = false;
        this.state.groupdeletemodelshow = false;
        this.state.addnewgroupmodelshow = false;
        this.state.removegroupmodelshow = false;
        this.state.disdetail = false;
        this.state.shoesharelinkmodel = false;
    }

    // Declare onCloseMemberModel method for close member model 

    onCloseMemberModel() {
        this.setState({
            disdetail: false
        })
        this.state.disdetail = false;
    }

    // Declare onCloseMemberHistory method for close member model 

    onCloseMemberHistory() {
        this.setState({
            showmap: false
        })
        this.state.showmap = false;
    }

    // Declare copyToClipboard method for copy share link click on button

    copyToClipboard(link) {

        var textField = document.createElement('textarea')
        textField.innerText = link
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()
        alertify.success("Copied!");

    }

    // Declare handleLocationError method for when any kid of location related error is occur at that time that method handled current location

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    // Declare getAllLocations method for set and render map by default when intialize current page

    getAllLocations() {

        infoWindow = new window.google.maps.InfoWindow();
        if (navigator && navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function (position) {

                pos = [position.coords.latitude, position.coords.longitude]
                let centerpos = { "lat": position.coords.latitude, "lng": position.coords.longitude }
                map.setCenter(centerpos);

            }, function (error) {
                console.log("error", error)
                this.handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            this.handleLocationError(false, infoWindow, map.getCenter());
        }
    }

    gethistory = (uid) => {

        this.setState({
            showmap: true
        });
        this.state.showmap = true;

        console.log("flag for open model:- ", this.state.showmap);

        var data = {
            uid: uid,
            gid: this.state.gid
        };

        console.log("send req for get history:- ", data);

        this.services.senddata('getHistory', data);
        this.services.getdata().subscribe(async (res) => {
            switch (res.event) {
                case 'getHistory':

                    console.log("get all location:- ", res.data);

                    var finaldata = this.removeDuplicates(res.data, 'lat');

                    // console.log("newdata:- ", this.removeDuplicates(finaldata, 'lng'));

                    var lendata = res.data.length;

                    flightPath = new window.google.maps.Polyline({
                        path: finaldata,
                        geodesic: true,
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });

                    if (lineData.length === 0) {
                        if (lendata == 0 || lendata == 1) {
                            lineData = [];
                            // await lineData.setMap(null);
                        } else {
                            lineData = flightPath;
                            console.log("lineData:- ", lineData);
                            lineData.setMap(map);
                        }
                    } else {
                        if (lendata == 0 || lendata == 1) {
                            await lineData.setMap(null);
                        } else {
                            await lineData.setMap(null);
                            lineData = flightPath;
                            console.log("lineData:- ", lineData);
                            lineData.setMap(map);
                        }
                    }

                    this.services.offsocket();

                    break;
            }
        });

    }

    removeDuplicates(array, key) {
        return array.filter((obj, index, self) =>
            index === self.findIndex((el) => (
                el[key] === obj[key]
            ))
        )
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
                                        <div className="card-header py-3">
                                            <h6 className="m-0 font-weight-bold text-primary">Group List</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <div>
                                                    <button type="button" className="btn btn-primary" onClick={this.onAddNewGroup}><i className="fas fa-plus"></i> Add New</button>
                                                </div>
                                                <br />
                                                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                                    <thead>
                                                        <tr>
                                                            <th>Group Name</th>
                                                            <th >Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            this.state.groups.map(function (obj, i) {
                                                                return (
                                                                    <tr key={i}>
                                                                        <td>
                                                                            <span className="btn-hover myspan" onClick={this.onGetdata.bind(this, obj._id, obj.groupname)}>{obj.groupname}</span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="res-action">
                                                                                <span className="btn btn-primary btn-hover" onClick={this.getgroupdata.bind(this, obj._id, obj.groupname)} title="Add New Group"><i className="fas fa-plus"></i></span>
                                                                                &nbsp;&nbsp;
                                                                                <span className="btn btn-success btn-hover" onClick={this.getsharelink.bind(this, obj._id, obj.groupname, obj.shareid)} title="Share Link"><i className="fas fa-share"></i></span>
                                                                                &nbsp;&nbsp;
                                                                                {
                                                                                    (obj.default == true) ?
                                                                                        ''
                                                                                        :
                                                                                        <span onClick={this.delgroupdata.bind(this, obj._id)} className="btn btn-danger btn-hover" title="Remove Group"><i className="fas fa-times"></i></span>
                                                                                }
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }, this)
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <Footer />
                </div>


                {/* open model for add new member in specific group */}

                <div className={(this.state.groupmodelshow) ? 'modal fade show disblock' : 'modal fade disnone'} id="groupmodel" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onJoinSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Join {this.state.groupName}</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">

                                    <div className="form-group">
                                        <label>Invite Code</label>
                                        {
                                            (this.state.errcode) ?
                                                <input type="text" value={this.state.invitecode} onChange={this.onChangeInviteCode} className="form-control" placeholder="Please Enter Invite Code" />
                                                :
                                                <input type="text" style={{ border: '1px solid red' }} value={this.state.invitecode} onChange={this.onChangeInviteCode} className="form-control" placeholder="Please Enter Invite Code" />
                                        }
                                    </div>

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-primary" >Join</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.groupmodelshow) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for add new member in specific group */}

                <div className={(this.state.shoesharelinkmodel) ? 'modal fade show disblock' : 'modal fade disnone'} id="groupmodel" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1135px' }} role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onJoinSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Send this link to others to invite</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">

                                    <div className="input-group">
                                        <input type="text" value={this.state.sharetxtlink} onChange={this.onChangeShareTxtLink} className="form-control" placeholder="Invite Your Friends" />
                                        <div className="input-group-append">
                                            <button className="btn btn-success" type="button" onClick={this.copyToClipboard.bind(this, this.state.sharetxtlink)}>
                                                Copy Link
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </form>
                        </div>

                    </div>
                </div>

                {
                    (this.state.shoesharelinkmodel) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for display member of specific group */}

                <div className={(this.state.disgmembershow) ? 'modal fade show disblock' : 'modal fade disnone'} id="groupmember" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">{this.state.groupName} Members</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {
                                        this.state.members.map(function (obj, i) {
                                            return (
                                                <div className="row mymargin" key={i}>
                                                    <div className="col-xl-8 col-8">
                                                        {
                                                            (obj.uid == this.state.uid) ?
                                                                <span className="btn-hover" onClick={this.getdetail.bind(this, obj.uid)} style={{ fontWeight: 'bolder' }}>You</span> :
                                                                <span className="btn-hover" onClick={this.getdetail.bind(this, obj.uid)}>{obj.username}</span>
                                                        }
                                                    </div>
                                                    <div className="col-xl-4 col-4 text-right" style={{ paddingRight: '13px', paddingLeft: '0px' }}>
                                                        {
                                                            (obj.uid == this.state.uid) ?
                                                                <span className="btn btn-primary btn-hover" style={{ padding: '6px', paddingRight: '10px', paddingLeft: '10px' }} onClick={this.gethistory.bind(this, obj.uid)} title="Location History">
                                                                    <i className="fas fa-history"></i>
                                                                </span> :
                                                                <div>
                                                                    <span onClick={this.onRemoveMember.bind(this, obj.uid)} className="btn btn-danger btn-hover">
                                                                        <i className="fas fa-times"></i>
                                                                    </span>
                                                                    &nbsp;&nbsp;
                                                                    <span className="btn btn-primary btn-hover" style={{ padding: '6px', paddingRight: '10px', paddingLeft: '10px' }} onClick={this.gethistory.bind(this, obj.uid)} title="Location History">
                                                                        <i className="fas fa-history"></i>
                                                                    </span>
                                                                </div>

                                                        }

                                                    </div>
                                                </div>
                                            )
                                        }, this)
                                    }

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.disgmembershow) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for member details */}

                <div className={(this.state.disdetail) ? 'modal fade show disblock' : 'modal fade disnone'} id="groupmember" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content" style={{ maxHeight: '95vh', overflow: 'auto' }}>
                            <form onSubmit={this.onSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Members Details</h5>
                                    <button type="button" className="close" onClick={this.onCloseMemberModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th>Latitude</th>
                                                <th>Longitude</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {(this.state.userupdatedata) ?
                                                this.state.userupdatedata.map(function (obj, i) {
                                                    return (
                                                        <tr key={i}>
                                                            <td>
                                                                <span>{obj.lat}</span>
                                                            </td>
                                                            <td>
                                                                <span>{obj.lng}</span>
                                                            </td>
                                                            <td>
                                                                <span>{moment(obj.cd).format('DD-MM-YYYY HH:mm:ss')}</span>
                                                            </td>
                                                        </tr>
                                                    )
                                                }, this)
                                                : ''
                                            }
                                        </tbody>
                                    </table>

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseMemberModel} data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.disdetail) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for delete confirmation */}

                <div className={(this.state.groupdeletemodelshow) ? 'modal fade show disblock' : 'modal fade disnone'} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onDeleteSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Delete Group</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are Your Sure You Want To Delete ?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-danger" >Delete</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.groupdeletemodelshow) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for add new group */}

                <div className={(this.state.addnewgroupmodelshow) ? 'modal fade show disblock' : 'modal fade disnone'} id="newgroup" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onGroupSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Add New Group</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Group Name</label>
                                        {
                                            (this.state.errgname) ?
                                                <input type="text" value={this.state.groupname} onChange={this.onChangeGroupName} className="form-control" placeholder="Please Enter Group Name" />
                                                :
                                                <input type="text" style={{ border: '1px solid red' }} value={this.state.groupname} onChange={this.onChangeGroupName} className="form-control" placeholder="Please Enter Group Name" />
                                        }

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-primary">Add</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.addnewgroupmodelshow) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for delete member confirmation */}

                <div className={(this.state.removegroupmodelshow) ? 'modal fade show disblock' : 'modal fade disnone'} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">

                        <div className="modal-content">
                            <form onSubmit={this.onRemoveDeleteSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Delete Member</h5>
                                    <button type="button" className="close" onClick={this.onCloseModel} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are Your Sure You Want To Delete ?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseModel} data-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-danger" >Delete</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.removegroupmodelshow) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

                {/* open model for show history of user */}

                <div className={(this.state.showmap) ? 'modal fade show disblock' : 'modal fade disnone'} id="groupmodel" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '700px' }}>

                        <div className="modal-content">
                            <form onSubmit={this.onJoinSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">History</h5>
                                    <button type="button" className="close" onClick={this.onCloseMemberHistory} data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="maMap" id="map" style={{ height: '500px' }} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.onCloseMemberHistory} data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                {
                    (this.state.showmap) ? <div className="modal-backdrop fade show"></div> : ''
                }

                {/* END */}

            </div>

        );
    }

}
