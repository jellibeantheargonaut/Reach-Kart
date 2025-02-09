// solidity smart contract code for an order

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// @author: JellibeanTheArgonaut

contract Order {
    uint public orderTime;
    address payable public seller;
    address payable public buyer;
    string public orderId;
    uint public orderAmount;

    // enum to represent the status of the order
    enum OrderStatus { Placed, Pending, Paid, Shipped, Delivered, Cancelled, Refunded, Returned }
    OrderStatus public status;

    // mappings
    mapping(OrderStatus => string) public statusMessages;
    // events to represent the order status changes
    event OrderPlaced(uint timestamp);
    event OrderPaid(uint timestamp);
    event OrderShipped(uint timestamp);
    event OrderDelivered(uint timestamp);
    event OrderCancelled(uint timestamp);
    event OrderRefunded(uint timestamp);
    event OrderReturned(uint timestamp);

    // constructor to create the order
    constructor(uint _orderTime, address payable _seller, address payable _buyer,string memory _orderId, uint _orderAmount) payable {
        require(
            block.timestamp < _orderTime,
            "Order time should be in the future"
        );

        orderTime = _orderTime;
        seller = _seller;
        buyer = _buyer;
        orderAmount = _orderAmount;
        orderId = _orderId;
        status = OrderStatus.Placed;

        statusMessages[OrderStatus.Placed] = "Placed";
        statusMessages[OrderStatus.Pending] = "Pending";
        statusMessages[OrderStatus.Paid] = "Paid";
        statusMessages[OrderStatus.Shipped] = "Shipped";
        statusMessages[OrderStatus.Delivered] = "Delivered";
        statusMessages[OrderStatus.Cancelled] = "Cancelled";
        statusMessages[OrderStatus.Refunded] = "Refunded";
        statusMessages[OrderStatus.Returned] = "Returned";
    }

    // functions to handle the order
    function confirmOrder() public {
        require(status == OrderStatus.Placed, "Order is not placed");
        status = OrderStatus.Pending;

        emit OrderPlaced(block.timestamp);
    }

    function payAmount() public payable {
        require(status == OrderStatus.Pending, "Order is not pending");

        status = OrderStatus.Paid;
        seller.transfer(orderAmount);
        emit OrderPaid(block.timestamp);
    }

    function cancelOrder() public {
        require(status == OrderStatus.Placed || status == OrderStatus.Pending, "Order is not placed or pending");

        status = OrderStatus.Cancelled;

        emit OrderCancelled(block.timestamp);
    }

    function returnOrder() public {
        require(status == OrderStatus.Delivered, "Order is not delivered");

        status = OrderStatus.Returned;

        emit OrderReturned(block.timestamp);
    }

    function shipOrder() public {
        require(status == OrderStatus.Paid, "Order is not paid");

        status = OrderStatus.Shipped;

        emit OrderShipped(block.timestamp);
    }

    function confirmDelivery() public {
        require(status == OrderStatus.Shipped, "Order is not shipped");

        status = OrderStatus.Delivered;

        emit OrderDelivered(block.timestamp);
    }

    function getRefund() public payable{
        require(status == OrderStatus.Cancelled || status == OrderStatus.Returned, "Order is not cancelled or returned");
        status = OrderStatus.Refunded;
        buyer.transfer(orderAmount);
        emit OrderRefunded(block.timestamp);
    }

    function getStatus() public view returns(string memory) {
        return statusMessages[status];
    }
}