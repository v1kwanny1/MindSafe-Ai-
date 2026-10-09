/**
 * MindSafe AI — 1-Click Embeddable Widget for www.mindsafe.uk
 * Creator: Victor Kwantreng | Safe Minds, Better Lives
 * Version: 3.0.0
 */
(function () {
  if (window.MindSafeWidgetLoaded) return;
  window.MindSafeWidgetLoaded = true;

  // Determine App URL from current script or fallback to production URL
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('mindsafe-widget') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  var defaultAppUrl = "https://ais-pre-lapzhenjkvrstvwq3q2i3x-625626324794.europe-west2.run.app";
  var appUrl = (currentScript && currentScript.getAttribute('data-app-url')) || 
               (currentScript && currentScript.src ? currentScript.src.replace(/\/mindsafe-widget\.js.*$/, '') : defaultAppUrl);
  
  if (!appUrl || appUrl.indexOf('http') !== 0) {
    appUrl = defaultAppUrl;
  }

  var position = (currentScript && currentScript.getAttribute('data-position')) || 'bottom-right';

  // Inject Styles
  var style = document.createElement('style');
  style.id = 'mindsafe-widget-styles';
  style.innerHTML = `
    #mindsafe-widget-launcher {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
      color: #f8fafc;
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      border-radius: 9999px;
      padding: 8px 18px 8px 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.2);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    #mindsafe-widget-launcher:hover {
      transform: translateY(-2px) scale(1.03);
      border-color: rgba(251, 191, 36, 0.8);
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(251, 191, 36, 0.35);
    }
    #mindsafe-widget-launcher:active {
      transform: translateY(0) scale(0.98);
    }
    .mindsafe-widget-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
      flex-shrink: 0;
    }
    .mindsafe-widget-label {
      display: flex;
      flex-direction: column;
      text-align: left;
      line-height: 1.2;
    }
    .mindsafe-widget-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #ffffff;
    }
    .mindsafe-widget-sub {
      font-size: 10px;
      color: #fbbf24;
      font-weight: 600;
    }
    .mindsafe-widget-badge {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      margin-left: 2px;
      animation: mindsafePulse 2s infinite;
    }
    @keyframes mindsafePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    #mindsafe-widget-modal {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 80px;
      width: 440px;
      max-width: calc(100vw - 40px);
      height: 680px;
      max-height: calc(100vh - 100px);
      background: #020617;
      border: 1.5px solid rgba(251, 191, 36, 0.35);
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(251, 191, 36, 0.15);
      z-index: 999995;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: mindsafeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #mindsafe-widget-modal.mindsafe-open {
      display: flex;
    }
    #mindsafe-widget-modal.mindsafe-fullscreen {
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      width: auto;
      max-width: none;
      height: auto;
      max-height: none;
      border-radius: 24px;
    }
    @keyframes mindsafeSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .mindsafe-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #090d16;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .mindsafe-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mindsafe-header-title {
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mindsafe-header-tag {
      font-size: 9px;
      padding: 2px 6px;
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 700;
    }
    .mindsafe-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mindsafe-btn-icon {
      background: transparent;
      border: none;
      color: #94a3b8;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .mindsafe-btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .mindsafe-widget-body {
      flex: 1;
      width: 100%;
      height: 100%;
      position: relative;
      background: #020617;
    }
    .mindsafe-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 640px) {
      #mindsafe-widget-launcher {
        bottom: 15px;
        right: 15px;
        padding: 6px 14px 6px 8px;
      }
      #mindsafe-widget-modal {
        left: 10px;
        right: 10px;
        bottom: 75px;
        width: auto;
        max-width: none;
        height: calc(100vh - 90px);
        border-radius: 18px;
      }
    }
  `;
  document.head.appendChild(style);

  // Inject Launcher
  var launcher = document.createElement('div');
  launcher.id = 'mindsafe-widget-launcher';
  launcher.title = 'Open MindSafe AI Companion (www.mindsafe.uk)';
  launcher.innerHTML = `
    <div class="mindsafe-widget-icon">🧠</div>
    <div class="mindsafe-widget-label">
      <span class="mindsafe-widget-title">MindSafe AI</span>
      <span class="mindsafe-widget-sub">Safe Minds, Better Lives</span>
    </div>
    <div class="mindsafe-widget-badge"></div>
  `;
  document.body.appendChild(launcher);

  // Inject Modal
  var modal = document.createElement('div');
  modal.id = 'mindsafe-widget-modal';
  modal.innerHTML = `
    <div class="mindsafe-widget-header">
      <div class="mindsafe-header-left">
        <span style="font-size: 18px;">🐸</span>
        <div class="mindsafe-header-title">
          <span>MindSafe AI</span>
          <span class="mindsafe-header-tag">www.mindsafe.uk</span>
        </div>
      </div>
      <div class="mindsafe-header-actions">
        <button type="button" class="mindsafe-btn-icon" id="mindsafe-btn-expand" title="Toggle Fullscreen">⛶</button>
        <button type="button" class="mindsafe-btn-icon" id="mindsafe-btn-newtab" title="Open Fullscreen in New Tab">↗</button>
        <button type="button" class="mindsafe-btn-icon" id="mindsafe-btn-close" title="Close">✕</button>
      </div>
    </div>
    <div class="mindsafe-widget-body">
      <iframe 
        id="mindsafe-widget-frame"
        class="mindsafe-widget-iframe" 
        src=""
        allow="microphone; camera; clipboard-write; autoplay"
        title="MindSafe AI Companion">
      </iframe>
    </div>
  `;
  document.body.appendChild(modal);

  var frame = document.getElementById('mindsafe-widget-frame');
  var isFrameLoaded = false;
  var isOpen = false;
  var isFullscreen = false;

  function loadFrameOnce() {
    if (!isFrameLoaded) {
      frame.src = appUrl + "?embed=true&host=www.mindsafe.uk";
      isFrameLoaded = true;
    }
  }

  function openWidget() {
    loadFrameOnce();
    modal.classList.add('mindsafe-open');
    isOpen = true;
    launcher.style.display = 'none';
  }

  function closeWidget() {
    modal.classList.remove('mindsafe-open');
    isOpen = false;
    launcher.style.display = 'flex';
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  launcher.addEventListener('click', toggleWidget);
  document.getElementById('mindsafe-btn-close').addEventListener('click', closeWidget);
  
  document.getElementById('mindsafe-btn-expand').addEventListener('click', function () {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      modal.classList.add('mindsafe-fullscreen');
    } else {
      modal.classList.remove('mindsafe-fullscreen');
    }
  });

  document.getElementById('mindsafe-btn-newtab').addEventListener('click', function () {
    window.open(appUrl + "?host=www.mindsafe.uk", "_blank");
  });

  // Expose API on window for custom site buttons on www.mindsafe.uk
  window.MindSafeWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    isOpen: function () { return isOpen; }
  };
})();
