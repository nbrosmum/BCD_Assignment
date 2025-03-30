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
    }

    mapping(address => User) public users;

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
        admin = msg.sender; // Contract deployer is the admin
    }

    function register(string memory _name, string memory _idNumber, UserRole _role) public onlyUnverifiedUsers {
        require(_role == UserRole.Buyer || _role == UserRole.Seller, "Invalid role");

        users[msg.sender] = User(_name, _idNumber, false, _role);
        emit UserRegistered(msg.sender, _name, _role);
    }

    function verifyUser(address _user) public onlyAdmin {
        require(bytes(users[_user].name).length > 0, "User not found");
        users[_user].isVerified = true;
        emit UserVerified(_user);
    }

    function getUserDetails(address _user) public view returns (string memory, string memory, bool, UserRole) {
        User memory user = users[_user];
        return (user.name, user.idNumber, user.isVerified, user.role);
    }

    function isUserVerified(address _user) public view returns (bool) {
        return users[_user].isVerified;
    }

    function getUserRole(address _user) public view returns (UserRole) {
        return users[_user].role;
    }
}