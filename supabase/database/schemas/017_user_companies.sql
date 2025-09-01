-- =============================================================================
-- Table: user_companies
-- =============================================================================
-- Relacionamento many-to-many entre usuários e empresas

CREATE TABLE IF NOT EXISTS "public"."user_companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "join_type" character varying(20) DEFAULT 'invited'::character varying,
    "invited_by_user_id" "uuid",
    "invited_at" timestamp with time zone,
    "invitation_token" character varying(255),
    "invitation_expires_at" timestamp with time zone,
    "approved_by_user_id" "uuid",
    "approved_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "display_name" character varying(100),
    "department" character varying(100),
    "employee_id" character varying(50),
    "start_date" "date",
    "end_date" "date",
    "is_primary_company" boolean DEFAULT false,
    "default_login_company" boolean DEFAULT false,
    "can_switch_companies" boolean DEFAULT true,
    "max_daily_documents" integer,
    "allowed_modules" "text"[],
    "restricted_ips" "inet"[],
    "allowed_hours_start" time without time zone,
    "allowed_hours_end" time without time zone,
    "allowed_days_week" integer[],
    "timezone" character varying(50),
    "created_by_user_id" "uuid",
    "updated_by_user_id" "uuid",
    "last_access_at" timestamp with time zone,
    "access_count" integer DEFAULT 0,
    "notes" "text",
    "custom_fields" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_companies_dates_valid" CHECK ((("end_date" IS NULL) OR ("end_date" >= "start_date"))),
    CONSTRAINT "user_companies_hours_valid" CHECK (((("allowed_hours_start" IS NULL) AND ("allowed_hours_end" IS NULL)) OR (("allowed_hours_start" IS NOT NULL) AND ("allowed_hours_end" IS NOT NULL)))),
    CONSTRAINT "user_companies_invitation_token_with_expiry" CHECK (((("invitation_token" IS NULL) AND ("invitation_expires_at" IS NULL)) OR (("invitation_token" IS NOT NULL) AND ("invitation_expires_at" IS NOT NULL)))),
    CONSTRAINT "user_companies_join_type_valid" CHECK ((("join_type")::"text" = ANY (ARRAY[('invited'::character varying)::"text", ('requested'::character varying)::"text", ('transferred'::character varying)::"text", ('created'::character varying)::"text"]))),
    CONSTRAINT "user_companies_max_documents_positive" CHECK ((("max_daily_documents" IS NULL) OR ("max_daily_documents" > 0))),
    CONSTRAINT "user_companies_status_valid" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('inactive'::character varying)::"text", ('pending'::character varying)::"text", ('suspended'::character varying)::"text"])))
);

ALTER TABLE "public"."user_companies" OWNER TO "postgres";

COMMENT ON TABLE "public"."user_companies" IS 'Relacionamento many-to-many entre usuários e empresas';