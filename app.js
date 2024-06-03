const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const port = 80;
const path = require('path');
const db = require('croxydb');
const { ProLogs } = require('speste-djs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

/* kullanıcıları buradan ekleyebilirsiniz */
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

const checkLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', checkLoggedIn, (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', (req, res) => {
    const { username, password, email, discord } = req.body;
    if (db.has(username)) {
        return res.status(400).send("Kullanıcı adı zaten kullanılmış.");
    }

    if (db.has(email)) {
        return res.status(400).render("E-mail adresi zaten kullanılmış.");
    }

    db.set(username, { username: username, password: password, email: email, discord: discord });
    db.set(email, { username: username, password: password, email: email, discord: discord });
    db.set(discord, { username: username, password: password, email: email, discord: discord });

    res.redirect('/login?register=true')
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    const logger = new ProLogs()
    logger.info(`Sunucu ${port} portunda başlatıldı.`)
});
