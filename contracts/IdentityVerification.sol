// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IdentityVerification {
    address public admin;
    
    enum UserRole { None, Buyer, Seller }
    
    struct User {
        string name;
        string idNumber;
        bool isVerified;
        UserRole role;
        uint256 registrationDate;
        uint256 verificationDate;
    }

    mapping(address => User) public users;
    mapping(string => bool) private isIdNumberUsed;

    event UserRegistered(address indexed user, string name, UserRole role);
    event UserVerified(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyUnverifiedUsers() {
        require(!users[msg.sender].isVerified, "User already verified");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function register(
        string memory _name, 
        string memory _idNumber, 
        UserRole _role
    ) public onlyUnverifiedUsers {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 100, "Name too long");
        require(bytes(_idNumber).length > 0, "ID number cannot be empty");
        require(!isIdNumberUsed[_idNumber], "ID number already registered");
        require(_role == UserRole.Buyer || _role == UserRole.Seller, "Invalid role");

        users[msg.sender] = User({
            name: _name,
            idNumber: _idNumber,
            isVerified: false,
            role: _role,
            registrationDate: block.timestamp,
            verificationDate: 0
        });
        
        isIdNumberUsed[_idNumber] = true;
        emit UserRegistered(msg.sender, _name, _role);
    }

    function verifyUser(address _user) public onlyAdmin {
        require(bytes(users[_user].name).length > 0, "User not found");
        require(!users[_user].isVerified, "User already verified");
        
        users[_user].isVerified = true;
        users[_user].verificationDate = block.timestamp;
        emit UserVerified(_user);
    }

    // View functions
    function getUserDetails(address _user) public view returns (
        string memory,
        string memory,
        bool,
        UserRole,
        uint256,
        uint256
    ) {
        User memory user = users[_user];
        return (
            user.name,
            user.idNumber,
            user.isVerified,
            user.role,
            user.registrationDate,
            user.verificationDate
        );
    }

    function isUserVerified(address _user) public view returns (bool) {
        return users[_user].isVerified;
    }

    function getUserRole(address _user) public view returns (UserRole) {
        return users[_user].role;
    }
}
