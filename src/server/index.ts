import express from 'express';
import { initExpress } from '@remult/core/server';
import '../Task';
 
let app = express();
initExpress(app);
app.listen(3002, () => console.log("Server started")); 