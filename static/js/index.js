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