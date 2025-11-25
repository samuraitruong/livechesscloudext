// Live Chess Cloud Extension - Content Script
// This script runs on https://view.livechesscloud.com/

(function() {
  'use strict';

  console.log('Live Chess Cloud Extension loaded');

  // Storage for captured JSON responses
  const capturedData = new Map();
  let downloadButton = null;
  
  // Separate storage for different data types
  let tournamentData = null;
  const roundPairings = new Map(); // round-X/index.json -> pairing data
  const gameData = new Map(); // round-X/game-X.json -> game moves

  // Initialize extension features
  function init() {
    console.log('Live Chess Cloud Extension: Initializing...');
    
    // Wait for body to be available
    if (!document.body) {
      console.log('Live Chess Cloud Extension: Waiting for body...');
      const observer = new MutationObserver(() => {
        if (document.body) {
          observer.disconnect();
          init();
        }
      });
      observer.observe(document.documentElement, { childList: true });
      return;
    }
    
    // Inject script to intercept fetch and XMLHttpRequest (do this first)
    injectRequestInterceptor();
    
    // Add extension indicator (only once)
    if (!document.getElementById('lcc-extension-indicator')) {
      addExtensionIndicator();
    }
    
    // Add download button to app bar (only once)
    if (!document.querySelector('app-gv-button[type="lcc-download"]')) {
      addDownloadButtonToAppBar();
    }
    
    // Listen for messages from popup (set up once)
    if (!chrome.runtime.onMessage.hasListeners()) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Live Chess Cloud Extension: Received message', request);
        if (request.action === 'getPageInfo') {
          sendResponse({
            title: document.title,
            url: window.location.href,
            ready: true
          });
          return true;
        } else if (request.action === 'getCapturedData') {
          sendResponse({
            count: capturedData.size,
            data: Array.from(capturedData.entries())
          });
          return true;
        }
        return false;
      });
    }

    // Listen for messages from injected script
    window.addEventListener('message', (event) => {
      // Only accept messages from our injected script
      if (event.source !== window || !event.data || event.data.source !== 'lcc-request-interceptor') {
        return;
      }

      if (event.data.type === 'jsonResponse') {
        handleCapturedResponse(event.data.url, event.data.data);
      }
    });
    
    console.log('Live Chess Cloud Extension: Initialized successfully');
  }

  // Inject script into page context to intercept requests
  function injectRequestInterceptor() {
    // Check if already injected to avoid duplicate injection
    // We check via postMessage since we can't directly access page window from content script
    window.postMessage({ source: 'lcc-content-script', action: 'checkInjected' }, '*');
    
    // Use background script to inject into MAIN world (avoids CSP issues)
    chrome.runtime.sendMessage({ action: 'injectInterceptor' }, (response) => {
      if (response && response.success) {
        console.log('Live Chess Cloud: Request interceptor injection requested');
      } else {
        console.error('Live Chess Cloud: Failed to inject interceptor', response?.error);
        // Fallback: try direct script tag injection (may still have CSP issues)
        tryDirectInjection();
      }
    });
  }
  
  // Fallback method if background injection fails
  function tryDirectInjection() {
    const scriptUrl = chrome.runtime.getURL('request-interceptor.js');
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = function() {
      console.log('Live Chess Cloud: Request interceptor loaded via script tag');
      this.remove();
    };
    script.onerror = function() {
      console.error('Live Chess Cloud: Failed to load interceptor script');
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Handle captured JSON response
  function handleCapturedResponse(url, data) {
    console.log('Captured JSON response:', url, data);
    
    // Store in general map
    capturedData.set(url, {
      url: url,
      data: data,
      timestamp: new Date().toISOString()
    });
    
    // Categorize and store by type
    if (url.includes('/tournament.json')) {
      tournamentData = data;
      console.log('Live Chess Cloud: Tournament data captured', data);
    } else if (url.match(/\/round-\d+\/index\.json/)) {
      const roundMatch = url.match(/\/round-(\d+)\/index\.json/);
      const roundNum = roundMatch ? roundMatch[1] : 'unknown';
      roundPairings.set(roundNum, data);
      console.log('Live Chess Cloud: Round pairing data captured', roundNum, data);
    } else if (url.match(/\/round-\d+\/game-\d+\.json/)) {
      const gameMatch = url.match(/\/round-(\d+)\/game-(\d+)\.json/);
      if (gameMatch) {
        const roundNum = gameMatch[1];
        const gameNum = gameMatch[2];
        const key = `${roundNum}-${gameNum}`;
        gameData.set(key, data);
        console.log('Live Chess Cloud: Game data captured', key, data);
      }
    }

    // Update download button
    updateDownloadButton();
  }

  // Add download button to app bar
  function addDownloadButtonToAppBar() {
    // Find the app bar
    const appBar = document.querySelector('app-gv-bottom');
    if (!appBar) {
      // Wait for app bar to appear (SPA might load it dynamically)
      const observer = new MutationObserver((mutations, obs) => {
        const bar = document.querySelector('app-gv-bottom');
        if (bar) {
          obs.disconnect();
          insertDownloadButton(bar);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // Also try again after a delay
      setTimeout(() => {
        const bar = document.querySelector('app-gv-bottom');
        if (bar && !document.querySelector('app-gv-button[type="lcc-download"]')) {
          insertDownloadButton(bar);
        }
      }, 1000);
      return;
    }
    
    insertDownloadButton(appBar);
  }
  
  function insertDownloadButton(appBar) {
    // Create button matching the existing structure
    const button = document.createElement('app-gv-button');
    button.setAttribute('type', 'lcc-download');
    button.setAttribute('_ngcontent-lch-c5', '');
    button.setAttribute('_nghost-lch-c10', '');
    button.id = 'lcc-download-button';
    button.title = 'Download Game - Click: PGN, Double-click: Menu';
    button.style.position = 'relative';
    
    // Create SVG icon (download icon) - use inline SVG since we can't modify the sprite
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('_ngcontent-lch-c10', '');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.fill = 'currentColor';
    
    // Download icon path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z');
    svg.appendChild(path);
    
    button.appendChild(svg);
    
    // Badge removed - we only download one merged file now
    
    // Add click handler - single click downloads PGN, double click shows menu
    let clickCount = 0;
    let clickTimer;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          // Single click - download merged PGN
          if (gameData.size > 0) {
            handleDownload('pgn');
          } else {
            showNotification('No game data captured yet. Please navigate through games to capture data.');
          }
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        // Double click - show menu
        clearTimeout(clickTimer);
        showDownloadMenu(button);
        clickCount = 0;
      }
    });
    
    // Right click - show menu
    button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showDownloadMenu(button);
    });
    
    // Add to app bar (before the last button or at the end)
    const lastButton = appBar.querySelector('app-gv-button:last-of-type');
    if (lastButton) {
      appBar.insertBefore(button, lastButton.nextSibling);
    } else {
      appBar.appendChild(button);
    }
    
    downloadButton = button;
  }
  
  function showDownloadMenu(button) {
    // Remove existing menu if any
    const existingMenu = document.getElementById('lcc-download-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.id = 'lcc-download-menu';
    menu.className = 'lcc-download-menu';
    menu.innerHTML = `
      <div class="lcc-menu-item" data-format="pgn">📥 Download PGN</div>
      <div class="lcc-menu-item" data-format="json">📄 Download JSON</div>
    `;
    
    // Position menu near button
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.bottom = `${window.innerHeight - rect.top + 10}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.zIndex = '10000';
    
    document.body.appendChild(menu);
    
    // Handle menu clicks
    menu.querySelectorAll('.lcc-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const format = e.target.dataset.format;
        handleDownload(format);
        menu.remove();
      });
    });
    
    // Close menu when clicking outside
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== button) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 100);
  }

  // Update download button (no badge needed for single file download)
  function updateDownloadButton() {
    // Badge removed - we only download one merged file now
    // Button is always available when extension is active
  }

  // Convert single game JSON to PGN format
  function convertGameToPGN(gameData, roundNum, gameNum, pairing) {
    const moves = gameData.moves || [];
    const result = gameData.result || '*';
    const serialNr = gameData.serialNr || '';
    const chess960 = gameData.chess960 || 0;
    const firstMove = gameData.firstMove ? new Date(gameData.firstMove) : new Date();
    
    // Extract move notations (remove timing data)
    const moveNotations = moves.map(move => {
      // Move format: "d4 4925+534" - extract just the move notation
      const parts = move.trim().split(/\s+/);
      return parts[0];
    });
    
    // Get player names from pairing
    const whiteName = pairing?.white ? formatPlayerName(pairing.white) : 'White';
    const blackName = pairing?.black ? formatPlayerName(pairing.black) : 'Black';
    
    // Build PGN headers
    const headers = [];
    
    // Event name from tournament
    if (tournamentData && tournamentData.name) {
      headers.push(`[Event "${escapePGNString(tournamentData.name)}"]`);
    } else {
      headers.push(`[Event "Live Chess Cloud"]`);
    }
    
    headers.push(`[Site "view.livechesscloud.com"]`);
    headers.push(`[Date "${firstMove.toISOString().split('T')[0].replace(/-/g, '.')}"]`);
    headers.push(`[Round "${roundNum}"]`);
    headers.push(`[White "${escapePGNString(whiteName)}"]`);
    headers.push(`[Black "${escapePGNString(blackName)}"]`);
    headers.push(`[Result "${convertResult(result)}"]`);
    
    if (chess960 && chess960 !== 'STANDARD') {
      headers.push(`[Variant "Chess960"]`);
      if (typeof chess960 === 'number') {
        headers.push(`[SetUp "1"]`);
        headers.push(`[FEN "${getChess960StartPosition(chess960)}"]`);
      }
    }
    
    if (serialNr) {
      headers.push(`[GameID "${serialNr}"]`);
    }
    
    // Build move text
    let moveText = '';
    for (let i = 0; i < moveNotations.length; i++) {
      const moveNum = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;
      
      if (isWhite) {
        moveText += `${moveNum}. `;
      }
      moveText += `${moveNotations[i]} `;
    }
    
    // Add result
    moveText += convertResult(result);
    
    // Combine headers and moves
    return headers.join('\n') + '\n\n' + moveText.trim() + '\n';
  }
  
  // Format player name from pairing data
  function formatPlayerName(player) {
    if (!player) return 'Unknown';
    const parts = [];
    if (player.title) parts.push(player.title);
    if (player.fname) parts.push(player.fname);
    if (player.mname) parts.push(player.mname);
    if (player.lname) parts.push(player.lname);
    return parts.join(' ').trim() || 'Unknown';
  }
  
  // Escape PGN string (replace quotes with escaped quotes)
  function escapePGNString(str) {
    return String(str).replace(/"/g, '\\"');
  }
  
  // Get Chess960 starting position (simplified - would need full implementation)
  function getChess960StartPosition(startPos) {
    // This is a placeholder - full Chess960 FEN generation is complex
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  
  // Merge all captured data into a single PGN file
  function mergeAllToPGN() {
    if (gameData.size === 0) {
      return null;
    }
    
    let pgnContent = '';
    const processedGames = new Set();
    
    // First, process games that have pairing data (organized by rounds)
    const rounds = Array.from(roundPairings.keys()).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const roundNum of rounds) {
      const pairingData = roundPairings.get(roundNum);
      if (!pairingData || !pairingData.pairings) continue;
      
      // Process each pairing in the round
      pairingData.pairings.forEach((pairing, index) => {
        const gameNum = index + 1;
        const gameKey = `${roundNum}-${gameNum}`;
        const game = gameData.get(gameKey);
        
        if (game) {
          // Convert this game to PGN
          const gamePGN = convertGameToPGN(game, roundNum, gameNum, pairing);
          pgnContent += gamePGN + '\n';
          processedGames.add(gameKey);
        }
      });
    }
    
    // Then, process any remaining games that don't have pairing data
    gameData.forEach((game, key) => {
      if (!processedGames.has(key)) {
        const [roundNum, gameNum] = key.split('-');
        const pairingData = roundPairings.get(roundNum);
        const pairing = pairingData?.pairings?.[parseInt(gameNum) - 1];
        
        const gamePGN = convertGameToPGN(game, roundNum, gameNum, pairing);
        pgnContent += gamePGN + '\n';
      }
    });
    
    return pgnContent.trim();
  }
  
  // Convert result format
  function convertResult(result) {
    if (result === 'WHITEWIN' || result === '1-0') return '1-0';
    if (result === 'BLACKWIN' || result === '0-1') return '0-1';
    if (result === 'DRAW' || result === '1/2-1/2') return '1/2-1/2';
    return '*';
  }

  // Handle download button click
  function handleDownload(format = 'pgn') {
    if (format === 'pgn') {
      // Merge all data into single PGN
      const mergedPGN = mergeAllToPGN();
      
      if (!mergedPGN) {
        alert('No game data captured yet. Please wait for the page to load and navigate through the games.');
        return;
      }
      
      // Generate filename
      let filename = 'tournament';
      const gameCount = gameData.size;
      
      if (gameCount === 1) {
        // Single game: Use format [White Player] - [Black player] - [Result].pgn
        const gameKeys = Array.from(gameData.keys());
        const gameKey = gameKeys[0];
        const [roundNum, gameNum] = gameKey.split('-');
        const game = gameData.get(gameKey);
        
        if (game) {
          // Get pairing data for player names
          const pairingData = roundPairings.get(roundNum);
          const pairing = pairingData?.pairings?.[parseInt(gameNum) - 1];
          
          const whiteName = pairing?.white ? formatPlayerName(pairing.white) : 'White';
          const blackName = pairing?.black ? formatPlayerName(pairing.black) : 'Black';
          const result = convertResult(game.result);
          
          // Clean names for filename (remove special characters)
          const cleanWhite = whiteName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
          const cleanBlack = blackName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
          
          // Format: White_Player - Black_Player - Result
          filename = `${cleanWhite}_-_${cleanBlack}_-_${result}`;
        } else {
          // Fallback to tournament name if no game data
          if (tournamentData && tournamentData.name) {
            filename = tournamentData.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
          }
        }
      } else {
        // Multiple games: Use tournament name
        if (tournamentData && tournamentData.name) {
          filename = tournamentData.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        }
      }
      
      const blob = new Blob([mergedPGN], { type: 'application/x-chess-pgn' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${filename}.pgn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      showNotification(`Downloaded merged PGN with ${gameCount} game(s)`);
    } else {
      // Download all JSON files separately
      if (capturedData.size === 0) {
        alert('No game data captured yet. Please wait for the page to load.');
        return;
      }
      
      let downloadCount = 0;
      
      capturedData.forEach((item, url) => {
        // Generate filename from URL
        let filename = 'data';
        const urlMatch = url.match(/\/([^\/]+)\.json/);
        if (urlMatch) {
          filename = urlMatch[1];
        }
        
        const content = JSON.stringify(item.data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        
        setTimeout(() => {
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          downloadCount++;
          
          if (downloadCount === capturedData.size) {
            showNotification(`Downloaded ${downloadCount} JSON file(s)`);
          }
        }, downloadCount * 100);
      });
    }
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.id = 'lcc-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Add a visual indicator that the extension is active
  function addExtensionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'lcc-extension-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    indicator.textContent = '✓ Live Chess Cloud Extension Active';
    document.body.appendChild(indicator);

    // Hide after 3 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.5s';
      setTimeout(() => indicator.remove(), 500);
    }, 3000);
  }

  // Initialize immediately and also on DOM ready
  // This ensures the extension works even if the page is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded, initialize immediately
    setTimeout(init, 0);
  }

  // Re-initialize on hash changes (for SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Re-inject interceptor if needed (button should persist)
      injectRequestInterceptor();
    }
  }).observe(document, { subtree: true, childList: true });

  // Also listen to popstate for browser navigation
  window.addEventListener('popstate', () => {
    setTimeout(() => injectRequestInterceptor(), 100);
  });

  // Listen to hashchange for SPA navigation
  window.addEventListener('hashchange', () => {
    setTimeout(() => injectRequestInterceptor(), 100);
  });

  // Export functions for use in popup or other scripts
  window.liveChessCloudExtension = {
    getPageInfo: () => ({
      title: document.title,
      url: window.location.href
    }),
    getCapturedData: () => Array.from(capturedData.entries())
  };

  // Make sure message listener is always available
  // This is a fallback in case init() hasn't run yet
  if (!chrome.runtime.onMessage.hasListeners()) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getPageInfo') {
        sendResponse({
          title: document.title,
          url: window.location.href,
          ready: true
        });
        return true;
      } else if (request.action === 'getCapturedData') {
        sendResponse({
          count: capturedData.size,
          data: Array.from(capturedData.entries())
        });
        return true;
      }
      return false;
    });
  }

})();

