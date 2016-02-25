import * as ast from '../ast';
import { generateId } from '../ast/node';
import List from '../ast/list';


function deserialize(json, unique = false) {
    var obj = Object.create(ast[json.type].prototype);
    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
            obj[key] = new List(obj, ...value.map(child => deserialize(child, unique)));
        } else if (typeof value === "object") {
            obj[key] = deserialize(value, unique);
        } else {
            obj[key] = value;
        }
    }
    if (unique) {
        obj.id = generateId();
    }
    return obj;
}

export { deserialize as default };
