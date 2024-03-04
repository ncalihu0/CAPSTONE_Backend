import express from 'express';
import mysql from 'mysql2';
import axios from 'axios'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron'
import moment from 'moment';
import bodyParser from 'body-parser'

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const database = mysql.createConnection({
    host: 'sql5.freesqldatabase.com',
    user: 'sql5687275',
    password: 'WXEqCM8XeE',
    database: 'sql5687275'
})

//sending articles to users by fetching it from thr api
let date = new Date();
let format = moment(date).format('YYYY-MM-D')
const input = "tips to budget"
const response = await axios.get(`https://newsapi.org/v2/everything?q=${input}+money management+cash+budgeting&pageSize=5&sortBy=relevancy&to=${format}&apiKey=3a62fb90d8854a25a5af26dd34eb0b38`)
let articles = response.data.articles;
let htmlContent = `<div>`
articles.forEach(article => {
    htmlContent += `
    <div style="margin-bottom: 20px;">
        <img src="${article.urlToImage}" alt="${article.title}" style="max-width: 100px;">
        <div>
            <h3 style="margin-bottom: 5px;">${article.title}</h3>
            <p style="margin-bottom: 5px;">${article.description}</p>
            <a href="${article.url}">Read more</a>
        </div>
        <div style="clear: both;"></div>
    </div>
`;
})
htmlContent += '</div>';

//creating function to send emails to users
const sendNewsletter = (email) => {
    dotenv.config();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: email, // Change to your recipient
        from: 'budgetbuddyinc@gmail.com', // Change to your verified sender
        subject: `Newsletter`,
        html: htmlContent,
        asm: {
            group_id: 25253,
            groups_to_display: [
                25253
            ],
        },
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })

}

//as this goes off, it will run our function sendNewsletter to our users. It will start once the server is running. 
//can test for every minute, use the code below
// cron.schedule('* * * * *', async () => {
//The schedule is every monday at 9:30
// cron.schedule('0 30 9 * * 1', async () => {

//     try {
//         const query = "SELECT email FROM User";
//         const [rows, fields] = await database.promise().query(query);
//         const emails = rows.map(row => row.email);
//         emails.forEach(email => sendNewsletter(email));
//     } catch (error) {
//         console.error('Error fetching emails from database:', error);
//     }
// });

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/budgetTracker', async (req, res) => {
    res.send('budget info')
})

app.get('/resources', async (req, res) => {
    let location = req.query.location;
    let input = req.query.input;
    if (input) {
        //if we want the user to search or we make a prompt
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${input}+finance+cash&pageSize=5&sortBy=relevancy&apiKey=3a62fb90d8854a25a5af26dd34eb0b38`)
        //sends an array of articles. This includes the source, author, title, desc, url, urlIMG, published, content
        return res.json({ data: response.data.articles })
    } else if (location) {
        //use google events api to search for budgeting events
        //let user input city & state or just zipcode
        let response = await axios.get(`https://serpapi.com/search.json?q=budgeting+events+in+${location}&api_key=37c572e07631a37fa4210f55546a883d06f95591e4f24f5e1ef0ad64f0e8cf78&google_domain=google.com&gl=us&hl=en&engine=google_events`)
        //if the results have any events near the location, send the json of that data
        if (response.data.events_results.length > 0) {
            return res.json({ data: response.data.events_results })
            //else let the user know no events found
        } else {
            return res.json({ message: 'No events found. Try another location' })
        }

    }


})

app.get('/login', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    const query = `SELECT * FROM User WHERE email = "${email}"`;
    database.query(query, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: 'Internal server error' })
        } else {
            if (data.length > 0) {
                if (data[0].password === password && data[0].admin === 1) {
                    return res.status(200).json({
                        redirect: '/admin',
                        message: `Welcome back ${data[0].first_name}`
                    });
                } else if (data[0].password === password) {
                    return res.status(200).json({ message: `Welcome back ${data[0].first_name}` });
                } else {
                    return res.json({ error: "Wrong password" });
                }
            } else {
                return res.json({ error: "Wrong email" });
            }

        }
    })

})

app.get('/admin', (req, res) => {
    const query = `SELECT * FROM User`;
    database.query(query, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: 'Internal server error' })
        } else {
            return res.status(200).json({ users: data })
        }
    })

})
app.put('/update', (req, res) => {
    const values = [
        req.body.first_name,
        req.body.last_name,
        req.body.password,
        req.body.email,
        req.body.secuQues1,
        req.body.answerSecuQues1,
        req.body.phoneNum,
        req.body.admin,
        req.body.id
    ];
    const query = `
        UPDATE User
        SET 
            first_name = ?, 
            last_name = ?, 
            password = ?, 
            email = ?, 
            secuQues1 = ?, 
            answerSecuQues1 = ?, 
            phoneNum = ?, 
            admin = ?
        WHERE id = ?`;
    database.query(query, values, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: 'Internal server error' })
        } if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            return res.status(200).json({ message: 'Successfully updated' })
        }
    })
})


app.post('/signup', (req, res) => {
    const values = [req.query.first_name, req.query.last_name, req.query.password, req.query.email, req.query.secuQues1, req.query.answerSecuQues1, req.query.phoneNum]
    const query = "INSERT INTO User (`first_name`, `last_name`, `password`, `email`, `secuQues1`, `answerSecuQues1`, `phoneNum`) VALUES (?)"
    const email = req.query.email;

    database.query(query, [values], (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
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
            return res.status(200).json({ message: 'User has been created' })
        }
    })
})

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});