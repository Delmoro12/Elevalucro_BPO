#!/bin/bash
# Build script to generate migration from organized database files

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
MIGRATION_FILE="migrations/${TIMESTAMP}_complete_schema.sql"

echo -e "${YELLOW}Building migration from organized files...${NC}"

# Create migration file with header
cat > "$MIGRATION_FILE" << EOF
-- =============================================================================
-- Auto-generated migration from organized files
-- Generated at: $(date)
-- =============================================================================

EOF

# Concatenate schemas in order
echo -e "${GREEN}Adding schemas...${NC}"
for file in database/schemas/*.sql; do
    if [ -f "$file" ]; then
        echo "-- From: $(basename $file)" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
        cat "$file" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
    fi
done

# Add functions
echo -e "${GREEN}Adding functions...${NC}"
for file in functions/*.sql; do
    if [ -f "$file" ]; then
        echo "-- From: $(basename $file)" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
        cat "$file" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
    fi
done

# Add RLS policies if they exist
if [ -d "database/rls" ] && [ "$(ls -A database/rls/*.sql 2>/dev/null)" ]; then
    echo -e "${GREEN}Adding RLS policies...${NC}"
    for file in database/rls/*.sql; do
        echo "-- From: $(basename $file)" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
        cat "$file" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
    done
fi

# Add views if they exist
if [ -d "database/views" ] && [ "$(ls -A database/views/*.sql 2>/dev/null)" ]; then
    echo -e "${GREEN}Adding views...${NC}"
    for file in database/views/*.sql; do
        echo "-- From: $(basename $file)" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
        cat "$file" >> "$MIGRATION_FILE"
        echo "" >> "$MIGRATION_FILE"
    done
fi

echo -e "${GREEN}✅ Migration created: $MIGRATION_FILE${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally: npx supabase db reset"
echo "2. Deploy to production: npx supabase db push"