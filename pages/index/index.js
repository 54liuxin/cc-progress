Page({
  data: {
    goalName: '我的目标',        // 目标名称
    startDate: '',              // 开始日期
    targetDay: 10,              // 目标天数
    progressPercent: 0,         // 进度百分比
    mode: 'countup',            // 计时模式（countup: 正计时, countdown: 倒计时）
    shape: 'rect',              // 进度条形状（rect: 矩形, circle: 圆形）
    currentDay: 0,              // 当前天数
    progressWidth: 0,           // 矩形进度条宽度
  },

  onLoad() {
    this.updateProgressData();
  },

  onShow() {
    this.updateProgressData();
    this.updateCanvasSize(); // 页面显示时，更新 Canvas
  },

  // 更新进度数据
  updateProgressData() {
    const data = wx.getStorageSync('progressData') || {};
    if (data) {
      this.setData({
        goalName: data.goalName || this.data.goalName,
        startDate: data.startDate || this.data.startDate,
        targetDay: data.targetDay || this.data.targetDay,
        mode: data.mode || this.data.mode,
        shape: data.shape || this.data.shape,
      });
    }

    this.calculateProgress();
  },

  // 计算进度
  calculateProgress() {
    const { targetDay, mode, startDate } = this.data;
    if (!startDate) return;

    const startDateTime = new Date(startDate).getTime();
    const currentDateTime = new Date().getTime();

    if (startDateTime > currentDateTime) {
      this.setData({
        progressPercent: 100,
        currentDay: targetDay,
      });
      return;
    }

    const daysElapsed = Math.floor((currentDateTime - startDateTime) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(daysElapsed, targetDay);
    let progressPercent = (currentDay / targetDay) * 100;

    // 倒计时模式：进度从100%开始递减
    if (mode === 'countdown') {
      progressPercent = 100 - progressPercent; // 倒计时模式
    }

    progressPercent = Math.max(0, Math.min(100, progressPercent));

    const remainingDays = mode === 'countdown' ? targetDay - currentDay : currentDay;

    this.setData({
      progressPercent: progressPercent.toFixed(2),
      currentDay: remainingDays,
    });

    this.updateProgressBar();
  },

// 更新进度条
updateProgressBar() {
  const { shape, progressPercent } = this.data;

  if (shape === 'circle') {
    this.drawCircleCompat(progressPercent);
  } else if (shape === 'rect') {
    this.drawRect(progressPercent);
  }
}
,


  // 清除画布
  clearCanvas() {
    setTimeout(() => {
      const ctx = wx.createCanvasContext('circleProgress', this);
      const query = wx.createSelectorQuery();
      query.select('#circleProgress').boundingClientRect((rect) => {
        if (!rect) {
          console.error('Canvas 元素未找到，无法清除画布');
          return;
        }

        const canvasWidth = rect.width;
        const canvasHeight = rect.height; // 获取画布高度
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);  // 清除画布
        ctx.draw();  // 更新画布
      }).exec();
    }, 200); // 延迟 200 毫秒，确保 Canvas 渲染完成
  },

// 绘制矩形进度条
drawRect(progressPercent) {
  const maxWidth = 360;  
  const progressWidth = (progressPercent / 100) * maxWidth;
  this.setData({
    progressWidth: Math.min(progressWidth, maxWidth),
  });
},



  // 绘制圆形进度条
  // 在需要绘制时调用：this.drawCircleCompat(this.data.progressPercent)
drawCircleCompat(progressPercent = 0) {
  const query = wx.createSelectorQuery().in(this);
  query.select('#circleProgress').fields({ node: true, size: true }).exec((res) => {
    const r = res && res[0];
    // 如果支持新 Canvas 节点接口（RenderingContext）
    if (r && r.node) {
      const canvas = r.node;
      const width = r.width;
      const height = r.height;
      const dpr = (wx.getSystemInfoSync && wx.getSystemInfoSync().pixelRatio) || 1;

      // 设置真实像素尺寸并缩放到 CSS 像素坐标系
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // 清空（使用 CSS 像素坐标）
      ctx.clearRect(0, 0, width, height);

      // 计算位置/半径（以 CSS px 为单位）
      const lineWidth = 10;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(0, Math.min(width, height) / 2 - lineWidth);

      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + 2 * Math.PI * (progressPercent / 100);

      // 背景环
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#e6e6e6';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 进度环
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // （可选）在圆心画文字：ctx.fillText(...)
      return;
    }

    // 回退：不支持新节点接口（老基础库），使用旧的 CanvasContext
    this._drawCircleFallback(progressPercent);
  });
},

// 旧接口回退实现（兼容）
_drawCircleFallback(progressPercent = 0) {
  const ctx = wx.createCanvasContext('circleProgress', this);
  const query = wx.createSelectorQuery().in(this);
  query.select('#circleProgress').boundingClientRect((rect) => {
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const lineWidth = 10;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(0, Math.min(width, height) / 2 - lineWidth);
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + 2 * Math.PI * (progressPercent / 100);

    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.setStrokeStyle('#e6e6e6');
    ctx.setLineWidth(lineWidth);
    ctx.stroke();

    // 进度
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.setStrokeStyle('#4a90e2');
    ctx.setLineWidth(lineWidth);
    ctx.stroke();

    // 提交 —— 旧接口需要 draw()
    ctx.draw();
  }).exec();
},

  
  
  
  
  
  

  // 打开设置页面
  openSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    });
  },

  // 更新 Canvas 大小（保证圆形进度条居中）
  updateCanvasSize() {
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('#circleProgress').boundingClientRect((rect) => {
        const canvasWidth = rect.width;
        const canvasHeight = rect.height; // 获取画布高度
        const radius = (canvasWidth - 40) / 5;  // 保持圆环半径不变
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2; // 设置圆环的 Y 轴为画布的中心
        this.drawCircleCompat(this.data.progressPercent);
      }).exec();
    }, 100); // 延迟 100 毫秒，确保 Canvas 渲染完成
  },
});
