const { reactive } = require('vue');

export class User1 {
    constructor(name, age) {
        return require('vue').reactive(this);
    }

    getUserInfo() {
        return `Name: ${this.name}, Age: ${this.age}`;
    }
}

// 使用类创建对象
const user = new User1('John Doe', 30);

// 由于构造函数返回的是代理对象，这里的 user 是一个响应式对象
console.log(user.name); // 'John Doe'
console.log(user.getUserInfo()); // 'Name: John Doe, Age: 30'

// 修改属性，Vue 响应式系统会捕捉到这些变化
user.age = 31;
console.log(user); // 'Name: John Doe, Age: 31'
