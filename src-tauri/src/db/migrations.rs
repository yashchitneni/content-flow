use sqlx::{SqlitePool, Row};

const MIGRATIONS: &[(&str, &str)] = &[
    ("001_initial_schema", include_str!("migrations/001_initial_schema.sql")),
];

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
    // Create migrations table if it doesn't exist
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS migrations (
            id TEXT PRIMARY KEY,
            applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Run each migration
    for (id, sql) in MIGRATIONS {
        // Check if migration has already been applied
        let exists: bool = sqlx::query("SELECT EXISTS(SELECT 1 FROM migrations WHERE id = ?)")
            .bind(id)
            .fetch_one(pool)
            .await?
            .get(0);
        
        if !exists {
            println!("Running migration: {}", id);
            
            // Execute migration in a transaction
            let mut tx = pool.begin().await?;
            
            // SQLite requires executing statements separately
            // Split by complete statements, handling CREATE TRIGGER specially
            let mut statements = Vec::new();
            let mut current_statement = String::new();
            let mut in_trigger = false;
            
            for line in sql.lines() {
                let trimmed = line.trim();
                
                if trimmed.to_uppercase().starts_with("CREATE TRIGGER") {
                    in_trigger = true;
                }
                
                current_statement.push_str(line);
                current_statement.push('\n');
                
                if in_trigger && trimmed.to_uppercase() == "END;" {
                    statements.push(current_statement.trim().to_string());
                    current_statement.clear();
                    in_trigger = false;
                } else if !in_trigger && trimmed.ends_with(';') {
                    statements.push(current_statement.trim().to_string());
                    current_statement.clear();
                }
            }
            
            // Execute each statement
            for statement in statements {
                if !statement.is_empty() {
                    sqlx::query(&statement)
                        .execute(&mut *tx)
                        .await
                        .map_err(|e| format!("Failed to execute statement: {}\nError: {}", 
                            statement.lines().next().unwrap_or(""), e))?;
                }
            }
            
            // Record migration as applied
            sqlx::query("INSERT INTO migrations (id) VALUES (?)")
                .bind(id)
                .execute(&mut *tx)
                .await?;
            
            tx.commit().await?;
            
            println!("Migration {} applied successfully", id);
        } else {
            println!("Migration {} already applied, skipping", id);
        }
    }
    
    Ok(())
}