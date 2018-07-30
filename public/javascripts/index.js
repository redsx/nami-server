
var socket = io('http://localhost:10086');

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