# Monk Commerce

An e-commerce service for coupon management.

## Features included

- Identifying the applicable coupons and appplying them on the basis of items in the cart.

## Tech Stacks used

- Node.js (Runtime environment)
- JavaScript (Scirpting Language)
- Express.js (Framework)
- MySQL with Sequelize ORM (database)

## API testing-

I have added postman request file in the root directory of this project which contains all the APIs with sample request, you can import, edit and test APIs from there.

## Implemented cases

I have implemented APIs for the following-

- POST /coupons: We can create a new coupon by filling all the data in the request body, if any data is missing the
  API will not work and throw respective error.
- GET /coupons: It will retrieve all coupons no parameter or filters needed.
- GET /coupons/{id}: It will retrieve a specific coupon by its ID, we have to pass ID as parameter in URL itself.
- PUT /coupons/{id}: It will retrieve and update a specific coupon by its ID, we have to pass ID as parameter in
  URL itself.
- DELETE /coupons/{id}: It will retrieve and delete a specific coupon by its ID, we have to pass ID as parameter in
  URL itself.
- POST /applicable-coupons: It will fetch all applicable coupons for the cart and calculate the total discount
  that will be applied by each coupon.
- POST /apply-coupon/{id}: It will apply a specific coupon based on the provided ID to the cart and return the
  updated cart with discounted price.
- Apart from above mentioned functionalities there are error checks applied on all the APIs for nil/unexpected/
  undefined values and basic error handling has been implemented by creating an AppError class that extends the base error class.
- I have maintained code quality by using prettier for code formatting and eslint for code quality.

## Unimplemented cases

- We can partner with debit/credit card and paylater providers, and give discount coupons on using certain payment
  methods, and in return we can charge from those payment method providers.
- We can also add discount coupons for our loyal customers by offering them extra discount once in a while.
- Coupons can be also be applied to any customer, city or state depending on thier loyalty or interest in our
  product.
- We can give coupons to customers according to their regional festivals too, as everyone spend a lot in shopping
  on festivals no matter rich or poor.
- Coupons can also be given to customers who have signed up but not using our product that much, means they show up
  once in a while to keep thier interest in our product.
- Coupons can be given in parts, like 25% on 1st 2 orders and 50% on 3rd order.
- There should be small coupons on daily basis, kind of deal of the day, these will keep the customers interested in
  our product.
- Coupons should be given in such a way that the seller also contributes to part of it.

## Limitations and assumptions

- For the product-wise coupon I'm assuming I have to apply Y % of discount on total number of products X added in
  the cart if there is certain discount on product X (subject to max discount amount). For example, price of X is 50 and customer added 6 units that is 50\*6 = 300 total amount and max discount amount is 100, so even the discount is 50% that equates to 150 rupess, I will give only 100 rupees discount as that is the maximum amount threshold for that coupon.
- For the BxGy coupon I'm not giving any discounts if there is no product added from 2nd array, I will only give
  the items for free if the items are added and that too minimum of (maxRedemption, eligible items added from the 2nd array).
- For the cart-wise I'm applying discounts only if the total cart amount equals or exceeds the threshold amount
  mentioned in the coupon.
