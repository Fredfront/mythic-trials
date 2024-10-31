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
      from: 'NL WoW',
      to: email,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body>
          <h2>${subject}</h2>
          <p>${message}</p>
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
