// javascript for sign-in page

function signin() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

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
                document.querySelector('.form-messages').textContent = data.message;
            });
        }
    });
}

function signup() {
    let name = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
        document.querySelector('.form-messages').textContent = 'Passwords do not match';
        return;
    }

    let data = {
        name: name,
        email: email,
        password: password,
        account_type: 'customer'
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
                document.querySelector('.form-messages').textContent = data.message;
            });
        }
    });
}