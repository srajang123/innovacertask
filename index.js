const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const ip = require('ip');
const bodyParser = require('body-parser');
const app = express();
const db = require('./util/database');
const nodemailer = require('nodemailer');
const Nexmo = require('nexmo');
const host = ip.address();
const port = process.env.PORT || 5000;
const nexmo = new Nexmo({
    apiKey: '9fd1b595',
    apiSecret: 'T3LeFIRLDaSKZUMT',
});
var msg = (to, text) => {
    const from = 'Client Service';
    nexmo.message.sendSms(from, to, text);
}
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
var sendMessageHost = (name, email, mob, time, host, hmob) => {
    let mailOption = {
        from: 'srajan.1721cs1138@kiet.edu',
        to: host,
        subject: 'Entry Management',
        html: '<h1>Entry Management</h1><h3>A new atendee...</h3><br><b>Name:</b>' + name + '<br><b>Phone</b>' + mob + '<br><b>E-mail:</b>' + email + '<br><b>Check-in Time:</b>' + time
    }
    Mail(mailOption);
    msg('91' + hmob, 'Atendee Name: ' + name + '\n Phone: ' + mob + '\nE-mail: ' + email);
}
var sendMessageGuest = (name, email, mob, enter, exit, host, addr) => {
    let mailOption = {
        from: 'srajan.1721cs1138@kiet.edu',
        to: email,
        subject: 'Entry Management',
        html: '<h1>Entry Management</h1><h3>Thanks for attending.</h3><br><b>Name:</b>' + name + '<br><b>Phone</b>' + mob + '<br><b>Check-in Time:</b>' + enter + '<br><b>Check-out Time:</b>' + exit + '<br><b>Host Name:</b>' + host + '<br><b>Address Visited: </b>' + addr
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
    res.render('base', { title: 'Entry Management', base: true });
});
app.get('/guest', (req, res, next) => {
    db.execute('select hname,hemail from host')
        .then(rows => {
            rows = rows[0];
            res.render('guest', { title: 'CheckIn', data: rows });
        })
        .catch(err => {
            console.log(err);
        })
});
app.get('/host', (req, res, next) => {
    res.render('host', { title: 'Host Information' });
});
app.get('/checkout', (req, res, next) => {
    res.render('out', { title: 'CheckOut', getData: true });
})

app.post('/checkin', (req, res, next) => {
    let host = req.body.host;
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;
    let timestamp = getTime();
    db.query('insert into guest values(?,?,?,?,?,?)', [name, email, mobile, timestamp, '', host])
        .then(out => {
            res.redirect('/');
            db.execute('select hmobile from host where hemail=?', [host])
                .then(rows => {
                    rows = rows[0][0];
                    sendMessageHost(name, email, mobile, timestamp, host, rows.hmobile);
                })
                .catch(err => { console.log(err) })
        })
        .catch(err => { console.log(err) });
});
app.post('/fetch', (req, res, next) => {
    let id = req.body.email;
    db.execute('select * from guest where gemail=?', [id])
        .then(rows => {
            rows = rows[0][0];
            if (rows == undefined) {
                res.redirect('/checkout');
            } else
                res.render('out', { data: rows, title: 'CheckOut', getDetails: false });
        })
        .catch(err => { console.log(err) });
});
app.post('/checkout', (req, res, next) => {
    let id = req.body.user;
    let time = getTime();
    db.execute('update guest set checkout=? where gemail=?', [time, id])
        .then(result => {
            db.execute('select * from guest g, host h where g.gemail=? and g.host=h.hemail', [id])
                .then(rows => {
                    rows = rows[0][0];
                    sendMessageGuest(rows.gname, rows.gemail, rows.gmobile, rows.checkin, rows.checkout, rows.hname, rows.address);
                    res.redirect('/');
                })
                .catch(err => { console.log(err) });
        })
        .catch(err => { console.log(err) });
});
app.post('/host', (req, res, next) => {
    db.execute('insert into host values(?,?,?,?)', [req.body.name, req.body.email, req.body.mobile, req.body.address])
        .then(out => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/host');
        })
});
app.listen(port, host, () => { console.log('Server running on ' + host + ':' + port) });