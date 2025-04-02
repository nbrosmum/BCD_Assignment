// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IdentityVerification.sol";

contract Marketplace {
    struct Product {
        uint id;
        string name;
        uint price;
        address payable seller;
        bool isSold;
    }

    IdentityVerification public identityVerification;
    mapping(uint => Product) public products;
    uint public productCount;

    event ProductListed(uint productId, string name, uint price, address seller);
    event ProductPurchased(uint productId, address buyer);

    modifier onlyVerifiedUser() {
        require(identityVerification.isUserVerified(msg.sender), "User must be verified to participate");
        _;
    }

    constructor(address _identityVerificationAddress) {
        identityVerification = IdentityVerification(_identityVerificationAddress);
    }

    function listProduct(string memory _name, uint _price) public onlyVerifiedUser {
        require(_price > 0, "Price must be greater than zero");
        productCount++;
        products[productCount] = Product(productCount, _name, _price, payable(msg.sender), false);
        emit ProductListed(productCount, _name, _price, msg.sender);
    }

    function purchaseProduct(uint _productId) public payable onlyVerifiedUser {
        Product storage product = products[_productId];
        require(product.id > 0 && product.id <= productCount, "Product does not exist");
        require(!product.isSold, "Product already sold");
        require(msg.value == product.price, "Incorrect payment amount");
        require(msg.sender != product.seller, "Seller cannot buy own product");
        
        product.seller.transfer(msg.value);
        product.isSold = true;
        emit ProductPurchased(_productId, msg.sender);
    }
}
