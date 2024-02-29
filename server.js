import express from 'express';
import mysql from 'mysql2';
import axios from 'axios'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv';

dotenv.config();

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
    //if we want the user to search or we make a prompt
    const input = req.query.input;
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${input}+finance+cash&pageSize=5&sortBy=relevancy&apiKey=3a62fb90d8854a25a5af26dd34eb0b38`)
    //sends an array of articles. This includes the source, author, title, desc, url, urlIMG, published, content
    res.json({ data: response.data.articles })

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
    const email = req.query.email;

    databse.query(query, [values], (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            const msg = {
                to: email, // Change to your recipient
                from: 'budgetbuddyinc@gmail.com', // Change to your verified sender
                subject: `🎉 Welcome to BudgetBuddy! Let's Make Finance Fun! 🎉`,
                text:
                    `           Hey there, Financial Trailblazer!, 
                       Welcome aboard the BudgetBuddy train! 🚀 We're beyond excited to have you join our crew as we embark on an epic journey to conquer your financial goals and dreams.
            
                       We know that navigating the financial landscape can sometimes feel like trying to find your way through a maze with a blindfold on. 😅 But fear not! Our user-friendly interface and supercharged 
                       features are here to be your guiding light, making the process as smooth as butter and twice as enjoyable!
            
                       Welcome to the BudgetBuddy community, where financial freedom meets fun! 🎉 We're absolutely stoked to have you on board and can't wait to witness you soar on your financial journey!
            
                       Here's to a future filled with prosperity, excitement, and plenty of high-fives! 🙌
            
                       Warm regards,
                       BudgetBuddy 💼`,
            }
            sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })
            res.status(200).json({ message: 'User has been created' })
        }
    })
})

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});