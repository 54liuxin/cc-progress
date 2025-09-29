App({
  globalData: {
    goalName: '我的目标',
    targetDay: 30,
    currentDay: 0,
    mode: 'countup',
    shape: 'rect',
    startDate: ''
  },
  onLaunch() {
    // 小程序启动时检查是否需要自动增长
    // this.checkAndIncrementDay();
  },
  // 检查并增加天数
  checkAndIncrementDay() {
    // 这个函数现在不再需要，因为进度计算逻辑已更改
  }
})