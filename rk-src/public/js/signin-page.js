// javascript for sign-in page
async function blankSiginForm(){
    const signinForm = document.querySelector('form-container');
    const fields = signinForm.querySelectorAll('input');
    fields.forEach(field => {
        field.value = '';
    });
}

async function blankSignupForm(){
    const signupForm = document.querySelector('form-container');
    const fields = signupForm.querySelectorAll('input');
    fields.forEach(field => {
        field.value = '';
    });
}


async function signin() {
    let email = document.getElementById('signin-email').value;
    let password = document.getElementById('signin-password').value;

    let data = {
        email: email,
        password: password
    };

    fetch('/common/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = '/home';
        } else {
            response.json().then((data) => {
                document.querySelector('.form-container-messages').textContent = data.message;
            });
        }
    });
}

function signup() {
    let name = document.getElementById('signup-username').value;
    let email = document.getElementById('signup-email').value;
    let password = document.getElementById('signup-password').value;
    let confirmPassword = document.getElementById('signup-confirm-password').value;
    let accountType = document.getElementById('signup-account-type').value;
    if (password !== confirmPassword) {
        document.querySelector('.form-container-messages').textContent = 'Passwords do not match';
        document.getElementById('signup-password').style.border = '1px solid red';
        document.getElementById('signup-confirm-password').value = '';
        return;
    }

    if(password.length < 8){
        document.querySelector('.form-container-messages').textContent = 'Password must be at least 8 characters long';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm-password').value = '';
        return;
    }

    // regular expression to validate email
    const emailRegex = /\S+@\S+\.\S+/;
    if(!emailRegex.test(email)){
        document.getElementById('signup-email').style.border = '1px solid red';
        // also set focus on email field
        document.getElementById('signup-email').focus();
        document.querySelector('.form-container-messages').textContent = 'Invalid email';
        return;
    }
    
    let data = {
        name: name,
        email: email,
        password: password,
        account_type: accountType
    }

    fetch('/common/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = '/home';
        } else {
            response.json().then((data) => {
                document.querySelector('.form-container-messages').textContent = data.message;
            });
        }
    });
}

document.getElementById('signin-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        signin();
    }
});

document.getElementById('signup-confirm-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        signup();
    }
});