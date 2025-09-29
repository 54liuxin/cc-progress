// pages/settings/settings.js
Page({
  data: {
    goalName: '我的目标',
    startDate: '2025-01-01',
    targetDays: 30,
    mode: 'countup',
    shape: 'rect'
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    try {
      const goalName = wx.getStorageSync('goalName') || '我的目标';
      const startDate = wx.getStorageSync('startDate') || new Date().toISOString().slice(0, 10);
      const targetDays = wx.getStorageSync('targetDays') || 30;
      const mode = wx.getStorageSync('mode') || 'countup';
      const shape = wx.getStorageSync('shape') || 'rect';

      this.setData({
        goalName,
        startDate,
        targetDays: Number(targetDays),
        mode,
        shape
      });
    } catch (e) {
      console.error('读取存储数据失败', e);
    }
  },

  onGoalNameInput(e) {
    this.setData({
      goalName: e.detail.value
    });
  },

  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  onTargetDaysInput(e) {
    this.setData({
      targetDays: parseInt(e.detail.value) || 0
    });
  },

  onModeChange(e) {
    this.setData({
      mode: e.detail.value
    });
  },

  onShapeChange(e) {
    this.setData({
      shape: e.detail.value
    });
  },

  saveSettings() {
    const { goalName, startDate, targetDays, mode, shape } = this.data;

    if (!goalName.trim()) {
      wx.showToast({
        title: '请输入目标名称',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (targetDays <= 0) {
      wx.showToast({
        title: '目标天数必须大于0',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    try {
      // 保存到本地存储
      wx.setStorageSync('goalName', goalName);
      wx.setStorageSync('startDate', startDate);
      wx.setStorageSync('targetDays', targetDays);
      wx.setStorageSync('mode', mode);
      wx.setStorageSync('shape', shape);

      // 显示保存成功的提示
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });

      // 返回首页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } catch (e) {
      console.error('保存设置失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 2000
      });
    }
  }
})