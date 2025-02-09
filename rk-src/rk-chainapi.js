// javascript file that interacts with the hardhat network
// to provide apis for user and seller operations
//
// @author: JellibeanTheArgonaut


// Orders are stored in orders table in the database
//
// schema of the orders table
// orderId - the id of the order UUIDv4
// orderAddress - the address of the order contract
// productId - the id of the product UUIDv4
// buyerAddress - the address of the buyer (wallet address)
// orderPlaced - the time when the order was placed
// orderConfirmed - the time when the order was confirmed
// orderCancelled - the time when the order was cancelled
// orderPaid - the time when the order was paid for
// orderRefunded - the time when the order was refunded
