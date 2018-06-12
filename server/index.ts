
import * as express from 'express';
import './phaser';
import App from './App';
import * as path from 'path';

const port = process.env.PORT || 3000;
const app: express.Application = express();

app.use(express.static('dist'));

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }

  return console.log(`server is listening on ${port}`);
});

const game = new App();