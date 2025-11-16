// Popup script for Think First extension
// Displays streak and statistics

// Motivational messages based on streak
const motivationalMessages = [
  { min: 0, max: 0, message: "Start your first session on ChatGPT!" },
  { min: 1, max: 2, message: "Great start! Keep the momentum going! 🚀" },
  { min: 3, max: 5, message: "You're building a habit! 🌱" },
  { min: 6, max: 10, message: "Amazing progress! Your critical thinking is growing! 🌟" },
  { min: 11, max: 20, message: "You're on fire! Keep up the great work! 🔥" },
  { min: 21, max: 50, message: "Incredible dedication! You're a critical thinking master! 🏆" },
  { min: 51, max: Infinity, message: "Legendary! You're an inspiration! 👑" }
];

// Get motivation message based on streak
function getMotivationMessage(streak) {
  for (const msg of motivationalMessages) {
    if (streak >= msg.min && streak <= msg.max) {
      return msg.message;
    }
  }
  return motivationalMessages[0].message;
}

// Format time in minutes
function formatTime(totalCompleted) {
  const minutes = totalCompleted * 5; // Each session is 5 minutes
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMin = minutes % 60;
    return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
  }
}

// Load and display statistics
async function loadStats() {
  try {
    const data = await chrome.storage.local.get(['streak', 'totalCompleted', 'lastCompleted']);

    const streak = data.streak || 0;
    const totalCompleted = data.totalCompleted || 0;

    // Update streak display
    const streakElement = document.getElementById('streak-number');
    if (streakElement) {
      streakElement.textContent = streak;

      // Add animation
      if (streak > 0) {
        streakElement.style.animation = 'pulse 0.5s ease';
      }
    }

    // Update total completed
    const totalElement = document.getElementById('total-completed');
    if (totalElement) {
      totalElement.textContent = totalCompleted;
    }

    // Update total time
    const timeElement = document.getElementById('total-time');
    if (timeElement) {
      timeElement.textContent = formatTime(totalCompleted);
    }

    // Update motivation message
    const motivationElement = document.getElementById('motivation-text');
    if (motivationElement) {
      motivationElement.textContent = getMotivationMessage(streak);
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
});

// Listen for storage changes (real-time updates)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    loadStats();
  }
});
