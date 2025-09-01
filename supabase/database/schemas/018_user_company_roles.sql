-- =============================================================================
-- Table: user_company_roles
-- =============================================================================
-- Roles específicos dos usuários em cada empresa

CREATE TABLE IF NOT EXISTS "public"."user_company_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_company_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "is_primary_role" boolean DEFAULT false,
    "assigned_by_user_id" "uuid",
    "assigned_reason" "text",
    "assignment_type" character varying(20) DEFAULT 'manual'::character varying,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "auto_revoke_at" timestamp with time zone,
    "permissions_override" "jsonb",
    "resource_scope" "jsonb",
    "conditions" "jsonb",
    "requires_approval" boolean DEFAULT false,
    "approved_by_user_id" "uuid",
    "approved_at" timestamp with time zone,
    "approval_status" character varying(20) DEFAULT 'approved'::character varying,
    "last_used_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid",
    CONSTRAINT "user_company_roles_approval_status_valid" CHECK ((("approval_status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('approved'::character varying)::"text", ('rejected'::character varying)::"text"]))),
    CONSTRAINT "user_company_roles_assignment_type_valid" CHECK ((("assignment_type")::"text" = ANY (ARRAY[('manual'::character varying)::"text", ('automatic'::character varying)::"text", ('inherited'::character varying)::"text"]))),
    CONSTRAINT "user_company_roles_valid_dates" CHECK ((("valid_until" IS NULL) OR ("valid_until" > "valid_from")))
);

ALTER TABLE "public"."user_company_roles" OWNER TO "postgres";

COMMENT ON TABLE "public"."user_company_roles" IS 'Roles específicos dos usuários em cada empresa';