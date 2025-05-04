const express = require('express');
const axios = require('axios');
const open = require('open');
const path = require('path');
const { generateJWEAndJWS } = require('./payglocal.js');
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
            totalAmount: parseFloat(amount).toFixed(2).toString(),
            txnCurrency: currency,
            cardData: {
                number: cardNumber.replace(/\D/g, ''),
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                securityCode: cvv
            }
        },
        merchantCallbackURL: 'https://api.uat.payglocal.in/gl/v1/payments/merchantCallback'
    };

    const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArZx8NziRKpOZj8przchx
SBPAHDx78h/8NRxYRgM7cJxUEseB0Xandg707PkaHKcKyNgmuXOY7185Nm412fn8
wF4462irvUvIPuEwJHIXhnCQmktZ1WbAjVAGYLRLUlfX4be95/FRHlYFzhTTvE8q
G0mFk6JMCO6V85rtqmcFJQTFWaxSW7yXjfzYm50U9akgIO8p+gJcc/7GxpiCgGFU
RnpMhvPkvpLYEzHYo/eQ/Hu9OsvgJBAVaom0aoEkyfn694/o2T2uruG3or7NZoaX
p7spTrDbMl5IiVCUXglaW0aPBUBfR3JhTpqOq37QUEvX0IXFqANcMnTKt60JFY4s
MwIDAQAB
-----END PUBLIC KEY-----`;
    const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCMld7U2MD3b6V5
DcaGqOtNAJMJLs86j5+P3UuICyOubZQ4B5CMWGxz7skBPEWwXcbxPUqeJkdx03a9
XJmJA8VTdgtGgEKmQGxU5ULau2rx2ik/HPYhHCAolxbXWKALp0cz3P8o0WPQY8mu
kG2hT/HEl9Xwuj0CTkc9jKTY23Gw8tqcchTE/jE+AB+3PKCbxS/ayCUowSoUDtp0
xjfUtvr7dsqitT9GJOdY+yyTOy3zsdzZhllcLtpKfrvf9ahI3TykpUOmWstTpWer
u4Vyvba81QNcfV/ePLjzmio8lPJldeMl0d6/+vzPcghi11IVz0qCnuunOhKgKKMR
hBHHjkrNAgMBAAECggEANjoM5K7i585x1lrA6+o2MNJ65LzghCcoFfb3Dne1gK+V
z3Ljh68HzkQZ1lcoTlotxZmtsYj0X+yATZRtSJNixsmumbgZfUU2RBzWh8Zo/vb2
l/iU27qckOuOjOwLd9NDPLcO2PDDfnsvLR1anDFZAUrL4/oCVGRbSFt6roceuHCx
8OdH1BDspw1i1bZbtrNxTogMsIkIvhvyYw85OIEKxUGP8DsOcd3Ejh2vJWdpXb7P
kaKLhvZSBQXndGDEBoflvS2K8n350BlQaet8kSnvrxsnW5LODNeyT7XB8kq97AmM
BT9sliK6AhaItXG+zDRBqcGy/7LAEqLfFe+lDP3nhQKBgQDGWXhseRC6KhEvRB7X
IGZCJr+g+/A+RyD7A4M51qCcTeb2fb8nBVjVTjKzEdDVLI7e7unbO+TygKCeSa9X
q2QR7GCacW5icSSbGW02bPiYPp4bWjXeGb7k4pi4LTTl2AIqlVsLH32q+AyFrBKD
4mLuYcMbiq5ZyTMSyKbU2loGtwKBgQC1cl4EvgfjqNxBkNjjjFT5P48plVG5LzRf
Mbqb91Hkuc/mb5Ecm8abloXd5062a6XRtSjxMaNEH3YwCReYVNfm7dO0DWik+j/m
dCYUUejhCC0O45+QmNYvS9pUGAREGe3FUPamsBT4RSWz2awAhbmHYWyzwH56buzg
olGOgMuWmwKBgQC1e4+P0IXZkDwA/1cohuCJjmKvrVT35qTqhyA+f36dBTpaNlv8
HAxXvyDsb1SgeBCRMhCPI5IrwD02Fz1z/cGmFJ2fMkJJmDRiJTWkIriitEh9xmCb
QvtC+YG6osJPuwDgbZ/L4ZheIm9yryqRuUXDz3dxb8ZvKISunyDmiJLuqQKBgDfq
OpbziLLbgqSh4nSc9kKpF5EU9s4+gcEkLgGKQa5epHa6wtkyGA4yYKZ1dYg5vCvX
y/on9cw0ddNvudmzq6T6fVbrGuhcRfzapjF03HMcdeY0tyN0Nez1Tx7DF+10oBVC
UgAkGxI3HNtDpQG0M+xIVZs/IrrQHCdNXhywDA0pAoGAbog727UkCD5zL05O2awc
/9UFsmW2OFbzMZg+ayNu570XE1i1yw1d+DDd91wlgDwU49mgur0qVCO6imd+pJyB
nB+BJR81kYroJJa+saKzYcnm2eev+Eu74vliMB1yodDDyuMI356HBrzJYkXJaF48
SNiERS6K4YC9Yy0kNnYTIcQ=
-----END PRIVATE KEY-----`;
    const publicKeyId = "kId-WmfYgXuUh3qQvyuw";
    const privateKeyId = "kId-L0MaQZasuCLo9ZAc";
    const merchantId = "jpsltest1"

    const data = {
        payload, // transaction payload in proper format refer to our integration guide (required)
        publicKey, // PayGlocal public key (downloaded from gcc) (required)
        privateKey, // private key (generated and downloaded from gcc) (required)
        merchantId, // unique merchant id (provided by PayGlocal) (required)
        privateKeyId, // kid for private key (required)
        publicKeyId // kid for public key (required)
    };

    generateJWEAndJWS(data).then((resp) => {
        var redirectURL = "";
        axios.post('https://api.uat.payglocal.in/gl/v1/payments/initiate', resp["jweToken"], {
            headers: {
                'x-gl-token-external': resp["jwsToken"],
                'Content-Type': 'text/plain'
            }
        }).then((response)=>{
            // console.log(response.data)
            if (response.data["status"] == "INPROGRESS"){
                console.log(response.data["data"])
                redirectURL = response.data["data"]["redirectUrl"];
                console.log(redirectURL);
            }
            res.json({ success: true, data: response.data });
        }).catch((error)=>{
            res.status(500).json({ success: false, error: error.message });
        });
    });

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});