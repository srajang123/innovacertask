const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const ip = require('ip');
const bodyParser = require('body-parser');
const app = express();
const db = require('./util/database');
const nodemailer = require('nodemailer');

const host = ip.address();
const port = process.env.PORT || 5000;

var Mail = (mailOption) => {
    let smtpData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'srajan.1721cs1138@kiet.edu',
            pass: 'princeofpersia'
        }
    });
    smtpData.sendMail(mailOption, (err, res) => {
        if (err)
            console.log(err);
    });
}
var sendMessageHost = (name, email, mob, time) => {
    let mailOption = {
        from: 'srajan.1721cs1138@kiet.edu',
        to: 'srajan.oel@gmail.com',
        subject: 'Entry Management',
        html: '<h1>Entry Management</h1><h3>A new atendee...</h3><br><b>Name:</b>' + name + '<br><b>Phone</b>' + mob + '<br><b>E-mail:</b>' + email + '<br><b>Check-in Time:</b>' + time
    }
    Mail(mailOption);
}
var sendMessageGuest = (name, email, mob, enter, exit) => {
    let mailOption = {
        from: 'srajan.1721cs1138@kiet.edu',
        to: email,
        subject: 'Entry Management',
        html: '<h1>Entry Management</h1><h3>Thanks for attending.</h3><br><b>Name:</b>' + name + '<br><b>Phone</b>' + mob + '<br><b>Check-in Time:</b>' + enter + '<br><b>Check-out Time:</b>' + exit + '<br><b>Host Name:</b>' + 'Srajan' + '<br><b>Address Visited: </b>' + 'KIET'
    }
    Mail(mailOption);
}

var getTime = () => {
    let d = new Date();
    let h = d.getHours();
    let m = 'AM';
    if (h >= 12) {
        h -= 12;
        m = 'PM';
    }
    if (h == 0) {
        h = 12;
    }
    let min = d.getMinutes() + ' ' + m + ' IST';
    return h + ':' + min;
}

app.engine('hbs', hbs({ layoutsDir: 'views/layouts/', defaultLayout: 'main-layout', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    res.render('home', { title: 'Entry Management' });
});
app.get('/guest', (req, res, next) => {
    res.render('guest', { title: 'CheckIn' });
});
app.get('/host', (req, res, next) => {
    res.render('host', { title: 'Host Information' });
});
app.get('/checkout', (req, res, next) => {
    res.render('out', { title: 'CheckOut', getData: true });
})

app.post('/checkin', (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;
    let timestamp = getTime();
    db.query('insert into guest values(?,?,?,?,?)', [name, email, mobile, timestamp, ''])
        .then(out => {
            res.redirect('/');
            sendMessageHost(name, email, mobile, timestamp);
        })
        .catch(err => { console.log(err) });
});
app.post('/fetch', (req, res, next) => {
    let id = req.body.email;
    db.execute('select * from guest where email=?', [id])
        .then(rows => {
            rows = rows[0][0];
            res.render('out', { data: rows, title: 'CheckOut', getDetails: false });
        })
        .catch(err => { console.log(err) });
});
app.post('/checkout', (req, res, next) => {
    let id = req.body.user;
    let time = getTime();
    console.log(id + '\n' + time);
    db.execute('update guest set checkout=? where email=?', [time, id])
        .then(result => {
            console.log('Bye ' + id);
            db.execute('select * from guest where email=?', [id])
                .then(rows => {
                    rows = rows[0][0];
                    sendMessageGuest(rows.name, rows.email, rows.mobile, rows.checkin, rows.checkout);
                    res.redirect('/');
                })
                .catch(err => { console.log(err) });
        })
        .catch(err => { console.log(err) });
});
app.listen(port, host, () => { console.log('Server running on ' + host + ':' + port) });