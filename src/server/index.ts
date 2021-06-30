import express from 'express';
import { initExpress } from '@remult/core/server';

let app = express();
initExpress(app);
app.listen(3002, () => console.log("Server started"));