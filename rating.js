// Плагин KUV Rating для Lampa (финальная рабочая версия)
(function() {
    "use strict";

    const gitpath = "https://rpd-odr.github.io/kuv/";
    
    // Диапазоны возрастных рейтингов
    const AGE_RATINGS = {
        "18+": { 
            icon: gitpath + "icons/age18.svg",
            min: 18
        },
        "16+": {
            icon: gitpath + "icons/age16.svg",
            min: 16,
            max: 17
        },
        "12+": {
            icon: gitpath + "icons/age12.svg",
            min: 12,
            max: 15
        },
        "6+": {
            icon: gitpath + "icons/age6.svg",
            min: 6,
            max: 11
        },
        "0+": {
            icon: gitpath + "icons/age0.svg",
            min: 0,
            max: 5
        }
    };

    // Полные соответствия статусов
    const STATUS_MAP = {
        "Ended": "Завершён",
        "Returning Series": "Выходит",
        "Ongoing": "Выходит",
        "Canceled": "Отменён",
        "In Production": "В производстве",
        "Planned": "Запланирован",
        "Released": "Вышел",
        "Post Production": "Постпродакшн"
    };

    // Определение возрастного рейтинга
    function determineAgeRating(ageText) {
        // Извлекаем число из текста (поддержка форматов: "12", "12+", "16-18")
        const ageNum = parseInt(ageText) || 0;
        
        // Проверяем диапазоны от старшего к младшему
        if (ageNum >= 18) return "18+";
        if (ageNum >= 16) return "16+";
        if (ageNum >= 12) return "12+";
        if (ageNum >= 6) return "6+";
        return "0+";
    }

    // Обработка одной карточки
    async function processCard(card) {
        if (card.dataset.kuvProcessed) return;
        card.dataset.kuvProcessed = "true";
        
        // 1. Возрастной рейтинг
        const ageBlock = card.querySelector('.full-start__pg, .age-rating, [class*="age"]');
        if (ageBlock) {
            const ageText = (ageBlock.textContent || '').trim();
            const ageRating = determineAgeRating(ageText);
            
            if (AGE_RATINGS[ageRating]) {
                try {
                    const iconUrl = AGE_RATINGS[ageRating].icon;
                    const cachedIcon = localStorage.getItem(`kuv-icon-${ageRating}`);
                    
                    let svg = cachedIcon;
                    if (!svg) {
                        const response = await fetch(iconUrl);
                        svg = await response.text();
                        localStorage.setItem(`kuv-icon-${ageRating}`, svg);
                    }
                    
                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'kuv-age-icon';
                    iconContainer.innerHTML = svg;
                    ageBlock.replaceWith(iconContainer);
                } catch (e) {
                    console.error("Ошибка загрузки иконки:", e);
                }
            }
        }
        
        // 2. Статус сериала
        try {
            const cardData = getCardData(card);
            if (cardData) {
                const rawStatus = cardData.status || cardData.tmdb?.status;
                const status = STATUS_MAP[rawStatus] || rawStatus;
                
                if (status) {
                    const existingStatus = card.querySelector('.kuv-show-status');
                    if (existingStatus) {
                        existingStatus.textContent = status;
                    } else {
                        const statusElement = document.createElement('div');
                        statusElement.className = 'kuv-show-status';
                        statusElement.textContent = status;
                        
                        const rateLine = card.querySelector('.full-start-new__rate-line, .full-start__rate-line, .card__info');
                        if (rateLine) {
                            rateLine.appendChild(statusElement);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Ошибка обработки статуса:", e);
        }
    }

    // Получение данных карточки
    function getCardData(card) {
        try {
            // Пробуем разные способы получения данных
            if (card.dataset.item) return JSON.parse(card.dataset.item);
            if (card.dataset.params) return JSON.parse(card.dataset.params);
            if (card.dataset.card) return JSON.parse(card.dataset.card);
            
            // Для полноэкранного режима
            const activity = Lampa.Activity.active();
            if (activity && activity.movie) return activity.movie;
            
            return null;
        } catch (e) {
            console.error("Ошибка парсинга данных карточки:", e);
            return null;
        }
    }

    // Инициализация плагина
    function initPlugin() {
        // Стили
        const style = document.createElement('style');
        style.textContent = `
            .kuv-age-icon {
                display: inline-block;
                margin-right: 6px;
                vertical-align: middle;
            }
            .kuv-age-icon svg {
                width: 22px;
                height: 22px;
                fill: currentColor;
            }
            .kuv-show-status {
                display: inline-block;
                font-size: 12px;
                color: rgba(255,255,255,0.8);
                margin-left: 8px;
                vertical-align: middle;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
        
        // Обработка карточек
        const processAllCards = () => {
            document.querySelectorAll('.card, .item, [data-card]').forEach(processCard);
        };
        
        // Первичная обработка
        processAllCards();
        
        // Наблюдатель за изменениями
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            mutations.forEach((m) => {
                if (m.addedNodes.length) needsUpdate = true;
            });
            if (needsUpdate) processAllCards();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Обработка полноэкранного режима
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                setTimeout(() => processCard(e.object.activity.render()), 300);
            }
        });
    }

    // Запуск
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') initPlugin();
        });
    }
})();