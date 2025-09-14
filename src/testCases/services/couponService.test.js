const { CouponSchema } = require("../../models/couponModel");
const CouponService = require("../../services/couponService");
const AppError = require("../../utils/AppError");

jest.mock("../../models/couponModel", () => ({
  CouponSchema: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe("CouponService", () => {
  let couponService;

  beforeEach(() => {
    couponService = new CouponService();
    jest.clearAllMocks();
  });

  describe("createCoupon", () => {
    it("should successfully create a new coupon", async () => {
      const couponData = {
        type: "cart-wise",
        discount_details: {
          type: "percentage",
          value: 10,
          discountAmountMax: "50",
        },
        conditioning: { minCartValue: 100 },
        code: "CART100",
        expiry_date: "2025-12-31",
      };

      const mockCoupon = { id: 1, ...couponData };
      CouponSchema.create.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.createCoupon(couponData);

      expect(CouponSchema.create).toHaveBeenCalledWith(couponData);
      expect(result).toEqual(mockCoupon);
    });

    it("should throw AppError for missing required fields", async () => {
      const incompleteCouponData = {
        type: "cart-wise",
      };

      await expect(
        couponService.createCoupon(incompleteCouponData),
      ).rejects.toThrow(AppError);

      expect(CouponSchema.create).not.toHaveBeenCalled();
    });

    it("should throw AppError for past expiry date", async () => {
      const couponData = {
        type: "cart-wise",
        discount_details: { value: 10 },
        conditioning: { minCartValue: 100 },
        code: "CART100",
        expiry_date: "2020-01-01",
      };

      await expect(couponService.createCoupon(couponData)).rejects.toThrow(
        AppError,
      );

      expect(CouponSchema.create).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const couponData = {
        type: "cart-wise",
        discount_details: { value: 10 },
        conditioning: { minCartValue: 100 },
        code: "CART100",
      };

      CouponSchema.create.mockRejectedValueOnce(new Error("Database error"));

      await expect(couponService.createCoupon(couponData)).rejects.toThrow(
        AppError,
      );
    });
  });

  describe("findAllCoupons", () => {
    it("should return all coupons", async () => {
      const mockCoupons = [
        { id: 1, type: "cart-wise", code: "CART100" },
        { id: 2, type: "product-wise", code: "PROD50" },
      ];

      CouponSchema.findAll.mockResolvedValueOnce(mockCoupons);

      const result = await couponService.findAllCoupons();

      expect(CouponSchema.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCoupons);
    });

    it("should handle database errors", async () => {
      CouponSchema.findAll.mockRejectedValueOnce(new Error("Database error"));

      await expect(couponService.findAllCoupons()).rejects.toThrow(
        "Cannot fetch coupons. Database error",
      );
    });
  });

  describe("findCouponById", () => {
    it("should return coupon by ID", async () => {
      const mockCoupon = { id: 1, type: "cart-wise", code: "CART100" };
      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.findCouponById(1);

      expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCoupon);
    });

    it("should throw AppError when coupon not found", async () => {
      CouponSchema.findByPk.mockResolvedValueOnce(null);

      await expect(couponService.findCouponById(1)).rejects.toThrow(AppError);
    });

    it("should preserve AppError status codes", async () => {
      CouponSchema.findByPk.mockResolvedValueOnce(null);

      try {
        await couponService.findCouponById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe("updateCoupon", () => {
    it("should successfully update a coupon", async () => {
      const oldCoupon = {
        id: 1,
        type: "cart-wise",
        discount_details: { value: 10 },
        conditioning: { minCartValue: 100 },
        code: "OLD_CODE",
        expiry_date: "2025-12-31",
      };

      const updateData = {
        discount_details: { value: 15 },
        code: "NEW_CODE",
      };

      const updatedCoupon = { ...oldCoupon, ...updateData };

      CouponSchema.findByPk.mockResolvedValueOnce(oldCoupon);
      CouponSchema.update.mockResolvedValueOnce([1]);
      CouponSchema.findByPk.mockResolvedValueOnce(updatedCoupon);

      const result = await couponService.updateCoupon(1, updateData);

      expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
      expect(CouponSchema.update).toHaveBeenCalledWith(
        expect.objectContaining({
          discount_details: { value: 15 },
          code: "NEW_CODE",
        }),
        { where: { id: 1 } },
      );
      expect(result).toEqual(updatedCoupon);
    });

    it("should throw AppError when coupon not found", async () => {
      CouponSchema.findByPk.mockResolvedValueOnce(null);

      await expect(couponService.updateCoupon(1, {})).rejects.toThrow(AppError);
    });

    it("should throw AppError for past expiry date", async () => {
      const oldCoupon = { id: 1, expiry_date: "2025-12-31" };
      CouponSchema.findByPk.mockResolvedValueOnce(oldCoupon);

      const updateData = { expiry_date: "2020-01-01" };

      await expect(couponService.updateCoupon(1, updateData)).rejects.toThrow(
        AppError,
      );
    });

    it("should preserve existing values when not provided", async () => {
      const oldCoupon = {
        id: 1,
        discount_details: { value: 10 },
        conditioning: { minCartValue: 100 },
        code: "OLD_CODE",
        expiry_date: "2025-12-31",
      };

      const updateData = { code: "NEW_CODE" };

      CouponSchema.findByPk.mockResolvedValueOnce(oldCoupon);
      CouponSchema.update.mockResolvedValueOnce([1]);
      CouponSchema.findByPk.mockResolvedValueOnce({
        ...oldCoupon,
        code: "NEW_CODE",
      });

      await couponService.updateCoupon(1, updateData);

      expect(CouponSchema.update).toHaveBeenCalledWith(
        expect.objectContaining({
          discount_details: { value: 10 },
          conditions: { minCartValue: 100 },
          code: "NEW_CODE",
          expiry_date: "2025-12-31",
        }),
        { where: { id: 1 } },
      );
    });
  });

  describe("deleteCoupon", () => {
    it("should successfully delete a coupon", async () => {
      const mockCoupon = { id: 1, code: "TEST" };
      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);
      CouponSchema.destroy.mockResolvedValueOnce(1);

      const result = await couponService.deleteCoupon(1);

      expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
      expect(CouponSchema.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: "Coupon deleted successfully" });
    });

    it("should throw AppError when coupon not found", async () => {
      CouponSchema.findByPk.mockResolvedValueOnce(null);

      await expect(couponService.deleteCoupon(1)).rejects.toThrow(AppError);
    });

    it("should handle database errors", async () => {
      CouponSchema.findByPk.mockRejectedValueOnce(new Error("Database error"));

      await expect(couponService.deleteCoupon(1)).rejects.toThrow(AppError);
    });
  });

  describe("getApplicableCoupons", () => {
    const mockCartData = {
      cart: {
        items: [
          { productId: 1, price: 100, quantity: 2 },
          { productId: 2, price: 50, quantity: 1 },
        ],
      },
    };

    it("should return applicable cart-wise coupons", async () => {
      const mockCoupons = [
        {
          id: 1,
          type: "cart-wise",
          discount_details: { value: 10, discountAmountMax: 50 },
          conditioning: { minCartValue: 200 },
          expiry_date: "2025-12-31",
        },
      ];

      CouponSchema.findAll.mockResolvedValueOnce(mockCoupons);

      const result = await couponService.getApplicableCoupons(mockCartData);

      expect(result).toHaveArray();
      expect(result[0]).toMatchObject({
        couponId: 1,
        couponType: "cart-wise",
        discount: expect.any(String),
      });
    });

    it("should return applicable product-wise coupons", async () => {
      const mockCoupons = [
        {
          id: 2,
          type: "product-wise",
          discount_details: { value: 20, discountAmountMax: 40 },
          conditioning: { productId: 1 },
          expiry_date: "2025-12-31",
        },
      ];

      CouponSchema.findAll.mockResolvedValueOnce(mockCoupons);

      const result = await couponService.getApplicableCoupons(mockCartData);

      expect(result).toHaveArray();
      expect(result[0]).toMatchObject({
        couponId: 2,
        couponType: "product-wise",
        discount: expect.any(String),
      });
    });

    it("should return applicable BxGy coupons", async () => {
      const mockCoupons = [
        {
          id: 3,
          type: "BxGy",
          discount_details: {
            buyIds: [1],
            getIds: [2],
            maxRedemption: 1,
          },
          conditioning: { buy: 1, get: 1 },
          expiry_date: "2025-12-31",
        },
      ];

      CouponSchema.findAll.mockResolvedValueOnce(mockCoupons);

      const result = await couponService.getApplicableCoupons(mockCartData);

      expect(result).toHaveArray();
      expect(result[0]).toMatchObject({
        couponId: 3,
        couponType: "BxGy",
        discount: expect.any(String),
      });
    });

    it("should filter out BxGy coupons that don't meet minimum buy requirement", async () => {
      const mockCoupons = [
        {
          id: 4,
          type: "BxGy",
          discount_details: {
            buyIds: [3],
            getIds: [2],
            maxRedemption: 1,
          },
          conditioning: { buy: 1, get: 1 },
          expiry_date: "2025-12-31",
        },
      ];

      CouponSchema.findAll.mockResolvedValueOnce(mockCoupons);

      const result = await couponService.getApplicableCoupons(mockCartData);

      expect(result).toEqual([]);
    });

    it("should throw AppError for missing cart data", async () => {
      await expect(couponService.getApplicableCoupons(null)).rejects.toThrow(
        AppError,
      );
    });
  });

  describe("applyCoupon", () => {
    const mockCartData = {
      cart: {
        items: [
          { productId: 1, price: 100, quantity: 1 },
          { productId: 2, price: 50, quantity: 2 },
        ],
      },
    };

    it("should apply cart-wise coupon correctly", async () => {
      const mockCoupon = {
        id: 1,
        type: "cart-wise",
        discount_details: { value: 10, discountAmountMax: 50 },
        conditioning: { minCartValue: 150 },
        expiry_date: "2025-12-31",
      };

      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.applyCoupon(1, mockCartData);

      expect(result).toMatchObject({
        updated_cart: {
          items: mockCartData.cart.items,
          total_price: "200.00",
          total_discount: "20.00",
          final_price: "180.00",
        },
      });
    });

    it("should apply product-wise coupon correctly", async () => {
      const mockCoupon = {
        id: 2,
        type: "product-wise",
        discount_details: { value: 20, discountAmountMax: 30 },
        conditioning: { productId: 1 },
        expiry_date: "2025-12-31",
      };

      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.applyCoupon(2, mockCartData);

      expect(result).toMatchObject({
        updated_cart: {
          total_discount: "20.00",
        },
      });
    });

    it("should apply BxGy coupon correctly", async () => {
      const mockCoupon = {
        id: 3,
        type: "BxGy",
        discount_details: {
          buyIds: [1],
          getIds: [2],
          maxRedemption: 2,
        },
        conditioning: { buy: 1, get: 1 },
        expiry_date: "2025-12-31",
      };

      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.applyCoupon(3, mockCartData);

      expect(result).toMatchObject({
        updated_cart: {
          total_discount: "50.00",
        },
      });
    });

    it("should throw AppError for expired coupon", async () => {
      const expiredCoupon = {
        id: 1,
        type: "cart-wise",
        expiry_date: "2020-01-01",
      };

      CouponSchema.findByPk.mockResolvedValueOnce(expiredCoupon);

      await expect(couponService.applyCoupon(1, mockCartData)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw AppError for missing cart data", async () => {
      await expect(couponService.applyCoupon(1, null)).rejects.toThrow(
        AppError,
      );
    });

    it("should handle cart-wise coupon that doesn't meet minimum cart value", async () => {
      const mockCoupon = {
        id: 1,
        type: "cart-wise",
        discount_details: { value: 10, discountAmountMax: 50 },
        conditioning: { minCartValue: 1000 },
        expiry_date: "2025-12-31",
      };

      CouponSchema.findByPk.mockResolvedValueOnce(mockCoupon);

      const result = await couponService.applyCoupon(1, mockCartData);

      expect(result).toMatchObject({
        updated_cart: {
          total_discount: "0.00",
        },
      });
    });
  });
});

expect.extend({
  toHaveArray() {
    return {
      pass: true,
      message: () => "expected value to be an array",
    };
  },
});
