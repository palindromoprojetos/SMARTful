import { HttpStatus } from "../../utils/smartful.utils";
import { IErrorBase, MessageError } from "../smartful.data";

export const notify = (message?: string) => {
    throw new Error(message);
}

export class ErrorBase implements IErrorBase {

    //#region CRUD

    static get RegistroCriado(): MessageError {
        return new MessageError(
            HttpStatus.CREATED,
            "MSG-001",
            "Registro Criado!",
            "Registro criado com sucesso!",
        );
    }

    static get RegistroAtualizado(): MessageError {
        return new MessageError(
            HttpStatus.ACCEPTED,
            "MSG-002",
            "Registro Atualizado!",
            "Registro atualizado com sucesso!",
        );
    }

    static get RegistroExcluido(): MessageError {
        return new MessageError(
            HttpStatus.ACCEPTED,
            "MSG-003",
            "Registro Atualizado!",
            "Registro atualizado com sucesso!",
        );
    }

    //#endregion

    //#region Processos

    static get AcaoFalhou(): MessageError {
        return new MessageError(
            HttpStatus.EXPECTATION_FAILED,
            "ERRO-001",
            "Ação Falhou!",
            "A ação solicitada falhou!",
        );
    }

    static get NaoPermitido(): MessageError {
        return new MessageError(
            HttpStatus.FORBIDDEN,
            "ERRO-002",
            "Não Permitido!",
            "A ação solicitada não é permitida!",
        );
    }

    static get NaoEncontrado(): MessageError {
        return new MessageError(
            HttpStatus.NO_CONTENT,
            "ERRO-003",
            "Não Encontrado!",
            "Registro não encontrado com os parâmetros informados!",
        );
    }

    //#endregion

}
