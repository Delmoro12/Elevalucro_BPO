

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."ensure_single_primary_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se está marcando como primário
    IF NEW.is_primary_role = true THEN
        -- Remove a flag de outros roles do mesmo usuário/empresa
        UPDATE user_company_roles 
        SET is_primary_role = false 
        WHERE user_company_id = NEW.user_company_id 
        AND role_id != NEW.role_id 
        AND is_primary_role = true;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_primary_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."extract_user_names"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        -- Extrair primeiro nome
        NEW.first_name = COALESCE(NEW.first_name, SPLIT_PART(NEW.full_name, ' ', 1));
        
        -- Extrair último nome (tudo após o primeiro espaço)
        IF POSITION(' ' IN NEW.full_name) > 0 THEN
            NEW.last_name = COALESCE(NEW.last_name, SUBSTRING(NEW.full_name FROM POSITION(' ' IN NEW.full_name) + 1));
        END IF;
        
        -- Display name padrão é o primeiro nome
        NEW.display_name = COALESCE(NEW.display_name, NEW.first_name);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."extract_user_names"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_company_roles_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    uc_record user_companies%ROWTYPE;
BEGIN
    -- Buscar dados da user_companies
    SELECT * INTO uc_record FROM user_companies WHERE id = NEW.user_company_id;
    
    IF FOUND THEN
        NEW.user_id = uc_record.user_id;
        NEW.company_id = uc_record.company_id;
    ELSE
        RAISE EXCEPTION 'user_company_id % not found', NEW.user_company_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_company_roles_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_permissions_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    uc_record user_companies%ROWTYPE;
BEGIN
    -- Buscar dados da user_companies
    SELECT * INTO uc_record FROM user_companies WHERE id = NEW.user_company_id;
    
    IF FOUND THEN
        NEW.user_id = uc_record.user_id;
        NEW.company_id = uc_record.company_id;
    ELSE
        RAISE EXCEPTION 'user_company_id % not found', NEW.user_company_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_permissions_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_companies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_companies_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_role_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_role_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_roles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_companies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_companies_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_company_roles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_company_roles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_companies uc
    WHERE uc.user_id = auth.uid()
    AND uc.company_id = company_uuid
    AND uc.status = 'active'
  );
$$;


ALTER FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") IS 'Verifica se o usuário tem acesso a uma empresa específica';



CREATE OR REPLACE FUNCTION "public"."user_is_bpo"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users u
    JOIN user_profiles up ON up.id = u.profile_id
    WHERE u.id = auth.uid()
    AND up.category = 'bpo'
    AND u.is_active = true
  );
$$;


ALTER FUNCTION "public"."user_is_bpo"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_bpo"() IS 'Verifica se o usuário é da equipe BPO (ElevaLucro)';



CREATE OR REPLACE FUNCTION "public"."user_is_bpo_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users u
    JOIN user_profiles up ON up.id = u.profile_id
    WHERE u.id = auth.uid()
    AND up.slug = 'bpo_super_admin'
    AND u.is_active = true
  );
$$;


ALTER FUNCTION "public"."user_is_bpo_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_bpo_super_admin"() IS 'Verifica se o usuário é super admin BPO';



CREATE OR REPLACE FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_companies uc
    JOIN user_company_roles ucr ON ucr.user_company_id = uc.id
    JOIN user_profiles up ON up.id = ucr.profile_id
    WHERE uc.user_id = auth.uid()
    AND uc.company_id = company_uuid
    AND uc.status = 'active'
    AND ucr.is_active = true
    AND up.can_manage_company = true
  );
$$;


