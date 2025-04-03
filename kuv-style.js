(function () {
  "use strict";
  
  //const localpath = "/plugins/kuv/"; //заменить gitpath на это, если расположен на локальном лампаке в папке wwwroot/plugins
  const gitpath = "https://rpd-odr.github.io/kuv/";

  const ICONS = {
    "head__logo-icon": { main: gitpath + "img/logo-icon.svg" },
    "open--search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "n-search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "-settings": { main: gitpath + "icons/gear-duotone.svg" },
    "reload-icon": { main: gitpath + "icons/arrows-clockwise-duotone.svg" },
    "full-screen": { main: gitpath + "icons/arrows-out-simple-duotone.svg" },
    "head__menu-icon": { main: gitpath + "icons/list-bullets-duotone.svg" },
    "-main": { main: gitpath + "icons/house-duotone.svg" },
    "n-movie": { main: gitpath + "icons/film-slate-duotone.svg" },
    "n-tv": { main: gitpath + "icons/television-duotone.svg" },
    "menu-mult": { main: gitpath + "icons/rabbit-duotone.svg" },
    "-favorite": { main: gitpath + "icons/list-heart-duotone.svg" },
    "-relise": { main: gitpath + "icons/high-definition-duotone.svg" },
    "-mytorrents": { main: gitpath + "icons/magnet-duotone.svg" },
    "-console": { main: gitpath + "icons/terminal-window-duotone.svg" },
    "n-back": { main: gitpath + "icons/arrow-u-up-left-duotone.svg" },
    "nt-interface": { main: gitpath + "icons/layout-duotone.svg" },
    "nt-player": { main: gitpath + "icons/play-circle-duotone.svg" },
    "nt-server": { main: gitpath + "icons/hard-drives-duotone.svg" },
    "nt-more": { main: gitpath + "icons/sliders-horizontal-duotone.svg" },
    "nt-backup": { main: gitpath + "icons/vault-duotone.svg" },
    "button--book": { main: gitpath + "icons/heart-fill.svg", alt: gitpath + "icons/heart-duotone.svg" },
    "button--play": { main: gitpath + "icons/play-duotone.svg" },
    "view--trailer": { main: gitpath + "icons/youtube-logo-duotone.svg" },
    "view--online": { main: gitpath + "icons/queue-duotone.svg" },
    "view--torrent": { main: gitpath + "icons/download-simple-duotone.svg" },
    "filter--back": { main: gitpath + "icons/arrow-left-duotone.svg" },
    "filter--search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "watched__icon": { main: gitpath + "icons/play-circle-duotone.svg" },
    "prestige__viewed": { main: gitpath + "icons/eye-duotone.svg" },
    "item__viewed": { main: gitpath + "icons/play-duotone.svg" },
    "head-rate": { main: gitpath + "icons/star-duotone.svg" },
    "open--premium": { main: gitpath + "icons/star-duotone.svg" },
    "open--feed": { main: gitpath + "icons/star-four-duotone.svg" },
    "open--notice": { main: gitpath + "icons/bell-duotone.svg" },
    "n-about": { main: gitpath + "icons/info-duotone.svg" },
    "open--broadcast": { main: gitpath + "icons/broadcast-duotone.svg" },
    "button--reaction": { main: gitpath + "icons/smiley-sticker-duotone.svg" },
    "nt-account": { main: gitpath + "icons/user-gear-duotone.svg" },
    "nt-parser": { main: gitpath + "icons/list-magnifying-glass-duotone.svg" },
    "nt-tmdb": { main: gitpath + "icons/database-duotone.svg" },
    "nt-plugins": { main: gitpath + "icons/puzzle-piece-duotone.svg" },
    "nt-parental_control": { main: gitpath + "icons/lock-duotone.svg" },
    "nt-add_plugin": { main: gitpath + "icons/skull-duotone.svg" },
    "notice-": { main: gitpath + "icons/info-duotone.svg" },
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
    if (!document.querySelector('link[href="https://rpd-odr.github.io/kuv/styles/kuv-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://rpd-odr.github.io/kuv/styles/kuv-style.css";
      document.head.appendChild(link);
    }
  }

  function customizeMenu() {
    Lampa.Storage.set("menu_hide", JSON.stringify(["Персоны", "Аниме", "Лента", "История", "Расписание", "Подписки", "Фильтр", "Каталог"]));
    Lampa.Storage.set("menu_sort", JSON.stringify(["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное", "Релизы", "Торренты"]));
  }
  async function initPlugin() {
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
