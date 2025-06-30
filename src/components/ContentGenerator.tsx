// Twitter Auto Poster Content Script with Corrected Post Button Logic

class TwitterAutoPoster {
  constructor() {
    this.isRunning = false;
    this.currentPostCount = 0;
    this.totalPosts = 0;
    this.config = null;
    this.timeoutId = null;
  }

  // --- Core Control Flow ---

  async startAutoPosting(config) {
    if (this.isRunning) {
      return { success: false, message: 'Already running' };
    }
    this.isRunning = true;
    this.config = config;
    this.currentPostCount = 0;
    this.totalPosts = config.postCount;
    console.log('🚀 Starting Twitter Auto Poster with corrected click logic:', config);
    this.generateAndPost();
    return { success: true, message: 'Auto posting started successfully.' };
  }

  stopAutoPosting() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.sendStatusUpdate('Auto posting stopped by user.', 'info', true);
    return { success: true, message: 'Auto posting stopped.' };
  }

  // --- Main Loop with Improved Structure ---

  scheduleNextPost() {
    if (!this.isRunning || this.currentPostCount >= this.totalPosts) {
      if (this.isRunning) {
        this.isRunning = false;
        this.sendStatusUpdate(`Completed all ${this.currentPostCount} posts.`, 'success', true);
      }
      return;
    }
    const minInterval = this.config.intervalMin * 1000;
    const maxInterval = this.config.intervalMax * 1000;
    const randomInterval = this.getRandomDelay(minInterval, maxInterval);
    this.sendStatusUpdate(
      `Post ${this.currentPostCount + 1}/${this.totalPosts}. Next post in ${Math.floor(randomInterval / 1000)}s`,
      'info'
    );
    this.timeoutId = setTimeout(() => this.generateAndPost(), randomInterval);
  }

  async generateAndPost() {
    if (!this.isRunning) return;
    try {
      this.sendStatusUpdate(`Generating content for post ${this.currentPostCount + 1}...`, 'info');
      const content = await this.generateContentFromLLM();
      if (!content) throw new Error('LLM returned empty or invalid content.');

      this.sendStatusUpdate(`Posting: "${content.substring(0, 50)}..."`, 'info');
      const posted = await this.postToTwitter(content);

      if (posted) {
        this.currentPostCount++;
        this.sendStatusUpdate(`Successfully posted ${this.currentPostCount}/${this.totalPosts}`, 'success');
      } else {
        throw new Error('The posting function failed. See console for details.');
      }
    } catch (error) {
      console.error('❌ Error during generateAndPost cycle:', error);
      this.sendStatusUpdate(`Error: ${error.message}. Retrying...`, 'error');
    } finally {
      if (this.isRunning) {
        this.scheduleNextPost();
      }
    }
  }

  // --- LLM Content Generation (Correct) ---
  async generateContentFromLLM() {
    const systemPrompt = `...`; // Your system prompt
    const prompts = ['...']; // Your prompts
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    try {
      if (!this.config.apiKey) {
        throw new Error("Groq API key is missing.");
      }
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: randomPrompt }],
          max_tokens: 280,
          temperature: 0.8,
          top_p: 0.9
        })
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Request Failed (${response.status}): ${errorBody}`);
      }
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      if (!content) throw new Error('API response was successful, but content was empty.');
      return content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    }
  }

  // --- CORRECTED POSTING LOGIC with Wait for Enabled Button ---
  async postToTwitter(content) {
    try {
      console.log('🚀 Starting human-like posting process...');
      const tweetBox = await this.waitForElement('div[data-testid="tweetTextarea_0"]');
      if (!tweetBox) {
        throw new Error('Tweet box not found on page after waiting.');
      }

      await this.wait(this.getRandomDelay(500, 1000));
      await this.simulateHumanTyping(tweetBox, content);

      // =========================== THE CRITICAL FIX IS HERE ===========================
      console.log('⏳ Waiting for the "Post" button to become enabled...');
      let postButton = null;
      let attempts = 0;
      const maxAttempts = 14; // Wait for up to 7 seconds (14 * 500ms)

      while (attempts < maxAttempts) {
        postButton = this.findAndValidateTweetButton();
        if (postButton) {
          console.log('✅ Button is enabled! Proceeding to click.');
          break; // Exit the loop if an enabled button is found
        }
        attempts++;
        await this.wait(500); // Wait half a second before trying again
      }

      if (!postButton) {
        throw new Error('Post button did not become enabled in time.');
      }
      // =================================================================================

      await this.simulateHumanClick(postButton);
      console.log('✅ Posting process completed successfully.');
      await this.wait(this.getRandomDelay(4000, 5000)); // Wait for post to publish
      return true;

    } catch (error) {
      console.error('❌ Failed during postToTwitter:', error);
      throw error;
    }
  }

  /**
   * **IMPROVED**
   * Tries multiple selectors to find an enabled Post button.
   * @returns {Element|null} The enabled button element or null.
   */
  findAndValidateTweetButton() {
    const selectors = [
        'button[data-testid="tweetButtonInline"]', // Primary and most reliable
        'button[data-testid="tweetButton"]',
    ];

    for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
            const isDisabled = button.disabled || button.getAttribute('aria-disabled') === 'true';
            if (!isDisabled) {
                // Found an enabled button, return it immediately
                return button;
            }
        }
    }
    // If loop finishes, no enabled button was found with any selector
    return null;
  }

  // --- Helpers and Utilities (Unchanged and Correct) ---
  async simulateHumanTyping(element, text) {
    element.focus();
    element.click();
    for (const char of text) {
      document.execCommand('insertText', false, char);
      await this.wait(this.getRandomDelay(40, 110) + (char === ' ' ? 100 : 0));
    }
  }

  async simulateHumanClick(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
    await this.wait(this.getRandomDelay(200, 400));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await this.wait(this.getRandomDelay(80, 150));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    element.click();
    console.log('🚀 Button click dispatched.');
  }

  async waitForElement(selector, timeout = 7000) {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          resolve(element);
        }
      }, 500);
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        resolve(null);
      }, timeout);
    });
  }

  getRandomDelay(min, max) { return Math.random() * (max - min) + min; }
  wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  sendStatusUpdate(message, type, finished = false) {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'updateStatus', message, type, finished });
    }
  }
}

// --- INITIALIZATION AND MESSAGE LISTENING (Unchanged) ---
if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
    console.log('🐦 Twitter Auto Poster (Corrected Click Logic) content script loaded.');
    const autoPoster = new TwitterAutoPoster();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'startAutoPosting') {
            autoPoster.startAutoPosting(request.config).then(sendResponse);
            return true;
        } else if (request.action === 'stopAutoPosting') {
            sendResponse(autoPoster.stopAutoPosting());
        }
    });
}