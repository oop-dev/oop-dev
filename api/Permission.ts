import {Base, Col, Menu} from "../oop-core/Base";
export class Permission extends Base<Permission> {
    @Col({tag: '名称', type: '', filter: true, show: '1111'})//1111代表增删改查是否显示
    name = ''
}

