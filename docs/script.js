const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const cardNumberInput = document.getElementById('card-number');
const expiryInput = document.getElementById('expiry');
const cvvInput = document.getElementById('cvv');
const payButton = document.getElementById('pay-button');
const visaIcon = document.getElementById('visa-icon');
const mastercardIcon = document.getElementById('mastercard-icon');
const amexIcon = document.getElementById('amex-icon');

const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
};

function resetCardIcons() {
    visaIcon.classList.remove('active');
    mastercardIcon.classList.remove('active');
    amexIcon.classList.remove('active');
}

amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 1) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    e.target.value = value;
    validateAmount();
    updatePayButton();
    validateForm();
});

currencySelect.addEventListener('change', () => {
    validateCurrency();
    updatePayButton();
    validateForm();
});

cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    e.target.value = value;
    validateCardNumber();
    detectCardType(value);
    validateForm();
});

expiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    e.target.value = value;
    validateExpiry();
    validateForm();
});

cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    validateCVV();
    validateForm();
});

function detectCardType(number) {
    const cleaned = number.replace(/\D/g, '');
    const visa = /^4/;
    const mastercard = /^5[1-5]/;
    const amex = /^3[47]/;

    resetCardIcons();
    if (visa.test(cleaned)) {
        visaIcon.classList.add('active');
    } else if (mastercard.test(cleaned)) {
        mastercardIcon.classList.add('active');
    } else if (amex.test(cleaned)) {
        amexIcon.classList.add('active');
    }
}

function validateAmount() {
    const value = parseFloat(amountInput.value);
    const error = document.getElementById('amount-error');
    const isValid = !isNaN(value) && value > 0;
    error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function validateCurrency() {
    const value = currencySelect.value;
    const error = document.getElementById('currency-error');
    const isValid = value !== '';
    error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function validateCardNumber() {
    const value = cardNumberInput.value.replace(/\D/g, '');
    const error = document.getElementById('card-number-error');
    const isValid = value.length >= 15 && value.length <= 16;
    error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function validateExpiry() {
    const value = expiryInput.value;
    const error = document.getElementById('expiry-error');
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(value)) {
        error.style.display = 'block';
        return false;
    }
    const [month, year] = value.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const isValid = year > currentYear || (year === currentYear && month >= currentMonth);
    error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function validateCVV() {
    const value = cvvInput.value;
    const error = document.getElementById('cvv-error');
    const isValid = value.length === 3 || value.length === 4;
    error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function updatePayButton() {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    if (!isNaN(amount) && amount > 0 && currency) {
        payButton.textContent = `Pay ${currencySymbols[currency]}${amount.toFixed(2)}`;
    } else {
        payButton.textContent = 'Pay';
    }
}

function validateForm() {
    const isValid = validateAmount() && validateCurrency() && validateCardNumber() && validateExpiry() && validateCVV();
    payButton.disabled = !isValid;
}

async function initiatePayment() {
    const [expiryMonth, expiryYearShort] = expiryInput.value.split('/');
    const expiryYear = `20${expiryYearShort}`;
    const payload = {
        amount: amountInput.value,
        currency: currencySelect.value,
        cardNumber: cardNumberInput.value,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvv: cvvInput.value
    };

    try {
        const response = await fetch('/initiate-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            alert('Payment initiated successfully!');
            console.log(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Payment failed: ' + error.message);
        console.error(error);
    }
}

payButton.addEventListener('click', () => {
    initiatePayment();
});