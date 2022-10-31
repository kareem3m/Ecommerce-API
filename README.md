# E-commerce API
API is deployed at https://nodogoro.herokuapp.com
## Authentication
 - Creat a new user account at **/user/signup**.
 - Login to an existing user account at **/user/login**.
 - Save the received token to use it with subsequent requests.
 - User info can be updated at **/user/update**.
## Orders
To place, pay or delete an order. include an authentication in request headers as **user-token**.
- Place a new order at **/order/create**. Order status will be **pending**.
- Delete a pending order at **/order/delete/[order-id]**, where **[order-id]** is the id of the order you want to delete.
- View all orders at **/order**. Supply optional query parameters such as **status** to filter by status, **limit** and **after_id** to use pagination.
- Pay for a pending order at **/order/pay/[order-id]**, where **[order-id]** is the id of the order you want to pay for. 
	- The response will redirect you to Stripe checkout page. 
	- Order status will be changed to **paymentProcessing**.
	- If the payment is successful on Stripe, the order status will be changed to **Paid**.
