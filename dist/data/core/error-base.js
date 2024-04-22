"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBase = exports.notify = void 0;
const smartful_utils_1 = require("../../utils/smartful.utils");
const smartful_data_1 = require("../smartful.data");
const notify = (message) => {
    throw new Error(message);
};
exports.notify = notify;
class ErrorBase {
    //#region CRUD
    static get RegistroCriado() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.CREATED, "MSG-001", "Registro Criado!", "Registro criado com sucesso!");
    }
    static get RegistroAtualizado() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.ACCEPTED, "MSG-002", "Registro Atualizado!", "Registro atualizado com sucesso!");
    }
    static get RegistroExcluido() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.ACCEPTED, "MSG-003", "Registro Atualizado!", "Registro atualizado com sucesso!");
    }
    //#endregion
    //#region Processos
    static get AcaoFalhou() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.EXPECTATION_FAILED, "ERRO-001", "Ação Falhou!", "A ação solicitada falhou!");
    }
    static get NaoPermitido() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.FORBIDDEN, "ERRO-002", "Não Permitido!", "A ação solicitada não é permitida!");
    }
    static get NaoEncontrado() {
        return new smartful_data_1.MessageError(smartful_utils_1.HttpStatus.NO_CONTENT, "ERRO-003", "Não Encontrado!", "Registro não encontrado com os parâmetros informados!");
    }
}
exports.ErrorBase = ErrorBase;
