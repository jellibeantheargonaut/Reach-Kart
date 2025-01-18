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
function signIn() {
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

/*
/* function for meilisearch search */
/* filepath: /Users/jellibean/Documents/Github/Reach-Kart/static/js/index.js */
document.addEventListener('DOMContentLoaded', () => {
    const searchClient = new MeiliSearch({
        host: 'http://localhost:7700',
        apiKey: 'GugSsWTPnuqs41p84ai0dH0LI6GqLliXYvBdrw4vAw8'
    });

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value;

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(async () => {
            try {
                const results = await searchClient
                    .index('books')
                    .search(query, {
                        attributesToRetrieve: ['name']
                    });

                searchResults.innerHTML = '';
                
                if (results.hits.length > 0) {
                    results.hits.forEach(product => {
                        const resultContainer = document.createElement('div');
                        resultContainer.className = 'search-result-item';
                        resultContainer.innerText = product.name;
                        searchResults.appendChild(resultContainer);
                    });
                    searchResults.style.display = 'flex';
                    document.getElementById('overlay-container').style.display = 'block';
                } else {
                    searchResults.style.display = 'none';
                }
            } catch (error) {
                console.error('Search failed:', error);
            }
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            searchResults.style.display = 'none';
            document.getElementById('overlay-container').style.display = 'none';
        }
    });
});