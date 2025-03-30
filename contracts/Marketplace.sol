// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IdentityVerification.sol";

contract Marketplace {
    IdentityVerification public immutable identityContract;
    
    struct Product {
        string name;
        uint256 price;
        address seller;
        bool sold;
        uint256 listingTimestamp;
    }

    Product[] public products;
    mapping(uint256 => address) public productBuyers;

    event ProductListed(uint256 indexed productId, string name, uint256 price, address seller);
    event ProductPurchased(uint256 indexed productId, address buyer, uint256 price);
    event ProductRemoved(uint256 indexed productId);
    event FundsWithdrawn(address recipient, uint256 amount);

    modifier onlyVerifiedSeller() {
        require(identityContract.isUserVerified(msg.sender), "Unverified seller");
        require(
            identityContract.getUserRole(msg.sender) == IdentityVerification.UserRole.Seller, 
            "Not a seller"
        );
        _;
    }

    modifier onlyVerifiedBuyer() {
        require(identityContract.isUserVerified(msg.sender), "Unverified buyer");
        require(
            identityContract.getUserRole(msg.sender) == IdentityVerification.UserRole.Buyer,
            "Not a buyer"
        );
        _;
    }

    modifier validProductId(uint256 _productId) {
        require(_productId < products.length, "Invalid product ID");
        _;
    }

    constructor(address _identityContract) {
        require(_identityContract != address(0), "Invalid identity contract");
        identityContract = IdentityVerification(_identityContract);
    }

    function listProduct(string memory _name, uint256 _price) external onlyVerifiedSeller {
        require(bytes(_name).length > 0, "Product name required");
        require(_price > 0, "Price must be > 0");
        
        products.push(Product({
            name: _name,
            price: _price,
            seller: msg.sender,
            sold: false,
            listingTimestamp: block.timestamp
        }));
        
        emit ProductListed(products.length - 1, _name, _price, msg.sender);
    }

    function buyProduct(uint256 _productId) external payable 
        onlyVerifiedBuyer 
        validProductId(_productId) 
    {
        Product storage product = products[_productId];
        
        require(!product.sold, "Product already sold");
        require(msg.value == product.price, "Incorrect payment amount");
        require(msg.sender != product.seller, "Sellers cannot buy their own products");

        product.sold = true;
        productBuyers[_productId] = msg.sender;
        
        (bool success, ) = product.seller.call{value: msg.value}("");
        require(success, "Payment failed");
        
        emit ProductPurchased(_productId, msg.sender, product.price);
    }

    function removeProduct(uint256 _productId) external validProductId(_productId) {
        Product storage product = products[_productId];
        
        require(
            msg.sender == product.seller || 
            msg.sender == address(identityContract),
            "Not authorized"
        );
        require(!product.sold, "Cannot remove sold product");
        
        delete products[_productId];
        emit ProductRemoved(_productId);
    }

    // View functions
    function getProductCount() external view returns (uint256) {
        return products.length;
    }

    function getActiveProducts() external view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < products.length; i++) {
            if (!products[i].sold) activeCount++;
        }
        
        Product[] memory activeProducts = new Product[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < products.length; i++) {
            if (!products[i].sold) {
                activeProducts[index] = products[i];
                index++;
            }
        }
        return activeProducts;
    }
}