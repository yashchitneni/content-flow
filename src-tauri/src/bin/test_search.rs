// Task #12: Test program for Full-Text Search
use sqlx::sqlite::SqlitePoolOptions;
use std::time::Instant;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to the database
    let database_url = "sqlite:../../../content-flow.db";
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    println!("Connected to database");

    // Check if we have any transcripts
    let count_row = sqlx::query_as::<_, (i64,)>("SELECT COUNT(*) FROM Transcript")
        .fetch_one(&pool)
        .await?;
    
    println!("Total transcripts in database: {}", count_row.0);

    if count_row.0 == 0 {
        println!("No transcripts found. Please import some transcripts first.");
        return Ok(());
    }

    // Test search queries
    let test_queries = vec![
        "video",
        "content",
        "tutorial",
        "hello world",
    ];

    for query in test_queries {
        println!("\n--- Testing search for: '{}' ---", query);
        
        let start = Instant::now();
        
        // Count matching results
        let count_result = sqlx::query_as::<_, (i32,)>(
            "SELECT COUNT(*) FROM TranscriptFTS WHERE TranscriptFTS MATCH ?1"
        )
        .bind(query)
        .fetch_one(&pool)
        .await;

        match count_result {
            Ok(count) => {
                println!("Found {} matching transcripts", count.0);
                
                if count.0 > 0 {
                    // Get top 3 results
                    let search_result = sqlx::query_as::<_, (String, String, f64)>(
                        r#"
                        SELECT 
                            t.TranscriptID,
                            SUBSTR(t.Content, 1, 100) as snippet,
                            rank
                        FROM TranscriptFTS fts
                        JOIN Transcript t ON fts.TranscriptID = t.TranscriptID
                        WHERE TranscriptFTS MATCH ?1
                        ORDER BY rank
                        LIMIT 3
                        "#
                    )
                    .bind(query)
                    .fetch_all(&pool)
                    .await?;

                    for (id, snippet, rank) in search_result {
                        println!("\n  ID: {}", id);
                        println!("  Snippet: {}...", snippet);
                        println!("  Rank: {}", -rank);
                    }
                }
            }
            Err(e) => {
                println!("Search error: {}", e);
            }
        }
        
        let elapsed = start.elapsed();
        println!("Search time: {:.2}ms", elapsed.as_secs_f64() * 1000.0);
    }

    // Test performance with a more complex query
    println!("\n--- Performance Test ---");
    let start = Instant::now();
    
    let perf_result = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM TranscriptFTS WHERE TranscriptFTS MATCH 'content OR video OR tutorial'"
    )
    .fetch_one(&pool)
    .await?;
    
    let elapsed = start.elapsed();
    println!("Complex query matched {} results in {:.2}ms", perf_result.0, elapsed.as_secs_f64() * 1000.0);
    
    if elapsed.as_millis() < 200 {
        println!("✓ Performance requirement met (<200ms)");
    } else {
        println!("✗ Performance requirement NOT met (>200ms)");
    }

    Ok(())
}