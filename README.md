## nami-server服务端项目 && 文档

## 接口

接口返回未给出情况参考 `constants/status`
### login
```
// request
// nickname/email 二者必传一个 password必传
{ password, nickname, email }
// response
```

### signUp
```
// request
{ password, nickname, email }
// response
```

### initUser
```
// request
{ token }
// response
{
    status: 0,
    data: {
        userInfo: { nickname, avatar, status, blocks, blockAll }
}
```

### initGroup
```
// request
{ token }
// response
```
### createGroup
```
// request
{ token, name }
// response
```

### groupMessage
```
// request
{ token }
// response
```

### joinGroup
```
// request
{ token, groupId }
// response
```