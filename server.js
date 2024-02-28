import express from 'express';
import mysql from 'mysql2';

const app = express();
const databse = mysql.createConnection({
    host: 'sql5.freesqldatabase.com',
    user: 'sql5.freesqldatabase.com',
    password: 'WXEqCM8XeE',
    database: 'sql5687275'
})

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/budgetTracker', async (req, res) => {
    res.send('budget info')
})

app.get('/resources', async (req, res) => {
    res.send('articles')
})

app.get('/login', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    const query = `SELECT * FROM User WHERE email = "${email}"`;
    databse.query(query, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ error: 'Internal server error' })
        } else {
            if (data.length > 0) {
                if (data[0].password === password && data[0].admin === true) {
                    res.status(200).json({ redirect: '/admin' });
                } else if (data[0].password === password) {
                    res.status(200).json({ message: `Welcome back ${data.first_name}` });
                } else {
                    res.json({ error: "Wrong password" });
                }
            } else {
                res.json({ error: "Wrong email" });
            }

        }
    })

})

app.get('/admin', (req, res) => {
    const query = `SELECT * FROM User`;
    databse.query(query, (err, data => {
        if (err) {
            console.log(err)
            res.status(500).json({ error: 'Internal server error' })
        } else {
            res.status(200).json({ users: data })
        }
    }))

})

app.get('/signup', (req, res) => {
    const values = [req.query.first_name, req.query.last_name, req.query.password, req.query.email, req.query.securityQuestion1, req.query.answerSecQues1, req.query.phoneNum]
    const query = "INSERT INTO User (`first_name`, `last_name`, `password`, `email`, `securityQuestion1`, `answerSecQues1`, `phoneNum`) VALUES (?)"
    databse.query(query, [values], (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'User has been created' })
        }
    })
})

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});