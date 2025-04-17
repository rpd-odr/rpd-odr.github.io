// Плагин KUV Rating для Lampa (упрощённая рабочая версия)
(function () {
  "use strict";

  const gitpath = "https://rpd-odr.github.io/kuv/";
  
  const ICONS = {
    "18+": gitpath + "icons/age18.svg",
    "16+": gitpath + "icons/age16.svg",
    "12+": gitpath + "icons/age12.svg",
    "6+":  gitpath + "icons/age6.svg",
    "0+":  gitpath + "icons/age0.svg"
  };

  // Простой кэш иконок
  const iconCache = {};

  async function fetchIcon(path) {
    if (iconCache[path]) return iconCache[path];
    try {
      const response = await fetch(path);
      return await response.text();
    } catch (e) {
      console.error("KUV Rating: Ошибка загрузки иконки", e);
      return null;
    }
  }

  // Основная функция замены рейтинга
  async function processCard(cardElement) {
    if (!cardElement || cardElement.dataset.kuvProcessed) return;
    
    // Помечаем карточку как обработанную
    cardElement.dataset.kuvProcessed = "true";
    
    // Ищем блок для вставки рейтинга
    const rateLine = cardElement.querySelector('.full-start-new__rate-line, .full-start__rate-line');
    if (!rateLine) return;
    
    // Получаем текущий рейтинг из текста
    const pgElement = cardElement.querySelector('.full-start__pg');
    if (!pgElement) return;
    
    const ageText = pgElement.textContent.trim();
    if (!ICONS[ageText]) return;
    
    // Вставляем иконку
    const svg = await fetchIcon(ICONS[ageText]);
    if (svg) {
      rateLine.insertAdjacentHTML('beforeend', `
        <div class="kuv-age-icon" style="display:inline-block;margin-left:5px;">
          ${svg}
        </div>
      `);
      pgElement.remove();
    }
  }

  // Инициализация плагина
  function init() {
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
      .kuv-age-icon svg {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
    
    // Обрабатываем существующие карточки
    document.querySelectorAll('.card').forEach(processCard);
    
    // Наблюдатель за новыми карточками
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
    init();
  } else {
    window.addEventListener('load', init);
  }
})();