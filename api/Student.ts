import {Base} from "../oop-core/Base";
export class Student extends Base<Student>{
    name=''
    age=0
    sex=0
    score=0
    async hello() {
        return 'hello world'
    }
}
