// solidity smart contract code for an order

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// @author: JellibeanTheArgonaut

contract Order {
    uint public orderTime;
    address payable public seller;
    address payable public buyer;
    string public orderId; // uuid for database reference
    uint public orderAmount;
    uint public orderQuantity;
    string public orderDeliveryAddress; // address uuid of the buyer for delivery

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
    constructor(uint _orderTime, address payable _seller, 
                address payable _buyer,string memory _orderId, uint _orderAmount, 
                uint _orderQuantity, string memory _orderDeliveryAddress) payable {
        require(
            block.timestamp < _orderTime,
            "Order time should be in the future"
        );

        orderTime = _orderTime;
        seller = _seller;
        buyer = _buyer;
        orderAmount = _orderAmount;
        orderQuantity = _orderQuantity;
        orderId = _orderId;
        status = OrderStatus.Placed;
        orderDeliveryAddress = _orderDeliveryAddress;


        statusMessages[OrderStatus.Placed] = "Placed";
        statusMessages[OrderStatus.Pending] = "Pending";
        statusMessages[OrderStatus.Paid] = "Paid";
        statusMessages[OrderStatus.Shipped] = "Shipped";
        statusMessages[OrderStatus.Delivered] = "Delivered";
        statusMessages[OrderStatus.Cancelled] = "Cancelled";
        statusMessages[OrderStatus.Refunded] = "Refunded";
        statusMessages[OrderStatus.Returned] = "Returned";
    }

    // getter functions
    function getOrderSeller() public view returns(address) {
        return seller;
    }

    function getOrderBuyer() public view returns(address) {
        return buyer;
    }

    function getOrderAmount() public view returns(uint) {
        return orderAmount;
    }
    
    function getOrderQuantity() public view returns(uint) {
        return orderQuantity;
    }

    function getOrderDeliveryAddress() public view returns(string memory) {
        return orderDeliveryAddress;
    }

    // setter function to change the buyer or seller
    function updateBuyer(address payable _buyer) public {
        buyer = _buyer;
    }

    function updateSeller(address payable _seller) public {
        seller = _seller;
    }
}