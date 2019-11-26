const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const ip = require('ip');
const bodyParser = require('body-parser');
const app = express();
const db = require('./util/database');

const host = ip.address();
const port = process.env.PORT || 5000;

var sendMessageHost = (name, email, mob, time) => {
    console.log(name + ':' + email + ':' + mob + ':' + time);
}
var sendMessageGuest = (name, email, mob, enter, exit) => {
    console.log(name + ':' + email + ':' + mob + ':' + enter + ':' + exit);
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
app.get('/guest', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'guest.html'));
});
app.get('/host', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'host.html'));
});
app.get('/checkout', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'out.html'));
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
            //res.send('out',{data:rows,title:'CheckOut',getDetails:false});
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
                    sendMessageGuest(rows.name, rows.email, rows.mobile, rows.chekin, rows.checkout);
                })
                .catch(err => { console.log(err) });
        })
        .catch(err => { console.log(err) });
});
app.listen(port, host, () => { console.log('Server running on ' + host + ':' + port) });