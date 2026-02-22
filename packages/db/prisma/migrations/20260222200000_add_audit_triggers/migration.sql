CREATE OR REPLACE FUNCTION audit_capture_row_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
  v_row_id text;
  v_actor_user_id text;
  v_actor_session_id text;
  v_source text;
  v_intent text;
  v_request_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    v_row_id := v_new ->> 'id';
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_row_id := COALESCE(v_new ->> 'id', v_old ->> 'id');
  ELSE
    v_old := to_jsonb(OLD);
    v_row_id := v_old ->> 'id';
  END IF;

  IF TG_TABLE_NAME = 'BetterAuthAccount' THEN
    v_old := v_old - 'password' - 'accessToken' - 'refreshToken' - 'idToken';
    v_new := v_new - 'password' - 'accessToken' - 'refreshToken' - 'idToken';
  ELSIF TG_TABLE_NAME = 'BetterAuthSession' THEN
    v_old := v_old - 'token';
    v_new := v_new - 'token';
  ELSIF TG_TABLE_NAME = 'BetterAuthVerification' THEN
    v_old := v_old - 'value';
    v_new := v_new - 'value';
  END IF;

  v_actor_user_id := nullif(current_setting('app.audit.actor_user_id', true), '');
  v_actor_session_id := nullif(current_setting('app.audit.actor_session_id', true), '');
  v_source := upper(COALESCE(nullif(current_setting('app.audit.source', true), ''), 'SYSTEM'));
  v_intent := nullif(current_setting('app.audit.intent', true), '');
  v_request_id := nullif(current_setting('app.audit.request_id', true), '');

  INSERT INTO "AuditEvent" (
    "action",
    "tableName",
    "rowId",
    "actorUserId",
    "actorSessionId",
    "source",
    "intent",
    "requestId",
    "oldData",
    "newData"
  )
  VALUES (
    TG_OP::"AuditAction",
    TG_TABLE_NAME,
    v_row_id,
    v_actor_user_id,
    v_actor_session_id,
    CASE
      WHEN v_source IN ('WEB', 'SCRIPT', 'SYSTEM') THEN v_source::"AuditSource"
      ELSE 'SYSTEM'::"AuditSource"
    END,
    v_intent,
    v_request_id,
    v_old,
    v_new
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_better_auth_user
AFTER INSERT OR UPDATE OR DELETE ON "BetterAuthUser"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_better_auth_session
AFTER INSERT OR UPDATE OR DELETE ON "BetterAuthSession"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_better_auth_account
AFTER INSERT OR UPDATE OR DELETE ON "BetterAuthAccount"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_better_auth_verification
AFTER INSERT OR UPDATE OR DELETE ON "BetterAuthVerification"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_dog
AFTER INSERT OR UPDATE OR DELETE ON "Dog"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_dog_registration
AFTER INSERT OR UPDATE OR DELETE ON "DogRegistration"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_breeder
AFTER INSERT OR UPDATE OR DELETE ON "Breeder"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_owner
AFTER INSERT OR UPDATE OR DELETE ON "Owner"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_dog_ownership
AFTER INSERT OR UPDATE OR DELETE ON "DogOwnership"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_trial_result
AFTER INSERT OR UPDATE OR DELETE ON "TrialResult"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_show_result
AFTER INSERT OR UPDATE OR DELETE ON "ShowResult"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_import_run
AFTER INSERT OR UPDATE OR DELETE ON "ImportRun"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

CREATE TRIGGER trg_audit_import_run_issue
AFTER INSERT OR UPDATE OR DELETE ON "ImportRunIssue"
FOR EACH ROW EXECUTE FUNCTION audit_capture_row_change();

