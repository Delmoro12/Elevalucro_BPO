-- =============================================================================
-- Table: role_permissions
-- =============================================================================
-- Relacionamento many-to-many entre roles e permissions

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "is_granted" boolean DEFAULT true,
    "is_inherited" boolean DEFAULT false,
    "inherited_from_role_id" "uuid",
    "conditions" "jsonb",
    "resource_restrictions" "jsonb",
    "expires_at" timestamp with time zone,
    "is_temporary" boolean DEFAULT false,
    "granted_by_user_id" "uuid",
    "granted_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "role_permissions_inherit_not_self" CHECK (("inherited_from_role_id" <> "role_id")),
    CONSTRAINT "role_permissions_inheritance_valid" CHECK (((("is_inherited" = false) AND ("inherited_from_role_id" IS NULL)) OR (("is_inherited" = true) AND ("inherited_from_role_id" IS NOT NULL))))
);

ALTER TABLE "public"."role_permissions" OWNER TO "postgres";

COMMENT ON TABLE "public"."role_permissions" IS 'Relacionamento many-to-many entre roles e permissions';