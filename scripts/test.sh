#!/bin/bash

# TabFlow Testing Script
# Runs various checks before deployment

set -e

echo "📊 TabFlow Testing Suite"
echo "========================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi
}

# Check manifest.json validity
run_test "manifest.json syntax" "cat extension/manifest.json | python3 -m json.tool"

# Check required files exist
run_test "newtab.html exists" "[ -f extension/newtab/newtab.html ]"
run_test "newtab.js exists" "[ -f extension/newtab/newtab.js ]"
run_test "styles.css exists" "[ -f extension/newtab/styles.css ]"
run_test "popup.html exists" "[ -f extension/popup/popup.html ]"
run_test "service-worker.js exists" "[ -f extension/background/service-worker.js ]"

# Check icon files
run_test "icon-16.png exists" "[ -f extension/icons/icon-16.png ]"
run_test "icon-48.png exists" "[ -f extension/icons/icon-48.png ]"
run_test "icon-128.png exists" "[ -f extension/icons/icon-128.png ]"

# Check API files
run_test "API package.json exists" "[ -f api/package.json ]"
run_test "MongoDB lib exists" "[ -f api/lib/mongodb.js ]"
run_test "Auth lib exists" "[ -f api/lib/auth.js ]"

# Check documentation
run_test "README.md exists" "[ -f README.md ]"
run_test "LICENSE exists" "[ -f LICENSE ]"
run_test "CONTRIBUTING.md exists" "[ -f CONTRIBUTING.md ]"

echo ""
echo "========================"
echo -e "Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
echo "========================"
echo ""

if [ $failed -gt 0 ]; then
    echo -e "${RED}Some tests failed. Please fix before deploying.${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed! Ready to deploy.${NC}"
    exit 0
fi