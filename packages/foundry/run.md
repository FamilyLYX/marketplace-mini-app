# load the variables from the .env file
source .env

# Deploy and verify contract on LUKSO Testnet.
forge script --chain 4201 script/deploy.s.sol:DeployScript --rpc-url $LUKSO_TESTNET_RPC_URL --broadcast --verify --verifier blockscout --verifier-url $BLOCKSCOUT_TESTNET_API_URL -vvvv

# Deploy and verify contract on LUKSO Mainnet.
forge script --chain 42 script/deploy.s.sol:DeployScript --rpc-url $LUKSO_MAINNET_RPC_URL --broadcast --verify --verifier blockscout --verifier-url $BLOCKSCOUT_MAINNET_API_URL -vvvv
