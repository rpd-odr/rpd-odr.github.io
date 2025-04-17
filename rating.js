// Плагин KUV Rating для Lampa (с диапазонными проверками)
(function() {
    "use strict";

    const gitpath = "https://rpd-odr.github.io/kuv/";
    
    // Иконки возрастных рейтингов с диапазонами
    const AGE_RATINGS = {
        "18+": { 
            icon: gitpath + "icons/age18.svg",
            range: [18, Infinity] // 18 и выше
        },
        "16+": {
            icon: gitpath + "icons/age16.svg",
            range: [16, 17] // 16-17
        },
        "12+": {
            icon: gitpath + "icons/age12.svg",
            range: [12, 15] // 12-15
        },
        "6+": {
            icon: gitpath + "icons/age6.svg",
            range: [6, 11] // 6-11
        },
        "0+": {
            icon: gitpath + "icons/age0.svg",
            range: [0, 5] // 0-5
        }
    };

    // Тексты статусов сериалов
    const STATUS_TEXTS = {
        "Ended": "Завершён",
        "Returning Series": "Выходит",
        "Canceled": "Отменён",
        "In Production": "В производстве",
        "Planned": "Запланирован"
    };

    // Определяем рейтинг по числовому значению
    function getAgeRating(ageNum) {
        ageNum = parseInt(ageNum) || 0;
        
        for (const [label, data] of Object.entries(AGE_RATINGS)) {
            const [min, max] = data.range;
            if (ageNum >= min && ageNum <= max) {
                return label;
            }
        }
        return null;
    }

    // Основная функция обработки
    async function processCard(card) {
        if (card.dataset.kuvProcessed) return;
        card.dataset.kuvProcessed = "true";
        
        // 1. Обработка возрастного рейтинга
        const ageBlock = card.querySelector('.full-start__pg');
        if (ageBlock) {
            const ageText = ageBlock.textContent.trim();
            
            // Пробуем извлечь число из текста (например "12" из "12+")
            const ageNum = parseInt(ageText) || 0;
            const ageRating = getAgeRating(ageNum);
            
            if (ageRating && AGE_RATINGS[ageRating]) {
                try {
                    const response = await fetch(AGE_RATINGS[ageRating].icon);
                    const svg = await response.text();
                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'kuv-age-icon';
                    iconContainer.innerHTML = svg;
                    ageBlock.replaceWith(iconContainer);
                } catch (e) {
                    console.error("Ошибка загрузки иконки:", e);
                }
            }
        }
        
        // 2. Добавление статуса сериала
        try {
            const cardData = card.dataset.item ? JSON.parse(card.dataset.item) : null;
            if (cardData) {
                const status = cardData.tmdb?.status || cardData.status;
                if (status && STATUS_TEXTS[status]) {
                    const statusElement = document.createElement('div');
                    statusElement.className = 'kuv-show-status';
                    statusElement.textContent = STATUS_TEXTS[status];
                    
                    const rateLine = card.querySelector('.full-start-new__rate-line, .full-start__rate-line');
                    if (rateLine && !rateLine.querySelector('.kuv-show-status')) {
                        rateLine.appendChild(statusElement);
                    }
                }
            }
        } catch (e) {
            console.error("Ошибка обработки статуса:", e);
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
        
        // Обработка существующих карточек
        document.querySelectorAll('.card').forEach(processCard);
        
        // Наблюдатель за изменениями DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        node.querySelectorAll('.card').forEach(processCard);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запуск
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('DOMContentLoaded', initPlugin);
    }
})();