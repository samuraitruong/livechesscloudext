// Live Chess Cloud Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const pageTitleEl = document.getElementById('pageTitle');
  const pageUrlEl = document.getElementById('pageUrl');
  const refreshBtn = document.getElementById('refreshBtn');
  const dataCountEl = document.getElementById('dataCount');
  const dataListEl = document.getElementById('dataList');

  // Get current active tab
  async function updatePageInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('view.livechesscloud.com')) {
        // Try to inject content script if not already loaded
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }).catch(() => {
          // Script might already be injected, that's okay
        });
        
        // Wait a bit for script to initialize, then send message
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' }, (response) => {
            if (chrome.runtime.lastError) {
              statusEl.innerHTML = '<div class="status-indicator error"></div><span>Extension not active. Try refreshing the page.</span>';
              pageTitleEl.textContent = tab.title || '-';
              pageUrlEl.textContent = tab.url || '-';
              return;
            }

            if (response && response.ready) {
              statusEl.innerHTML = '<div class="status-indicator active"></div><span>Extension Active</span>';
              pageTitleEl.textContent = response.title || tab.title || '-';
              pageUrlEl.textContent = response.url || tab.url || '-';
            } else {
              statusEl.innerHTML = '<div class="status-indicator error"></div><span>Waiting for page...</span>';
            }
          });
        }, 200);

        // Get captured data
        chrome.tabs.sendMessage(tab.id, { action: 'getCapturedData' }, (response) => {
          if (!chrome.runtime.lastError && response) {
            updateCapturedDataDisplay(response.count, response.data);
          } else {
            updateCapturedDataDisplay(0, []);
          }
        });
      } else {
        statusEl.innerHTML = '<div class="status-indicator inactive"></div><span>Not on Live Chess Cloud</span>';
        pageTitleEl.textContent = tab.title || '-';
        pageUrlEl.textContent = tab.url || '-';
        updateCapturedDataDisplay(0, []);
      }
    } catch (error) {
      console.error('Error updating page info:', error);
      statusEl.innerHTML = '<div class="status-indicator error"></div><span>Error loading info</span>';
    }
  }

  // Update captured data display
  function updateCapturedDataDisplay(count, data) {
    dataCountEl.textContent = `${count} file${count !== 1 ? 's' : ''} captured`;
    
    if (count === 0) {
      dataListEl.innerHTML = '<div class="data-empty">No JSON files captured yet. Wait for page to load.</div>';
    } else {
      dataListEl.innerHTML = data.map(([url, item]) => {
        const gameId = item.gameId || 'unknown';
        const timestamp = new Date(item.timestamp).toLocaleTimeString();
        return `
          <div class="data-item">
            <div class="data-item-name">${gameId}</div>
            <div class="data-item-time">${timestamp}</div>
          </div>
        `;
      }).join('');
    }
  }

  // Refresh button handler
  refreshBtn.addEventListener('click', updatePageInfo);

  // Initial load
  updatePageInfo();
});

