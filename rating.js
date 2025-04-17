// Плагин KUV Rating для Lampa (гарантированно рабочий вариант)
(function() {
    "use strict";

    const gitpath = "https://rpd-odr.github.io/kuv/";
    
    // Иконки возрастных рейтингов
    const AGE_ICONS = {
        "18+": gitpath + "icons/age18.svg",
        "16+": gitpath + "icons/age16.svg",
        "12+": gitpath + "icons/age12.svg",
        "6+": gitpath + "icons/age6.svg",
        "0+": gitpath + "icons/age0.svg"
    };

    // Основная функция обработки
    function processCards() {
        // Находим все блоки с возрастным рейтингом
        const ratingBlocks = document.querySelectorAll('.full-start__pg');
        
        ratingBlocks.forEach(async (block) => {
            // Пропускаем уже обработанные
            if (block.dataset.kuvProcessed) return;
            block.dataset.kuvProcessed = "true";
            
            // Получаем текст рейтинга
            const ageText = block.textContent.trim();
            
            // Проверяем наличие иконки для этого рейтинга
            if (!AGE_ICONS[ageText]) return;
            
            try {
                // Загружаем SVG иконку
                const response = await fetch(AGE_ICONS[ageText]);
                const svg = await response.text();
                
                // Создаем контейнер для иконки
                const iconContainer = document.createElement('div');
                iconContainer.className = 'kuv-age-icon';
                iconContainer.innerHTML = svg;
                
                // Вставляем иконку рядом с оригинальным блоком
                block.parentNode.insertBefore(iconContainer, block.nextSibling);
                
                // Скрываем оригинальный текст рейтинга
                block.style.display = 'none';
                
            } catch (e) {
                console.error("Ошибка при обработке рейтинга:", e);
            }
        });
    }

    // Инициализация плагина
    function initPlugin() {
        // Добавляем базовые стили
        const style = document.createElement('style');
        style.textContent = `
            .kuv-age-icon {
                display: inline-block;
                margin-left: 6px;
                vertical-align: middle;
            }
            .kuv-age-icon svg {
                width: 22px;
                height: 22px;
            }
        `;
        document.head.appendChild(style);
        
        // Обрабатываем карточки сразу
        processCards();
        
        // Наблюдаем за изменениями DOM
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    needsUpdate = true;
                }
            });
            if (needsUpdate) processCards();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Запускаем плагин
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('DOMContentLoaded', initPlugin);
    }
})();