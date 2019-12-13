// Import require modules

import React from 'react';
import Sidebar from '../Common/Sidebar';
import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import Service from '../../Services/service';
import Auth from '../../Authantication/Auth';
import alertify from 'alertifyjs';
import CryptoJS from 'crypto-js';

// Declare globle variables to use this page

var map, marker, infoWindow, bounds;
var pos = []
var markers = [];
var userGroupids = "";
var currentGroupid = "";
var lastWindow = null;

var hostprofileurl = "https://ls.artoon.in/img/user.png";

export default class User extends React.Component {

    // Declare constructor 

    constructor(props) {
        super(props);

        // Declare state variables, methods and class objects for use this page

        this.services = new Service();
        this.auth = new Auth();

        this.onChangeGroup = this.onChangeGroup.bind(this);
        this.defaultLocData = this.defaultLocData.bind(this);
        this.checkAndSendLocationData = this.checkAndSendLocationData.bind(this);
        this.sendLocationData = this.sendLocationData.bind(this);

        this.state = {
            map: {},
            sharelink: '',
            groups: [],
            members: [],
            latlong: [],
            invite: '',
            errinvite: true,
            a: '',
            showMenu: true,
            latitude: '30.0',
            longitude: '-121.0',
            gid: '',
            sharetxtlink: '',
            gname: '',
            gfullname: ''
        }

        // this interval set 30 seconds and trace current location of login user
        setInterval(() => {
            this.checkAndSendLocationData();
        }, 30*1000)
    }

    // Declare componentDidMount method for mount some data and methods on load this page

