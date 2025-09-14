const CouponService = require("../services/couponService");
const couponService = new CouponService();

class CouponController {
  async createCoupon(req, res, next) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({
        success: true,
        data: coupon,
        message: "Coupon created successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findAllCoupons(req, res, next) {
    try {
      const coupons = await couponService.findAllCoupons();
      res.status(200).json({
        success: true,
        data: coupons,
        count: coupons.length,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findCouponById(req, res, next) {
    try {
      const coupon = await couponService.findCouponById(req.params.id);
      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCoupon(req, res, next) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: coupon,
        message: "Coupon updated successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCoupon(req, res, next) {
    try {
      const result = await couponService.deleteCoupon(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getApplicableCoupons(req, res, next) {
    try {
      const applicableCoupons = await couponService.getApplicableCoupons(
        req.body,
      );
      res.status(200).json({
        success: true,
        data: applicableCoupons,
        count: applicableCoupons.length,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async applyCoupon(req, res, next) {
    try {
      const result = await couponService.applyCoupon(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: "Coupon applied successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = CouponController;
