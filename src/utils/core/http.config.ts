import { Request, Response, NextFunction }  from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ResultSet } from "../../data/core/result-set";
import { HttpStatus } from "./http.status";
import { app } from './http.server';


const corsOptions = {
    origin: '*',
    preflightContinue: true,
    optionsSuccessStatus: HttpStatus.NO_CONTENT,
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
}

const isBodyError = (err: any): boolean => {
    const erros: Array<any> = [
        'entity.too.large',
        'entity.parse.failed',
        'entity.verify.failed',
        'request.aborted',
        'request.size.invalid',
        'encoding.unsupported',
        'stream.encoding.set',
        'parameters.too.many',
        'charset.unsupported'
    ];

    return erros.includes(err.type)
}

const bodyErroHandler = (
    {
        onError = (err: Error, req: Request, res: Response) => {
        },
        errorMessage = (err: Error) => {
            return err.message
        }
    } = {}
) => {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        if(err && isBodyError(err)) {
            const result: ResultSet = new ResultSet();
            const message: string = errorMessage(err);

            onError(err, req, res);

            result
                .setStatus(err.status)
                .setText(errorMessage(err))

            result.message.message = err.type;
            result.message.status = err.status;
            result.message.code = 'BODY.ERROR';
            result.message.errorMessage = message;

            return res.status(result.status).json(result.data);
        }
        else {
            next(err);
        }
    }
}

app.use(bodyParser.json());
app.use(bodyErroHandler());
app.use(cors(corsOptions));
