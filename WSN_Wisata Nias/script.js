const navigation = document.querySelector(".site-nav");
const filterButtons = document.querySelectorAll(".filter-btn");
const destinations = [...document.querySelectorAll(".destination-item")];
const emptyState = document.querySelector(".empty-state");
const navigationMenu = document.querySelector("#mainNav");
const destinationSearch = document.querySelector("#destinationSearch");
const areaFilter = document.querySelector("#areaFilter");
const destinationCount = document.querySelector("#destinationCount");
const reservationForm = document.querySelector("#reservationForm");
const reservationFeedback = document.querySelector("#reservationFeedback");
const guestContact = document.querySelector("#guestContact");
const reservationArea = document.querySelector("#reservationArea");
const reservationDestination = document.querySelector("#reservationDestination");
const reservationService = document.querySelector("#reservationService");

let selectedCategory = "semua";

function updateNavigation() {
  navigation.classList.toggle("nav-scrolled", window.scrollY > 24);
}

function normalizeText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filterDestinations() {
  const searchTerm = normalizeText(destinationSearch.value.trim());
  const selectedArea = areaFilter.value;
  let visibleCount = 0;

  destinations.forEach((destination) => {
    const matchesCategory = selectedCategory === "semua"
      || destination.dataset.category === selectedCategory;
    const matchesArea = selectedArea === "semua"
      || destination.dataset.area === selectedArea;
    const searchableText = normalizeText(
      `${destination.dataset.search} ${destination.querySelector("h3").textContent}`,
    );
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const isVisible = matchesCategory && matchesArea && matchesSearch;

    destination.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
  destinationCount.textContent = `${visibleCount} destinasi ditemukan`;
}

function openReservation({ area, destination, service } = {}) {
  if (area) reservationArea.value = area;
  if (destination) reservationDestination.value = destination;
  if (service) reservationService.value = service;
  reservationFeedback.hidden = true;
  document.querySelector("#reservasi").scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("scroll", updateNavigation, { passive: true });
updateNavigation();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    filterDestinations();
  });
});

destinationSearch.addEventListener("input", filterDestinations);
areaFilter.addEventListener("change", filterDestinations);

document.querySelectorAll(".area-explore").forEach((button) => {
  button.addEventListener("click", () => {
    areaFilter.value = button.dataset.area;
    selectedCategory = "semua";
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton.dataset.filter === selectedCategory;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    filterDestinations();
    document.querySelector("#destinasi").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".destination-book").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".destination-item");
    openReservation({
      area: card.dataset.area,
      destination: button.dataset.destination,
    });
    document.querySelector("#reservationNotes").placeholder = `Contoh: ingin mengunjungi ${button.dataset.destination}`;
  });
});

document.querySelectorAll(".service-book").forEach((button) => {
  button.addEventListener("click", () => {
    openReservation({ service: button.dataset.service });
  });
});

navigationMenu.addEventListener("click", (event) => {
  if (event.target.closest(".nav-link") && navigationMenu.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(navigationMenu).hide();
  }
});

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const contactValue = guestContact.value.trim();
  const contactDigits = contactValue.replace(/\D/g, "");
  const validContact = /^[+0-9 ()-]+$/.test(contactValue)
    && contactDigits.length >= 8
    && contactDigits.length <= 15;
  guestContact.setCustomValidity(
    validContact ? "" : "Masukkan nomor WhatsApp yang valid (8–15 digit).",
  );
  if (!reservationForm.reportValidity()) return;

  const formData = new FormData(reservationForm);
  const destination = formData.get("destination") || "Belum ditentukan";
  const area = reservationArea.options[reservationArea.selectedIndex].text;
  const notes = formData.get("notes") || "Tidak ada";
  const message = [
    "Halo, saya ingin menanyakan permintaan reservasi wisata Nias.",
    "",
    `Nama: ${formData.get("name")}`,
    `Nomor WhatsApp: ${formData.get("contact")}`,
    `Tanggal kunjungan: ${formData.get("date")}`,
    `Jumlah wisatawan: ${formData.get("guests")}`,
    `Area: ${area}`,
    `Destinasi: ${destination}`,
    `Layanan: ${formData.get("service")}`,
    `Catatan: ${notes}`,
  ].join("\n");
  const whatsappUrl = new URL("https://web.whatsapp.com/send");
  whatsappUrl.searchParams.set("phone", "6282272760322");
  whatsappUrl.searchParams.set(
    "text",
    `Saya mau melihat pemandangan wisata di Nias. Berikut detail permintaan reservasi:\n\n${message}`,
  );
  window.location.assign(whatsappUrl.toString());
});

guestContact.addEventListener("input", () => guestContact.setCustomValidity(""));

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
document.querySelector("#tripDate").min = localToday;
document.querySelector("#currentYear").textContent = new Date().getFullYear();
filterDestinations();
