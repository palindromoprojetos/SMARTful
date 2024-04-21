import express from 'express';

import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();

const serverHttp = createServer(app);

const serverIO = new Server(serverHttp);

export { serverHttp, serverIO, app }
