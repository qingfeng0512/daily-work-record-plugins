// 存储工具函数
class Storage {
  // 向后台脚本发送消息
  static async sendMessage(action, data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action, data },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response?.error || '未知错误'));
          }
        }
      );
    });
  }

  // 保存待办事项
  static async saveTodos(todos) {
    return this.sendMessage('saveTodos', { todos });
  }

  // 加载待办事项
  static async loadTodos() {
    return this.sendMessage('loadTodos', {});
  }

  // 获取设置
  static async getSettings() {
    return this.sendMessage('getSettings', {});
  }

  // 保存设置
  static async saveSettings(settings) {
    return this.sendMessage('saveSettings', { settings });
  }

  // 调用AI API
  static async callAIApi(data) {
    return this.sendMessage('callAIApi', data);
  }

  // 本地存储操作（直接使用Chrome Storage API）
  static async localSet(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static async localGet(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  static async localRemove(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// 工具函数：深拷贝对象
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 生成唯一ID
function generateId() {
  return 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
