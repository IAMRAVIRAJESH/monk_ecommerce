const CouponController = require("../../controllers/couponController");
const CouponService = require("../../services/couponService");
jest.mock("../../services/couponService");

describe("CouponController", () => {
  let couponController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    couponController = new CouponController();
    mockReq = { body: {}, params: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("createCoupon", () => {
    it("should return 201 and coupon on success", async () => {
      CouponService.prototype.createCoupon.mockResolvedValueOnce({ id: 1 });
      mockReq.body = { code: "CART100" };
      await couponController.createCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
        message: "Coupon created successfully",
      });
    });
    it("should return proper error response on failure", async () => {
      const error = { message: "Missing fields", statusCode: 400 };
      CouponService.prototype.createCoupon.mockRejectedValueOnce(error);
      await couponController.createCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing fields",
      });
    });
  });

  describe("findAllCoupons", () => {
    it("should return 200 and list of coupons", async () => {
      CouponService.prototype.findAllCoupons.mockResolvedValueOnce([{ id: 1 }]);
      await couponController.findAllCoupons(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }],
        count: 1,
      });
    });
    it("should handle service errors gracefully", async () => {
      CouponService.prototype.findAllCoupons.mockRejectedValueOnce({
        message: "Database error",
        statusCode: 500,
      });
      await couponController.findAllCoupons(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("findCouponById", () => {
    it("should return coupon by ID", async () => {
      CouponService.prototype.findCouponById.mockResolvedValueOnce({ id: 1 });
      mockReq.params.id = 1;
      await couponController.findCouponById(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
      });
    });
    it("should handle not found error", async () => {
      const error = { message: "Coupon not found", statusCode: 404 };
      CouponService.prototype.findCouponById.mockRejectedValueOnce(error);
      mockReq.params.id = 1;
      await couponController.findCouponById(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon not found",
      });
    });
  });

  describe("updateCoupon", () => {
    it("should return updated coupon", async () => {
      CouponService.prototype.updateCoupon.mockResolvedValueOnce({ id: 1 });
      mockReq.params.id = 1;
      mockReq.body = { code: "NEW" };
      await couponController.updateCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
        message: "Coupon updated successfully",
      });
    });
    it("should handle invalid params error", async () => {
      const error = { message: "Invalid data", statusCode: 400 };
      CouponService.prototype.updateCoupon.mockRejectedValueOnce(error);
      await couponController.updateCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid data",
      });
    });
  });

  describe("deleteCoupon", () => {
    it("should return success message", async () => {
      CouponService.prototype.deleteCoupon.mockResolvedValueOnce({
        message: "Coupon deleted successfully",
      });
      mockReq.params.id = 1;
      await couponController.deleteCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Coupon deleted successfully",
      });
    });
    it("should handle service error on delete", async () => {
      const error = { message: "Not found", statusCode: 404 };
      CouponService.prototype.deleteCoupon.mockRejectedValueOnce(error);
      mockReq.params.id = 999;
      await couponController.deleteCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not found",
      });
    });
  });

  describe("getApplicableCoupons", () => {
    it("should return applicable coupons", async () => {
      CouponService.prototype.getApplicableCoupons.mockResolvedValueOnce([
        { couponId: 1 },
      ]);
      await couponController.getApplicableCoupons(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [{ couponId: 1 }],
        count: 1,
      });
    });
    it("should handle missing cart error", async () => {
      const error = { message: "Cart data missing", statusCode: 400 };
      CouponService.prototype.getApplicableCoupons.mockRejectedValueOnce(error);
      await couponController.getApplicableCoupons(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Cart data missing",
      });
    });
  });

  describe("applyCoupon", () => {
    it("should return updated cart on success", async () => {
      CouponService.prototype.applyCoupon.mockResolvedValueOnce({
        updated_cart: { total_discount: "50.00" },
      });
      mockReq.params.id = 1;
      mockReq.body = { cart: { items: [] } };
      await couponController.applyCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { updated_cart: { total_discount: "50.00" } },
        message: "Coupon applied successfully",
      });
    });
    it("should handle service error for expired coupon", async () => {
      const error = { message: "Invalid or inactive coupon", statusCode: 400 };
      CouponService.prototype.applyCoupon.mockRejectedValueOnce(error);
      mockReq.params.id = 1;
      await couponController.applyCoupon(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or inactive coupon",
      });
    });
  });
});
