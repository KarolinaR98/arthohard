const menuBar = document.querySelector(".menu-bar");
const mobileMenu = document.querySelector(".menu-mobile");
const menuOverlay = document.querySelector(".menu-overlay");

//hamburger menu
menuBar.addEventListener("click", () => {    
    mobileMenu.classList.toggle("collapse");
    menuOverlay.classList.toggle("active");
})