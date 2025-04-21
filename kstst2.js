// Плагин KUV style для Lampa.
// Заменяет большинство иконок и шрифты в интерфейсе.
// Частично переработан интерфейс.
// Добавлена кнопка перезагрузки в шапку.

// Для корректной работы из локального источника необходима папка kuv со всеми подпапками.
// А также нужно заменить gitpath на localpath в коде ниже!

(function () {
    "use strict";

    // const localpath = "/plugins/kuv/"; // раскомментировать и заменить gitpath на localpath, если расположен локально
    var gitpath = "https://rpd-odr.github.io/kuv/";
    var CACHE_VERSION = '1.0';
    var CACHE_PREFIX = 'kuv_icon_';

    // Карта иконок: ключ — часть класса, значения — пути к SVG
    var ICONS = {
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
        "n-cartoons": { main: gitpath + "icons/rabbit-duotone.svg" },
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
        "button--subscribe": { main: gitpath + "icons/bell-duotone.svg"},
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
        "nt-pirate_store": { main: gitpath + "icons/puzzle-piece-duotone.svg" },
        "simple-keyboard-mic": { main: gitpath + "icons/microphone-duotone.svg" },
        "close-button": { main: gitpath + "icons/x-circle-duotone.svg" }
    };

    var RATE_STAR_ICON = { main: gitpath + "icons/star-duotone.svg" };

    // Иконки возрастных рейтингов
    var AGE_ICONS = {
        "0+": gitpath + "icons/age0.svg",
        "6+": gitpath + "icons/age6.svg",
        "12+": gitpath + "icons/age12.svg",
        "16+": gitpath + "icons/age16.svg",
        "18+": gitpath + "icons/age18.svg"
    };

    // Диапазоны для возрастных рейтингов
    var RATING_RANGES = [
        { min: 0, max: 5, rating: "0+" },
        { min: 6, max: 11, rating: "6+" },
        { min: 12, max: 15, rating: "12+" },
        { min: 16, max: 17, rating: "16+" },
        { min: 18, max: Infinity, rating: "18+" }
    ];

    var iconCache = {}; // Кэш иконок

    // Загружает иконку с кэшированием
    function fetchIcon(path) {
        return new Promise(function(resolve, reject) {
            if (iconCache[path]) {
                resolve(iconCache[path]);
                return;
            }

            var cacheKey = CACHE_PREFIX + CACHE_VERSION + '_' + path;
            try {
                var cached = localStorage.getItem(cacheKey);
                if (cached) {
                    iconCache[path] = cached;
                    resolve(cached);
                    return;
                }
            } catch (e) {
                console.warn('Ошибка чтения кэша:', e);
            }

            var xhr = new XMLHttpRequest();
            xhr.open('GET', path, true);

            xhr.onload = function() {
                if (xhr.status === 200) {
                    var svgContent = xhr.responseText;
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = svgContent;
                    var svgElement = tempDiv.querySelector('svg');
                    
                    if (svgElement) {
                        svgElement.classList.add('kuvicon');
                        var processedSvg = svgElement.outerHTML;
                        iconCache[path] = processedSvg;
                        
                        try {
                            localStorage.setItem(cacheKey, processedSvg);
                        } catch (e) {
                            if (e.name === 'QuotaExceededError') {
                                clearOldCache();
                                try {
                                    localStorage.setItem(cacheKey, processedSvg);
                                } catch (e) {
                                    console.error('Не удалось сохранить в кэш:', e);
                                }
                            }
                        }
                        
                        resolve(processedSvg);
                    } else {
                        reject(new Error('SVG не найден'));
                    }
                } else {
                    reject(new Error('Ошибка загрузки SVG: ' + xhr.status));
                }
            };

            xhr.onerror = function() {
                reject(new Error('Сетевая ошибка'));
            };

            xhr.send();
        });
    }

    function clearOldCache() {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(CACHE_PREFIX) === 0) {
                keys.push(key);
            }
        }
        
        var deleteCount = Math.floor(keys.length / 2);
        for (var j = 0; j < deleteCount; j++) {
            localStorage.removeItem(keys[j]);
        }
    }

    function processRateStars() {
        var rateBlocks = document.querySelectorAll(".full-start__rate");
        Array.prototype.forEach.call(rateBlocks, function(block) {
            if (block.dataset.kuvStarProcessed) return;
            block.dataset.kuvStarProcessed = "true";

            var divs = block.querySelectorAll("div");
            if (divs.length >= 2) {
                var secondDiv = divs[1];
                
                fetchIcon(RATE_STAR_ICON.main)
                    .then(function(svg) {
                        if (!svg) return;

                        var iconContainer = document.createElement("span");
                        iconContainer.className = "kuv-rate-star";
                        iconContainer.innerHTML = svg;

                        secondDiv.insertBefore(iconContainer, secondDiv.firstChild);
                    })
                    .catch(function(error) {
                        console.error("KUV Rating: Ошибка при добавлении звезды:", error);
                    });
            }
        });
    }

    // Присваивает классы по data-action
    function assignActionClasses(targetElement) {
        var elements = targetElement.querySelectorAll("[data-action]");
        Array.prototype.forEach.call(elements, function(parentElement) {
            var action = parentElement.dataset.action;
            if (action) {
                var childElement = parentElement.querySelector(".menu__ico, .navigation-bar__icon");
                if (childElement) {
                    Array.prototype.forEach.call(childElement.classList, function(className) {
                        if (className.indexOf("data-action-") === 0) {
                            childElement.classList.remove(className);
                        }
                    });
                    childElement.classList.add("data-action-" + action);
                }
            }
        });
    }

    // Присваивает классы по data-component
    function assignComponentClasses(targetElement) {
        var elements = targetElement.querySelectorAll("[data-component]");
        Array.prototype.forEach.call(elements, function(parentElement) {
            var component = parentElement.dataset.component;
            if (component) {
                var childElement = parentElement.querySelector(".settings-folder__icon");
                if (childElement) {
                    Array.prototype.forEach.call(childElement.classList, function(className) {
                        if (className.indexOf("data-component-") === 0) {
                            childElement.classList.remove(className);
                        }
                    });
                    childElement.classList.add("data-component-" + component);
                }
            }
        });
    }

    // Заменяет иконки на SVG
    function replaceIcons(targetElement) {
        return new Promise(function(resolve) {
            var promises = [];
            Object.keys(ICONS).forEach(function(key) {
                var elements = targetElement.querySelectorAll('[class*="' + key + '"]');
                if (elements.length === 0) return;

                Array.prototype.forEach.call(elements, function(element) {
                    var existingSvg = element.querySelector("svg");
                    var existingImg = element.querySelector("img");

                    if (!existingSvg && !existingImg) return;

                    if (existingSvg) existingSvg.parentNode.removeChild(existingSvg);
                    if (existingImg) existingImg.parentNode.removeChild(existingImg);

                    var paths = ICONS[key];
                    var mainPath = paths.main;
                    var altPath = paths.alt;
                    var pathToUse = mainPath;

                    // Проверка на fill="transparent" у старого SVG
                    if (existingSvg) {
                        var elements = existingSvg.getElementsByTagName("*");
                        for (var i = 0; i < elements.length; i++) {
                            if (elements[i].getAttribute("fill") === "transparent") {
                                if (altPath) {
                                    pathToUse = altPath;
                                }
                                break;
                            }
                        }
                    }

                    promises.push(
                        fetchIcon(pathToUse).then(function(svgContent) {
                            if (svgContent) {
                                element.insertAdjacentHTML("afterbegin", svgContent);
                            }
                        })
                    );
                });
            });

            Promise.all(promises).then(resolve);
        });
    }

    // Получение нормализованного рейтинга по диапазону
    function getNormalizedRating(ageText) {
        var match = ageText.match(/^(\d+)\+?$/);
        if (!match) return null;

        var age = parseInt(match[1], 10);
        for (var i = 0; i < RATING_RANGES.length; i++) {
            var range = RATING_RANGES[i];
            if (age >= range.min && age <= range.max) {
                return range.rating;
            }
        }
        return null;
    }

    // Обработка возрастных рейтингов
    function processRatings() {
        var ratingBlocks = document.querySelectorAll(".full-start__pg, [class*='pg']");
        Array.prototype.forEach.call(ratingBlocks, function(block) {
            if (block.dataset.kuvProcessed) return;
            block.dataset.kuvProcessed = "true";

            var ageText = block.textContent.trim();
            var normalizedRating = getNormalizedRating(ageText);
            if (!normalizedRating || !AGE_ICONS[normalizedRating]) return;

            fetchIcon(AGE_ICONS[normalizedRating])
                .then(function(svg) {
                    if (!svg) return;

                    var iconContainer = document.createElement("div");
                    iconContainer.className = "kuv-age-icon";
                    iconContainer.innerHTML = svg;

                    var targetElement = block.closest(".full-start-new__rate-line, .full-start__rate-line, [class*='rate-line']");
                    if (!targetElement) {
                        targetElement = block.parentNode;
                    }

                    targetElement.insertBefore(iconContainer, targetElement.firstChild);
                    block.style.display = "none";
                })
                .catch(function(error) {
                    console.error("KUV Rating: Ошибка при обработке рейтинга:", error);
                });
        });
    }

    // Добавляет кнопку "Перезагрузить" в шапку
    function addReloadButton() {
        var reloadButton = $(
            '<div id="RELOAD" class="head__action selector reload-screen">' +
            '<div class="reload-icon"><svg></svg></div>' +
            '</div>'
        );
        replaceIcons(reloadButton[0]);
        $('.head__actions').append(reloadButton);
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
            location.reload();
        });
    }

    // Добавляет кастомные стили
    function addStyles() {
        if (!document.querySelector('link[href="' + gitpath + 'styles/kuv-style.css"]')) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = gitpath + "styles/kuv-style.css";
            document.head.appendChild(link);
        }

        var ratingStyle = document.createElement("style");
        ratingStyle.textContent = [
            '.kuv-age-icon {',
            '    display: inline-block;',
            '    margin-right: 1.5em!important;',
            '    vertical-align: middle;',
            '}',
            '.kuv-age-icon svg {',
            '    width: 2.2em;',
            '    height: 2.2em;',
            '}',
            '.kuv-rate-star {',
            '    display: inline-block;',
            '    margin-right: 0.3em;',
            '    vertical-align: middle;',
            '}',
            '.kuv-rate-star svg {',
            '    width: 0.5em;',
            '    height: 0.5em;',
            '}',
            '.full-start__pg, .full-start__status {',
            '    background: rgba(0, 0, 0, 0.15);',
            '    border-radius: 0.3em;',
            '    border: none!important;',
            '}'
        ].join('\n');
        document.head.appendChild(ratingStyle);
    }

    // Настраивает левое меню
    function customizeMenu() {
        Lampa.Storage.set("menu_hide", JSON.stringify(["Персоны", "Аниме", "Лента", "История", "Расписание", "Подписки", "Фильтр", "Каталог"]));
        Lampa.Storage.set("menu_sort", JSON.stringify(["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное", "Релизы", "Торренты"]));
    }

    // Следим за DOM и заменяем иконки при динамических изменениях
    function observeDOMChanges() {
        if (typeof MutationObserver === "undefined") return;
        
        var timeout;
        var observer = new MutationObserver(function(mutations) {
            if (timeout) return;
            
            timeout = setTimeout(function() {
                var nodes = [];
                mutations.forEach(function(mutation) {
                    if (mutation.type === "childList") {
                        Array.prototype.forEach.call(mutation.addedNodes, function(node) {
                            if (node.nodeType === 1) {
                                nodes.push(node);
                            }
                        });
                    }
                });

                if (nodes.length) {
                    nodes.forEach(function(node) {
                        assignActionClasses(node);
                        assignComponentClasses(node);
                        replaceIcons(node);
                    });
                    processRatings();
                    processRateStars();
                }

                timeout = null;
            }, 100);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Инициализация плагина
    function initPlugin() {
        Promise.resolve()
            .then(function() {
                addReloadButton();
                addStyles();
                customizeMenu();
                assignActionClasses(document.body);
                assignComponentClasses(document.body);
                processRatings();
                processRateStars();
                return replaceIcons(document.body);
            })
            .then(function() {
                observeDOMChanges();
            });

        Lampa.Listener.follow("activity:start", function() {
            assignActionClasses(document.body);
            assignComponentClasses(document.body);
            replaceIcons(document.body);
            processRatings();
            processRateStars();
        });

        Lampa.Listener.follow("activity:archive", function() {
            assignActionClasses(document.body);
            assignComponentClasses(document.body);
            replaceIcons(document.body);
            processRatings();
            processRateStars();
        });
    }

    // Запуск при готовности приложения
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type === "ready") {
                initPlugin();
            }
        });
    }
})();
