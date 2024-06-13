const express = require("express");
const mysql = require("mysql2");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const cron = require('node-cron');
const PORT = process.env.PORT || 8080;
const axios = require('axios');
const stripe = require('stripe')('sk_test_51LoS3iSGyKMMAZwstPlmLCEi1eBUy7MsjYxiKsD1lT31LQwvPZYPvqCdfgH9xl8KgeJoVn6EVPMgnMRsFInhnnnb00WhKhMOq7');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
require("dotenv").config()

// URL Constants
const BASE_URL = process.env.BASE_URL;
const SUCCESS_URL = `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&sender_id=`;
const CANCEL_URL = `${BASE_URL}/cancel`;
const TICKET_URL = `${BASE_URL}/tickets/`;
const DOCUMENT_URL = `${BASE_URL}/documents/`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  key: "userId",
  secret: "Englishps4",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 * 24 * 12,
  },
}));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createPool({
  connectionLimit: 10, // Maximum number of connections in the pool
  host: "localhost",
  user: "root",
  password: "Englishps#4",
  database: "whatsapp_clg",
});

connection.getConnection((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

const userStates = {};

app.post('/clg/webhook', (req, res) => {
  console.log('Incoming POST request:', JSON.stringify(req.body, null, 2));

  try {
    if (req.body && req.body.entry && req.body.entry[0].changes && req.body.entry[0].changes[0].value.messages) {
      const message = req.body.entry[0].changes[0].value.messages[0];
      const senderId = message.from;
      const messageType = message.type;

      if (messageType === 'text' || messageType === 'button') {
        const messageBody = messageType === 'text' ? message.text.body.toLowerCase() : message.button.payload.toLowerCase();

        if (!userStates[senderId]) {
          userStates[senderId] = { step: 0, data: {} };
        }

        const userState = userStates[senderId];

        if (messageBody === 'hi') {
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "college_template_1",
              language: { code: "en_US" }
            }
          });
        } else if (messageBody === 'fest') {
          stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'inr',
                product_data: { name: 'Fest Ticket' },
                unit_amount: 80000,
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: `${SUCCESS_URL}${senderId}`,
            cancel_url: CANCEL_URL,
          }).then(session => {
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: {
                body: `Please complete your payment using the following link:\n${session.url}`
              }
            });
          }).catch(err => {
            console.error('Error creating Stripe session:', err);
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Sorry, there was an error processing your payment. Please try again later." }
            });
          });
        } else if (messageBody === 'admission form') {
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "text",
            text: { body: "Please fill out the admission form using the following link:\nhttps://example.com/admission-form" }
          });
        } else if (messageBody === 'support') {
          userState.step = 1;
          sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "template",
              template: {
                  name: "college_support_temp",
                  language: { code: "en_US" }
              }
          });
      } else if (messageBody === 'raise issue') {
          userState.step = 20;
          sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Please describe the issue you are facing." }
          });
      } else if (userState.step === 20) {
          const issueDescription = messageBody;
          // Here you can save the issue to a database or handle it accordingly.
          userState.step = 0;
          sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Thank you for raising the issue." }
          });
      } else if (messageBody === 'call support') {
          sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "You can reach our support team at +1234567890." }
          });
      } else if (messageBody === 'documents') {
          userState.step = 1;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "choose_document_temp_clg",
              language: { code: "en_US" }
            }
          });
        } else if (messageBody === 'cafeteria') {
          // Clear previous items and initialize new order
          userState.data.items = [];
          userState.step = 10;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "college_caffetaria_temp",
              language: { code: "en_US" }
            }
          });
        } else if (userState.step === 10 && (messageBody === 'tea' || messageBody === 'coffee' || messageBody === 'bread')) {
          userState.selectedItem = messageBody;
          userState.step = 11;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "text",
            text: { body: `You selected ${messageBody}. Please enter the quantity.` }
          });
        } else if (userState.step === 11) {
          const quantity = parseInt(messageBody);
          if (isNaN(quantity) || quantity <= 0) {
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Invalid quantity. Please enter a positive number." }
            });
          } else {
            if (!userState.data.items) {
              userState.data.items = [];
            }
            userState.data.items.push({ name: userState.selectedItem, quantity });
            userState.selectedItem = null;
            userState.step = 12;
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "template",
              template: {
                name: "confrim_order_cafeteria",
                language: { code: "en_US" }
              }
            });
          }
        } else if (userState.step === 12 && messageBody === 'add more') {
          userState.step = 10;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "college_caffetaria_temp",
              language: { code: "en_US" }
            }
          });
        } else if (userState.step === 12 && messageBody === 'confirm order') {
          const itemPrices = { tea: 10, coffee: 15, bread: 5 };
          let lineItems = userState.data.items.map(item => ({
            price_data: {
              currency: 'inr',
              product_data: { name: item.name.charAt(0).toUpperCase() + item.name.slice(1) },
              unit_amount: itemPrices[item.name] * 100,
            },
            quantity: item.quantity,
          }));

          stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${SUCCESS_URL}${senderId}`,
            cancel_url: CANCEL_URL,
          }).then(session => {
            userState.sessionId = session.id;
            userState.type = 'cafeteria';
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: `Please complete your payment using the following link:\n${session.url}` }
            });
          }).catch(err => {
            console.error('Error creating Stripe session:', err);
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Sorry, there was an error processing your payment. Please try again later." }
            });
          });
        } else if (userState.step === 1) {
          if (messageBody.toLowerCase() === 'fee receipts' || messageBody === '1') {
            userState.data.documentType = 'Fee Receipts';
          } else if (messageBody.toLowerCase() === 'results' || messageBody === '2') {
            userState.data.documentType = 'Results';
          } else if (messageBody.toLowerCase() === 'id card' || messageBody === '3') {
            userState.data.documentType = 'ID Card';
          } else {
            sendWhatsAppMessage({
              messaging_product: "whatsapp",
              to: senderId,
              type: "text",
              text: { body: "Invalid option. Please select 1 for Fee Receipts, 2 for Results, or 3 for ID Card." }
            });
            return;
          }
          userState.step = 2;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "choose_pu_uni_temp_clg",
              language: { code: "en_US" }
            }
          });
        } else if (userState.step === 2) {
          userState.data.educationLevel = messageBody;
          userState.step = 3;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "text",
            text: { body: "Please provide your ID number." }
          });
        } else if (userState.step === 3) {
          userState.data.rollNumber = messageBody;
          userState.step = 0;

          const { educationLevel, rollNumber, documentType } = userState.data;
          connection.query(
            'SELECT media FROM documents WHERE student_id = ? AND edu_lvl = ? AND type = ?',
            [rollNumber, educationLevel, documentType],
            (err, results) => {
              if (err) {
                console.error('Error fetching data from MySQL:', err);
                sendWhatsAppMessage({
                  messaging_product: "whatsapp",
                  to: senderId,
                  type: "text",
                  text: { body: "Sorry, there was an error fetching your documents. Please try again later." }
                });
                return;
              }

              if (results.length > 0) {
                const mediaFileName = results[0].media;
                const mediaFilePath = path.join(__dirname, 'public', 'documents', mediaFileName);

                sendWhatsAppMessage({
                  messaging_product: "whatsapp",
                  to: senderId,
                  type: "document",
                  document: {
                    link: `${BASE_URL}/documents/${mediaFileName}`,
                    caption: `${documentType} for ${rollNumber}`
                  }
                });
              } else {
                sendWhatsAppMessage({
                  messaging_product: "whatsapp",
                  to: senderId,
                  type: "text",
                  text: { body: "Sorry, no documents found for the provided details." }
                });
              }
            }
          );
        }
      } else {
        sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: senderId,
          type: "text",
          text: { body: "Sorry, I didn't understand that. Please type 'hi' to start." }
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling webhook request:', error);
    res.sendStatus(500);
  }
});

app.get('/clg/success', async (req, res) => {
  const sessionId = req.query.session_id;
  const senderId = req.query.sender_id;

  handlePaymentSuccess(sessionId, senderId)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('Error handling payment success:', err);
      res.sendStatus(500);
    });
});

async function handlePaymentSuccess(sessionId, senderId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const ticketDetails = {
      ticketId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details.email,
      senderId: senderId,
    };

    if (userStates[senderId].type === 'fest') {
      await connection.execute('INSERT INTO fest_ticket (ticket_id, amount, currency, customer_email, sender_id) VALUES (?, ?, ?, ?, ?)', [ticketDetails.ticketId, ticketDetails.amount, ticketDetails.currency, ticketDetails.customerEmail, ticketDetails.senderId]);

      const pdfBytes = await generateTicketPDF(ticketDetails);
      const filePath = path.join(__dirname, 'public', 'tickets', `${ticketDetails.ticketId}.pdf`);
      fs.writeFileSync(filePath, pdfBytes);

      sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: senderId,
        type: "document",
        document: {
          link: `${TICKET_URL}${ticketDetails.ticketId}.pdf`,
          caption: 'Here is your ticket.'
        }
      });
    } else if (userStates[senderId].type === 'cafeteria') {
      const items = userStates[senderId].data.items;
      await connection.execute('INSERT INTO fest_ticket (ticket_id, amount, currency, customer_email, sender_id) VALUES (?, ?, ?, ?, ?)', [ticketDetails.ticketId, ticketDetails.amount, ticketDetails.currency, ticketDetails.customerEmail, ticketDetails.senderId]);

      const pdfBytes = await generateCafeteriaReceiptPDF(ticketDetails, items);
      const filePath = path.join(__dirname, 'public', 'tickets', `${ticketDetails.ticketId}.pdf`);
      fs.writeFileSync(filePath, pdfBytes);

      sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: senderId,
        type: "document",
        document: {
          link: `${TICKET_URL}${ticketDetails.ticketId}.pdf`,
          caption: 'Here is your receipt.'
        }
      });
    }
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
  }
}

async function generateTicketPDF(ticketDetails) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 500]);

  const { width, height } = page.getSize();
  const fontSize = 18;
  const text = `Ticket ID: ${ticketDetails.ticketId}\nAmount: ${ticketDetails.amount / 100}\nCustomer Email: ${ticketDetails.customerEmail}`;

  const qrCode = await QRCode.toDataURL(JSON.stringify(ticketDetails));

  const qrImage = await pdfDoc.embedPng(qrCode);
  const qrDims = qrImage.scale(0.5);

  page.drawImage(qrImage, {
    x: (width - qrDims.width) / 2,
    y: height - qrDims.height - 50,
    width: qrDims.width,
    height: qrDims.height
  });

  const textX = 50;
  const textY = height - qrDims.height - 100;

  page.drawText(text, {
    x: textX,
    y: textY,
    size: fontSize,
    font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    color: rgb(0, 0, 0),
    lineHeight: fontSize + 4
  });

  return await pdfDoc.save();
}

async function generateCafeteriaReceiptPDF(ticketDetails, items) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 500]);

  const { width, height } = page.getSize();
  const fontSize = 18;

  let itemText = 'Items Ordered:\n';
  items.forEach(item => {
    itemText += `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} x ${item.quantity}\n`;
  });

  const text = `Receipt ID: ${ticketDetails.ticketId}\nAmount: ${ticketDetails.amount / 100}\nCustomer Email: ${ticketDetails.customerEmail}\n\n${itemText}`;

  const qrCode = await QRCode.toDataURL(JSON.stringify(ticketDetails));

  const qrImage = await pdfDoc.embedPng(qrCode);
  const qrDims = qrImage.scale(0.5);

  page.drawImage(qrImage, {
    x: (width - qrDims.width) / 2,
    y: height - qrDims.height - 50,
    width: qrDims.width,
    height: qrDims.height
  });

  const textX = 50;
  const textY = height - qrDims.height - 200;

  page.drawText(text, {
    x: textX,
    y: textY,
    size: fontSize,
    font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    color: rgb(0, 0, 0),
    lineHeight: fontSize + 4
  });

  return await pdfDoc.save();
}

// Function to send WhatsApp message
function sendWhatsAppMessage(data) {
  const config = {
    headers: {
      'Authorization': 'Bearer EAAFsUoRPg1QBO6ZCbIX3mh0YL4VvkMJhzPovnNITFIDLsZCM6Y1fidZA8mfMm7ac5jXUugjZCsq10DB1YGTP62waRfLZBn7SYcgQVMD2SmH7H7wxfgd6hZBSjALEZC5rxCbyhPuertNehx0KIOqMVZBw5CGLOkQqd8IZA01tNTTtp45sNpDBMcSC7jtZBwzIEkxKdBYoZCTLm7OLZBEcXSm3',
      'Content-Type': 'application/json'
    }
  };

  axios.post('https://graph.facebook.com/v19.0/332700683252247/messages', data, config)
    .then(response => {
      console.log('Message sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending message:', error.response.data);
    });
}

// Webhook verification endpoint (GET request)
app.get('/clg/webhook', (req, res) => {
  console.log('Query parameters:', req.query);
  const VERIFY_TOKEN = "EAAFsUoRPg1QBOzpnPGEpxBDKEw93j35D2V0Qg5C8O58FNQZAxWXWMo0XJZB6ezMoUWY6xNC6AhPGUZCjt0w8AJwuyAfkhjnZAn73tOU88pXhTxAJevtKm1GSGkDFwh5y79N1eX9LWhD3ceZAZBr36MDd1fgAy0m9UfVDIugUDGxcl64vAhpNuj7FkbG36HGJn3RQus1iw92DiNn4w"; // Replace with your verification token
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.error('Failed verification. Make sure the verification tokens match.');
    res.sendStatus(403);
  }
});

// GET endpoint for testing
app.get('/clg', (req, res) => {
  res.send('Welcome to the Facebook Messenger webhook!');
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});