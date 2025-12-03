// 主应用逻辑 - 使用原生JavaScript
class TodoApp {
  constructor() {
    // 当前选中的日期
    this.selectedDate = DateUtils.getToday();
    // 当前显示的年月
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    // 待办事项列表
    this.todos = [];
    // 设置
    this.settings = {
      theme: 'light',
      aiApiKey: '',
      aiModel: 'Qwen/Qwen2.5-14B-Instruct'
    };
    // 搜索关键词
    this.searchKeyword = '';
    // 是否显示搜索结果
    this.showingSearchResults = false;
    // 加载状态
    this.loading = false;
    // AI总结
    this.aiSummary = '';
    // 显示AI总结状态
    this.showingAISummary = false;

    this.init();
  }

  // 初始化应用
  async init() {
    try {
      await this.loadTodos();
      await this.loadSettings();
      this.renderCalendar();
      this.renderEvents();
      this.bindEvents();
      console.log('应用初始化完成');
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }

  // 绑定事件监听器
  bindEvents() {
    // 今天按钮
    document.getElementById('btn-today').addEventListener('click', () => {
      this.goToToday();
    });

    // 设置按钮（头部）
    document.getElementById('btn-settings-header').addEventListener('click', () => {
      this.showSettings();
    });

    // 上个月按钮
    document.getElementById('btn-prev').addEventListener('click', () => {
      this.goToPrevMonth();
    });

    // 下个月按钮
    document.getElementById('btn-next').addEventListener('click', () => {
      this.goToNextMonth();
    });

    // 添加待办按钮
    document.getElementById('btn-add').addEventListener('click', () => {
      this.addTodo();
    });

    // AI总结按钮
    document.getElementById('btn-ai').addEventListener('click', () => {
      this.generateAISummary();
    });

    // 关闭AI总结按钮
    document.getElementById('btn-close-ai').addEventListener('click', () => {
      this.closeAISummary();
    });

    // 搜索框
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.searchKeyword = e.target.value;
      this.handleSearch();
    });

