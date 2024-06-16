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
const { v4: uuidv4 } = require('uuid');  // For generating unique filenames
const cron = require('node-cron');
const PORT = process.env.PORT || 8080;
const axios = require('axios');
const stripe = require('stripe')('sk_test_51LoS3iSGyKMMAZwstPlmLCEi1eBUy7MsjYxiKsD1lT31LQwvPZYPvqCdfgH9xl8KgeJoVn6EVPMgnMRsFInhnnnb00WhKhMOq7');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
require("dotenv").config()

// URL Constants
const BASE_URL = 'https://9cff1d240aff90bf5e30c6baac008fe4.serveo.net';
const SUCCESS_URL = `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&sender_id=`;
const CANCEL_URL = `${BASE_URL}/cancel`;
const TICKET_URL = `${BASE_URL}/tickets/`;
const DOCUMENT_URL = `${BASE_URL}/documents/`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/fest');  // Specify the directory where fest images will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();  // Generate a unique identifier for the filename
    cb(null, `${uniqueSuffix}-${file.originalname}`);  // Use unique identifier + original filename
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
}));
app.use(session({
  key: "userId",
  secret: "Englishps4",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 * 24 * 12,
  },
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const connection = mysql.createPool({
  connectionLimit: 10,
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

app.post('/webhook', (req, res) => {
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
        }else if (messageBody === 'fest') {
          // Query to fetch all active fests
          const query = 'SELECT * FROM fest WHERE active = 1';
        
          connection.query(query, async (err, results) => { // <-- Mark the function as async here
            if (err) {
              console.error('Error fetching fest details from MySQL:', err);
              sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: { body: "Sorry, there was an error processing your request. Please try again later." }
              });
              return;
            }
        
            if (results.length === 0) {
              // No active fest found
              sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: { body: "Sorry, there is no active fest currently." }
              });
              return;
            }
        
            // Assuming there is at least one active fest, you can process the first one
            const activeFest = results[0];
        
            // Example: Creating a Stripe session (modify as per your Stripe integration)
            try {
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                  price_data: {
                    currency: 'inr',
                    product_data: {
                      name: activeFest.fest_name,
                      description: activeFest.description,
                    },
                    unit_amount: activeFest.amount * 100, // Stripe expects amount in smallest currency unit (cents)
                  },
                  quantity: 1,
                }],
                mode: 'payment',
                success_url: `${SUCCESS_URL}${senderId}`,
                cancel_url: CANCEL_URL,
              });
        
              // Set user state to 'fest' and include the fest_id
              userStates[senderId] = { type: 'fest', festId: activeFest.fest_id };
        
              // Construct the festival image URL
              const festImageUrl = `${BASE_URL}/fest/${activeFest.fest_image}`;
        
              // Send WhatsApp message with festival image
              await sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: senderId,
                recipient_type: "individual",
                type: "image",
                image: {
                  link: festImageUrl
                }
              });
        
              // Send WhatsApp message with payment link and fest details
              await sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: {
                  body: `*Festival Details* \n\n` +
                        `*Name:* ${activeFest.fest_name}\n` +
                        `*Description:* ${activeFest.description}\n` +
                        `*Date:* ${activeFest.start_date.toISOString().slice(0, 10)}\n` +
                        `*Time:* ${activeFest.start_date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n` +
                        `*Price:* ₹${activeFest.amount}\n\n` +
                        `*Payment Link* \n` +
                        `${session.url}`
                }
              });
        
            } catch (error) {
              console.error('Error creating Stripe session or sending WhatsApp message:', error);
        
              // Send an error message to WhatsApp
              sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: { body: "Sorry, there was an error processing your request. Please try again later." }
              });
            }
          });
        }else if (messageBody === 'admission form') {
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
      } else if (messageBody === 'call') {
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
          // Initialize userState.data if it doesn't exist
          if (!userState.data) {
            userState.data = {};
          }
        
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
        }else if (userState.step === 10 && (messageBody === 'tea' || messageBody === 'coffee' || messageBody === 'bread')) {
          userState.selectedItem = messageBody;
          userState.step = 11;
          sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: senderId,
            type: "template",
            template: {
              name: "select_cafetria_quanitity",
              language: { code: "en_US" }
            }
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
            userStates[senderId].sessionId = session.id;
            userStates[senderId].type = 'cafeteria';
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
        }  else if (userState.step === 1) {
          if (messageBody.toLowerCase() === 'fee receipts' || messageBody === '1') {
            userState.data.documentType = 'Fee Receipts';
          } else if (messageBody.toLowerCase() === 'results' || messageBody === '2') {
            userState.data.documentType = 'Results';
          } else if (messageBody.toLowerCase() === 'id card' || messageBody === '3') {
            userState.data.documentType = 'ID Card';
          }  else {
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

app.get('/success', async (req, res) => {
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
    console.log('Retrieving session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    console.log('Session retrieved:', session);

    const receiptDetails = {
      receiptId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details.email,
      senderId: senderId,
    };

    if (userStates[senderId].type === 'fest') {
      const festId = userStates[senderId].festId;
      console.log('Active fest ID:', festId);

      // Insert the fest ticket with the fest_id
      await connection.execute(
        'INSERT INTO fest_ticket (ticket_id, amount, currency, customer_email, sender_id, fest_id) VALUES (?, ?, ?, ?, ?, ?)',
        [receiptDetails.receiptId, receiptDetails.amount, receiptDetails.currency, receiptDetails.customerEmail, receiptDetails.senderId, festId]
      );

      const pdfBytes = await generateTicketPDF(receiptDetails);
      const filePath = path.join(__dirname, 'public', 'tickets', `${receiptDetails.receiptId}.pdf`);
      fs.writeFileSync(filePath, pdfBytes);

      sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: senderId,
        type: "document",
        document: {
          link: `${TICKET_URL}${receiptDetails.receiptId}.pdf`,
          caption: 'Here is your ticket.'
        }
      });
    } else if (userStates[senderId].type === 'cafeteria') {
      const items = userStates[senderId].data.items.map(item => `${item.name} x ${item.quantity}`).join(', ');
      await connection.execute(
        'INSERT INTO cafeteria_receipt (receipt_id, amount, currency, customer_email, sender_id, items_ordered) VALUES (?, ?, ?, ?, ?, ?)',
        [receiptDetails.receiptId, receiptDetails.amount, receiptDetails.currency, receiptDetails.customerEmail, receiptDetails.senderId, items]
      );

      const pdfBytes = await generateCafeteriaReceiptPDF(receiptDetails, userStates[senderId].data.items);
      const filePath = path.join(__dirname, 'public', 'tickets', `${receiptDetails.receiptId}.pdf`);
      fs.writeFileSync(filePath, pdfBytes);

      sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: senderId,
        type: "document",
        document: {
          link: `${TICKET_URL}${receiptDetails.receiptId}.pdf`,
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
  const text = `Ticket ID: ${ticketDetails.receiptId}\nAmount: ${ticketDetails.amount / 100}\nCustomer Email: ${ticketDetails.customerEmail}`;

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
app.get('/webhook', (req, res) => {
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
app.get('/', (req, res) => {
  res.send('Welcome to the Facebook Messenger webhook!');
});



// admin panel
app.post('/api/add-fest', upload.single('fest_image'), (req, res) => {
  const { fest_name, amount, description, start_date, end_date } = req.body;
  const fest_image = req.file.filename;  // Filename of uploaded fest image

  // Check if there is any active fest
  const checkActiveQuery = 'SELECT COUNT(*) AS active_count FROM fest WHERE active = 1';
  connection.query(checkActiveQuery, (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking active fest:', checkError);
      return res.status(500).json({ error: 'Failed to check active fest' });
    }
    
    const activeCount = checkResults[0].active_count;
    if (activeCount > 0) {
      return res.status(400).json({ error: 'There is already an active fest. Please deactivate it first.' });
    }
    
    // Proceed to insert the new fest as active
    const insertQuery = `INSERT INTO fest (fest_name, amount, description, start_date, end_date, fest_image, active) VALUES (?, ?, ?, ?, ?, ?, 1)`;
    const values = [fest_name, amount, description, start_date, end_date, fest_image];

    connection.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Error adding fest:', error);
        return res.status(500).json({ error: 'Failed to add fest' });
      }
      res.json({ message: 'Fest added successfully' });
    });
  });
});

app.get('/api/fests', (req, res) => {
  connection.query('SELECT * FROM fest', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.put('/api/deactivate/fests/:festId', (req, res) => {
  const festId = req.params.festId;
  
  // SQL query to update fest with specified festId
  const sql = 'UPDATE fest SET active = 0 WHERE fest_id = ?';

  // Execute the SQL query
  connection.query(sql, [festId], (error, results, fields) => {
    if (error) {
      console.error('Error deactivating fest:', error);
      res.status(500).json({ error: 'Error deactivating fest' });
      return;
    }
    console.log(`Fest with fest_id ${festId} deactivated successfully.`);
    res.json({ message: `Fest with fest_id ${festId} deactivated successfully.` });
  });
});

app.get('/api/registrations/:fest_id', async (req, res) => {
  const festId = req.params.fest_id;

  // SQL query to fetch tickets for a specific fest_id
  const query = 'SELECT * FROM fest_ticket WHERE fest_id = ?';

  // Execute the query with festId as parameter
  connection.query(query, [festId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Error fetching tickets' });
      return;
    }
    res.json(results); // Send the fetched tickets as JSON response
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});