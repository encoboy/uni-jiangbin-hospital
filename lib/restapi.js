//用户数据示例
let users = [
    {
        "uuid": "08c0a6ec-a42b-47b2-bb1e-15e0f5f9a19a",
        "name": "admin",
        "password": "123456",
        "avatar": '/static/images/Avatar-1.png'
    },
    {
        "uuid": "3bb179af-bcc5-4fe0-9dac-c05688484649",
        "name": "tom",
        "password": "123456",
        "avatar": '/static/images/Avatar-2.png'
    },
    {
        "uuid": "fdee46b0-4b01-4590-bdba-6586d7617f95",
        "name": "医生",
        "password": "123456",
        "avatar": '/static/images/Avatar-3.png'
    },
    {
        "uuid": "33c3693b-dbb0-4bc9-99c6-fa77b9eb763f",
        "name": "患者",
        "password": "123456",
        "avatar": '/static/images/Avatar-4.png'
    }
];

//群数据示例
let groups = [
    // {
    //     "uuid": "group-a42b-47b2-bb1e-15e0f5f9a19a",
    //     "name": "群1",
    //     "userList": ['08c0a6ec-a42b-47b2-bb1e-15e0f5f9a19a', '3bb179af-bcc5-4fe0-9dac-c05688484649', 'fdee46b0-4b01-4590-bdba-6586d7617f95', '33c3693b-dbb0-4bc9-99c6-fa77b9eb763f']
    // },
    // {
    //     "uuid": "group-4b01-4590-bdba-6586d7617f95",
    //     "name": "群2",
    //     "userList": ['08c0a6ec-a42b-47b2-bb1e-15e0f5f9a19a', 'fdee46b0-4b01-4590-bdba-6586d7617f95', '33c3693b-dbb0-4bc9-99c6-fa77b9eb763f']
    // },
    // {
    //     "uuid": "group-dbb0-4bc9-99c6-fa77b9eb763f",
    //     "name": "群3",
    //     "userList": ['08c0a6ec-a42b-47b2-bb1e-15e0f5f9a19a', '3bb179af-bcc5-4fe0-9dac-c05688484649']
    // }
];

import { docutorUserUrl } from '@/api/docApi/api.js'
import { post } from '@/api/docApi/request.js'


function RestApi() {

}

RestApi.prototype.getUserData = async () => {
	console.log('getUserData执行了吗')
	await post(docutorUserUrl).then(res => {
		console.log('获取所有的用户data:',res);
		users = res.data.result;
	}).catch(err => {
		console.log(err);
	})
}

RestApi.prototype.findFriends = function (user) {
    var friendList = users.filter(v => v.uuid != user.uuid);
    return friendList;
}

RestApi.prototype.findGroups = function (user) {
    var groupList = groups.filter(v => v.userList.find(id => id == user.uuid));
    return groupList;
}

RestApi.prototype.findUser = function (username, password) {
    var user = users.find(user => (user.name == username && user.password == password))
    return user;
}

RestApi.prototype.findGroupMembers = function (groupId) {
    let members = [];
    let group = groups.find(v => v.uuid == groupId);
    users.map(user => {
        if (group.userList.find(v => v == user.uuid)) {
            members.push(user)
        }
    });
    return members;
}

export default new RestApi();