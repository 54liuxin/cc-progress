// pages/index/index.js
Page({
  data: {
    goalName: '我的目标',
    startDate: '2025-01-01',
    targetDays: 30,
    currentDay: 10,
    mode: 'countup', // countup: 计时, countdown: 倒计时
    shape: 'rect', // rect: 矩形, circle: 圆形
    progressPercent: "0.00",
    canvasSize: 300,
    currentValue: 0,
    targetValue: 0
  },

  onLoad() {
    this.loadData();
    this.calculateProgress();
  },

  onShow() {
    this.loadData();
    this.calculateProgress();
    
    // 如果是圆形进度条，绘制Canvas
    if (this.data.shape === 'circle') {
      this.drawCircleProgress();
    }
  },

  onReady() {
    // 页面渲染完成后，根据屏幕宽度调整canvas大小
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        // 根据屏幕宽度计算合适的canvas尺寸
        // 根据屏幕宽度计算合适的canvas尺寸
        const screenWidth = res.windowWidth;
        const screenHeight = res.windowHeight;

// 使用屏幕最小边长的70%作为canvas尺寸
        let canvasSize = Math.min(screenWidth, screenHeight) * 0.7;
// 设置最小和最大尺寸
        canvasSize = Math.max(200, Math.min(400, Math.floor(canvasSize)));



        // 设置最小和最大尺寸
        canvasSize = Math.max(200, Math.min(400, canvasSize));
        
        that.setData({
          canvasSize: Math.floor(canvasSize)
        });
        
        // 如果是圆形进度条，重新绘制Canvas
        if (that.data.shape === 'circle') {
          that.drawCircleProgress();
        }
      }
    });
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
      
      // 确保数据加载后重新计算进度
      this.calculateProgress();
    } catch (e) {
      console.error('读取存储数据失败', e);
    }
  },

  calculateProgress() {
    const { startDate, targetDays, mode } = this.data;
    let progressPercent = 0;
    let currentValue = 0;
    let targetValue = targetDays;

    // 基于开始日期计算当前进度
    if (targetDays > 0) {
      const start = new Date(startDate);
      const today = new Date();
      
      // 设置时间为当天0点，确保边界处理正确
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      
      // 计算相差天数
      const diffTime = today - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // 只要大于0点就算作当天已完成
      let currentDay = 0;
      if (diffDays >= 0) {
        currentDay = Math.min(diffDays + 1, targetDays); // +1表示当天也算完成
      }
      
      if (mode === 'countup') {
        // 计时模式：已完成的百分比
        progressPercent = (currentDay / targetDays) * 100;
        currentValue = currentDay;
      } else {
        // 倒计时模式：剩余的百分比
        progressPercent = ((targetDays - currentDay) / targetDays) * 100;
        currentValue = targetDays - currentDay;
      }
    }

    // 限制百分比范围
    progressPercent = Math.max(0, Math.min(100, progressPercent));

    this.setData({
      progressPercent: progressPercent.toFixed(2),
      currentValue: Number(currentValue),
      targetValue: Number(targetValue)
    });
    
    // 如果是圆形进度条，重新绘制Canvas
    if (this.data.shape === 'circle') {
      this.drawCircleProgress();
    }
  },

  drawCircleProgress() {
    const { progressPercent, mode, canvasSize, currentValue, targetValue } = this.data;
    let percent = parseFloat(progressPercent);

    // 根据模式调整显示方式
    if (mode === 'countdown') {
      percent = 100 - percent;
    }

    const ctx = wx.createCanvasContext('circleProgress', this);

    // 清空画布
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 修复中心坐标计算
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = (canvasSize / 2) * 0.7; // 增大半径比例
    const lineWidth = radius * 0.15; // 保持适中的线宽比例

// 绘制背景圆 - 倒计时模式下背景为红色
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    const bgColor = mode === 'countdown' ? '#ff6b6b' : '#e0e0e0';
    ctx.setStrokeStyle(bgColor);
    ctx.setLineWidth(lineWidth);
    ctx.stroke();

// 绘制进度圆弧 - 倒计时模式下进度为灰色
    if (percent > 0) {
      ctx.beginPath();
      const startAngle = -Math.PI / 2;
      const endAngle = (percent / 100) * 2 * Math.PI - Math.PI / 2;

      // 根据模式选择进度颜色 - 倒计时模式下已完成部分用灰色
      const color = mode === 'countup' ? '#4a90e2' : '#e0e0e0';
      ctx.setStrokeStyle(color);
      ctx.setLineWidth(lineWidth+2);
      ctx.setLineCap('round');
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();
    }




    ctx.draw(false); // 立即绘制，不等待
  }


})