// javascript for sign-in page

function signin() {
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