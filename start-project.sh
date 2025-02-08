#!/bin/bash

# create openssl self signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout rk-src/data/reachkart.key -out rk-src/data/reachkart.crt
echo "✅ Created self signed certificates"

# run the node application
cd rk-src
node rk-server.js
echo "✅ Node application is running"

## Start hardhat node
#npx hardhat node
