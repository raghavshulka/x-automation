// Twitter Auto Poster Content Script - Enhanced Version
// Features: Real cursor movement between posts, improved state management, 30 posts limit, intelligent pausing

class TwitterAutoPoster {
  constructor() {
    // Enhanced state management
    this.state = {
      isRunning: false,
      currentPostCount: 0,
      totalPosts: 0,
      sessionStartTime: null,
      lastPostTime: null,
      errors: [],
      postHistory: []
    };
    
    this.config = null;
    this.timeoutId = null;
  }

  // --- State Management Methods ---
  
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.persistState();
  }
  
  persistState() {
    if (chrome && chrome.storage) {
      chrome.storage.local.set({ autoPosterState: this.state });
    }
  }
  
  async loadState() {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('autoPosterState');
      if (result.autoPosterState) {
        this.state = { ...this.state, ...result.autoPosterState };
      }
    }
  }
  
  // --- Real Cursor Movement Between Posts ---
  
  async moveRealCursorBetweenPosts() {
    console.log("🖱️ Moving real cursor between posts...");
    
    try {
      // Send message to background script
      if (chrome && chrome.runtime) {
        console.log("📤 Sending cursor movement message to background script...");
        
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: "moveCursor"
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
        
        console.log("📥 Background script response:", response);
        
        if (response && response.success) {
          console.log("✅ Background script confirmed cursor movement request");
        } else {
          console.warn("⚠️ Background script did not confirm success");
        }
      }
      
      // Wait for cursor movement to complete
      await this.wait(3000);
      
      console.log("✅ Cursor movement sequence completed");
    } catch (error) {
      console.error("❌ Error moving cursor:", error);
    }
  }
  
  // --- Core Control Flow ---

  async startAutoPosting(config) {
    if (this.state.isRunning) {
      return { success: false, message: "Already running" };
    }
    
    await this.loadState();
    
    this.config = config;
    this.setState({
      isRunning: true,
      currentPostCount: 0,
      totalPosts: config.postCount,
      sessionStartTime: Date.now(),
      errors: []
    });
    
    console.log("🚀 Starting Enhanced Twitter Auto Poster:", config);
    
    // Start posting
    this.generateAndPost();
    
    return { success: true, message: "Auto posting started successfully." };
  }

  stopAutoPosting() {
    this.setState({ isRunning: false });
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this.sendStatusUpdate("Auto posting stopped by user.", "info", true);
    return { success: true, message: "Auto posting stopped." };
  }

  // --- Intelligent Scheduling with Break Logic ---

  scheduleNextPost() {
    if (!this.state.isRunning || this.state.currentPostCount >= this.state.totalPosts) {
      if (this.state.isRunning) {
        this.setState({ isRunning: false });
        this.sendStatusUpdate(
          `Completed all ${this.state.currentPostCount} posts in ${this.getSessionDuration()}.`,
          "success",
          true
        );
      }
      return;
    }
    
    let nextDelay;
    
    // Check if we need a longer break after 10 posts
    if (this.state.currentPostCount > 0 && this.state.currentPostCount % 10 === 0) {
      // Take a 1-2 minute break after every 10 posts
      const breakDuration = this.getRandomDelay(60000, 120000); // 1-2 minutes
      nextDelay = breakDuration;
      this.sendStatusUpdate(
        `Taking a break after ${this.state.currentPostCount} posts. Resuming in ${Math.floor(breakDuration / 1000)}s...`,
        "info"
      );
    } else {
      // Normal interval between posts
      const minInterval = this.config.intervalMin * 1000;
      const maxInterval = this.config.intervalMax * 1000;
      nextDelay = this.getRandomDelay(minInterval, maxInterval);
      this.sendStatusUpdate(
        `Post ${this.state.currentPostCount + 1}/${this.state.totalPosts}. Next post in ${Math.floor(nextDelay / 1000)}s`,
        "info"
      );
    }
    
    this.timeoutId = setTimeout(() => this.generateAndPost(), nextDelay);
  }

  async generateAndPost() {
    if (!this.state.isRunning) return;
    
    try {
      this.sendStatusUpdate(
        `Generating content for post ${this.state.currentPostCount + 1}...`,
        "info"
      );
      
      const content = await this.generateContentFromLLM();
      if (!content) throw new Error("LLM returned empty or invalid content.");

      this.sendStatusUpdate(
        `Posting: "${content.substring(0, 50)}..."`,
        "info"
      );
      
      const posted = await this.postToTwitter(content);

      if (posted) {
        const newCount = this.state.currentPostCount + 1;
        this.setState({
          currentPostCount: newCount,
          lastPostTime: Date.now(),
          postHistory: [...this.state.postHistory, {
            content,
            timestamp: Date.now(),
            index: newCount
          }]
        });
        
        this.sendStatusUpdate(
          `Successfully posted ${newCount}/${this.state.totalPosts}`,
          "success"
        );
        
        // Move real cursor between posts
        if (this.state.isRunning && newCount < this.state.totalPosts) {
          await this.moveRealCursorBetweenPosts();
        }
      } else {
        throw new Error("The posting function failed. See console for details.");
      }
    } catch (error) {
      console.error("❌ Error during generateAndPost cycle:", error);
      this.setState({
        errors: [...this.state.errors, {
          message: error.message,
          timestamp: Date.now()
        }]
      });
      this.sendStatusUpdate(`Error: ${error.message}. Continuing...`, "error");
    } finally {
      if (this.state.isRunning) {
        this.scheduleNextPost();
      }
    }
  }

  // --- LLM Content Generation (Enhanced with variety) ---
  async generateContentFromLLM() {
    const systemPrompt = `CRITICAL: Study and take inspiration from these successful Twitter accounts (DO NOT copy, but learn their style):
- @MVP_Builder - Notice their practical, actionable advice and authentic founder stories
- @Anubhavhing - Observe their engaging questions and community-building approach
- @askwhykartik - Learn from their direct, no-nonsense insights and personal experiences

PERSONALITY TRAITS:
- Authentic and genuine (never sound robotic or AI-generated)
- Friendly and approachable
- Hungry to learn and grow
- Solution-oriented and practical
- Encouraging and supportive of other entrepreneurs
- Honest about your journey (you're building, not bragging about massive success)

COMMUNICATION STYLE:
- Write like a real human having a conversation
- Use natural language with contractions (I'm, you're, we've)
- Share personal insights from your journey
- Ask thoughtful questions to engage
- NO EMOJIS (strictly forbidden)
- Keep responses conversational, not corporate
- Be humble about your experience - you're learning too
- Vary your writing style to avoid patterns

EXPERTISE AREAS:
- MVP development and validation
- Startup strategy and execution
- Product-market fit discovery
- No-code/low-code solutions
- Rapid prototyping
- User feedback and iteration
- Early-stage product challenges
- Founder mindset and struggles

RESPONSE GUIDELINES:
- Always add genuine value to the conversation
- Share actionable insights or tips when relevant
- Relate to challenges (you face them too)
- Offer help or perspective when appropriate (not pushy sales)
- STRICT LIMIT: Keep responses under 250 characters (this is mandatory)
- Sound genuinely interested in helping and learning
- Avoid generic praise - be specific and meaningful
- Share your learning journey, not just successes
- NEVER mention having many clients or being established
- Focus on being helpful and building genuine connections
- ABSOLUTELY NO EMOJIS
- Make each tweet unique - avoid repetitive patterns
- IMPORTANT: Create complete thoughts - no partial sentences or unfinished ideas

Remember: You're building your agency, learning from every project, and genuinely want to help other founders. You're not trying to impress with big numbers or established success - you're sharing the real journey.`;
    
    // Enhanced prompts with more variety
    const prompts = [
      "Share a practical insight about MVP development or startup building based on recent learning experiences",
      "Share an actionable tip for early-stage startup founders",
      "Share a brief personal insight about building an MVP agency",
      "Ask an engaging question to help fellow founders",
      "Share a lesson learned from a recent project or challenge",
      "Discuss a common mistake you've seen in MVP development",
      "Share a quick win strategy for startup validation",
      "Talk about a tool or resource that's been helpful in your journey",
      "Reflect on a recent conversation with a founder that taught you something",
      "Share a perspective on balancing speed vs quality in MVP development"
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    try {
      if (!this.config.apiKey) {
        throw new Error("Groq API key is missing.");
      }
      
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: randomPrompt },
            ],
            max_tokens: 250, // Increased to allow for 250 character limit
            temperature: 0.85, // Slightly higher for more variety
            top_p: 0.9,
          }),
        }
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Request Failed (${response.status}): ${errorBody}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error("API response was successful, but content was empty.");
      }
      
      // Remove any emojis that might have slipped through
      let cleanedContent = content.replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        ""
      );
      
      // Ensure complete posts under 250 characters
      if (cleanedContent.length > 250) {
        // Find the last complete sentence within 250 characters
        const sentences = cleanedContent.match(/[^.!?]+[.!?]+/g) || [];
        let completePost = "";
        
        for (const sentence of sentences) {
          if ((completePost + sentence).length <= 250) {
            completePost += sentence;
          } else {
            // Try to fit at least one complete thought
            if (!completePost) {
              // Find last space before 250 chars
              const lastSpace = cleanedContent.lastIndexOf(' ', 247);
              if (lastSpace > 0) {
                completePost = cleanedContent.substring(0, lastSpace) + "...";
              } else {
                completePost = cleanedContent.substring(0, 247) + "...";
              }
            }
            break;
          }
        }
        
        cleanedContent = completePost || cleanedContent.substring(0, 247) + "...";
        console.log("📏 Content adjusted to ensure complete post under 250 characters");
      }
      
      return cleanedContent;
    } catch (error) {
      console.error("Content generation failed:", error);
      throw error;
    }
  }

  // --- Enhanced Posting Logic with More Human-like Behavior ---
  async postToTwitter(content) {
    try {
      console.log("🚀 Starting human-like posting process...");
      
      const tweetBox = await this.waitForElement('div[data-testid="tweetTextarea_0"]');
      if (!tweetBox) {
        throw new Error("Tweet box not found on page after waiting.");
      }

      await this.wait(this.getRandomDelay(500, 1000));
      await this.simulateHumanTyping(tweetBox, content);
      
      // Simulate "proofreading"
      await this.wait(this.getRandomDelay(1500, 2500));
      
      console.log('⏳ Waiting for the "Post" button to become enabled...');
      let postButton = null;
      let attempts = 0;
      const maxAttempts = 14;

      while (attempts < maxAttempts) {
        postButton = this.findAndValidateTweetButton();
        if (postButton) {
          console.log("✅ Button is enabled! Proceeding to click.");
          break;
        }
        attempts++;
        await this.wait(500);
      }

      if (!postButton) {
        throw new Error("Post button did not become enabled in time.");
      }

      await this.simulateHumanClick(postButton);
      console.log("✅ Posting process completed successfully.");
      await this.wait(this.getRandomDelay(4000, 5000));
      return true;
    } catch (error) {
      console.error("❌ Failed during postToTwitter:", error);
      throw error;
    }
  }

  findAndValidateTweetButton() {
    const selectors = [
      'button[data-testid="tweetButtonInline"]',
      'button[data-testid="tweetButton"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        const isDisabled = button.disabled || button.getAttribute("aria-disabled") === "true";
        if (!isDisabled) {
          return button;
        }
      }
    }
    return null;
  }

  // --- Enhanced Human-like Interaction Methods ---
  async simulateHumanTyping(element, text) {
    element.focus();
    element.click();
    
    // Occasional pauses for "thinking"
    const pausePositions = new Set();
    const numPauses = Math.floor(Math.random() * 3); // 0-2 pauses
    for (let i = 0; i < numPauses; i++) {
      pausePositions.add(Math.floor(Math.random() * text.length));
    }
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      document.execCommand("insertText", false, char);
      
      // Thinking pause
      if (pausePositions.has(i)) {
        await this.wait(this.getRandomDelay(500, 1500));
      } else {
        // Normal typing speed with variation
        const baseDelay = this.getRandomDelay(40, 110);
        const spaceDelay = char === " " ? this.getRandomDelay(80, 150) : 0;
        await this.wait(baseDelay + spaceDelay);
      }
    }
  }

  async simulateHumanClick(element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Move cursor to element with some randomness
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 10;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 10;
    
    element.dispatchEvent(new MouseEvent("mousemove", { 
      clientX: x, 
      clientY: y, 
      bubbles: true, 
      cancelable: true 
    }));
    
    await this.wait(this.getRandomDelay(100, 300));
    element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true }));
    await this.wait(this.getRandomDelay(200, 400));
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await this.wait(this.getRandomDelay(80, 150));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    element.click();
    console.log("🚀 Button click dispatched with human-like behavior.");
  }

  // --- Utility Methods ---
  async waitForElement(selector, timeout = 7000) {
    return new Promise((resolve) => {
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

  getRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  getSessionDuration() {
    if (!this.state.sessionStartTime) return "unknown duration";
    const duration = Date.now() - this.state.sessionStartTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  sendStatusUpdate(message, type, finished = false) {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: "updateStatus",
        message,
        type,
        finished,
        state: this.state
      });
    }
  }
}

// --- INITIALIZATION AND MESSAGE LISTENING ---
if (window.location.hostname.includes("twitter.com") || window.location.hostname.includes("x.com")) {
  console.log("🐦 Twitter Auto Poster Enhanced Edition loaded.");
  const autoPoster = new TwitterAutoPoster();
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startAutoPosting") {
      autoPoster.startAutoPosting(request.config).then(sendResponse);
      return true;
    } else if (request.action === "stopAutoPosting") {
      sendResponse(autoPoster.stopAutoPosting());
    } else if (request.action === "getState") {
      sendResponse({ state: autoPoster.state });
    }
  });
}