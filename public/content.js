// Twitter Auto Poster Content Script with Improved Error Handling and Resilience

class TwitterAutoPoster {
  constructor() {
    this.isRunning = false;
    this.currentPostCount = 0;
    this.totalPosts = 0;
    this.config = null;
    this.timeoutId = null;
  }

  // --- Core Control Flow (Unchanged) ---
  async startAutoPosting(config) {
    if (this.isRunning) return { success: false, message: 'Already running' };
    this.isRunning = true;
    this.config = config;
    this.currentPostCount = 0;
    this.totalPosts = config.postCount;
    console.log('🚀 Starting Twitter Auto Poster with improved logic:', config);
    this.scheduleNextPost();
    return { success: true, message: 'Auto posting started.' };
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

  // --- REFINED: Main Loop with Better Error Separation ---
  async generateAndPost() {
    if (!this.isRunning) return;

    try {
      // --- STAGE 1: GET CONTENT FROM LLM ---
      this.sendStatusUpdate(`Generating content for post ${this.currentPostCount + 1}...`, 'info');
      const content = await this.generateContentFromLLM();
      if (!content) {
          throw new Error('LLM returned empty or invalid content.');
      }

      // --- STAGE 2: POST CONTENT TO TWITTER ---
      this.sendStatusUpdate(`Posting: "${content.substring(0, 50)}..."`, 'info');
      const posted = await this.postToTwitter(content);

      if (posted) {
        this.currentPostCount++;
        this.sendStatusUpdate(`Successfully posted ${this.currentPostCount}/${this.totalPosts}`, 'success');
      } else {
        // This case is for when postToTwitter returns false without an explicit error.
        throw new Error('Posting to Twitter failed for an unknown reason.');
      }
    } catch (error) {
      // This single catch block will now receive more specific error messages.
      console.error('❌ An error occurred in the generateAndPost cycle:', error);
      this.sendStatusUpdate(`Error: ${error.message}. Skipping post.`, 'error');
    } finally {
      // No matter what happens (success or failure), schedule the next post.
      if (this.isRunning) {
        this.scheduleNextPost();
      }
    }
  }

  scheduleNextPost() {
      if (!this.isRunning || this.currentPostCount >= this.totalPosts) {
          this.stopAutoPosting();
          this.sendStatusUpdate(`Completed all ${this.currentPostCount} posts.`, 'success', true);
          return;
      }
      const minInterval = this.config.intervalMin * 1000;
      const maxInterval = this.config.intervalMax * 1000;
      const randomInterval = this.getRandomDelay(minInterval, maxInterval);
      this.sendStatusUpdate(`Post ${this.currentPostCount + 1}/${this.totalPosts} - Next in ${Math.floor(randomInterval / 1000)}s`, 'info');
      this.timeoutId = setTimeout(() => this.generateAndPost(), randomInterval);
  }

  // --- REFINED: LLM Function with Better Error Details ---
  async generateContentFromLLM() {
    // 1. Check for API key *before* making the request.
    if (!this.config.apiKey) {
      throw new Error("Groq API key is missing. Please check your configuration.");
    }
    const systemPrompt = `...`; // Your extensive system prompt is good, keep it here.
    const prompts = ['...']; // Your list of prompts.
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ /* ... your request body ... */ })
      });

      // 2. Give a detailed error if the request fails.
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Request Failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      if (!content) throw new Error('API returned a valid response, but content was empty.');
      
      return content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    } catch (error) {
      console.error('Content generation API call failed:', error);
      // Re-throw the error to be caught by the main generateAndPost loop
      throw error;
    }
  }

  // --- REFINED: Posting Logic with Increased Resilience ---
  async postToTwitter(content) {
    try {
      // 1. Wait for the tweet box to exist before doing anything else.
      const tweetBox = await this.waitForElement('div[data-testid="tweetTextarea_0"]');
      if (!tweetBox) throw new Error('Could not find the tweet input box after waiting.');

      await this.wait(this.getRandomDelay(500, 1000));
      await this.simulateHumanTyping(tweetBox, content);

      await this.wait(this.getRandomDelay(1500, 2500)); // "Proofread" time

      const postButton = this.findAndValidateTweetButton();
      if (!postButton) throw new Error('Could not find an enabled "Post" button.');

      await this.simulateHumanClick(postButton);
      await this.wait(this.getRandomDelay(3000, 5000));
      return true;

    } catch (error) {
      console.error('❌ Failed during Twitter interaction:', error);
      // Re-throw to be caught by the main loop, so it can be reported.
      throw new Error(`Twitter Posting Error: ${error.message}`);
    }
  }

  // --- Human-Like Helpers (Unchanged from before) ---
  findAndValidateTweetButton() { /* ... unchanged ... */ }
  simulateHumanTyping(element, text) { /* ... unchanged ... */ }
  simulateHumanClick(element) { /* ... unchanged ... */ }
  
  // --- NEW: Resilient Utility Function ---
  async waitForElement(selector, timeout = 5000) {
    console.log(`⏳ Waiting for element: ${selector}`);
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          clearTimeout(failSafeTimeout);
          console.log(`✅ Found element: ${selector}`);
          resolve(element);
        }
      }, 500);

      const failSafeTimeout = setTimeout(() => {
        clearInterval(interval);
        console.error(`⚠️ Timed out waiting for element: ${selector}`);
        resolve(null); // Resolve with null to indicate failure
      }, timeout);
    });
  }
  
  // Other utilities (wait, getRandomDelay, sendStatusUpdate) are unchanged
  getRandomDelay(min, max) { return Math.random() * (max - min) + min; }
  wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  sendStatusUpdate(message, type, finished = false) { /* ... unchanged ... */ }
}

// --- INITIALIZATION AND MESSAGE LISTENING (Unchanged) ---
if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
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