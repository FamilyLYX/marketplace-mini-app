import { Abi } from "viem";
export const FAMILY_VAULT_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_admin",
        type: "address",
        internalType: "address",
      },
      {
        name: "_seller",
        type: "address",
        internalType: "address",
      },
      {
        name: "_nftContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_priceInLYX",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_expectedUIDHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "fallback",
    stateMutability: "payable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "batchCalls",
    inputs: [
      {
        name: "data",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "results",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyer",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "confirmReceipt",
    inputs: [
      {
        name: "plainUidCode",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "execute",
    inputs: [
      {
        name: "operationType",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeBatch",
    inputs: [
      {
        name: "operationsType",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "targets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "values",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "datas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "expectedUIDHash",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getData",
    inputs: [
      {
        name: "dataKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "dataValue",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDataBatch",
    inputs: [
      {
        name: "dataKeys",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [
      {
        name: "dataValues",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initiateDispute",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nftContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceInLYX",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveDispute",
    inputs: [
      {
        name: "nftRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "paymentRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "seller",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setData",
    inputs: [
      {
        name: "dataKey",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "dataValue",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setDataBatch",
    inputs: [
      {
        name: "dataKeys",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dataValues",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "state",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum FamilyVault.VaultState",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "universalReceiver",
    inputs: [
      {
        name: "typeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "ContractCreated",
    inputs: [
      {
        name: "operationType",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "contractAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "salt",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DataChanged",
    inputs: [
      {
        name: "dataKey",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "dataValue",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeOpened",
    inputs: [
      {
        name: "initiator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Executed",
    inputs: [
      {
        name: "operationType",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "selector",
        type: "bytes4",
        indexed: true,
        internalType: "bytes4",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FundsDeposited",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipRenounced",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReceiptConfirmed",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RenounceOwnershipStarted",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradeCompleted",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradeSettledByAdmin",
    inputs: [
      {
        name: "admin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UniversalReceiver",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "typeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "receivedData",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "returnedValue",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultInitialized",
    inputs: [
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nftContract",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC725X_ContractDeploymentFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_ExecuteParametersEmptyArray",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_ExecuteParametersLengthMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_InsufficientBalance",
    inputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC725X_MsgValueDisallowedInStaticCall",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_NoContractBytecodeProvided",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725X_UnknownOperationType",
    inputs: [
      {
        name: "operationTypeProvided",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC725Y_DataKeysValuesLengthMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC725Y_MsgValueDisallowed",
    inputs: [],
  },
  {
    type: "error",
    name: "LSP14CallerNotPendingOwner",
    inputs: [
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "LSP14CannotTransferOwnershipToSelf",
    inputs: [],
  },
  {
    type: "error",
    name: "LSP14MustAcceptOwnershipInSeparateTransaction",
    inputs: [],
  },
  {
    type: "error",
    name: "LSP14NotInRenounceOwnershipInterval",
    inputs: [
      {
        name: "renounceOwnershipStart",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "renounceOwnershipEnd",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "LSP1DelegateNotAllowedToSetDataKey",
    inputs: [
      {
        name: "dataKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "NoExtensionFoundForFunctionSelector",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableCallerNotTheOwner",
    inputs: [
      {
        name: "callerAddress",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as Abi;
