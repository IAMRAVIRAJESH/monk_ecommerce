const { Sequelize, Op } = require("sequelize");
const { CouponSchema } = require("../models/couponModel");
const AppError = require("../utils/AppError");

class CouponService {
  async createCoupon(couponData) {
    try {
      if (
        !couponData?.type ||
        !couponData.discount_details ||
        !couponData.conditioning ||
        !couponData.code
      ) {
        throw new AppError("Coupon data is missing", 400);
      }

      if (
        couponData.expiry_date &&
        new Date(couponData.expiry_date) <= new Date()
      ) {
        throw new AppError("Expiry date must be in the future", 400);
      }
      const newCoupon = await CouponSchema.create(couponData);
      return newCoupon;
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async findAllCoupons() {
    try {
      const coupons = await CouponSchema.findAll();
      return coupons;
    } catch (error) {
      throw new AppError(`Cannot fetch coupons. ${error.message}`, 500);
    }
  }

  async findCouponById(id) {
    try {
      const coupon = await CouponSchema.findByPk(id);
      if (!coupon) {
        throw new AppError("Coupon not found", 404);
      }
      return coupon;
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async updateCoupon(id, req) {
    try {
      const form = req;

      const oldCoupon = await CouponSchema.findByPk(id);
      if (!oldCoupon) {
        throw new AppError("Coupon not found", 404);
      }
      if (form?.expiry_date && new Date(form.expiry_date) <= new Date()) {
        throw new AppError("Expiry date must be in the future", 400);
      }

      const discount_details =
        form.discount_details || oldCoupon.discount_details;
      const conditions = form.conditioning || oldCoupon.conditioning;
      const code = form.code || oldCoupon.code;
      const expiry_date = form.expiry_date || oldCoupon.expiry_date;

      const updatedValue = {
        discount_details,
        conditions,
        expiry_date,
        code,
      };
      await CouponSchema.update(updatedValue, {
        where: { id: id },
      });
      const updatedCoupon = await CouponSchema.findByPk(id);
      return updatedCoupon;
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async deleteCoupon(id) {
    try {
      const coupon = await CouponSchema.findByPk(id);
      if (!coupon) {
        throw new AppError("Coupon not found", 404);
      }
      const deleted = await CouponSchema.destroy({
        where: { id: id },
      });
      if (deleted) {
        return { message: "Coupon deleted successfully" };
      }
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getApplicableCoupons(req) {
    try {
      const form = req;
      if (!form) {
        throw new AppError("Cart data is missing or empty", 400);
      }
      let totalAmount = 0;
      let discountAmount = 0;

      let id = [];
      for (const item of form.cart.items) {
        totalAmount += item.price * item.quantity;
        id.push(item.productId);
      }

      const getCoupons = await CouponSchema.findAll({
        where: {
          [Op.or]: [
            { "conditioning.minCartValue": { [Op.lte]: totalAmount } },
            { "conditioning.productId": { [Op.in]: id } },
            Sequelize.literal(
              `JSON_OVERLAPS(discount_details->'$.buyIds', CAST('${JSON.stringify(id)}' AS JSON))`,
            ),
          ],
          [Op.and]: [{ expiry_date: { [Op.gte]: new Date() } }],
        },
      });
      const applicableCoupons = getCoupons.filter((coupon) => {
        if (coupon.type !== "BxGy") return true;

        const buyIds = coupon.discount_details.buyIds;
        const minBuy = coupon.conditioning.buy;

        let totalBuyQty = 0;
        for (const item of form.cart.items) {
          if (buyIds.includes(item.productId)) {
            totalBuyQty += item.quantity;
          }
        }

        return totalBuyQty >= minBuy;
      });

      const couponDiscounts = applicableCoupons.map((coupon) => {
        discountAmount = 0;
        if (coupon.type == "cart-wise") {
          discountAmount = totalAmount * (coupon.discount_details.value / 100);
          discountAmount = Math.min(
            discountAmount,
            coupon.discount_details.discountAmountMax,
          );
        } else if (coupon.type == "product-wise") {
          let curr = 0;
          discountAmount = 0;
          //I'm assuming I have to apply discount on total number of products X added in the cart if there is discount on productId X (subject to MaxdiscountAmount).
          for (const item of form.cart.items) {
            if (item.productId == coupon.conditioning.productId)
              curr = item.price * item.quantity;
          }
          discountAmount = curr * (coupon.discount_details.value / 100);
          discountAmount = Math.min(
            discountAmount,
            coupon.discount_details.discountAmountMax,
          );
        } else if (coupon.type == "BxGy") {
          let buyCount = 0;
          let getItems = [];
          discountAmount = 0;

          for (const item of form.cart.items) {
            if (coupon.discount_details.buyIds.includes(item.productId)) {
              buyCount += item.quantity;
            } else if (
              coupon.discount_details.getIds.includes(item.productId)
            ) {
              for (let i = 0; i < item.quantity; i++) {
                getItems.push(item.price);
              }
            }
          }

          const timesOfferCanApply = Math.min(
            Math.floor(buyCount / coupon.conditioning.buy) *
              coupon.conditioning.get,
            coupon.discount_details.maxRedemption,
            getItems.length,
          );

          if (timesOfferCanApply > 0) {
            // Sorting getItems in increasing order to apply discount on cheapest items
            getItems.sort((a, b) => a - b);

            for (const i in timesOfferCanApply) {
              discountAmount += getItems[i];
            }
          }
        }
        return {
          couponId: coupon.id,
          couponType: coupon.type,
          discount: discountAmount.toFixed(2),
        };
      });

      return couponDiscounts;
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async applyCoupon(id, req) {
    try {
      if (!req) {
        throw new AppError("Cart data is missing or empty", 400);
      }
      const coupon = await CouponSchema.findByPk(id);
      const form = req;

      if (new Date(coupon.expiry_date) < new Date()) {
        throw new AppError("Invalid or inactive coupon", 400);
      }

      let totalAmount = 0;
      for (const item of form.cart.items) {
        totalAmount += item.price * item.quantity;
      }

      let discountAmount = 0;
      if (
        coupon.type == "cart-wise" &&
        totalAmount >= coupon.conditioning.minCartValue
      ) {
        discountAmount = totalAmount * (coupon.discount_details.value / 100);
        discountAmount = Math.min(
          discountAmount,
          coupon.discount_details.discountAmountMax,
        );
      } else if (coupon.type == "product-wise") {
        let curr = 0;
        //I'm assuming I have to apply discount on total number of products X added in the cart if there is discount on productId X (subject to MaxdiscountAmount).
        for (const item of form.cart.items) {
          if (item.productId === coupon.conditioning.productId)
            curr = item.price * item.quantity;
        }
        discountAmount = curr * (coupon.discount_details.value / 100);
        discountAmount = Math.min(
          discountAmount,
          coupon.discount_details.discountAmountMax,
        );
      } else if (coupon.type == "BxGy") {
        let buyCount = 0;
        let getItems = [];

        for (const item of form.cart.items) {
          if (coupon.discount_details.buyIds.includes(item.productId)) {
            buyCount += item.quantity;
          } else if (coupon.discount_details.getIds.includes(item.productId)) {
            for (let i = 0; i < item.quantity; i++) {
              getItems.push(item.price);
            }
          }
        }

        const timesOfferCanApply = Math.min(
          Math.floor(buyCount / coupon.conditioning.buy) *
            coupon.conditioning.get,
          coupon.discount_details.maxRedemption,
          getItems.length,
        );

        if (timesOfferCanApply > 0) {
          // Sorting getItems in increasing order to apply discount on the cheapest items first
          getItems.sort((a, b) => a - b);

          for (let i = 0; i < timesOfferCanApply; i++) {
            discountAmount += getItems[i];
          }
        }
      }

      return {
        updated_cart: {
          items: form.cart.items,
          total_price: totalAmount.toFixed(2),
          total_discount: discountAmount.toFixed(2),
          final_price: (totalAmount - discountAmount).toFixed(2),
        },
      };
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
}

module.exports = CouponService;
