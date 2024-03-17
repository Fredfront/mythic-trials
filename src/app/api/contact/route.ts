import { NextResponse } from 'next/server'
const nodemailer = require('nodemailer')

export async function POST(request: any) {
  const username = process.env.EMAIL_USERNAME
  const password = process.env.EMAIL_PASSWORD
  const myEmail = process.env.EMAIL

  const formData = await request.formData()

  const email = formData.get('email')
  const subject = formData.get('subject')
  const message = formData.get('message')

  // create transporter object
  const transporter = nodemailer.createTransport({
    host: 'send.one.com',
    port: 465,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },

    auth: {
      user: username,
      pass: password,
    },
  })

  try {
    const mail = await transporter.sendMail({
      from: username,
      to: myEmail,
      replyTo: email,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kontaktskjema Mythic Trials 2024</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          p {
            margin: 10px 0;
          }
          .message {
            border-left: 3px solid #ccc;
            padding: 10px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Kontaktskjema Mythic Trials 2024</h2>
          <div class="message">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
        </div>
      </body>
      </html>
      
            `,
    })

    return NextResponse.json({ message: 'Success: email was sent' })
  } catch (error) {
    return NextResponse.json({ message: 'Error: email was not sent' })
  }
}
