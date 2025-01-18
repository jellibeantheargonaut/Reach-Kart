document.addEventListener('DOMContentLoaded', () => {
    function toggleSidebar(){
        const sidebar = document.getElementById('sidebar-menu-container');
        if(sidebar.style.display === 'none'){
            sidebar.style.display = 'flex';
            const menuicon = document.getElementById('menu-icon');
            menuicon.classList.remove('fa-bars');
            menuicon.classList.add('fa-xmark');
        }
        else {
            sidebar.style.display = 'none';
            const menuicon = document.getElementById('menu-icon');
            menuicon.classList.remove('fa-xmark');
            menuicon.classList.add('fa-bars');
        }
    }
    
    window.toggleSidebar = toggleSidebar;
});

function toggleUserAccountMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const userIcon = document.querySelector('.user-profile-icon-container');
    if (!userIcon.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

/* filepath: /Users/jellibean/Documents/Github/Reach-Kart/static/js/index.js */
function toggleSignin() {
    const overlay = document.getElementById('signin-overlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.signin-overlay-container');
    const form = document.querySelector('.signin-form-container');

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    });

    form.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

/* sigin button signin request */
function checkSession() {
    return fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                window.location.href = '/';
                return true;
            }
            return false;
        })
        .catch(error => {
            console.error('Session check failed:', error);
            return false;
        });
}

async function signIn() {
    // Check if user is already logged in
    const loggedIn = await checkSession();
    if (loggedIn) {
        toggleUserAccountMenu();
        return;
    }
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const data = {
        email: email,
        password: password
    };
    fetch('/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('signin-status').innerText = 'Signin successful';
            document.getElementById('signin-status').style.color = '#00A550';
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
        else {
            document.getElementById('signin-status').innerText = 'Signin failed';
            document.getElementById('signin-status').style.color = 'red';
        }
    })
}