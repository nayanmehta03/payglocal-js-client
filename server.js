const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.post('/initiate-payment', async (req, res) => {
    const { amount, currency, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    const payload = {
        merchantTxnId: 'TXN' + Math.random().toString(36).substr(2, 12).toUpperCase(),
        paymentData: {
            totalAmount: parseFloat(amount).toFixed(2),
            txnCurrency: currency,
            cardData: {
                number: cardNumber.replace(/\D/g, ''),
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                securityCode: cvv
            }
        },
        merchantCallbackURL: 'https://api.prod.payglocal.in/gl/v1/payments/merchantCallback'
    };

    try {
        const response = await axios.post('https://api.uat.payglocal.in/gl/v1/payments/initiate', payload, {
            headers: {
                'x-gl-token-external': 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtJZC1MME1hUVphc3VDTG85WkFjIiwieC1nbC1tZXJjaGFudElkIjoianBzbHRlc3QxIiwiaXNzdWVkLWJ5IjoianBzbHRlc3QxIiwiaXMtZGlnZXN0ZWQiOiJ0cnVlIiwieC1nbC1lbmMiOiJ0cnVlIn0.eyJkaWdlc3QiOiJGNHBDNmt6YkU5WkFFYjdNN2R2OEVvMjNoMFFjVEJFbDN2TVpTSjhSdU9rPSIsImRpZ2VzdEFsZ29yaXRobSI6IlNIQS0yNTYiLCJleHAiOjMwMDAwMCwiaWF0IjoiMTc0NTMzNTgxMjk3MyJ9.GW2oQs8WGwn5uyKCJQOD_KjFOL3nLQTCW28BplP-naYYWlxe25Ipdp516VYrL72HQ_kOtBOFgymEdjHEpvTv-GUOcg8idUEXSlI2WV6eQrXe2NXJXwmpPQw1U5DRObYaMsMWJ8ozl1Zgch35QW_tPTm_-o2lYCmvdV2b5IdPzXsCattlakxBhmotvTcFwvOi4nLz-lWMLtnRaQcnM9CxkXKqht4Do6NlI38l1jYV6wWs852Tgh04VVhaK8TEoh2GxOVQjlTsYE4EBRHllV6rOv7A6rsdD68YA05OncR-JlbKoL7z1FH0zbhHQCjnoVCRmoi8hI27vPOIF2BsgtQXnA',
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});