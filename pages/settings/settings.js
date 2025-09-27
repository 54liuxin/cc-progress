Page({
    data: {
      goalName: '',     // 目标名称
      startDate: '',    // 开始日期
      targetDay: 1,     // 目标天数
      mode: 'countup',  // 模式：计时 or 倒计时
      shape: 'rect',    // 形状：矩形 or 圆形
    },
  
    onLoad() {
      // 从 localStorage 获取数据，如果有的话
      const data = wx.getStorageSync('progressData');
      if (data) {
        this.setData({
          goalName: data.goalName || '',
          startDate: data.startDate || '',
          targetDay: data.targetDay || 1,
          mode: data.mode || 'countup',
          shape: data.shape || 'rect',
        });
      }
    },
  
    // 目标名称输入框变化
    onGoalNameChange(e) {
      this.setData({ goalName: e.detail.value });
    },
  
    // 开始日期选择器变化
    onStartDateChange(e) {
      this.setData({ startDate: e.detail.value });
    },
  
    // 目标天数变化，确保为正整数
    onTargetDayChange(e) {
      let targetDay = parseInt(e.detail.value, 10);  // 转换为整数
      if (targetDay <= 0 || isNaN(targetDay)) {
        targetDay = 1;  // 如果是负数或非数字，设置为1
      }
      this.setData({ targetDay: targetDay });
    },
  
    // 模式变化
    onModeChange(e) {
      this.setData({ mode: e.detail.value });
    },
  
    // 形状变化
    onShapeChange(e) {
      this.setData({ shape: e.detail.value });
    },
  
    // 保存设置
    saveSettings() {
      const { goalName, startDate, targetDay, mode, shape } = this.data;
  
      // 保存数据到 localStorage
      const progressData = {
        goalName,
        startDate,
        targetDay,
        mode,
        shape,
        lastUpdate: new Date().toDateString(),
      };
  
      wx.setStorageSync('progressData', progressData);  // 保存数据
  
      // 保存完成后跳转回首页
      wx.navigateBack();  // 返回首页
    },
  
    // 取消设置
    cancelSettings() {
      wx.navigateBack();  // 如果点击取消，返回首页
    },
  });
  