    // 关闭设置模态框
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      this.hideSettings();
    });

    document.getElementById('btn-cancel-settings').addEventListener('click', () => {
      this.hideSettings();
    });

    // API Key输入框事件
    const apiKeyInput = document.getElementById('api-key-input');
    apiKeyInput.addEventListener('blur', async (e) => {
      const apiKey = e.target.value.trim();
      if (apiKey && apiKey !== this.settings.aiApiKey) {
        // 更新临时设置并加载模型
        this.settings.aiApiKey = apiKey;
        await this.loadAvailableModels();
      }
    });

    // 保存设置
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      this.saveSettings();
    });

    // 关闭搜索结果
    document.getElementById('btn-close-search').addEventListener('click', () => {
      this.closeSearchResults();
      document.getElementById('search-input').value = '';
      this.searchKeyword = '';
    });
  }

  // 处理搜索
  handleSearch() {
    if (this.searchKeyword.trim()) {
      this.showSearchResults();
    } else {
      this.closeSearchResults();
    }
  }

  // 显示搜索结果
  showSearchResults() {
    this.showingSearchResults = true;
    this.showingAISummary = false;

    document.getElementById('events-section').style.display = 'none';
    document.getElementById('ai-summary-section').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'block';

    const keyword = this.searchKeyword.toLowerCase();
    const results = this.todos.filter(todo =>
      todo.title.toLowerCase().includes(keyword) ||
      (todo.description && todo.description.toLowerCase().includes(keyword))
    );

    const resultsList = document.getElementById('results-list');
    const resultsEmpty = document.getElementById('results-empty');

    resultsList.innerHTML = '';

    if (results.length === 0) {
      resultsList.style.display = 'none';
      resultsEmpty.style.display = 'block';
    } else {
      resultsList.style.display = 'block';
      resultsEmpty.style.display = 'none';

      results.forEach(todo => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';

        const dateDiv = document.createElement('div');
        dateDiv.className = 'result-date';
        dateDiv.textContent = DateUtils.formatDateCN(new Date(todo.date));

        const titleDiv = document.createElement('div');
        titleDiv.className = 'result-title';
        titleDiv.textContent = todo.title;

        const statusDiv = document.createElement('div');
        statusDiv.className = 'result-status';
        if (todo.completed) {
          statusDiv.textContent = '✓ 已完成';
        } else {
          statusDiv.textContent = '⏳ 待完成';
          statusDiv.classList.add('pending');
        }

        resultDiv.appendChild(dateDiv);
        resultDiv.appendChild(titleDiv);
        resultDiv.appendChild(statusDiv);

        resultDiv.addEventListener('click', () => {
          this.selectDate(todo.date);
          this.closeSearchResults();
          document.getElementById('search-input').value = '';
          this.searchKeyword = '';
        });

        resultsList.appendChild(resultDiv);
      });
    }
  }

  // 关闭搜索结果
  closeSearchResults() {
    this.showingSearchResults = false;
    this.renderEvents();
  }

  // 显示设置模态框
  async showSettings() {
    document.getElementById('api-key-input').value = this.settings.aiApiKey || '';
    document.getElementById('modal-overlay').style.display = 'flex';

    // 动态加载模型列表
    if (this.settings.aiApiKey) {
      await this.loadAvailableModels();
    } else {
      // 如果没有API key，显示默认选项
      this.populateModelSelect([]);
    }
  }

  // 加载可用模型列表
  async loadAvailableModels() {
    try {
      const models = await API.getAvailableModels(this.settings.aiApiKey);
      this.populateModelSelect(models);
    } catch (error) {
      console.error('加载模型列表失败:', error);
      // 加载失败时显示默认选项
      this.populateModelSelect([]);
    }
  }

  // 填充模型选择下拉列表
  populateModelSelect(models) {
    const select = document.getElementById('ai-model-select');
    const currentModel = this.settings.aiModel || 'Qwen/Qwen2.5-14B-Instruct';

    // 清空现有选项
    select.innerHTML = '';

    if (models && models.length > 0) {
      // 添加所有可用模型
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.id;
        select.appendChild(option);
      });
    } else {
      // 如果没有模型数据或加载失败，显示默认选项
      const defaultModels = [
        { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen2.5-14B-Instruct (推荐)' },
        { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B-Instruct' },
        { id: 'Qwen/Qwen2.5-3B-Instruct', name: 'Qwen2.5-3B-Instruct' },
        { id: 'qwen-turbo', name: 'qwen-turbo (兼容旧版)' }
      ];

      defaultModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        select.appendChild(option);
      });
    }

    // 设置当前选中的模型
    select.value = currentModel;
  }

  // 隐藏设置模态框
  hideSettings() {
    document.getElementById('modal-overlay').style.display = 'none';
  }

  // 保存设置
  async saveSettings() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const aiModel = document.getElementById('ai-model-select').value;

    this.settings.aiApiKey = apiKey;
    this.settings.aiModel = aiModel;

    await Storage.saveSettings(this.settings);
    this.hideSettings();
    alert('设置已保存');
  }

  // 加载待办事项
  async loadTodos() {
    this.todos = await Storage.loadTodos();
  }

  // 保存待办事项
  async saveTodos() {
    await Storage.saveTodos(this.todos);
  }

  // 加载设置
  async loadSettings() {
    this.settings = await Storage.getSettings();
  }

  // 选择日期
  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.showingAISummary = false;
    this.showingSearchResults = false;
    this.renderCalendar();
    this.renderEvents();
  }

  // 判断是否是今天
  isToday(date) {
    return DateUtils.isToday(date);
  }

  // 判断是否是选中的日期
  isSelectedDate(date) {
    return DateUtils.formatDate(date) === this.selectedDate;
  }

  // 获取指定日期的统计信息
  getDateStats(dateStr) {
    const dateTodos = this.todos.filter(todo => todo.date === dateStr);
    return {
      total: dateTodos.length,
      completed: dateTodos.filter(t => t.completed).length,
      pending: dateTodos.filter(t => !t.completed).length
    };
  }

  // 获取日期的背景色
  getDateBackgroundColor(date) {
    const dateStr = DateUtils.formatDate(date);
    const stats = this.getDateStats(dateStr);
    return DateUtils.getEventColor(stats.total);
  }

  // 获取日期的文字色
  getDateTextColor(date) {
    const bgColor = this.getDateBackgroundColor(date);
    return DateUtils.getTextColor(bgColor);
  }

  // 导航到上个月
  goToPrevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.renderCalendar();
  }

  // 导航到下个月
  goToNextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.renderCalendar();
  }

  // 导航到今天
  goToToday() {
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.selectedDate = DateUtils.getToday();
    this.showingAISummary = false;
    this.showingSearchResults = false;
    this.renderCalendar();
    this.renderEvents();
  }

  // 获取日历矩阵
  getCalendarMatrix() {
    return DateUtils.getMonthMatrix(this.currentYear, this.currentMonth);
  }

  // 渲染日历
  renderCalendar() {
    // 更新月份标题
    const monthTitle = `${this.currentYear}年 ${DateUtils.getMonthName(this.currentMonth)}`;
    document.getElementById('current-month').textContent = monthTitle;

    // 清除旧的日期单元格（保留前7个星期头）
    const calendarGrid = document.getElementById('calendar-grid');
    while (calendarGrid.children.length > 7) {
      calendarGrid.removeChild(calendarGrid.lastChild);
    }

    // 渲染日期
    const matrix = this.getCalendarMatrix();
    matrix.forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';

      if (!day.isCurrentMonth) {
        dayDiv.classList.add('other-month');
      }
      if (this.isToday(day.date)) {
        dayDiv.classList.add('today');
      }
      if (this.isSelectedDate(day.date)) {
        dayDiv.classList.add('selected');
      }

      const bgColor = this.getDateBackgroundColor(day.date);
      dayDiv.style.backgroundColor = bgColor;
      dayDiv.style.color = this.getDateTextColor(day.date);

      const dateSpan = document.createElement('span');
      dateSpan.textContent = day.date.getDate();
      dayDiv.appendChild(dateSpan);

      // 如果有待办事项，显示数量
      const dateStr = DateUtils.formatDate(day.date);
      const todoCount = this.getDateStats(dateStr).total;
      if (todoCount > 0) {
        const countSpan = document.createElement('span');
        countSpan.className = 'todo-count';
        countSpan.textContent = todoCount;
        dayDiv.appendChild(countSpan);
      }

      // 添加点击事件
      dayDiv.addEventListener('click', () => {
        this.selectDate(dateStr);
      });

      calendarGrid.appendChild(dayDiv);
    });
  }

  // 获取选中日期的待办事项
  getSelectedDateTodos() {
    return this.todos.filter(todo => todo.date === this.selectedDate);
  }

  // 渲染事件列表
  renderEvents() {
    if (this.showingAISummary) {
      document.getElementById('events-section').style.display = 'none';
      document.getElementById('ai-summary-section').style.display = 'block';
      return;
    }

    if (this.showingSearchResults) {
      document.getElementById('events-section').style.display = 'none';
      document.getElementById('search-results-section').style.display = 'block';
      return;
    }

    document.getElementById('events-section').style.display = 'block';
    document.getElementById('ai-summary-section').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'none';

    // 更新选中日期标题
    const selectedDateTitle = DateUtils.formatDateCN(new Date(this.selectedDate));
    document.getElementById('selected-date').textContent = selectedDateTitle;

    // 获取待办事项
    const todos = this.getSelectedDateTodos();

    // 更新AI按钮状态
    const aiBtn = document.getElementById('btn-ai');
    aiBtn.disabled = todos.length === 0;

    // 渲染事件列表
    const eventsList = document.getElementById('events-list');
    const eventsEmpty = document.getElementById('events-empty');
    const eventsSection = document.getElementById('events-section');

    eventsList.innerHTML = '';

    if (todos.length === 0) {
      eventsList.style.display = 'none';
      eventsEmpty.style.display = 'block';
      // 无事件时，使用较小高度
      eventsSection.style.maxHeight = '200px';
    } else {
      eventsList.style.display = 'block';
      eventsEmpty.style.display = 'none';

      // 智能计算高度
      // 每个事件约60px高度，头部约50px，padding约32px
      const eventsCount = todos.length;
      const singleEventHeight = 60; // 单个事件高度
      const headerHeight = 50; // 头部高度
      const paddingHeight = 32; // 上下padding
      const maxEventsWithoutScroll = 10; // 10个事件以内不滚动

      if (eventsCount <= maxEventsWithoutScroll) {
        // 事件数量少，完全展开
        const calculatedHeight = headerHeight + paddingHeight + (eventsCount * singleEventHeight);
        eventsSection.style.maxHeight = calculatedHeight + 'px';
      } else {
        // 事件数量多，使用固定高度并启用滚动
        const maxHeight = headerHeight + paddingHeight + (maxEventsWithoutScroll * singleEventHeight);
        eventsSection.style.maxHeight = maxHeight + 'px';
      }

      todos.forEach(todo => {
        const todoDiv = document.createElement('div');
        todoDiv.className = 'event-item';
        if (todo.completed) {
          todoDiv.classList.add('completed');
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'event-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleTodo(todo.id);
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'event-title';
        titleSpan.textContent = todo.title;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'event-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editTodo(todo.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteTodo(todo.id);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        todoDiv.appendChild(contentDiv);
        todoDiv.appendChild(actionsDiv);

        eventsList.appendChild(todoDiv);
      });
    }
  }

  // 添加待办事项
  async addTodo() {
    const title = prompt('请输入待办事项标题:');
    if (title && title.trim()) {
      const newTodo = {
        id: generateId(),
        title: title.trim(),
        description: '',
        date: this.selectedDate,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.todos.push(newTodo);
      await this.saveTodos();
      this.renderCalendar();
      this.renderEvents();
    }
  }

  // 切换待办事项完成状态
  async toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
      await this.saveTodos();
      this.renderCalendar();
      this.renderEvents();
    }
  }

  // 编辑待办事项
  async editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      const newTitle = prompt('编辑待办事项:', todo.title);
      if (newTitle !== null && newTitle.trim()) {
        todo.title = newTitle.trim();
        todo.updatedAt = new Date().toISOString();
        await this.saveTodos();
        this.renderCalendar();
        this.renderEvents();
      }
    }
  }

  // 删除待办事项
  async deleteTodo(id) {
    if (confirm('确定要删除这个待办事项吗？')) {
      this.todos = this.todos.filter(t => t.id !== id);
      await this.saveTodos();
      this.renderCalendar();
      this.renderEvents();
    }
  }

  // 生成AI总结
  async generateAISummary() {
    if (!this.settings.aiApiKey) {
      alert('请先在设置中配置AI API密钥');
      return;
    }

    this.showingAISummary = true;
    this.loading = true;

    document.getElementById('ai-summary-section').style.display = 'block';
    document.getElementById('events-section').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'none';
    document.getElementById('ai-loading').style.display = 'block';
    document.getElementById('ai-summary-text').style.display = 'none';

    try {
      const summary = await API.generateTodoSummary(this.getSelectedDateTodos(), this.selectedDate);
      this.aiSummary = summary;
      document.getElementById('ai-summary-text').textContent = summary;
      document.getElementById('ai-loading').style.display = 'none';
      document.getElementById('ai-summary-text').style.display = 'block';
    } catch (error) {
      console.error('生成AI总结失败:', error);
      alert('生成AI总结失败: ' + error.message);
      this.showingAISummary = false;
      document.getElementById('ai-summary-section').style.display = 'none';
      this.renderEvents();
    } finally {
      this.loading = false;
    }
  }

  // 关闭AI总结
  closeAISummary() {
    this.showingAISummary = false;
    this.aiSummary = '';
    this.renderEvents();
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
