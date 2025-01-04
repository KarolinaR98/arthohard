const menuBar = document.querySelector(".menu-bar");
const mobileMenu = document.querySelector(".menu-mobile");
const menuOverlay = document.querySelector(".menu-overlay");
const mobileMenuAnhors = document.querySelectorAll(".menu-mobile a");
let scrollDisabled = false;

const navbar = document.querySelector(".main-nav");
const logo = document.querySelector(".logo");

const menuLinks = document.querySelectorAll(".menu-item a");
const sections = document.querySelectorAll("section");

const containers = document.querySelectorAll(".container");

const productsSection = document.getElementById("products-section");
const productsWrapper = document.querySelector(".products-wrapper");
const amountOfProductsSelector = document.getElementById("amount-of-products");
let products = [];

//disable and enable scrolling

const preventScroll = (event) => {
  if (scrollDisabled) {
    event.preventDefault();
  }
};

const disableScroll = () => {
  scrollDisabled = true;

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });

  window.addEventListener("keydown", (event) => {
    const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    if (keys.includes(event.keyCode)) {
      preventScroll(event);
    }
  });
};

const enableScroll = () => {
  scrollDisabled = false;

  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);
  window.removeEventListener("keydown", preventScroll);
};

//hamburger menu

const toggleMobileMenu = () => {
  mobileMenu.classList.toggle("collapse");
  menuOverlay.classList.toggle("active");

  menuOverlay.classList.contains("active") ? disableScroll() : enableScroll();
};

const closeMobileMenu = () => {
  mobileMenu.classList.remove("collapse");
  menuOverlay.classList.remove("active");
  document.body.classList.remove("no-scroll");

  enableScroll();
};

//navbar size changes

const updateNavbar = () => {
  if (window.innerWidth >= 996) {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      navbar.style.padding = "5px 0";
      logo.style.fontSize = "1.5rem";
    } else {
      navbar.style.padding = "33px 0";
      logo.style.fontSize = "2rem";
    }
  } else if (window.innerWidth < 996 && window.innerWidth > 576) {
    navbar.style.padding = "15px 0";
    logo.style.fontSize = "1.8rem";
  } else {
    navbar.style.padding = "15px 0";
    logo.style.fontSize = "1.5rem";
  }
};

// underline active links in navbar

const updateActiveLink = () => {
  let currentSectionId = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom >= 100) {
      currentSectionId = section.getAttribute("id");
    }
  });

  menuLinks.forEach((link) => {
    if (
      link.getAttribute("href") === `#${currentSectionId}` &&
      link.getAttribute("href") !== "#"
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

//navbar background color changes for mobiles

const updateNavBgColor = () => {
  if (window.innerWidth > 996) return;

  containers.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= navbar.offsetHeight && rect.bottom >= navbar.offsetHeight) {
      if (section.parentElement.classList.contains("background-color-white")) {
        navbar.style.backgroundColor = "var(--white)";
      } else {
        navbar.style.backgroundColor = "var(--background-color-mobile)";
      }
    } else return;
  });
};

const onLogoClick = () => {
  if (window.innerWidth > 996) return;

  navbar.style.backgroundColor = "var(--background-color-mobile)";
};

//fetchinging data for products section

const showLoading = () => {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-spinner spinner";
  productsWrapper.appendChild(loadingDiv);
};

const hideLoading = () => {
  const loadingDiv = document.querySelector(".loading-spinner");

  if (loadingDiv) {
    loadingDiv.remove();
  }
};

const fetchData = async (pageSize) => {
  try {
    showLoading();
    const response = await fetch(
      `https://brandstestowy.smallhost.pl/api/random?pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error. Status ${response.status}`);
    }

    const data = await response.json();

    hideLoading();
    products = data.data;
    displayProducts(products);

  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

const displayProducts = (products) => {
  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className = "product";
    productElement.setAttribute("id", product.id);
    productElement.textContent = `ID: ${product.id}`;
    productsWrapper.appendChild(productElement);
  });
};

const handleSelectorChange = (e) => {
  const pageSize = e.target.value;
  productsWrapper.innerHTML = "";

  fetchData(pageSize);
};

const productsSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fetchData(document.getElementById("amount-of-products").value);
        productsSectionObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

productsSectionObserver.observe(productsSection);

menuBar.addEventListener("click", toggleMobileMenu);

menuOverlay.addEventListener("click", closeMobileMenu);
mobileMenuAnhors.forEach((anchor) => {
  anchor.addEventListener("click", closeMobileMenu);
});
window.addEventListener("resize", closeMobileMenu);

window.addEventListener("scroll", updateNavbar);
window.addEventListener("resize", updateNavbar);

window.addEventListener("scroll", updateNavBgColor);
window.addEventListener("resize", updateNavBgColor);

logo.addEventListener("click", onLogoClick);

window.addEventListener("scroll", updateActiveLink);
window.addEventListener("resize", updateActiveLink);

amountOfProductsSelector.addEventListener("change", (e) =>
  handleSelectorChange(e)
);

updateNavbar();
updateNavBgColor();
updateActiveLink();
