# Twitter Auto Poster Chrome Extension

**⚠️ EDUCATIONAL PURPOSE ONLY ⚠️**


This Chrome extension is created to demonstrate automated web interactions using Chrome extension APIs and content scripts. Please use responsibly and in compliance with Twitter's Terms of Service.

## Features

- 🤖 Automated Twitter posting with AI-generated content
- 🧠 Groq API integration for authentic founder-style content
- 🖱️ Human-like cursor movements and typing simulation
- ⏱️ Configurable posting intervals (30-120 seconds)
- 🎯 Customizable number of posts
- 🔒 Secure API key storage
- 📊 Real-time status updates

## Installation

1. **Download the Extension**
   - Clone or download this repository
   - Extract to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Get Groq API Key**
   - Visit [console.groq.com](https://console.groq.com)
   - Sign up/login and create an API key
   - Copy the API key for use in the extension

## Usage

1. **Navigate to Twitter**
   - Go to [twitter.com](https://twitter.com) or [x.com](https://x.com)
   - Make sure you're logged in

2. **Configure Extension**
   - Click the extension icon in Chrome toolbar
   - Enter your Groq API key
   - Set number of posts (1-10)
   - Configure posting interval (30-120 seconds)

3. **Start Auto Posting**
   - Click "Start Auto Posting"
   - The extension will automatically generate and post content
   - Monitor progress in the popup

4. **Stop Anytime**
   - Click "Stop Posting" to halt the process
   - Extension will finish current post and stop

## Content Strategy

The extension generates authentic founder-focused content inspired by successful Twitter accounts:

### Content Characteristics:
- ✅ Authentic and conversational tone
- ✅ Actionable startup insights
- ✅ Personal journey sharing
- ✅ Community-focused questions
- ❌ No emojis (strictly forbidden)
- ❌ No corporate speak
- ❌ No bragging about success

## Technical Implementation

### Architecture
- **Manifest V3** Chrome extension
- **Content Script** for Twitter DOM manipulation
- **Background Script** for message handling
- **Popup Interface** for user controls
- **Groq API** for content generation

### Human-like Behavior
- Random typing delays (30-150ms per character)
- Cursor movement simulation
- Variable posting intervals
- Natural pauses and hesitations
- Realistic click positioning

### Security Features
- API keys stored in Chrome's secure storage
- No data sent to third-party servers
- Local content generation only
- Automatic cleanup on extension disable

## File Structure

```
twitter-auto-poster/
├── manifest.json          # Extension configuration
├── popup.html             # User interface
├── popup.js              # Popup logic
├── content.js            # Twitter interaction script
├── background.js         # Background service worker
└── README.md            # Documentation
```

## API Usage

The extension uses the Groq API with the following configuration:

```javascript
{
  model: 'llama-3.3-70b-versatile',
  max_tokens: 280,
  temperature: 0.8,
  top_p: 0.9
}
```

## Safety & Compliance

### Rate Limiting
- Configurable intervals (30-120 seconds minimum)
- Maximum 10 posts per session
- Human-like timing variations

### Error Handling
- API failure recovery
- DOM element detection
- Network error management
- Graceful degradation

### Privacy
- No data collection
- Local storage only
- No external tracking
- Secure API key handling

## Troubleshooting

### Common Issues

**Extension not working:**
- Refresh the Twitter page
- Check if logged into Twitter
- Verify API key is correct

**Posts not appearing:**
- Check Twitter's posting limits
- Verify account isn't restricted
- Ensure content meets Twitter guidelines

**API errors:**
- Verify Groq API key is valid
- Check API quota/limits
- Ensure stable internet connection

### Debug Mode
- Open Chrome DevTools (F12)
- Check Console for error messages
- Monitor Network tab for API calls

## Legal & Ethical Considerations

### Important Disclaimers
- **Educational Purpose Only**: This extension is for learning web automation
- **Terms of Service**: Ensure compliance with Twitter's ToS
- **Rate Limiting**: Respect platform limits and guidelines
- **Content Quality**: Generate valuable, authentic content only
- **Account Safety**: Use at your own risk

### Best Practices
- Start with low posting frequency
- Monitor engagement and adjust strategy
- Focus on providing genuine value
- Respect community guidelines
- Consider manual review of generated content

## Development

### Local Development
```bash
# Make changes to files
# Reload extension in chrome://extensions/
# Test on Twitter/X
```

### Contributing
- Fork the repository
- Make improvements
- Test thoroughly
- Submit pull request

## License

This project is for educational purposes. Use responsibly and in compliance with all applicable terms of service and regulations.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Chrome extension documentation
3. Verify Groq API documentation
4. Test with minimal configuration first

---

**Remember: This tool is for educational purposes only. Always use automation responsibly and in compliance with platform terms of service.**
