// sidebar.js


export function initializeSidebar() {
    const sidebar = document.querySelector('.sideBar');
    const brandName = document.querySelector('#brandName');
    const menuItems = document.querySelectorAll('.link-text');
    let icons = document.querySelectorAll('#icon')
    
    if (!sidebar) {
        console.log("returing");
        
        return
    };

    sidebar.addEventListener("mouseenter", () => {
        if (sidebar.classList.contains("w-20")) {
            sidebar.classList.remove("w-20");
            sidebar.classList.add("w-72");
            brandName?.classList.remove("hidden");
            menuItems.forEach(item => {
                item.classList.remove("hidden")
            });
            icons.forEach(icon => icon.classList.add("hover:animate-spin"))
        }
    });

    sidebar.addEventListener("mouseleave", () => {
        if (sidebar.classList.contains("w-72")) {
            sidebar.classList.remove("w-72");
            sidebar.classList.add("w-20");
            brandName?.classList.add("hidden");
            menuItems.forEach(item => item.classList.add("hidden"));
        }
    });
}

// window.addEventListener("DOMContentLoaded", initializeSidebar);
