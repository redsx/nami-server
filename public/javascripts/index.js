
var socket = io('http://localhost:10086');
var token  = localStorage.getItem('token');
socket.emit('test', {test: '123'}, function(ret) {
    console.log('ret: ', ret);
})

function signUp(nickname, password, email) {
    socket.emit('signUp', {
        password, nickname, email
    }, function(ret) {
        console.log('signUp ret: ', ret);
        if(ret.status === 0) {
            localStorage.setItem('token', ret.token);
        }
    })
}

function login(nickname, password) {
    socket.emit('login', {
        nickname,
        password
    }, function(ret) {
        console.log('login ret', ret);
        if(ret.status === 0) {
            localStorage.setItem('token', ret.token);
        }
    })
}

function initUser() {
    socket.emit('initUser', {
        token: localStorage.getItem('token'),
    }, function(ret) {
        console.log('init user ret: ', ret);
    })
}

function initGroup() {
    socket.emit('initGroup', {
        token: localStorage.getItem('token'),
    }, function(ret) {
        console.log('init user ret: ', ret);
    })
}

function createGroup(name) {
    socket.emit('createGroup', {
        name,
        token: localStorage.getItem('token'),
    }, function(ret) {
        console.log('init user ret: ', ret);
    })
}

function sendMessage(content) {
    socket.emit('message',{
        content,
        group: '1',
        type: 'text',
        isPrivate: false,
        token: localStorage.getItem('token'),
    }, (ret) => {
        console.log('send group message ret: ', ret);
    })
}

function getGroupInfo(groupId) {
    socket.emit('getGroupInfo', {groupId, token, creator: true}, (ret) => {
        console.log('get group info ret: ', ret);
    })
}

function refreshInviteLink(groupId) {
    socket.emit('refreshInviteLink', {groupId, token}, (ret) => {
        console.log('refresh Invite Link ret: ', ret);
    })
}

function updateGroupInfo({
    groupId = '3',
    name,
    bulletin,
}) {
    socket.emit('updateGroupInfo', {groupId, bulletin, name, token}, (ret) => {
        console.log('update Group Info ret: ', ret);
    })
}

function joinGroup(groupId) {
    socket.emit('joinGroup', {groupId, token}, (ret) => {
        console.log('join Group ret: ', ret);
    })
}


function exitGroup(groupId) {
    socket.emit('exitGroup', {groupId, token}, (ret) => {
        console.log('exit Group ret: ', ret);
    })
}

function searchGroupUser(groupId, nickname) {
    socket.emit('searchGroupUser', {groupId, nickname, token}, (ret) => {
        console.log('search Group User ret: ', ret);
    })
}

let arr = [];
function loadGroupHistories(groupId, timestamp) {
    socket.emit('loadGroupHistories', {
        groupId, 
        token,
        limit: 3,
        timestamp,
    }, (ret) => {
        arr = arr.concat(ret.data);
        console.log('load group histories ret: ', ret.data);
    })
}

function updateUserInfo (nickname) {
    socket.emit('updateUserInfo', {nickname, token}, (ret) => {
        console.log('search Group User ret: ', ret);
    })
}


function updatePassword (password) {
    socket.emit('updatePassword', {password, token}, (ret) => {
        console.log('search Group User ret: ', ret);
    })
}


socket.on('error', (err) => {
    console.log('err: ', err.message);
});

socket.on('disconnect',()=>{
    console.log('disconnect')
})
socket.on('reconnecting',()=>{
    console.log('reconnect');
})
socket.on('reconnect',()=>{
    console.log('reconnect success');
})

socket.on('message', (data) => {
    console.log('get message: ', data);
})