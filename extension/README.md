# 🧠 Think First - Chrome Extension

A Chrome extension that encourages critical thinking and problem-solving skills before using AI tools like ChatGPT.

## 🎯 Purpose

College students often become overdependent on AI, jumping straight to ChatGPT without thinking through problems themselves. **Think First** helps build critical thinking habits by:

1. **Blocking AI access for 5 minutes** when you navigate to ChatGPT
2. **Prompting reflection** with a guided scratchpad
3. **Tracking your streak** to encourage consistent critical thinking
4. **Auto-copying notes** to enhance your AI prompts

## ✨ Features

- **5-Minute Thinking Timer**: Forces you to pause and reflect before using AI
- **Guided Prompts**: Encourages you to write down what you know, what you've tried, and where you're stuck
- **Streak Tracking**: Gamifies the experience to build consistent habits
- **Smart Copy-Paste**: Automatically copies your notes to clipboard for easy pasting into ChatGPT
- **Beautiful UI**: Clean, professional interface that's pleasant to use
- **Zero Privacy Concerns**: All data stored locally, no external servers

## 🚀 Installation

### For Development/Testing

1. **Clone or download this repository**
   ```bash
   cd extension
   ```

2. **Open Chrome and navigate to Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `extension` folder
   - The extension should now appear in your extensions list

4. **Pin the extension** (optional but recommended)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Think First" and click the pin icon

## 📖 How to Use

1. **Navigate to ChatGPT** (chatgpt.com or chat.openai.com)

2. **See the blocking overlay** with a 5-minute timer

3. **Reflect on your problem**:
   - What you already know
   - What you've tried
   - What specific part you're stuck on

4. **Write in the scratchpad** - take your time to think

5. **Wait for timer to complete** (5 minutes)

6. **Click "Copy Notes & Continue"**:
   - Your notes are copied to clipboard
   - Overlay disappears
   - Paste into ChatGPT for a better, more specific prompt

7. **Check your streak** by clicking the extension icon

## 🎮 Streak System

- Every completed session adds to your streak
- View your stats in the popup (click extension icon)
- Tracks total completions and time spent thinking
- Motivational messages based on your progress

## 🛠️ Technical Details

### Files Structure
```
extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (navigation & state)
├── content.js         # Overlay injection & UI
├── styles.css         # Overlay styling
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── icons/            # Extension icons (add your own)
└── README.md         # This file
```

### Permissions
- `storage`: Save streak data locally
- `tabs`: Detect navigation to ChatGPT
- `scripting`: Inject content script
- Host permissions for ChatGPT domains

### Browser Support
- Chrome (Manifest V3)
- Edge (Chromium-based)
- Brave
- Other Chromium browsers

## 🎨 Customization

Want to modify the extension? Here are some easy tweaks:

### Change Timer Duration
In `background.js`, modify:
```javascript
const BLOCK_DURATION = 5 * 60 * 1000; // Change 5 to any number of minutes
```

### Add More AI Sites
In `background.js` and `manifest.json`, add to:
```javascript
const BLOCKED_URLS = ['chatgpt.com', 'chat.openai.com', 'claude.ai'];
```

### Customize Colors
In `styles.css`, change the gradient:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🐛 Troubleshooting

**Extension not blocking ChatGPT?**
- Make sure extension is enabled
- Try refreshing the ChatGPT page
- Check if you already completed a session

**Timer not starting?**
- Check browser console for errors
- Ensure you have the latest version
- Try reloading the extension

**Notes not copying?**
- Browser may be blocking clipboard access
- Manually select and copy the text
- Check console for permission errors

## 📝 Development Notes

Built during a 4-hour hackathon to address AI overdependence in education.

**Tech Stack**: Vanilla JavaScript, Chrome Extension Manifest V3, CSS3

**Philosophy**: Instead of blocking AI entirely, we make students engage with their own thinking first. The forced pause + guided reflection = better learning outcomes and more effective AI use.

## 🤝 Contributing

This is a hackathon project! Feel free to:
- Report bugs
- Suggest features
- Fork and improve
- Share with students who need it

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

Built with 🧠 by students, for students. Think first, AI second.
