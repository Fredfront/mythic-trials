// src/app/api/notify-team-creation/route.ts

import { NextResponse } from 'next/server'
const nodemailer = require('nodemailer')

export async function POST(request: Request) {
  const username = process.env.EMAIL_USERNAME
  const password = process.env.EMAIL_PASSWORD

  // Parse JSON data from the request body
  const { email, subject, message } = await request.json()

  // Create transporter object
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
    await transporter.sendMail({
      from: username,
      to: email,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
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
          .message {
            border-left: 3px solid #ccc;
            padding: 10px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${subject}</h2>
          <div class="message">
            <p>${message}</p>
          </div>
        </div>
      </body>
      </html>
      `,
    })

    return NextResponse.json({ message: 'Email successfully sent' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ message: 'Error: email was not sent' }, { status: 500 })
  }
}
