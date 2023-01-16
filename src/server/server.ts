"use strict"

import express from 'express';
import path from 'path';

const app = express();
const port = 80;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});
app.get('/test', (req, res) =>  {
    res.end(`Express is running : dir = ${__dirname}`);
});
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => console.log(`Express server is listening on port ${port}`));