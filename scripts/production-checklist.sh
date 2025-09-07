#!/bin/bash

echo "🚀 BakerLink Production Checklist Runner"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        FAILED=$((FAILED + 1))
    fi
}

FAILED=0

echo "1. Build Check"
npm run build > /dev/null 2>&1
check_status $? "Build completes without errors"

echo -e "\n2. Bundle Size Analysis"
MAIN_BUNDLE=$(find dist/assets -name "index-*.js" -exec ls -la {} \; | awk '{print $5}')
MAIN_SIZE_KB=$((MAIN_BUNDLE / 1024))
echo "   Main bundle: ${MAIN_SIZE_KB}KB"
if [ $MAIN_SIZE_KB -lt 500 ]; then
    check_status 0 "Main bundle under 500KB"
else
    check_status 1 "Main bundle under 500KB (currently ${MAIN_SIZE_KB}KB)"
fi

echo -e "\n3. Console Statements"
CONSOLE_COUNT=$(grep -r "console\." src --exclude-dir=node_modules | grep -v "logger" | wc -l | tr -d ' ')
if [ $CONSOLE_COUNT -eq 0 ]; then
    check_status 0 "No console statements found"
else
    check_status 1 "Found $CONSOLE_COUNT console statements"
fi

echo -e "\n4. Environment Configuration"
if [ -f ".env" ]; then
    check_status 0 ".env file exists"
else
    check_status 1 ".env file missing"
fi

echo -e "\n5. Security Headers"
if [ -f "vercel.json" ] || [ -f "netlify.toml" ]; then
    check_status 0 "Security headers configured"
else
    check_status 1 "Security headers not configured"
fi

echo -e "\n6. Error Boundary"
if grep -q "ErrorBoundary" src/App.jsx; then
    check_status 0 "Global error boundary implemented"
else
    check_status 1 "Global error boundary missing"
fi

echo -e "\n7. Code Splitting"
CHUNK_COUNT=$(find dist/assets -name "*.js" | wc -l | tr -d ' ')
if [ $CHUNK_COUNT -gt 10 ]; then
    check_status 0 "Code splitting implemented ($CHUNK_COUNT chunks)"
else
    check_status 1 "Insufficient code splitting"
fi

echo -e "\n========================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for production deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED checks failed. Please fix issues before deploying.${NC}"
    exit 1
fi