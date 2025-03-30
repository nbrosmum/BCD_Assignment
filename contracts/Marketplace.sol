// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IdentityVerification.sol";

contract Marketplace {
    IdentityVerification identityContract;
    address public admin;

    struct Product {
        string name;
        uint256 price;
        address seller;
        bool sold;
    }

    Product[] public products;

    event ProductListed(uint256 indexed productId, string name, uint256 price, address seller);
    event ProductPurchased(uint256 indexed productId, address buyer);

    modifier onlyVerifiedSeller() {
        require(identityContract.isUserVerified(msg.sender), "Seller must be verified");
        require(identityContract.getUserRole(msg.sender) == IdentityVerification.UserRole.Seller, "Must be a seller");
        _;
    }

    modifier onlyVerifiedBuyer() {
        require(identityContract.isUserVerified(msg.sender), "Buyer must be verified");
        require(identityContract.getUserRole(msg.sender) == IdentityVerification.UserRole.Buyer, "Must be a buyer");
        _;
    }

    constructor(address _identityContract) {
        identityContract = IdentityVerification(_identityContract);
        admin = msg.sender;
    }

    function listProduct(string memory _name, uint256 _price) public onlyVerifiedSeller {
        products.push(Product(_name, _price, msg.sender, false));
        uint256 productId = products.length - 1;
        emit ProductListed(productId, _name, _price, msg.sender);
    }

    function buyProduct(uint256 _productId) public payable onlyVerifiedBuyer {
        require(_productId < products.length, "Invalid product ID");
        Product storage product = products[_productId];
        require(!product.sold, "Product already sold");
        require(msg.value >= product.price, "Insufficient funds");

        payable(product.seller).transfer(product.price);
        product.sold = true;

        emit ProductPurchased(_productId, msg.sender);
    }

    function getProduct(uint256 _productId) public view returns (string memory, uint256, address, bool) {
        require(_productId < products.length, "Invalid product ID");
        Product memory product = products[_productId];
        return (product.name, product.price, product.seller, product.sold);
    }

    function getAllProducts() public view returns (Product[] memory) {
        return products;
    }
}
