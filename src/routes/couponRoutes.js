const express = require("express");

const CouponController = require("../controllers/couponController");
const couponController = new CouponController();

const router = express.Router();

router.post("/", couponController.createCoupon);
router.get("/", couponController.findAllCoupons);
router.get("/:id", couponController.findCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.post("/applicable-coupons", couponController.getApplicableCoupons);
router.post("/apply-coupon/:id", couponController.applyCoupon);

module.exports = router;
