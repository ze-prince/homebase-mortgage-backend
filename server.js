const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/', (req, res) => res.send('Homebase Backend Live!'));

app.post('/api/send-report', async (req, res) => {
  const { email, income, age, maxLoan, propertyPrice, tenorYears, monthlyPayment } = req.body;

  try {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.setTextColor(183, 28, 28);
    doc.text('HOMEBASE MORTGAGE BANK', w/2, 25, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Mortgage Affordability Report', w/2, 38, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Email: ${email}`, 20, 62);

    doc.setFontSize(28);
    doc.setTextColor(183, 28, 28);
    doc.text(`₦${Number(maxLoan).toLocaleString()}`, w/2, 90, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Recommended Property: ₦${Number(propertyPrice).toLocaleString()}`, 20, 110);
    doc.text(`Max Tenor: ${tenorYears} years`, 20, 120);
    doc.text(`Monthly Payment: ₦${Number(monthlyPayment).toLocaleString()}`, 20, 130);
    doc.text(`Your Income: ₦${Number(income).toLocaleString()} | Age: ${age}`, 20, 140);

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    await transporter.sendMail({
      from: `"Homebase Mortgage" <${process.env.EMAIL_USER}>`,
      to: email,
      bcc: process.env.EMAIL_USER,
      subject: 'Your Homebase Mortgage Affordability Report',
      html: `<h2>Thank you!</h2><p>Your personalized mortgage report is attached.</p>`,
      attachments: [{
        filename: 'Homebase-Mortgage-Report.pdf',
        content: pdfBase64,
        encoding: 'base64'
      }]
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
