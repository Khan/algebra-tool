import { generateId } from './node-utils';

export default class Node {
    constructor() {
        this.id = generateId();
        this.parent = null;
        this.next = null;
        this.prev = null;
    }
}
