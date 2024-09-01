import {Base} from "./Base";

class Parent {
    add() {
        // method body
    }
}

class Child extends Base<any> {
    // 子类没有定义 add 方法
}

const childInstance = new Child();
const addMethod = childInstance.add;

console.log(addMethod.name); // 输出: "add"
