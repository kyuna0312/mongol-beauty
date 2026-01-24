#!/bin/bash

# Fix Docker permissions for current user
# Run: bash scripts/fix-docker-permissions.sh

echo "🔧 Fixing Docker permissions..."
echo ""

# Check if user is already in docker group
if groups | grep -q docker; then
    echo "✅ User is already in docker group"
    echo ""
    echo "💡 If you still get permission errors, run:"
    echo "   newgrp docker"
    echo "   # Or logout and login again"
else
    echo "❌ User is NOT in docker group"
    echo ""
    echo "Adding user to docker group..."
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    echo "✅ User added to docker group"
    echo ""
    echo "📝 IMPORTANT: You need to apply the group change:"
    echo ""
    echo "   Option 1 (Quick - current session only):"
    echo "     newgrp docker"
    echo ""
    echo "   Option 2 (Permanent - recommended):"
    echo "     Logout and login again"
    echo ""
    echo "After applying, verify with:"
    echo "   docker ps"
fi

echo ""
echo "🔍 Current groups:"
groups
