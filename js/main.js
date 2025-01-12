const DESKTOP_BREAKPOINT = 996;
const MOBILE_BREAKPOINT = 576;

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
let hasMoreData = true;
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
  if (mobileMenu.classList.contains("collapse")) {
    if (window.innerWidth > 996) {
      closeMobileMenu();
    }
  }
};

//navbar size changes

const updateNavbar = () => {
  if (window.innerWidth >= DESKTOP_BREAKPOINT) {
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
  } else if (
    window.innerWidth < DESKTOP_BREAKPOINT &&
    window.innerWidth > MOBILE_BREAKPOINT
  ) {
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

const updateNavbarBgColor = () => {
  if (window.innerWidth > DESKTOP_BREAKPOINT) return;

  containers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    if (rect.top <= navbar.offsetHeight && rect.bottom >= navbar.offsetHeight) {
      if (
        container.parentElement.classList.contains("background-color-white")
      ) {
        navbar.style.backgroundColor = "var(--white)";
      } else {
        navbar.style.backgroundColor = "var(--background-color-mobile)";
      }
    } else return;
  });
};

const onLogoClick = () => {
  if (window.innerWidth > DESKTOP_BREAKPOINT) return;

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
      `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error. Status ${response.status}`);
    }

    const data = await response.json();

    hideLoading();
    products = [...products, ...data.data];
    displayProducts(data.data);

    if (data.currentPage < data.totalPages) {
      pageNumber++;
      hasMoreData = true;
    } else {
      hasMoreData = false;
    }

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
  hasMoreData = true;
  products = [];
  productsWrapper.innerHTML = "";
};

const bottomDetectorObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (hasMoreData) {
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

// performance optimalization

const throttle = (callback, delay = 250) => {
  let shouldWait = false;
  let waitingArgs;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      callback(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    callback(...args);
    shouldWait = true;

    setTimeout(timeoutFunc, delay);
  };
};

bottomDetectorObserver.observe(bottomDetector);

menuBar.addEventListener("click", toggleMobileMenu);

menuOverlay.addEventListener("click", closeMobileMenu);
mobileMenuAnchors.forEach((anchor) => {
  anchor.addEventListener("click", closeMobileMenu);
});
window.addEventListener("resize", throttle(updateMobileMenuOnResize));

window.addEventListener("scroll", throttle(updateNavbar));
window.addEventListener("resize", throttle(updateNavbar));

window.addEventListener("scroll", throttle(updateNavbarBgColor, 100));
window.addEventListener("resize", throttle(updateNavbarBgColor, 100));

logo.addEventListener("click", onLogoClick);

window.addEventListener("scroll", throttle(updateActiveLink));
window.addEventListener("resize", throttle(updateActiveLink));

productsWrapper.addEventListener("click", (e) => {
  if (e.target.classList.contains("product")) {
    displayProductPopup(e);
  }
});

amountOfProductsSelector.addEventListener("change", (e) =>
  handleSelectorChange(e)
);

updateNavbar();
updateNavbarBgColor();
updateActiveLink();
