-- =============================================================================
-- Table: user_permissions
-- =============================================================================
-- Permissões granulares específicas por usuário/empresa

CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_company_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "is_granted" boolean DEFAULT true,
    "granted_by_user_id" "uuid",
    "granted_reason" "text",
    "conditions" "jsonb",
    "resource_scope" "jsonb",
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_permissions" OWNER TO "postgres";

COMMENT ON TABLE "public"."user_permissions" IS 'Permissões granulares específicas por usuário/empresa';