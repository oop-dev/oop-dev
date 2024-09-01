// 定义父类
class Parent {
    get name() {
        console.log('father');
        return 'Parent Name';
    }

    get greeting() {
        console.log('father greeting');
        return 'Hello from Parent';
    }
}

// 创建父类的代理对象
const ParentHandler = {
    get(target, prop, receiver) {
        console.log('parent proxy:', prop);
        return Reflect.get(target, prop, receiver);
    }
};


// 定义子类
class Child extends Parent {
    get name() {
        console.log('child');
        return 'child';  // 通过super调用父类的代理方法
    }
}

// 将子类的原型链指向父类的代理对象
const ParentProxy = new Proxy(Parent.prototype, ParentHandler);
Object.setPrototypeOf(Child.prototype, ParentProxy);

// 创建子类实例
const childInstance = new Child();

console.log(childInstance.name);    // 触发子类的get方法，并通过父类代理访问父类属性
