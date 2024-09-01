// decorators.js

/**
 * 属性装饰器，用于存储属性的注释
 * @param {string} comment - 属性的注释
 */
function PropertyComment(comment) {
    return function (target, propertyKey) {
        // 确保在类上存储注释信息
        if (!target.constructor.__comments__) {
            target.constructor.__comments__ = {};
        }

        // 存储属性的注释
        target.constructor.__comments__[propertyKey] = comment;
    };
}

// 使用装饰器的类
class MyClass {
    @PropertyComment('This is a property comment for myProperty')
    myProperty = 'initial value';

    @PropertyComment('This is a property comment for anotherProperty')
    anotherProperty = 'another value';
}

// 访问注释信息
function printPropertyComments(cls) {
    const comments = cls.__comments__;
    if (comments) {
        Object.keys(comments).forEach(prop => {
            console.log(`Property: ${prop}, Comment: ${comments[prop]}`);
        });
    } else {
        console.log('No property comments found.');
    }
}

// 创建实例并打印注释
const instance = new MyClass();
printPropertyComments(MyClass);
