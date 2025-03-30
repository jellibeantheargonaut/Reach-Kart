// solidity smart contract code for a product registry
// SPDX-License-Identifier: UNLICENSED
// @author: JellibeanTheArgonaut

pragma solidity ^0.8.28;

contract ProductRegistry {
    address payable public seller;
    struct Product {
        string name;
        string description;
        uint price;
        uint quantity;
    }
    Product public product;
    string public productId; // uuid for database reference
    uint public rating;


    // enum to represent the status of the product
    enum ProductStatus { Available, SoldOut, Discontinued }
    ProductStatus public status;

    // constructor to create the product registry
    constructor( address payable _seller, string memory _productId,string memory _name, string memory _description, uint _price, uint _quantity) payable {
        seller = _seller;
        product = Product(_name, _description, _price, _quantity);
        productId = _productId;
        status = ProductStatus.Available;
    }

    // events to represent the product status changes
    event ProductAvailable(uint timestamp);
    event ProductSoldOut(uint timestamp);
    event ProductDiscontinued(uint timestamp);

    // getter functions
    function getProductSeller() public view returns(address) {
        return seller;
    }

    function getProductQuantity() public view returns(uint) {
        return product.quantity;
    }

    function getProductPrice() public view returns(uint) {
        return product.price;
    }

    function getProductName() public view returns(string memory) {
        return product.name;
    }

    function getProductDescription() public view returns(string memory) {
        return product.description;
    }

    function getProductRating() public view returns(uint) {
        return rating;
    }

    // setter functions
    function setProductSeller(address payable _seller) public {
        seller = _seller;
    }
    function setProductName(string memory _name) public {
        product.name = _name;
    }
    
    function setProductPrice(uint _price) public {
        product.price = _price;
    }

    function setProductQuantity(uint _quantity) public {
        product.quantity = _quantity;
    }

    function setProductDescription(string memory _description) public {
        product.description = _description;
    }


    // functions to handle the product
    function addProduct(uint qty) public {

        product.quantity += qty;
        status = ProductStatus.Available;

        emit ProductAvailable(block.timestamp);
    }

    function sellProduct(uint qty) public {
        require(status == ProductStatus.Available, "Product is not available");

        if(product.quantity == 0){
            status = ProductStatus.SoldOut;
            emit ProductSoldOut(block.timestamp);
        }
        else{
            product.quantity -= qty;
            if(product.quantity == 0){
                status = ProductStatus.SoldOut;
                emit ProductSoldOut(block.timestamp);
            }
        }
    }

    function discontinueProduct() public {
        require(status != ProductStatus.Discontinued, "Product is already discontinued");

        status = ProductStatus.Discontinued;

        emit ProductDiscontinued(block.timestamp);
    }

    // function to rate the product
    function rateProduct(uint _rating) public {
        require(_rating >= 0 && _rating <= 5, "Rating should be between 0 and 5");

        rating = _rating;
    }

}