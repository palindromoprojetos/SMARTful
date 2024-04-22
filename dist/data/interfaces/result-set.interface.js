"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageError = void 0;
const smartful_utils_1 = require("../../utils/smartful.utils");
class MessageError {
    constructor(status = smartful_utils_1.HttpStatus.OK, code = 'THATS_ALL_FOLKS', message = 'Solicitação concluída!', errorMessage = 'Solicitação concluída!') {
        this.status = status;
        this.code = code;
        this.message = message;
        this.errorMessage = errorMessage;
        this.toJson = () => JSON.stringify(this);
    }
}
exports.MessageError = MessageError;
