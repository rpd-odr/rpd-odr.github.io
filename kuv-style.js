(function () {
  "use strict";

  const ICONS = {
    "head__logo-icon": { main: "/plugins/kuv/img/logo-icon.svg" },
    "open--search": { main: "/plugins/kuv/icons/magnifying-glass-duotone.svg" },
    "n-search": { main: "/plugins/kuv/icons/magnifying-glass-duotone.svg" },
    "-settings": { main: "/plugins/kuv/icons/gear-duotone.svg" },
    "reload-icon": { main: "/plugins/kuv/icons/arrows-clockwise-duotone.svg" },
    "full-screen": { main: "/plugins/kuv/icons/arrows-out-simple-duotone.svg" },
    "head__menu-icon": { main: "/plugins/kuv/icons/list-bullets-duotone.svg" },
    "-main": { main: "/plugins/kuv/icons/house-duotone.svg" },
    "n-movie": { main: "/plugins/kuv/icons/film-slate-duotone.svg" },
    "n-tv": { main: "/plugins/kuv/icons/television-duotone.svg" },
    "menu-mult": { main: "/plugins/kuv/icons/rabbit-duotone.svg" },
    //"custom-source": { main: "/plugins/kuv/icons/rabbit-duotone.svg" },
    "-favorite": { main: "/plugins/kuv/icons/list-heart-duotone.svg" },
    "-relise": { main: "/plugins/kuv/icons/high-definition-duotone.svg" },
    "-mytorrents": { main: "/plugins/kuv/icons/magnet-duotone.svg" },
    "-console": { main: "/plugins/kuv/icons/terminal-window-duotone.svg" },
    "n-back": { main: "/plugins/kuv/icons/arrow-u-up-left-duotone.svg" },
    "nt-interface": { main: "/plugins/kuv/icons/layout-duotone.svg" },
    "nt-player": { main: "/plugins/kuv/icons/play-circle-duotone.svg" },
    "nt-server": { main: "/plugins/kuv/icons/hard-drives-duotone.svg" },
    "nt-more": { main: "/plugins/kuv/icons/sliders-horizontal-duotone.svg" },
    "nt-backup": { main: "/plugins/kuv/icons/vault-duotone.svg" },
    "button--book": { main: "/plugins/kuv/icons/heart-fill.svg", alt: "/plugins/kuv/icons/heart-duotone.svg" },
    "button--play": { main: "/plugins/kuv/icons/play-duotone.svg" },
    "view--trailer": { main: "/plugins/kuv/icons/youtube-logo-duotone.svg" },
    "view--online": { main: "/plugins/kuv/icons/queue-duotone.svg" },
    "view--torrent": { main: "/plugins/kuv/icons/download-simple-duotone.svg" },
    "filter--back": { main: "/plugins/kuv/icons/arrow-left-duotone.svg" },
    "filter--search": { main: "/plugins/kuv/icons/magnifying-glass-duotone.svg" },
    "watched__icon": { main: "/plugins/kuv/icons/play-circle-duotone.svg" },
    "prestige__viewed": { main: "/plugins/kuv/icons/eye-duotone.svg" },
    "item__viewed": { main: "/plugins/kuv/icons/play-duotone.svg" },
    "head-rate": { main: "/plugins/kuv/icons/star-duotone.svg" },
  };

  const iconCache = {};

  async function fetchIcon(path) {
    if (iconCache[path]) {
      return iconCache[path];
    }
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки SVG (${path}): ${response.status}`);
      }
      const svgContent = await response.text();
      iconCache[path] = svgContent;
      return svgContent;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  function assignActionClasses(targetElement) {
    targetElement.querySelectorAll("[data-action]").forEach((parentElement) => {
      const action = parentElement.dataset.action;
      if (action) {
        const childElement = parentElement.querySelector(".menu__ico, .navigation-bar__icon");
        if (childElement) {
          childElement.classList.forEach((className) => {
            if (className.startsWith("data-action-")) {
              childElement.classList.remove(className);
            }
          });
          childElement.classList.add(`data-action-${action}`);
        }
      }
    });
  }

  function assignComponentClasses(targetElement) {
    targetElement.querySelectorAll("[data-component]").forEach((parentElement) => {
      const component = parentElement.dataset.component;
      if (component) {
        const childElement = parentElement.querySelector(".settings-folder__icon");
        if (childElement) {
          childElement.classList.forEach((className) => {
            if (className.startsWith("data-component-")) {
              childElement.classList.remove(className);
            }
          });
          childElement.classList.add(`data-component-${component}`);
        }
      }
    });
  }

  async function replaceIcons(targetElement) {
    for (const [key, paths] of Object.entries(ICONS)) {
      const elements = targetElement.querySelectorAll(`[class*="${key}"]`);
      if (elements.length === 0) continue;

      for (const element of elements) {
        const existingSvg = element.querySelector("svg");
        const existingImg = element.querySelector("img");

        if (!existingSvg && !existingImg) continue;

        if (existingSvg) {
          existingSvg.remove();
        }
        if (existingImg) {
          existingImg.remove();
        }

        const mainPath = paths.main;
        const altPath = paths.alt;
        let pathToUse = mainPath;

        const childFillTransparent = existingSvg && Array.from(existingSvg.querySelectorAll("*")).some(
          (child) => child.getAttribute("fill") === "transparent"
        );
        if (childFillTransparent && altPath) {
          pathToUse = altPath;
        }

        const svgContent = await fetchIcon(pathToUse);
        if (svgContent) {
          const svgDoc = new DOMParser().parseFromString(svgContent, "image/svg+xml");
          const svgElement = svgDoc.querySelector("svg");
          if (svgElement) {
            svgElement.classList.add("kuvicon");
            element.insertAdjacentHTML("afterbegin", svgElement.outerHTML);
          }
        }
      }
    }
  }


  function addReloadButton() {
    const reloadButton = $(
      '<div id="RELOAD" class="head__action selector reload-screen">' +
      '<div class="reload-icon"><svg></svg></div>' +
      '</div>'
    );
    replaceIcons(reloadButton[0]); // Заменяем иконку внутри reloadButton
    $('.head__actions').append(reloadButton);
    $('#RELOAD').on('hover:enter hover:click hover:touch', function () {
      location.reload();
    });
  }

  function addStyles() {
    if (!document.querySelector('link[href="/plugins/kuv/styles/kuv-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/plugins/kuv/styles/kuv-style.css";
      document.head.appendChild(link);
    }
  }

  function customizeMenu() {
    Lampa.Storage.set("menu_hide", JSON.stringify(["Персоны", "Аниме", "Лента", "История", "Расписание", "Подписки", "Фильтр", "Каталог"]));
    Lampa.Storage.set("menu_sort", JSON.stringify(["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное", "Релизы", "Торренты"]));
  }
  async function initPlugin() {
    addMult();
    addReloadButton();
    addStyles();
    customizeMenu();
    assignActionClasses(document.body);
    assignComponentClasses(document.body);
    await replaceIcons(document.body);

    Lampa.Listener.follow("activity:start", async () => {
      assignActionClasses(document.body);
      assignComponentClasses(document.body);
      await replaceIcons(document.body);
    });

    Lampa.Listener.follow("activity:archive", async () => {
      assignActionClasses(document.body);
      assignComponentClasses(document.body);
      await replaceIcons(document.body);
    });

    observeDOMChanges();
  }

  function observeDOMChanges() {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              assignActionClasses(node);
              assignComponentClasses(node);
              replaceIcons(node);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow("app", (e) => {
      if (e.type === "ready") {
        initPlugin();
      }
    });
  }
})();
