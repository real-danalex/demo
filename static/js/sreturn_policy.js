// script.js - Dynamic Returns Policy Script
document.addEventListener("DOMContentLoaded", () => {
  const bakeryName = "Sunny Crust Bakery";
  const email = "returns@sunnycrust.com";
  const lastUpdated = "2025-10-30";

  // Update dynamic content
  document.getElementById("email").textContent = email;
  document.getElementById("lastUpdated").textContent = lastUpdated;

  // Log for debugging
  console.log(`${bakeryName} Returns Policy loaded successfully.`);
});
