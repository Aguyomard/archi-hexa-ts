#!/bin/bash

# Set API base URL
API_URL="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Social Network API ===${NC}"

# Function to make API calls and display results
call_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "\n${BLUE}$description${NC}"
  echo -e "${BLUE}$method $endpoint${NC}"
  
  if [ -n "$data" ]; then
    response=$(curl -s -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
  else
    response=$(curl -s -X $method "$API_URL$endpoint")
  fi
  
  echo -e "${GREEN}Response:${NC}"
  echo $response | jq '.' 2>/dev/null || echo $response
  echo -e "${BLUE}--------------------${NC}"
}

# Create users
call_api "POST" "/users" '{"name":"Alice"}' "Creating user Alice"
call_api "POST" "/users" '{"name":"Bob"}' "Creating user Bob"
call_api "POST" "/users" '{"name":"Charlie"}' "Creating user Charlie"

# Post messages
call_api "POST" "/messages" '{"author":"Alice","text":"Hello from Alice!"}' "Alice posts a message"
call_api "POST" "/messages" '{"author":"Bob","text":"Hello from Bob!"}' "Bob posts a message"
call_api "POST" "/messages" '{"author":"Charlie","text":"Hello from Charlie!"}' "Charlie posts a message"

# Get Alice's timeline
call_api "GET" "/users/Alice/timeline" "" "Getting Alice's timeline"

# Follow users
call_api "POST" "/users/Alice/follow" '{"userToFollow":"Bob"}' "Alice follows Bob"
call_api "POST" "/users/Alice/follow" '{"userToFollow":"Charlie"}' "Alice follows Charlie"

# Get Alice's wall
call_api "GET" "/users/Alice/wall" "" "Getting Alice's wall"

# Edit a message (note: you'll need to replace 1234 with an actual message ID)
echo -e "\n${RED}Note: To test editing a message, you'll need to use an actual message ID from the timeline/wall responses${NC}"

echo -e "\n${GREEN}API testing completed!${NC}" 