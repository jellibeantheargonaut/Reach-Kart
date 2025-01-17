function toggleSidebar(){
    const sidebar = document.getElementById('sidebar-menu-container');
    if(sidebar.style.display === 'none'){
        sidebar.style.display = 'flex';
    }
    else {
        sidebar.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    function toggleSidebar(){
        const sidebar = document.getElementById('sidebar-menu-container');
        if(sidebar.style.display === 'none'){
            sidebar.style.display = 'flex';
        }
        else {
            sidebar.style.display = 'none';
        }
    }
    
    window.toggleSidebar = toggleSidebar;
});