ALTER FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") IS 'Verifica se o usuário é admin de uma empresa específica';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "cnpj" character varying(18),
    "cnpj_raw" character varying(14),
    "ie" character varying(20),
    "im" character varying(20),
    "address_street" character varying(255),
    "address_number" character varying(20),
    "address_complement" character varying(100),
    "address_neighborhood" character varying(100),
    "address_city" character varying(100),
    "address_state" character varying(2),
    "address_zipcode" character varying(9),
    "address_country" character varying(50) DEFAULT 'Brasil'::character varying,
    "phone" character varying(20),
    "email" character varying(255),
    "website" character varying(255),
    "logo_url" "text",
    "primary_color" character varying(7) DEFAULT '#10b981'::character varying,
    "secondary_color" character varying(7) DEFAULT '#059669'::character varying,
    "is_active" boolean DEFAULT true,
    "subscription_plan" character varying(50) DEFAULT 'free'::character varying,
    "subscription_status" character varying(20) DEFAULT 'active'::character varying,
    "trial_ends_at" timestamp with time zone,
    "max_users" integer DEFAULT 3,
    "max_documents_per_month" integer DEFAULT 100,
    "max_storage_gb" integer DEFAULT 1,
    "current_documents_count" integer DEFAULT 0,
    "current_storage_mb" integer DEFAULT 0,
    "usage_reset_at" timestamp with time zone DEFAULT "date_trunc"('month'::"text", ("now"() + '1 mon'::interval)),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "companies_cnpj_format" CHECK ((("cnpj_raw")::"text" ~ '^[0-9]{14}$'::"text")),
    CONSTRAINT "companies_max_users_positive" CHECK (("max_users" > 0)),
    CONSTRAINT "companies_slug_format" CHECK ((("slug")::"text" ~ '^[a-z0-9-]+$'::"text")),
    CONSTRAINT "companies_subscription_plan_valid" CHECK ((("subscription_plan")::"text" = ANY ((ARRAY['free'::character varying, 'basic'::character varying, 'premium'::character varying, 'enterprise'::character varying])::"text"[]))),
    CONSTRAINT "companies_subscription_status_valid" CHECK ((("subscription_status")::"text" = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'cancelled'::character varying, 'trial'::character varying])::"text"[])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies" IS 'Tabela de empresas/organizações do sistema multi-tenant';



COMMENT ON COLUMN "public"."companies"."slug" IS 'Slug único para URLs amigáveis (ex: empresa-abc)';



COMMENT ON COLUMN "public"."companies"."cnpj_raw" IS 'CNPJ apenas números para consultas e validações';



COMMENT ON COLUMN "public"."companies"."max_users" IS 'Limite de usuários baseado no plano de assinatura';



COMMENT ON COLUMN "public"."companies"."current_documents_count" IS 'Contador de documentos processados no mês atual';



COMMENT ON COLUMN "public"."companies"."usage_reset_at" IS 'Data do próximo reset dos contadores de uso';



CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "module" character varying(50) NOT NULL,
    "category" character varying(50) DEFAULT 'general'::character varying,
    "action" character varying(50) NOT NULL,
    "is_system_permission" boolean DEFAULT false,
    "requires_ownership" boolean DEFAULT false,
    "requires_same_company" boolean DEFAULT true,
    "depends_on_permission_ids" "uuid"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "permissions_category_valid" CHECK ((("category")::"text" = ANY ((ARRAY['read'::character varying, 'write'::character varying, 'admin'::character varying, 'special'::character varying, 'general'::character varying])::"text"[]))),
    CONSTRAINT "permissions_module_valid" CHECK ((("module")::"text" ~ '^[a-z_]+$'::"text")),
    CONSTRAINT "permissions_slug_format" CHECK ((("slug")::"text" ~ '^[a-z0-9_.]+$'::"text"))
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."permissions" IS 'Permissões granulares do sistema organizadas por módulos';



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



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(50) NOT NULL,
    "description" "text",
    "category" character varying(50) DEFAULT 'custom'::character varying,
    "level" integer DEFAULT 1,
    "color" character varying(7) DEFAULT '#6b7280'::character varying,
    "icon" character varying(50),
    "is_system_role" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "is_assignable" boolean DEFAULT true,
    "inherit_from_role_id" "uuid",
    "max_users_with_role" integer,
    "requires_approval" boolean DEFAULT false,
    "company_id" "uuid",
    "expires_after_days" integer,
    "auto_revoke_inactive_days" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roles_category_valid" CHECK ((("category")::"text" = ANY ((ARRAY['system'::character varying, 'company'::character varying, 'custom'::character varying])::"text"[]))),
    CONSTRAINT "roles_inherit_not_self" CHECK (("inherit_from_role_id" <> "id")),
    CONSTRAINT "roles_level_valid" CHECK ((("level" >= 1) AND ("level" <= 10))),
    CONSTRAINT "roles_max_users_positive" CHECK ((("max_users_with_role" IS NULL) OR ("max_users_with_role" > 0))),
    CONSTRAINT "roles_slug_format" CHECK ((("slug")::"text" ~ '^[a-z0-9_-]+$'::"text")),
    CONSTRAINT "roles_system_role_no_company" CHECK ((NOT (("is_system_role" = true) AND ("company_id" IS NOT NULL))))
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."roles" IS 'Roles/funções que podem ser atribuídos aos usuários';



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
    CONSTRAINT "user_companies_join_type_valid" CHECK ((("join_type")::"text" = ANY ((ARRAY['invited'::character varying, 'requested'::character varying, 'transferred'::character varying, 'created'::character varying])::"text"[]))),
    CONSTRAINT "user_companies_max_documents_positive" CHECK ((("max_daily_documents" IS NULL) OR ("max_daily_documents" > 0))),
    CONSTRAINT "user_companies_status_valid" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying, 'suspended'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_companies" IS 'Relacionamento many-to-many entre usuários e empresas';



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
    CONSTRAINT "user_company_roles_approval_status_valid" CHECK ((("approval_status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "user_company_roles_assignment_type_valid" CHECK ((("assignment_type")::"text" = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying, 'inherited'::character varying])::"text"[]))),
    CONSTRAINT "user_company_roles_valid_dates" CHECK ((("valid_until" IS NULL) OR ("valid_until" > "valid_from")))
);


ALTER TABLE "public"."user_company_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_company_roles" IS 'Roles específicos dos usuários em cada empresa';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "first_name" character varying(100),
    "last_name" character varying(100),
    "display_name" character varying(100),
    "cpf" character varying(14),
    "rg" character varying(20),
    "birth_date" "date",
    "phone" character varying(20),
    "whatsapp" character varying(20),
    "address_street" character varying(255),
    "address_number" character varying(20),
    "address_complement" character varying(100),
    "address_neighborhood" character varying(100),
    "address_city" character varying(100),
    "address_state" character varying(2),
    "address_zipcode" character varying(9),
    "address_country" character varying(50) DEFAULT 'Brasil'::character varying,
    "job_title" character varying(100),
    "bio" "text",
    "avatar_url" "text",
    "timezone" character varying(50) DEFAULT 'America/Sao_Paulo'::character varying,
    "language" character varying(5) DEFAULT 'pt-BR'::character varying,
    "currency" character varying(3) DEFAULT 'BRL'::character varying,
    "email_notifications" boolean DEFAULT true,
    "push_notifications" boolean DEFAULT true,
    "sms_notifications" boolean DEFAULT false,
    "marketing_emails" boolean DEFAULT false,
    "two_factor_enabled" boolean DEFAULT false,
    "last_login_at" timestamp with time zone,
    "last_login_ip" "inet",
    "login_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_verified" boolean DEFAULT false,
    "verification_level" character varying(20) DEFAULT 'none'::character varying,
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_step" integer DEFAULT 0,
    "welcome_tour_completed" boolean DEFAULT false,
    "terms_accepted_at" timestamp with time zone,
    "privacy_policy_accepted_at" timestamp with time zone,
    "marketing_consent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid",
    CONSTRAINT "users_cpf_format" CHECK ((("cpf")::"text" ~ '^[0-9]{11}$'::"text")),
    CONSTRAINT "users_currency_valid" CHECK ((("currency")::"text" = ANY ((ARRAY['BRL'::character varying, 'USD'::character varying, 'EUR'::character varying])::"text"[]))),
    CONSTRAINT "users_language_valid" CHECK ((("language")::"text" = ANY ((ARRAY['pt-BR'::character varying, 'en-US'::character varying, 'es-ES'::character varying])::"text"[]))),
    CONSTRAINT "users_onboarding_step_valid" CHECK ((("onboarding_step" >= 0) AND ("onboarding_step" <= 10))),
    CONSTRAINT "users_verification_level_valid" CHECK ((("verification_level")::"text" = ANY ((ARRAY['none'::character varying, 'email'::character varying, 'phone'::character varying, 'document'::character varying, 'full'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Perfil público dos usuários (complementa auth.users do Supabase)';



COMMENT ON COLUMN "public"."users"."id" IS 'Referência para auth.users(id) - mesmo UUID';



COMMENT ON COLUMN "public"."users"."display_name" IS 'Nome para exibição na interface';



COMMENT ON COLUMN "public"."users"."cpf" IS 'CPF apenas números para validações';



COMMENT ON COLUMN "public"."users"."login_count" IS 'Contador de logins realizados';



COMMENT ON COLUMN "public"."users"."verification_level" IS 'Nível de verificação da identidade do usuário';



COMMENT ON COLUMN "public"."users"."onboarding_step" IS 'Etapa atual do processo de onboarding (0-10)';



CREATE OR REPLACE VIEW "public"."user_company_roles_active" AS
 SELECT "ucr"."id",
    "ucr"."user_company_id",
    "ucr"."role_id",
    "ucr"."user_id",
    "ucr"."company_id",
    "ucr"."is_active",
    "ucr"."is_primary_role",
    "ucr"."assigned_by_user_id",
    "ucr"."assigned_reason",
    "ucr"."assignment_type",
    "ucr"."valid_from",
    "ucr"."valid_until",
    "ucr"."auto_revoke_at",
    "ucr"."permissions_override",
    "ucr"."resource_scope",
    "ucr"."conditions",
    "ucr"."requires_approval",
    "ucr"."approved_by_user_id",
    "ucr"."approved_at",
    "ucr"."approval_status",
    "ucr"."last_used_at",
    "ucr"."usage_count",
    "ucr"."created_at",
    "ucr"."updated_at",
    "uc"."status" AS "user_company_status",
    "u"."full_name",
    "u"."avatar_url",
    "c"."name" AS "company_name",
    "c"."slug" AS "company_slug",
    "r"."name" AS "role_name",
    "r"."slug" AS "role_slug",
    "r"."color" AS "role_color",
    "r"."icon" AS "role_icon",
    "r"."level" AS "role_level",
    "r"."category" AS "role_category"
   FROM (((("public"."user_company_roles" "ucr"
     JOIN "public"."user_companies" "uc" ON (("uc"."id" = "ucr"."user_company_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "ucr"."user_id")))
     JOIN "public"."companies" "c" ON (("c"."id" = "ucr"."company_id")))
     JOIN "public"."roles" "r" ON (("r"."id" = "ucr"."role_id")))
  WHERE (("ucr"."is_active" = true) AND (("ucr"."approval_status")::"text" = 'approved'::"text") AND (("uc"."status")::"text" = 'active'::"text") AND ("c"."is_active" = true) AND ("u"."is_active" = true) AND ("r"."is_active" = true) AND (("ucr"."valid_until" IS NULL) OR ("ucr"."valid_until" > "now"())));


ALTER VIEW "public"."user_company_roles_active" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_company_roles_active" IS 'View com roles ativos e informações completas';



CREATE OR REPLACE VIEW "public"."user_effective_permissions" AS
 WITH "user_roles" AS (
         SELECT DISTINCT "ucra"."user_id",
            "ucra"."company_id",
            "ucra"."role_id",
            "ucra"."permissions_override"
           FROM "public"."user_company_roles_active" "ucra"
        ), "role_perms" AS (
         SELECT "ur"."user_id",
            "ur"."company_id",
            "ur"."role_id",
            "rp"."permission_id",
            "rp"."is_granted",
            "ur"."permissions_override"
           FROM ("user_roles" "ur"
             JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
          WHERE ("rp"."is_granted" = true)
        ), "effective_perms" AS (
         SELECT "rp"."user_id",
            "rp"."company_id",
            "rp"."permission_id",
            "p"."slug" AS "permission_slug",
            "p"."name" AS "permission_name",
            "p"."module",
            "p"."category",
            "p"."action",
            "bool_or"("rp"."is_granted") AS "is_granted",
            "array_agg"(DISTINCT "rp"."role_id") AS "granted_by_roles"
           FROM ("role_perms" "rp"
             JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
          WHERE ("p"."is_active" = true)
          GROUP BY "rp"."user_id", "rp"."company_id", "rp"."permission_id", "p"."slug", "p"."name", "p"."module", "p"."category", "p"."action"
        )
 SELECT "user_id",
    "company_id",
    "permission_id",
    "permission_slug",
    "permission_name",
    "module",
    "category",
    "action",
    "is_granted",
    "granted_by_roles"
   FROM "effective_perms"
  WHERE ("is_granted" = true);


ALTER VIEW "public"."user_effective_permissions" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_effective_permissions" IS 'View com todas as permissões efetivas dos usuários por empresa';



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



CREATE OR REPLACE VIEW "public"."user_effective_permissions_v2" AS
 WITH "user_role_perms" AS (
         SELECT DISTINCT "ucr"."user_id",
            "ucr"."company_id",
            "rp"."permission_id",
            "rp"."is_granted",
            'role'::"text" AS "source"
           FROM ("public"."user_company_roles" "ucr"
             JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ucr"."role_id")))
          WHERE (("ucr"."is_active" = true) AND (("ucr"."approval_status")::"text" = 'approved'::"text") AND ("rp"."is_granted" = true))
        ), "user_direct_perms" AS (
         SELECT "up"."user_id",
            "up"."company_id",
            "up"."permission_id",
            "up"."is_granted",
            'direct'::"text" AS "source"
           FROM "public"."user_permissions" "up"
          WHERE (("up"."is_granted" = true) AND (("up"."expires_at" IS NULL) OR ("up"."expires_at" > "now"())))
        ), "all_permissions" AS (
         SELECT "user_role_perms"."user_id",
            "user_role_perms"."company_id",
            "user_role_perms"."permission_id",
            "user_role_perms"."is_granted",
            "user_role_perms"."source"
           FROM "user_role_perms"
        UNION ALL
         SELECT "user_direct_perms"."user_id",
            "user_direct_perms"."company_id",
            "user_direct_perms"."permission_id",
            "user_direct_perms"."is_granted",
            "user_direct_perms"."source"
           FROM "user_direct_perms"
        ), "effective_perms" AS (
         SELECT "ap"."user_id",
            "ap"."company_id",
            "ap"."permission_id",
            "p"."slug" AS "permission_slug",
            "p"."name" AS "permission_name",
            "p"."module",
            "p"."category",
            "p"."action",
            "bool_or"("ap"."is_granted") AS "is_granted",
            "array_agg"(DISTINCT "ap"."source") AS "sources"
           FROM ("all_permissions" "ap"
             JOIN "public"."permissions" "p" ON (("p"."id" = "ap"."permission_id")))
          WHERE ("p"."is_active" = true)
          GROUP BY "ap"."user_id", "ap"."company_id", "ap"."permission_id", "p"."slug", "p"."name", "p"."module", "p"."category", "p"."action"
        )
 SELECT "user_id",
    "company_id",
    "permission_id",
    "permission_slug",
    "permission_name",
    "module",
    "category",
    "action",
    "is_granted",
    "sources"
   FROM "effective_perms"
  WHERE ("is_granted" = true);


ALTER VIEW "public"."user_effective_permissions_v2" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_effective_permissions_v2" IS 'Permissões efetivas considerando roles + permissões diretas';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(50) NOT NULL,
    "description" "text",
    "category" character varying(50) NOT NULL,
    "level" integer DEFAULT 5,
    "color" character varying(7) DEFAULT '#6b7280'::character varying,
    "icon" character varying(50),
    "is_system_profile" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "is_assignable" boolean DEFAULT true,
    "can_invite_users" boolean DEFAULT false,
    "can_manage_company" boolean DEFAULT false,
    "max_companies" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_profiles_category_valid" CHECK ((("category")::"text" = ANY ((ARRAY['bpo'::character varying, 'client'::character varying])::"text"[]))),
    CONSTRAINT "user_profiles_level_valid" CHECK ((("level" >= 1) AND ("level" <= 10))),
    CONSTRAINT "user_profiles_max_companies_positive" CHECK (("max_companies" > 0)),
    CONSTRAINT "user_profiles_slug_format" CHECK ((("slug")::"text" ~ '^[a-z0-9_-]+$'::"text"))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'Perfis/tipos de usuário no sistema (BPO vs Cliente)';



CREATE OR REPLACE VIEW "public"."users_with_profiles" AS
 SELECT "u"."id",
    "u"."full_name",
    "u"."first_name",
    "u"."last_name",
    "u"."display_name",
    "u"."cpf",
    "u"."rg",
    "u"."birth_date",
    "u"."phone",
    "u"."whatsapp",
    "u"."address_street",
    "u"."address_number",
    "u"."address_complement",
    "u"."address_neighborhood",
    "u"."address_city",
    "u"."address_state",
    "u"."address_zipcode",
    "u"."address_country",
    "u"."job_title",
    "u"."bio",
    "u"."avatar_url",
    "u"."timezone",
    "u"."language",
    "u"."currency",
    "u"."email_notifications",
    "u"."push_notifications",
    "u"."sms_notifications",
    "u"."marketing_emails",
    "u"."two_factor_enabled",
    "u"."last_login_at",
    "u"."last_login_ip",
    "u"."login_count",
    "u"."is_active",
    "u"."is_verified",
    "u"."verification_level",
    "u"."onboarding_completed",
    "u"."onboarding_step",
    "u"."welcome_tour_completed",
    "u"."terms_accepted_at",
    "u"."privacy_policy_accepted_at",
    "u"."marketing_consent_at",
    "u"."created_at",
    "u"."updated_at",
    "u"."profile_id",
    "up"."name" AS "profile_name",
    "up"."slug" AS "profile_slug",
    "up"."category" AS "profile_category",
    "up"."level" AS "profile_level",
    "up"."color" AS "profile_color",
    "up"."icon" AS "profile_icon",
    "up"."can_invite_users",
    "up"."can_manage_company",
    "up"."max_companies"
   FROM ("public"."users" "u"
     LEFT JOIN "public"."user_profiles" "up" ON (("up"."id" = "u"."profile_id")))
  WHERE ("u"."is_active" = true);


ALTER VIEW "public"."users_with_profiles" OWNER TO "postgres";


COMMENT ON VIEW "public"."users_with_profiles" IS 'Usuários com informações completas do profile';



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_cnpj_raw_key" UNIQUE ("cnpj_raw");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_unique_pair" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_invitation_token_key" UNIQUE ("invitation_token");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_unique_pair" UNIQUE ("user_id", "company_id");



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_unique_assignment" UNIQUE ("user_company_id", "role_id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_unique_pair" UNIQUE ("user_company_id", "permission_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_companies_cnpj_raw" ON "public"."companies" USING "btree" ("cnpj_raw");



CREATE INDEX "idx_companies_created_at" ON "public"."companies" USING "btree" ("created_at");



CREATE INDEX "idx_companies_is_active" ON "public"."companies" USING "btree" ("is_active");



CREATE INDEX "idx_companies_slug" ON "public"."companies" USING "btree" ("slug");



CREATE INDEX "idx_companies_subscription_plan" ON "public"."companies" USING "btree" ("subscription_plan");



CREATE INDEX "idx_permissions_category" ON "public"."permissions" USING "btree" ("category");



CREATE INDEX "idx_permissions_is_active" ON "public"."permissions" USING "btree" ("is_active");



CREATE INDEX "idx_permissions_is_system" ON "public"."permissions" USING "btree" ("is_system_permission");



CREATE INDEX "idx_permissions_module" ON "public"."permissions" USING "btree" ("module");



CREATE INDEX "idx_permissions_slug" ON "public"."permissions" USING "btree" ("slug");



CREATE INDEX "idx_role_permissions_expires_at" ON "public"."role_permissions" USING "btree" ("expires_at");



CREATE INDEX "idx_role_permissions_is_granted" ON "public"."role_permissions" USING "btree" ("is_granted");



CREATE INDEX "idx_role_permissions_permission_id" ON "public"."role_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_role_permissions_role_id" ON "public"."role_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_roles_category" ON "public"."roles" USING "btree" ("category");



CREATE INDEX "idx_roles_company_id" ON "public"."roles" USING "btree" ("company_id");



CREATE INDEX "idx_roles_is_active" ON "public"."roles" USING "btree" ("is_active");



CREATE INDEX "idx_roles_is_system_role" ON "public"."roles" USING "btree" ("is_system_role");



CREATE INDEX "idx_roles_level" ON "public"."roles" USING "btree" ("level");



CREATE INDEX "idx_roles_slug" ON "public"."roles" USING "btree" ("slug");



CREATE INDEX "idx_user_companies_company_id" ON "public"."user_companies" USING "btree" ("company_id");



CREATE INDEX "idx_user_companies_invitation_token" ON "public"."user_companies" USING "btree" ("invitation_token");



CREATE INDEX "idx_user_companies_is_primary" ON "public"."user_companies" USING "btree" ("is_primary_company");



CREATE INDEX "idx_user_companies_status" ON "public"."user_companies" USING "btree" ("status");



CREATE INDEX "idx_user_companies_user_id" ON "public"."user_companies" USING "btree" ("user_id");



CREATE INDEX "idx_user_company_roles_active_permissions" ON "public"."user_company_roles" USING "btree" ("user_id", "company_id", "is_active") WHERE (("is_active" = true) AND (("approval_status")::"text" = 'approved'::"text"));



CREATE INDEX "idx_user_company_roles_approval_status" ON "public"."user_company_roles" USING "btree" ("approval_status");



CREATE INDEX "idx_user_company_roles_company_id" ON "public"."user_company_roles" USING "btree" ("company_id");



CREATE INDEX "idx_user_company_roles_is_active" ON "public"."user_company_roles" USING "btree" ("is_active");



CREATE INDEX "idx_user_company_roles_is_primary" ON "public"."user_company_roles" USING "btree" ("is_primary_role");



CREATE INDEX "idx_user_company_roles_profile_id" ON "public"."user_company_roles" USING "btree" ("profile_id");



CREATE INDEX "idx_user_company_roles_role_id" ON "public"."user_company_roles" USING "btree" ("role_id");



CREATE INDEX "idx_user_company_roles_user_company" ON "public"."user_company_roles" USING "btree" ("user_company_id");



CREATE INDEX "idx_user_company_roles_user_id" ON "public"."user_company_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_company_roles_valid_until" ON "public"."user_company_roles" USING "btree" ("valid_until");



CREATE INDEX "idx_user_permissions_company_id" ON "public"."user_permissions" USING "btree" ("company_id");



CREATE INDEX "idx_user_permissions_is_granted" ON "public"."user_permissions" USING "btree" ("is_granted");



CREATE INDEX "idx_user_permissions_permission_id" ON "public"."user_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_user_permissions_user_company" ON "public"."user_permissions" USING "btree" ("user_company_id");



CREATE INDEX "idx_user_permissions_user_id" ON "public"."user_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_category" ON "public"."user_profiles" USING "btree" ("category");



CREATE INDEX "idx_user_profiles_is_active" ON "public"."user_profiles" USING "btree" ("is_active");



CREATE INDEX "idx_user_profiles_level" ON "public"."user_profiles" USING "btree" ("level");



CREATE INDEX "idx_user_profiles_slug" ON "public"."user_profiles" USING "btree" ("slug");



CREATE INDEX "idx_users_cpf" ON "public"."users" USING "btree" ("cpf");



CREATE INDEX "idx_users_created_at" ON "public"."users" USING "btree" ("created_at");



CREATE INDEX "idx_users_full_name" ON "public"."users" USING "btree" ("full_name");



CREATE INDEX "idx_users_is_active" ON "public"."users" USING "btree" ("is_active");



CREATE INDEX "idx_users_last_login_at" ON "public"."users" USING "btree" ("last_login_at");



CREATE INDEX "idx_users_profile_id" ON "public"."users" USING "btree" ("profile_id");



CREATE INDEX "idx_users_verification_level" ON "public"."users" USING "btree" ("verification_level");



CREATE OR REPLACE TRIGGER "companies_updated_at_trigger" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_companies_updated_at"();



CREATE OR REPLACE TRIGGER "permissions_updated_at_trigger" BEFORE UPDATE ON "public"."permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_permissions_updated_at"();



CREATE OR REPLACE TRIGGER "role_permissions_updated_at_trigger" BEFORE UPDATE ON "public"."role_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_role_permissions_updated_at"();



CREATE OR REPLACE TRIGGER "roles_updated_at_trigger" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_roles_updated_at"();



CREATE OR REPLACE TRIGGER "user_companies_updated_at_trigger" BEFORE UPDATE ON "public"."user_companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_companies_updated_at"();



CREATE OR REPLACE TRIGGER "user_company_roles_single_primary_trigger" BEFORE INSERT OR UPDATE OF "is_primary_role" ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_primary_role"();



CREATE OR REPLACE TRIGGER "user_company_roles_sync_cache_trigger" BEFORE INSERT OR UPDATE OF "user_company_id" ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_company_roles_cache"();



CREATE OR REPLACE TRIGGER "user_company_roles_updated_at_trigger" BEFORE UPDATE ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_company_roles_updated_at"();



CREATE OR REPLACE TRIGGER "user_permissions_sync_cache_trigger" BEFORE INSERT OR UPDATE OF "user_company_id" ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_permissions_cache"();



CREATE OR REPLACE TRIGGER "user_permissions_updated_at_trigger" BEFORE UPDATE ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_permissions_updated_at"();



CREATE OR REPLACE TRIGGER "user_profiles_updated_at_trigger" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "users_extract_names_trigger" BEFORE INSERT OR UPDATE OF "full_name" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."extract_user_names"();



CREATE OR REPLACE TRIGGER "users_updated_at_trigger" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_updated_at"();



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_inherited_from_role_id_fkey" FOREIGN KEY ("inherited_from_role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_inherit_from_role_id_fkey" FOREIGN KEY ("inherit_from_role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_user_company_id_fkey" FOREIGN KEY ("user_company_id") REFERENCES "public"."user_companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_company_id_fkey" FOREIGN KEY ("user_company_id") REFERENCES "public"."user_companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "companies_delete" ON "public"."companies" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "companies_insert" ON "public"."companies" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "companies_select" ON "public"."companies" FOR SELECT USING (("public"."user_is_bpo"() OR "public"."user_has_company_access"("id")));



CREATE POLICY "companies_update" ON "public"."companies" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("id")));



ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissions_delete" ON "public"."permissions" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "permissions_insert" ON "public"."permissions" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "permissions_select" ON "public"."permissions" FOR SELECT USING (true);



CREATE POLICY "permissions_update" ON "public"."permissions" FOR UPDATE USING ("public"."user_is_bpo_super_admin"());



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_delete" ON "public"."role_permissions" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "role_permissions_insert" ON "public"."role_permissions" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "role_permissions_select" ON "public"."role_permissions" FOR SELECT USING (true);



CREATE POLICY "role_permissions_update" ON "public"."role_permissions" FOR UPDATE USING ("public"."user_is_bpo_super_admin"());



ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_delete" ON "public"."roles" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "roles_insert" ON "public"."roles" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "roles_select" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "roles_update" ON "public"."roles" FOR UPDATE USING ("public"."user_is_bpo_super_admin"());



ALTER TABLE "public"."user_companies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_companies_delete" ON "public"."user_companies" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_companies_insert" ON "public"."user_companies" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_companies_select" ON "public"."user_companies" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_companies_update" ON "public"."user_companies" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



ALTER TABLE "public"."user_company_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_company_roles_delete" ON "public"."user_company_roles" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_company_roles_insert" ON "public"."user_company_roles" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_company_roles_select" ON "public"."user_company_roles" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_company_roles_update" ON "public"."user_company_roles" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_permissions_delete" ON "public"."user_permissions" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_permissions_insert" ON "public"."user_permissions" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_permissions_select" ON "public"."user_permissions" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_permissions_update" ON "public"."user_permissions" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_delete" ON "public"."user_profiles" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "user_profiles_insert" ON "public"."user_profiles" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "user_profiles_select" ON "public"."user_profiles" FOR SELECT USING (true);



CREATE POLICY "user_profiles_update" ON "public"."user_profiles" FOR UPDATE USING ("public"."user_is_bpo_super_admin"());



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_delete" ON "public"."users" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "users_insert" ON "public"."users" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "users_select" ON "public"."users" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."user_is_bpo"()));



CREATE POLICY "users_update" ON "public"."users" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."user_is_bpo"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "anon";
GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_companies" TO "anon";
GRANT ALL ON TABLE "public"."user_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_companies" TO "service_role";



GRANT ALL ON TABLE "public"."user_company_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_company_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_company_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."user_company_roles_active" TO "anon";
GRANT ALL ON TABLE "public"."user_company_roles_active" TO "authenticated";
GRANT ALL ON TABLE "public"."user_company_roles_active" TO "service_role";



GRANT ALL ON TABLE "public"."user_effective_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_effective_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_effective_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_effective_permissions_v2" TO "anon";
GRANT ALL ON TABLE "public"."user_effective_permissions_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."user_effective_permissions_v2" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."users_with_profiles" TO "anon";
GRANT ALL ON TABLE "public"."users_with_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."users_with_profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
