const express = require('express');
const app = express();
const port = 8080;

const adminRouter = require('./routes/admin.routes');
const apiRouter = require('./routes/api.routes');
const usersRouter = require('./routes/users.routes');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRouter);
app.use('/api/auth', apiRouter);
app.use('/users', usersRouter);

app.get('/login', (req, res) => {
  res.render('indexLogin', { join: false });
});

app.get('/join', (req, res) => {
  res.render('indexLogin', { join: true });
});

app.get('/admin-users', (req, res) => {
  res.render('admin-users');
});

app.get('/admin-products', (req, res) => {
  res.render('admin-products');
});

app.get('/', (req, res) => {
  res.render('home');
})

app.listen(port, () => {
  console.log(port, '포트로 서버가 켜졌어요!');
});