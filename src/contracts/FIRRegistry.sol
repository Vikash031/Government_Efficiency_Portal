// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FIRRegistry {
    struct FIR {
        uint256 id;
        string description;
        address reporter;
        string status; // "Open", "Investigating", "Closed", "Review Requested"
        uint256 timestamp;
        string resolutionNotes;
    }

    uint256 public firCount;
    mapping(uint256 => FIR) public firs;
    mapping(address => uint256[]) public userFIRs;
    address public admin;

    event FIRCreated(uint256 id, address reporter, string description);
    event StatusUpdated(uint256 id, string newStatus);
    
    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function createFIR(string memory _description) public {
        firCount++;
        firs[firCount] = FIR(firCount, _description, msg.sender, "Open", block.timestamp, "");
        userFIRs[msg.sender].push(firCount);
        emit FIRCreated(firCount, msg.sender, _description);
    }

    function updateStatus(uint256 _id, string memory _status, string memory _notes) public onlyAdmin {
        require(_id > 0 && _id <= firCount, "FIR not found");
        firs[_id].status = _status;
        firs[_id].resolutionNotes = _notes;
        emit StatusUpdated(_id, _status);
    }

    function requestReview(uint256 _id) public {
        require(_id > 0 && _id <= firCount, "FIR not found");
        require(msg.sender == firs[_id].reporter, "Only reporter can request review");
        firs[_id].status = "Review Requested";
        emit StatusUpdated(_id, "Review Requested");
    }

    function getFIR(uint256 _id) public view returns (FIR memory) {
        return firs[_id];
    }
    
    function getAllFIRs() public view returns (FIR[] memory) {
        FIR[] memory allFirs = new FIR[](firCount);
        for (uint i = 1; i <= firCount; i++) {
            allFirs[i - 1] = firs[i];
        }
        return allFirs;
    }

    function getUserFIRs(address _user) public view returns (FIR[] memory) {
        uint256[] memory ids = userFIRs[_user];
        FIR[] memory userFirsList = new FIR[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            userFirsList[i] = firs[ids[i]];
        }
        return userFirsList;
    }
}
