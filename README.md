# E-commerce API
API is deployed at https://nodogoro.herokuapp.com
## Authentication
 - Creat a new user account by sending a request to **/user/signup**.
 - Login to an existing user account by sending a request to **/user/login**.
 - Save the received token to use it with subsequent requests.
 - User info can be updated by sending a request to **/user/update**.
## Orders
To place, pay or delete an order. an authentication token has to be included in request headers as **user-token**.
- To place a new order, send a request to **/order/create**. Order status will be **pending**.
- To delete a pending order, send a request to **/order/delete/[order-id]**, where **[order-id]** is the id of the order you want to delete.
- View all orders through **/order**. Supply optional query parameters such as **status** to filter by status, **limit** and **after_id** to use pagination.
-  To pay for a pending order, send a request to **/order/pay/[order-id]**, where **[order-id]** is the id of the order you want to pay for. 
	- The response will redirect you to Stripe checkout page. 
	- Order status will be changed to **paymentProcessing**.
	- If the payment is successful on Stripe, the order status will be changed to **Paid**.
