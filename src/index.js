import 'babel-polyfill';
import express from 'express';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';
import { matchRoutes } from 'react-router-config';
import proxy from 'express-http-proxy';
import Routes from './client/Routes';
const app = express();

app.use(express.static('public'));

app.use(
  '/api',
  proxy('http://react-ssr-api.herokuapp.com', {
    proxyReqOptDecorator(opts) {
      opts.headers['x-forwarded-host'] = 'localhost:3000';
      return opts;
    }
  })
);

app.get('*', (req, res) => {
  const store = createStore(req);

  const promises = matchRoutes(Routes, req.path)
    .map(({ route }) => {
      return route.loadData ? route.loadData(store) : null;
    })
    .map(promise => {
      if (promise) {
        return new Promise((resolve, reject) => {
          promise.then(resolve).catch(resolve);
        });
      }
    });

  const context = {};

  Promise.all(promises).then(() => {
    const content = renderer(req, store, context);

    //console.log('context object', context.url);

    if (context.url) {
      console.log(
        'hi there seems to be some problem. Please come back again laer.'
      );
      return res.redirect(301, context.url);
    }

    if (context.notFound) {
      res.status(404);
    }
    //console.log('just before sending content', content);
    res.status(200).send(content);
  });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