    componentDidMount() {

        this.auth.authantication();
        
        setTimeout(() => {
            map = new window.google.maps.Map(document.getElementById('map'), {
                zoom: 11
            });
            bounds = new window.google.maps.LatLngBounds();
            this.getAllLocations()
            this.defaultLocData();
        }, 1000)

        
        let encrypted_uid = localStorage.getItem('uid');
        var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
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
                        // this.sendLocationData();
                        
                    }
                    break; 
                default:
                    break;
            }
        });

        this.services.getdata().subscribe((res) => {
            switch (res.event) {
                case 'UserLocationUpdate':
                    console.log("live data res:- ", res);
                    if (userGroupids.indexOf(res.data.uid) > -1) {
                        for (var i = 0; i < markers.length; i++) {
                            markers[i].setMap(null);
                        }

                        var data = {
                            uid: this.state.uid,
                            GroupId: currentGroupid
                        }

                        this.services.senddata('GetMemeberListMount', data);
                        this.services.getdata().subscribe((res) => {
                            switch (res.event) {
                                case 'GroupMemberLisMount':

                                    userGroupids = "";

                                    userGroupids = res.data.members;

                                    res.data.MemberList.forEach((item, i) => {

                                        // var location_coords = { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) };

                                        var member_kv = item.latest_kv;

                                        var groupkeys = JSON.parse(localStorage.getItem("gkeys"));
                                        console.log("gkeys in senddata",groupkeys);

                                        for(var i=0;i<groupkeys.length;i++){
                                            var cur_gkey = groupkeys[i].gkey;

                                            var gid = groupkeys[i].gid;

                                            var grp_kv = groupkeys[i].kv;
                                            
                                            if(currentGroupid == gid && member_kv == grp_kv){
                                                var bytes_gkey = CryptoJS.AES.decrypt(cur_gkey,'Location-Sharing');
                                                var decrypted_gkey = JSON.parse(bytes_gkey.toString(CryptoJS.enc.Utf8));

                                                var bytes_latitude = CryptoJS.AES.decrypt(item.latitude, decrypted_gkey);
                                                var current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));

                                                var bytes_longitude = CryptoJS.AES.decrypt(item.longitude, decrypted_gkey);
                                                var current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));

                                                var location_coords = { lat: parseFloat(current_latchar), lng: parseFloat(current_longchar) };

                                                console.log("change lat long:- ", location_coords);

                                                marker = new window.google.maps.Marker({
                                                    position: location_coords,
                                                    map: map,
                                                    title: item.username,
                                                    icon: {
                                                        url: (item.profile) ? item.profile : hostprofileurl,
                                                        scaledSize: { width: 50, height: 50 }
                                                    },
                                                    optimized: false
                                                })
        
                                                var content = '<div id="content">' +
                                                    '<h6>' + item.username + '</h6>' +
                                                    '</div>';
                                                var infowindow = new window.google.maps.InfoWindow();
                                                window.google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
                                                    return function () {
        
                                                        if (lastWindow) lastWindow.close();
        
                                                        infowindow.setContent(content);
                                                        infowindow.open(map, marker);
                                                        map.setCenter(marker.getPosition());
        
                                                        lastWindow = infowindow;
                                                    };
                                                })(marker, content, infowindow));
                                                markers.push(marker)
                                            }
                                        }   
                                    })
                                    break;
                                default:
                                    break;
                            }
                        });

                    } else {
                        console.log("not inarray", currentGroupid);
                    }
                    break;
                default:
                    break;
            }
        });

    }

    checkAndSendLocationData(){
            
        let encrypted_uid = localStorage.getItem('uid');
        if (!encrypted_uid) {
            return false;
        }
        var bytes_uid = CryptoJS.AES.decrypt(encrypted_uid.toString(), 'Location-Sharing');
        var userid = JSON.parse(bytes_uid.toString(CryptoJS.enc.Utf8));

        let encrypted_latitude = localStorage.getItem('latitude');
        var bytes_latitude = CryptoJS.AES.decrypt(encrypted_latitude.toString(), 'Location-Sharing');
        var current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));

        let encrypted_longitude = localStorage.getItem('longitude');
        var bytes_longitude = CryptoJS.AES.decrypt(encrypted_longitude.toString(), 'Location-Sharing');
        var current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));

        const location = window.navigator && window.navigator.geolocation

        if (location) {

            location.getCurrentPosition((position) => {

                this.setState({
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                })
                
                console.log("new lat, long:- ", this.state.latitude, this.state.longitude);
                console.log("current lat, long:- ", current_latchar, current_longchar);
                // current_latchar = '20.5811109'
                // current_longchar = '-121.41131959999998'
                if (this.state.latitude === current_latchar && this.state.longitude === current_longchar) {
                    console.log("state_lat==cur_lat","->> No change",this.state.latitude,current_latchar);
                    console.log("state_lng==cur_lng","->> No change",this.state.longitude,current_longchar);

                }else{
                    
                    console.log("state_lat!=cur_lat"," -->> Change detected! Push new location to server.");
                    console.log("state_lat!=cur_lat","->> change",this.state.latitude,current_latchar);
                    console.log("state_lng!=cur_lng","->> change",this.state.longitude,current_longchar);

                    var latitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.latitude), 'Location-Sharing');
                    localStorage.setItem("latitude", latitude);

                    var longitude = CryptoJS.AES.encrypt(JSON.stringify(this.state.longitude), 'Location-Sharing');
                    localStorage.setItem("longitude", longitude);
                    
                    let encrypted_email = localStorage.getItem('email');
                    let encrypted_username = localStorage.getItem('username');

                    var bytes_email = CryptoJS.AES.decrypt(encrypted_email.toString(), 'Location-Sharing');
                    var email = JSON.parse(bytes_email.toString(CryptoJS.enc.Utf8));

                    var bytes_username = CryptoJS.AES.decrypt(encrypted_username.toString(), 'Location-Sharing');
                    var username = JSON.parse(bytes_username.toString(CryptoJS.enc.Utf8));

                    var newSocketData = {
                        uid: userid,
                        email: email,
                        username: username,
                        status: false,
                        calloption: "no"
                    }
                    console.log("new location:- ", newSocketData);
                    this.services.senddata('Auth', newSocketData);

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
                        console.log("[SEND_LOCATION] decrypted_gkey: ",decrypted_gkey," for gid: ",groupkeys[i].gid);

                        let local_latitude = localStorage.getItem('latitude');
                        let bytes_latitude = CryptoJS.AES.decrypt(local_latitude.toString(), 'Location-Sharing');
                        let current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));

                        let local_longitude = localStorage.getItem('longitude');
                        let bytes_longitude = CryptoJS.AES.decrypt(local_longitude.toString(), 'Location-Sharing');
                        let current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));

                        let latitude = CryptoJS.AES.encrypt(JSON.stringify(current_latchar), decrypted_gkey);
                        let longitude = CryptoJS.AES.encrypt(JSON.stringify(current_longchar), decrypted_gkey);

                        var data = {
                            uid: userid,
                            gid: groupkeys[i].gid,
                            latitude: latitude.toString(),
                            longitude: longitude.toString(),
                            kv:groupkeys[i].kv,
                            cd: new Date(),
                        }
                        data_update.push(data);
                    }
                    this.services.senddata('UpdateLocation', data_update);
                // ************************ sending location complete***************************** 

                }
            }, (error) => {
                console.log("Update Location error:- ", error)
            });
        } else {
            this.handleLocationError(false, infoWindow, map.getCenter());
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
                console.log("[SEND_LOCATION] decrypted_gkey: ",decrypted_gkey," for gid: ",groupkeys[i].gid, " and kv:", groupkeys[i].kv);

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

                // var blatitude = CryptoJS.AES.decrypt(latitude.toString(), decrypted_gkey);
                // var clatchar = JSON.parse(blatitude.toString(CryptoJS.enc.Utf8));
                
                // var blongitude = CryptoJS.AES.decrypt(longitude.toString(), decrypted_gkey);
                // var clongchar = JSON.parse(blongitude.toString(CryptoJS.enc.Utf8));

                // console.log("[SEND_LOCATION] decrypted: ",clatchar,clongchar);

                var data = {
                    uid: userid,
                    gid: groupkeys[i].gid,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    kv: groupkeys[i].kv,
                    cd: new Date(),
                }
                console.log("[SEND LOCATION] data: ",data);
                data_update.push(data);
            }
            this.services.senddata('UpdateLocation', data_update);
        // ************************ sending location complete*****************************
            });
        }
        
    }

    // Declare defaultLocData method for set map of default group member location

    defaultLocData() {

        this.sendLocationData();

        let encrypted_name = localStorage.getItem('username');
        var bytes_name = CryptoJS.AES.decrypt(encrypted_name.toString(), 'Location-Sharing');
        var linkuname = JSON.parse(bytes_name.toString(CryptoJS.enc.Utf8));
        
        let modify_name = linkuname.replace(' ', '_');
        
        userGroupids = "";

        this.services.senddata('GetGroupsList', '');
        this.services.getdata().subscribe((res) => {
            switch (res.event) {
                case 'GroupList':

                    res.data.forEach((item, i) => {

                        var groupfullname = linkuname + '_Default Group';

                        if (item.default == true && item.groupname == groupfullname) {

                            this.setState({
                                gid: item._id,
                                gname: item.groupname,
                                sharetxtlink: this.auth.services.shareDomail + '?shareid=' + item.shareid + '&name=' + modify_name,
                                gfullname: groupfullname
                            })

                            // userGroupids = item.members;
                            currentGroupid = item._id;

                            var data = {
                                uid: this.state.uid,
                                GroupId: item._id
                            }

                            this.services.senddata('GetMemeberListDefault', data);
                            this.services.getdata().subscribe((res) => {
                                switch (res.event) {
                                    case 'GroupMemberListDefault':

                                        res.data.MemberList.forEach((items, ii) => {

                                            console.log("MemberItem: ",items);
                                            var member_kv = items.latest_kv;

                                            var groupkeys = JSON.parse(localStorage.getItem("gkeys"));
                                            console.log("[DEFAULT LOC] gkeys from local storage",groupkeys);

                                            for(var i=0;i<groupkeys.length;i++){
                                                var cur_gkey = groupkeys[i].gkey;
                                                var gid = groupkeys[i].gid;

                                                var grp_kv = groupkeys[i].kv;
                                                
                                                if(currentGroupid == gid && member_kv == grp_kv){
                                                    console.log(items.latitude,items.longitude);

                                                    var bytes_gkey = CryptoJS.AES.decrypt(cur_gkey.toString(),'Location-Sharing');
                                                    var decrypted_gkey = JSON.parse(bytes_gkey.toString(CryptoJS.enc.Utf8));
                                                    
                                                    console.log(decrypted_gkey);
                                                    
                                                    var bytes_latitude = CryptoJS.AES.decrypt(items.latitude.toString(), decrypted_gkey);
                                                    var current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));
                                                    
                                                    var bytes_longitude = CryptoJS.AES.decrypt(items.longitude.toString(), decrypted_gkey);
                                                    var current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));
                                                    
                                                    console.log("[DEFAULT_LOC] cur cords: ", items.longitude.toString(), items.latitude.toString());
                                                    var location_coords = { lat: parseFloat(current_latchar), lng: parseFloat(current_longchar) };
                                                    
                                                    // console.log("[DefaultLoc] Location coords : ",location_coords);

                                                    marker = new window.google.maps.Marker({
                                                        position: location_coords,
                                                        map: map,
                                                        title: items.username,
                                                        icon: {
                                                            url: (items.profile) ? items.profile : hostprofileurl,
                                                            scaledSize: { width: 50, height: 50 }
                                                        },
                                                        optimized: false
                                                    })
        
                                                    var content = '<div id="content">' +
                                                        '<h6>' + items.username + '</h6>' +
                                                        '</div>';
                                                    var infowindow = new window.google.maps.InfoWindow();

                                                    window.google.maps.event.addListener(marker, 'click', ((marker, content, infowindow) => {
                                                        return () => {
        
                                                            if (lastWindow) lastWindow.close();
        
                                                            infowindow.setContent(content);
                                                            infowindow.open(map, marker);
                                                            map.setCenter(marker.getPosition());
        
                                                            lastWindow = infowindow;
        
                                                        };
                                                    })(marker, content, infowindow));
        
                                                    markers.push(marker)
                                                    var myoverlay = new window.google.maps.OverlayView();
                                                    myoverlay.draw = function () {
                                                        this.getPanes().markerLayer.id = 'markerLayer';
                                                    };
                                                    myoverlay.setMap(map);
                                                }
                                            }
                                        })
                                    break;
                                default:
                                    break;
                                }
                            });
                        }
                    })
                break;
            default:
                break;
            }
        });

    }

