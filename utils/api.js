// API工具函数
class API {
  // 调用硅基流动AI API
  static async callSiliconFlowAI(prompt, model = 'Qwen/Qwen2.5-14B-Instruct') {
    try {
      const result = await Storage.callAIApi({
        prompt,
        model
      });

      if (result && result.choices && result.choices[0]) {
        return result.choices[0].message.content;
      } else {
        throw new Error('AI API返回数据格式错误');
      }
    } catch (error) {
      console.error('AI API调用失败:', error);
      throw error;
    }
  }

  // 生成待办事项总结
  static async generateTodoSummary(todos, date) {
    const completedTodos = todos.filter(t => t.completed);
    const pendingTodos = todos.filter(t => !t.completed);

    const prompt = `
请对以下待办事项进行总结和分析：
日期：${date}

已完成事项 (${completedTodos.length}项)：
${completedTodos.map(t => `- ${t.title}${t.description ? ': ' + t.description : ''}`).join('\n')}

未完成事项 (${pendingTodos.length}项)：
${pendingTodos.map(t => `- ${t.title}${t.description ? ': ' + t.description : ''}`).join('\n')}

请提供：
1. 今日工作总结
2. 效率分析
3. 明日建议
请用简洁的中文回答。
    `;

    return await this.callSiliconFlowAI(prompt);
  }

  // 验证API密钥
  static async validateApiKey(apiKey) {
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('验证API密钥失败:', error);
      return false;
    }
  }

  // 获取可用模型列表
  static async getAvailableModels(apiKey) {
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      return [];
    }
  }
}
