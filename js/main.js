const menuBar = document.querySelector(".menu-bar");
const mobileMenu = document.querySelector(".menu-mobile");
const menuOverlay = document.querySelector(".menu-overlay");
const mobileMenuAnchors = document.querySelectorAll(".menu-mobile a");

const navbar = document.querySelector(".main-nav");
const logo = document.querySelector(".logo");

const menuLinks = document.querySelectorAll(".menu-item a");
const sections = document.querySelectorAll("section");

const containers = document.querySelectorAll(".container");

const productsSection = document.getElementById("products-section");
const productsWrapper = document.querySelector(".products-wrapper");
const amountOfProductsSelector = document.getElementById("amount-of-products");
const bottomDetector = document.querySelector(
  ".products-section-bottom-detector"
);
let pageSize = amountOfProductsSelector.value;
let pageNumber = 1;
let products = [];

//disable and enable scrolling

const disableScroll = () => {
  document.querySelector("html").classList.add("prevent-scroll");
};

const enableScroll = () => {
  document.querySelector("html").classList.remove("prevent-scroll");
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

  enableScroll();
};

const updateMobileMenuOnResize = () => {
  if(mobileMenu.classList.contains("collapse")) {
    if(window.innerWidth > 996) {
      closeMobileMenu();
    }
  }
}

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

//managing data for products section

const showLoading = () => {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-spinner spinner";
  productsSection.appendChild(loadingDiv);
};

const hideLoading = () => {
  const loadingDiv = document.querySelector(".loading-spinner");

  if (loadingDiv) {
    loadingDiv.remove();
  }
};

const fetchData = async () => {
  try {
    showLoading();
    const response = await fetch(
      `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=10`
    );
    if (!response.ok) {
      throw new Error(`HTTP error. Status ${response.status}`);
    }

    const data = await response.json();

    hideLoading();
    products = [...products, ...data.data];
    displayProducts(data.data);
    pageNumber++;
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
  pageSize = e.target.value;
  pageNumber = 1;
  products = [];
  productsWrapper.innerHTML = "";
};

const bottomDetectorObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (products.length < pageSize) {
          fetchData();
        } else return;
      }
    });
  },
  { threshold: 0.5 }
);

// product popup

const displayProductPopup = (e) => {
  disableScroll();
  const productId = Number(e.target.getAttribute("id"));
  const productDetails = products.find((product) => product.id === productId);

  const productPopupContainer = document.createElement("div");
  productPopupContainer.className = "product-popup-container";
  productPopupContainer.innerHTML = `<div class="popup-content">
                <div class="popup-wrapper">
                    <p class="popup-product-id">${productDetails.id}</p>
                    <button class="popup-close-btn">x</button>
                </div>
                <p class="popup-product-name">Nazwa: ${productDetails.text}</p>
                <p class="popup-product-value">Wartość: ${productDetails.id}</p>
            </div>`;

  document.body.appendChild(productPopupContainer);

  const closeButton = productPopupContainer.querySelector(".popup-close-btn");

  closeButton.addEventListener("click", () => {
    document.body.removeChild(productPopupContainer);
    enableScroll();
  });
};

bottomDetectorObserver.observe(bottomDetector);

menuBar.addEventListener("click", toggleMobileMenu);

menuOverlay.addEventListener("click", closeMobileMenu);
mobileMenuAnchors.forEach((anchor) => {
  anchor.addEventListener("click", closeMobileMenu);
});
window.addEventListener("resize", updateMobileMenuOnResize);

window.addEventListener("scroll", updateNavbar);
window.addEventListener("resize", updateNavbar);

window.addEventListener("scroll", updateNavBgColor);
window.addEventListener("resize", updateNavBgColor);

logo.addEventListener("click", onLogoClick);

window.addEventListener("scroll", updateActiveLink);
window.addEventListener("resize", updateActiveLink);

productsWrapper.addEventListener("click", (e) => {
  if (e.target.classList.contains("product")) {
    console.log(e.target);
    displayProductPopup(e);
  }
});

amountOfProductsSelector.addEventListener("change", (e) =>
  handleSelectorChange(e)
);

updateNavbar();
updateNavBgColor();
updateActiveLink();
