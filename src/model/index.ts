import { Schema } from "mongoose";

export function setSchemaLean(schema: Schema) {
    schema.pre([
        'find',
        'findOne',
        'findOneAndUpdate',
        'updateOne',
        'updateMany',
    ], function () {
        const options = this.getOptions();
        if (options.lean == null) {
            this.setOptions({ ...options, lean: true });
        }
    });
}