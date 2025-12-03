// 日期工具函数
class DateUtils {
  // 格式化日期为 YYYY-MM-DD
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 格式化日期为中文显示
  static formatDateCN(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 星期${weekDay}`;
  }

  // 获取月份的第一天是星期几 (0-6, 0为星期日)
  static getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  // 获取月份的天数
  static getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // 获取今天的日期字符串
  static getToday() {
    return this.formatDate(new Date());
  }

  // 判断两个日期是否相等
  static isSameDay(date1, date2) {
    return this.formatDate(date1) === this.formatDate(date2);
  }

  // 判断是否是今天
  static isToday(date) {
    return this.isSameDay(date, new Date());
  }

  // 获取月份的日期矩阵
  static getMonthMatrix(year, month) {
    const firstDay = this.getFirstDayOfMonth(year, month);
    const daysInMonth = this.getDaysInMonth(year, month);
    const daysInPrevMonth = this.getDaysInMonth(year, month - 1);

    const matrix = [];

    // 上个月的末尾几天
    for (let i = firstDay - 1; i >= 0; i--) {
      matrix.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // 当前月的所有天
    for (let day = 1; day <= daysInMonth; day++) {
      matrix.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // 下个月的前几天
    const remaining = 42 - matrix.length; // 6行 x 7列 = 42个格子
    for (let day = 1; day <= remaining; day++) {
      matrix.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return matrix;
  }

  // 获取事件颜色（根据事件数量）
  static getEventColor(todoCount) {
    if (todoCount === 0) return '#ffffff'; // 白色：0个事件
    if (todoCount <= 2) return '#d4edda'; // 浅绿色：1-2个事件
    if (todoCount <= 4) return '#fff3cd'; // 浅橙色：3-4个事件
    if (todoCount <= 6) return '#f8d7da'; // 浅红色：5-6个事件
    return '#dc3545'; // 深红色：7+个事件
  }

  // 获取文本颜色（根据背景色）
  static getTextColor(bgColor) {
    // 对于深色背景，返回白色文字
    const darkColors = ['#dc3545', '#f8d7da'];
    return darkColors.includes(bgColor) ? '#ffffff' : '#333333';
  }

  // 计算两个日期之间的天数
  static daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 添加天数
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // 获取月份的中文名称
  static getMonthName(month) {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[month];
  }
}
