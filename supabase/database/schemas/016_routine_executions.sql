-- =============================================================================
-- Table: routine_executions
-- =============================================================================
-- History of routine executions for companies

CREATE TABLE IF NOT EXISTS "public"."routine_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_routine_id" "uuid" NOT NULL,
    "executed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "executed_by" "uuid",
    "status" character varying(20) DEFAULT 'completed'::character varying,
    "notes" "text",
    "attachments" "text"[],
    "time_spent_minutes" integer,
    "next_execution_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "routine_executions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying, 'failed'::character varying])::"text"[])))
);

ALTER TABLE "public"."routine_executions" OWNER TO "postgres";

COMMENT ON TABLE "public"."routine_executions" IS 'History of routine executions for companies';

COMMENT ON COLUMN "public"."routine_executions"."company_routine_id" IS 'Reference to the company routine that was executed';
COMMENT ON COLUMN "public"."routine_executions"."executed_at" IS 'When the routine was executed';
COMMENT ON COLUMN "public"."routine_executions"."executed_by" IS 'User who executed the routine';
COMMENT ON COLUMN "public"."routine_executions"."status" IS 'Execution status: completed, partially_completed, failed';
COMMENT ON COLUMN "public"."routine_executions"."notes" IS 'Notes about the execution';
COMMENT ON COLUMN "public"."routine_executions"."attachments" IS 'Array of attachment URLs (documents, screenshots, etc)';
COMMENT ON COLUMN "public"."routine_executions"."time_spent_minutes" IS 'Time spent on execution in minutes';
COMMENT ON COLUMN "public"."routine_executions"."next_execution_date" IS 'Calculated date for next execution';