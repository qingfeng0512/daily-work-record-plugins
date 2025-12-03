// 后台脚本 - Service Worker
class ExtensionBackground {
  constructor() {
    this.init();
  }

  init() {
    // 监听扩展程序安装
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('插件已安装');
        this.initDefaultSettings();
      }
    });

    // 监听来自弹出窗口的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // 保持消息通道开放
    });
  }

  // 初始化默认设置
  async initDefaultSettings() {
    const defaultSettings = {
      theme: 'light',
      autoSave: true,
      aiApiKey: '',
      aiModel: 'Qwen/Qwen2.5-14B-Instruct'
    };

    try {
      await chrome.storage.local.set({
        settings: defaultSettings
      });
      console.log('默认设置已初始化');
    } catch (error) {
      console.error('初始化设置失败:', error);
    }
  }

  // 处理消息
  async handleMessage(request, sender, sendResponse) {
    const { action, data } = request;

    try {
      switch (action) {
        case 'saveTodos':
          await this.saveTodos(data.todos);
          sendResponse({ success: true });
          break;

        case 'loadTodos':
          const todos = await this.loadTodos();
          sendResponse({ success: true, data: todos });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'saveSettings':
          await this.saveSettings(data.settings);
          sendResponse({ success: true });
          break;

        case 'callAIApi':
          const aiResult = await this.callAIApi(data);
          sendResponse({ success: true, data: aiResult });
          break;

        default:
          sendResponse({ success: false, error: '未知操作' });
      }
    } catch (error) {
      console.error('消息处理错误:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // 保存待办事项
  async saveTodos(todos) {
    await chrome.storage.local.set({ todos });
  }

  // 加载待办事项
  async loadTodos() {
    const result = await chrome.storage.local.get(['todos']);
    return result.todos || [];
  }

  // 获取设置
  async getSettings() {
    const result = await chrome.storage.local.get(['settings']);
    return result.settings || {};
  }

  // 保存设置
  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }

  // 调用硅基流动AI API
  async callAIApi(data) {
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      throw new Error('请先在设置中配置AI API密钥,格式为: sk-xxxxxx,否则无法使用AI功能');
    }

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: data.model || settings.aiModel || 'Qwen/Qwen2.5-14B-Instruct',
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手小U，可以帮助用户总结一天的待办事项完成情况。'
          },
          {
            role: 'user',
            content: data.prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'AI API调用失败');
    }

    return await response.json();
  }
}

// 初始化后台脚本
new ExtensionBackground();