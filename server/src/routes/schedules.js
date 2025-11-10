const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');

// 일정 생성
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      date,
      startTime,
      endTime,
      departureLocation,
      destinationLocation,
      memo,
    } = req.body;

    // 필수 필드 검증
    if (!userId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.',
      });
    }

    const newSchedule = new Schedule({
      userId,
      title,
      date: new Date(date),
      startTime,
      endTime,
      departureLocation,
      destinationLocation,
      memo,
    });

    await newSchedule.save();

    res.status(201).json({
      success: true,
      message: '일정이 생성되었습니다.',
      data: newSchedule,
    });
  } catch (error) {
    console.error('일정 생성 에러:', error);
    res.status(500).json({
      success: false,
      message: '일정 생성에 실패했습니다.',
      error: error.message,
    });
  }
});

// 특정 날짜의 일정 조회
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId가 필요합니다.',
      });
    }

    // 해당 날짜의 시작과 끝 시간 설정
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const schedules = await Schedule.find({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ startTime: 1 }); // 시작 시간 순으로 정렬

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('일정 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '일정 조회에 실패했습니다.',
      error: error.message,
    });
  }
});

// 모든 일정 조회 (특정 사용자)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const schedules = await Schedule.find({ userId }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('일정 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '일정 조회에 실패했습니다.',
      error: error.message,
    });
  }
});

// 일정 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: '일정을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '일정이 수정되었습니다.',
      data: updatedSchedule,
    });
  } catch (error) {
    console.error('일정 수정 에러:', error);
    res.status(500).json({
      success: false,
      message: '일정 수정에 실패했습니다.',
      error: error.message,
    });
  }
});

// 일정 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: '일정을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '일정이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('일정 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '일정 삭제에 실패했습니다.',
      error: error.message,
    });
  }
});

module.exports = router;
