// Service Worker (background.js)
// Este script corre en segundo plano y puede manejar eventos globales de la extensión.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Standup Finance Extension instalada.");
});

// Ejemplo: Escuchar cuando el usuario hace clic en el ícono de la extensión
chrome.action.onClicked.addListener((tab) => {
  console.log("Extensión clickeada en tab:", tab.id);
});
