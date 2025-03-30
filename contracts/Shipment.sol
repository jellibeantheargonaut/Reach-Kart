// solidity smart contract code for a shipment

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// @author: JellibeanTheArgonaut

contract Shipment {
    uint public shipmentTime;
    string public shipmentId; // uuid for database reference
    string public orderId; // uuid for database reference
    string public buyerMail;
    string public sellerMail;
    string public sourceAddress;
    string public destinationAddress;

    enum ShipmentStatus { Pending, Shipped, Delivered, Cancelled, Returned }
    ShipmentStatus public status;

    mapping(ShipmentStatus => string) public statusMessages;

    // constuctor to create the shipment
    constructor(uint _shipmentTime, string memory _shipmentId, string memory _orderId, string memory _buyerMail, string memory _sellerMail, string memory _sourceAddress, string memory _destinationAddress) {
        require(
            block.timestamp < _shipmentTime,
            "Shipment time should be in the future"
        );

        shipmentTime = _shipmentTime;
        shipmentId = _shipmentId;
        orderId = _orderId;
        buyerMail = _buyerMail;
        sellerMail = _sellerMail;
        sourceAddress = _sourceAddress;
        destinationAddress = _destinationAddress;
        status = ShipmentStatus.Pending;

        statusMessages[ShipmentStatus.Pending] = "Pending";
        statusMessages[ShipmentStatus.Shipped] = "Shipped";
        statusMessages[ShipmentStatus.Delivered] = "Delivered";
        statusMessages[ShipmentStatus.Cancelled] = "Cancelled";
        statusMessages[ShipmentStatus.Returned] = "Returned";
    }

    // getter functions
    function getShipmentId() public view returns(string memory) {
        return shipmentId;
    }

    function getShipmentOrder() public view returns(string memory) {
        return orderId;
    }

    function getShipmentBuyer() public view returns(string memory) {
        return buyerMail;
    }

    function getShipmentSeller() public view returns(string memory) {
        return sellerMail;
    }

    function getShipmentSource() public view returns(string memory) {
        return sourceAddress;
    }

    function getShipmentDestination() public view returns(string memory) {
        return destinationAddress;
    }

    function getShipmentStatus() public view returns(string memory) {
        return statusMessages[status];
    }

    // setter functions
    function ship() public{
        require(
            status == ShipmentStatus.Pending,
            "Shipment is not pending"
        );

        status = ShipmentStatus.Shipped;
    }

    function confirmDelivery() public {
        require(
            status == ShipmentStatus.Shipped,
            "Shipment is not shipped"
        );

        status = ShipmentStatus.Delivered;
    }

    function cancelShipment() public {
        require( status == ShipmentStatus.Pending || status == ShipmentStatus.Shipped, "Shipment is not pending or shipped");

        status = ShipmentStatus.Cancelled;
    }

    function returnShipment() public {
        require(
            status == ShipmentStatus.Delivered,
            "Shipment is not delivered"
        );

        status = ShipmentStatus.Returned;
    }
}