// Declare onChangeGroup method for get and set group wise member location on map

    onChangeGroup(e) {

        let encrypted_name = localStorage.getItem('username');
        var bytes_name = CryptoJS.AES.decrypt(encrypted_name.toString(), 'Location-Sharing');
        var linkuname = JSON.parse(bytes_name.toString(CryptoJS.enc.Utf8));

        let modify_name = linkuname.replace(' ', '_');

        var gdata = this.state.groups;
        gdata.forEach((item, i) => {
            if (item._id == e.target.value) {
                this.setState({
                    gname: item.groupname,
                    sharetxtlink: this.auth.services.shareDomail + '?shareid=' + item.shareid + '&name=' + modify_name
                })
            }
        });

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        var newgid = e.target.value;

        this.setState({
            gid: e.target.value
        })

        var data = {
            uid: this.state.uid,
            GroupId: e.target.value
        }

        this.services.senddata('GetMemeberList', data);
        this.services.getdata().subscribe((res) => {
            switch (res.event) {

                case 'GroupMemberList':

                    userGroupids = "";
                    // console.log("items:- ", res.data);

                    userGroupids = res.data.members;

                    res.data.MemberList.forEach((item, i) => {

                        currentGroupid = item.gid;

                        console.log("MemberItem: ",item);
                        var member_kv = item.latest_kv;

                        var groupkeys = JSON.parse(localStorage.getItem("gkeys"));
                        
                        console.log("gkeys",groupkeys,this.state.groups);

                        for(var i=0;i<groupkeys.length;i++){
                            var cur_gkey = groupkeys[i].gkey;
                            var gid = groupkeys[i].gid;

                            var grp_kv = groupkeys[i].kv;
                            
                            if(currentGroupid == gid && member_kv == grp_kv){
                                console.log("[CUR GROUP] LOOP_CG_fromLS GID_dropdownval ",currentGroupid,gid)
                                var bytes_gkey = CryptoJS.AES.decrypt(cur_gkey,'Location-Sharing');
                                var decrypted_gkey = JSON.parse(bytes_gkey.toString(CryptoJS.enc.Utf8));

                                var bytes_latitude = CryptoJS.AES.decrypt(item.latitude, decrypted_gkey);
                                var current_latchar = JSON.parse(bytes_latitude.toString(CryptoJS.enc.Utf8));

                                var bytes_longitude = CryptoJS.AES.decrypt(item.longitude, decrypted_gkey);
                                var current_longchar = JSON.parse(bytes_longitude.toString(CryptoJS.enc.Utf8));

                                var location_coords = { lat: parseFloat(current_latchar), lng: parseFloat(current_longchar) };

                                marker = new window.google.maps.Marker({
                                    position: location_coords,
                                    map: map,
                                    title: item.username,
                                    icon: {
                                        url: (item.profile) ? item.profile : hostprofileurl,
                                        scaledSize: { width: 50, height: 50 }
                                    },
                                    optimized: false
                                })
        
                                var content = '<div id="content">' +
                                    '<h6>' + item.username + '</h6>' +
                                    '</div>';
                                var infowindow = new window.google.maps.InfoWindow();

                                window.google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
                                    return function () {
        
                                        if (lastWindow) lastWindow.close();
        
                                        infowindow.setContent(content);
                                        infowindow.open(map, marker);
                                        map.setCenter(marker.getPosition());
        
                                        lastWindow = infowindow;
        
                                    };
                                })(marker, content, infowindow));
        
        
                                markers.push(marker)
                            }
                        }
                    })
                    break;
                default:
                    break;
            }
        });

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

    // Declare copyToClipboardForLink method for copy link of group click on button

    copyToClipboardForLink(link) {

        var textField = document.createElement('textarea')
        textField.innerText = link
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()
        alertify.success("Copied!");

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

                                            <div className="col-xl-12">
                                                <div className="row">
                                                    <div className="col-xl-6 col-xs-12" style={{ paddingLeft: '0', paddingTop: '8px' }}>
                                                        <h6 className="m-0 font-weight-bold text-primary">Map</h6>
                                                    </div>
                                                    <div className="col-xl-6 col-xs-12" style={{ paddingRight: '0', paddingLeft: '0' }}>
                                                        <div className="row">
                                                            <div className="row col-xl-9 col-xs-12 res-pb" style={{ textAlign: 'right' }}>

                                                                <div className="col-xl-9 col-9" style={{ paddingRight: '0' }}>
                                                                    <p style={{ background: '#f7f7f7', color: '#212529', border: 'none', marginBottom: '0', marginTop: '6px' }}>
                                                                        Invite link to {this.state.gname}
                                                                    </p>
                                                                </div>
                                                                <div className="col-xl-3 col-3" style={{ textAlign: 'left' }}>
                                                                    <button className="btn btn-success" type="button" onClick={this.copyToClipboardForLink.bind(this, this.state.sharetxtlink)}>
                                                                        Copy Link
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <br />
                                                            <div className="col-xl-3 col-xs-12">
                                                                <select className="form-control" onChange={this.onChangeGroup}>
                                                                    {
                                                                        this.state.groups ?
                                                                            this.state.groups.map(function (obj, i) {

                                                                                return (
                                                                                    <option value={obj._id} key={i} selected={this.state.gfullname == obj.groupname ? 'selected' : ''}>{obj.groupname}</option>
                                                                                )
                                                                            }, this)
                                                                            : ''
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="card-body">
                                            <div className="maMap" id="map" style={{ height: '500px' }} />
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