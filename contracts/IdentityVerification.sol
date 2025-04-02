// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IdentityVerification {
    struct User {
        string name;
        string governmentId;
        string phoneNumber;
        string ssmNumber;
        bool isVerified;
    }

    mapping(address => User) public users;
    mapping(string => bool) private usedGovernmentIds;
    address public admin;

    event UserRegistered(address user);
    event UserVerified(address user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can verify users");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerUser(string memory _name, string memory _governmentId, string memory _phoneNumber, string memory _ssmNumber) public {
        require(!users[msg.sender].isVerified, "User already registered");
        require(!usedGovernmentIds[_governmentId], "Government ID already used");
        
        users[msg.sender] = User(_name, _governmentId, _phoneNumber, _ssmNumber, false);
        usedGovernmentIds[_governmentId] = true;
        emit UserRegistered(msg.sender);
    }

    function verifyUser(address _user) public onlyAdmin {
        require(!users[_user].isVerified, "User already verified");
        users[_user].isVerified = true;
        emit UserVerified(_user);
    }

    function isUserVerified(address _user) public view returns (bool) {
        return users[_user].isVerified;
    }
}
