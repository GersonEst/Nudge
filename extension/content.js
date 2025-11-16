// Content script for Think First extension
// Handles overlay injection and user interaction

let countdownInterval = null;
let blockEndTime = null;

// Check if we should show block on page load
chrome.runtime.sendMessage({ type: 'CHECK_BLOCK_STATUS' }, (response) => {
  if (response && response.shouldBlock) {
    showBlockOverlay(response.endTime);
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_BLOCK') {
    showBlockOverlay(message.endTime);
    sendResponse({ received: true });
  }
  return true;
});

// Show the blocking overlay
function showBlockOverlay(endTime) {
  // Don't show if already showing
  if (document.getElementById('think-first-overlay')) {
    return;
  }

  blockEndTime = endTime;

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'think-first-overlay';
  overlay.innerHTML = `
    <div class="think-first-container">
      <h1 class="think-first-title">🧠 Think First</h1>
      <p class="think-first-subtitle">Take a moment to think before using AI</p>

      <div class="think-first-timer" id="think-first-timer">0:10</div>

      <div class="think-first-prompt">
        <label class="think-first-prompt-label">Before asking ChatGPT, write down:</label>
        <ul class="think-first-prompt-list">
          <li>What you already know about this problem</li>
          <li>What you've already tried</li>
          <li>What specific part you're stuck on</li>
        </ul>
      </div>

      <textarea
        id="think-first-notes"
        class="think-first-notes"
        placeholder="Your thoughts here... Take your time to reflect on the problem."
        rows="6"
      ></textarea>

      <button id="think-first-continue-btn" class="think-first-btn" disabled>
        <span id="think-first-btn-text">Continue (0:10)</span>
      </button>

      <div class="think-first-footer">
        Building critical thinking skills 💪
      </div>
    </div>
  `;

  // Append to body
  document.body.appendChild(overlay);

  // Start countdown
  startCountdown(endTime);

  // Focus on textarea
  setTimeout(() => {
    const textarea = document.getElementById('think-first-notes');
    if (textarea) textarea.focus();
  }, 100);
}

// Start the countdown timer
function startCountdown(endTime) {
  const timerElement = document.getElementById('think-first-timer');
  const buttonElement = document.getElementById('think-first-continue-btn');
  const buttonTextElement = document.getElementById('think-first-btn-text');

  // Clear existing interval if any
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Update immediately
  updateTimer();

  // Update every second
  countdownInterval = setInterval(updateTimer, 1000);

  function updateTimer() {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      // Timer finished
      clearInterval(countdownInterval);
      enableContinue();
    } else {
      // Calculate minutes and seconds
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (timerElement) {
        timerElement.textContent = display;
      }
      if (buttonTextElement) {
        buttonTextElement.textContent = `Continue (${display})`;
      }
    }
  }
}

// Enable the continue button when timer ends
function enableContinue() {
  const button = document.getElementById('think-first-continue-btn');
  const buttonText = document.getElementById('think-first-btn-text');
  const timer = document.getElementById('think-first-timer');

  if (!button) return;

  // Update UI
  button.disabled = false;
  button.classList.add('think-first-btn-enabled');
  if (buttonText) {
    buttonText.textContent = '📋 Copy Notes & Continue';
  }
  if (timer) {
    timer.textContent = 'Ready!';
    timer.classList.add('think-first-timer-complete');
  }

  // Add click handler
  button.onclick = handleContinue;
}

// Handle continue button click
async function handleContinue() {
  const notesElement = document.getElementById('think-first-notes');
  const notes = notesElement ? notesElement.value.trim() : '';

  try {
    // Copy to clipboard
    if (notes) {
      await navigator.clipboard.writeText(notes);
      showToast('✅ Notes copied to clipboard! Paste into ChatGPT');
    } else {
      showToast('✅ Timer complete! You can now use ChatGPT');
    }

    // Notify background script of completion
    chrome.runtime.sendMessage({
      type: 'BLOCK_COMPLETE',
      notes: notes
    });

    // Remove overlay after short delay
    setTimeout(() => {
      removeOverlay();
    }, 500);

  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Still allow continue even if clipboard fails
    showToast('⚠️ Could not copy notes. Press Ctrl+C to copy manually');

    // Select the text for manual copying
    if (notesElement) {
      notesElement.select();
    }

    // Still notify completion
    chrome.runtime.sendMessage({
      type: 'BLOCK_COMPLETE',
      notes: notes
    });

    setTimeout(() => {
      removeOverlay();
    }, 2000);
  }
}

// Remove the overlay
function removeOverlay() {
  const overlay = document.getElementById('think-first-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }

  // Clear interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// Show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.think-first-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'think-first-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Prevent overlay removal attempts
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.removedNodes.forEach((node) => {
      if (node.id === 'think-first-overlay' && blockEndTime && Date.now() < blockEndTime) {
        // User tried to remove overlay before timer ended - re-add it
        if (!document.getElementById('think-first-overlay')) {
          showBlockOverlay(blockEndTime);
        }
      }
    });
  });
});

// Start observing
observer.observe(document.body, { childList: true, subtree: false });

console.log('Think First content script loaded');
