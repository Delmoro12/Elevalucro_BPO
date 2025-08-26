alter table "public"."user_companies" drop constraint "user_companies_join_type_valid";

alter table "public"."user_companies" drop constraint "user_companies_status_valid";

alter table "public"."user_company_roles" drop constraint "user_company_roles_approval_status_valid";

alter table "public"."user_company_roles" drop constraint "user_company_roles_assignment_type_valid";

alter table "public"."user_companies" add constraint "user_companies_join_type_valid" CHECK (((join_type)::text = ANY ((ARRAY['invited'::character varying, 'requested'::character varying, 'transferred'::character varying, 'created'::character varying])::text[]))) not valid;

alter table "public"."user_companies" validate constraint "user_companies_join_type_valid";

alter table "public"."user_companies" add constraint "user_companies_status_valid" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying, 'suspended'::character varying])::text[]))) not valid;

alter table "public"."user_companies" validate constraint "user_companies_status_valid";

alter table "public"."user_company_roles" add constraint "user_company_roles_approval_status_valid" CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."user_company_roles" validate constraint "user_company_roles_approval_status_valid";

alter table "public"."user_company_roles" add constraint "user_company_roles_assignment_type_valid" CHECK (((assignment_type)::text = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying, 'inherited'::character varying])::text[]))) not valid;

alter table "public"."user_company_roles" validate constraint "user_company_roles_assignment_type_valid";


