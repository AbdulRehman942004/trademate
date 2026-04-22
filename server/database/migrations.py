import logging
from sqlalchemy import text, inspect
from .database import engine

logger = logging.getLogger(__name__)

def run_migrations():
    """
    Simple migration runner to handle schema changes that SQLModel.create_all() 
    doesn't handle (like column type changes or additions to existing tables).
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # --- Migration 1: Ensure otp_codes.used is BOOLEAN ---
    if "otp_codes" in tables:
        columns = inspector.get_columns("otp_codes")
        used_col = next((c for c in columns if c["name"] == "used"), None)
        
        if used_col:
            # In PostgreSQL, VARCHAR(5) shows up as VARCHAR. 
            # We want to make sure it's BOOLEAN.
            type_str = str(used_col["type"]).upper()
            if "VARCHAR" in type_str or "CHAR" in type_str:
                logger.info("Migrating otp_codes.used from %s to BOOLEAN...", type_str)
                try:
                    with engine.connect() as conn:
                        conn.execute(text("ALTER TABLE otp_codes ALTER COLUMN used TYPE BOOLEAN USING used::boolean;"))
                        conn.commit()
                    logger.info("Successfully migrated otp_codes.used to BOOLEAN.")
                except Exception as e:
                    logger.error("Failed to migrate otp_codes.used: %s", e)

    # Future migrations can be added here...
