# MCP Configuration Rules and Best Practices

## Configuration Hierarchy

### 1. Global MCP Configuration
**Location**: `~/.cursor/mcp.json`
- Contains MCP servers you want available in ALL projects
- Ideal for general-purpose tools like:
  - `taskmaster-ai` (project management)
  - `context7` (documentation lookup)
  - `playwright` (browser automation)
  - `supabase` (database tools)
  - General development utilities

### 2. Project-Specific MCP Configuration  
**Location**: `<project>/.cursor/mcp.json`
- Contains MCP servers specific to THIS project only
- Ideal for:
  - Project-specific database connections
  - Custom project tools
  - Client-specific API integrations
  - Development servers unique to this project

## Priority Rules
⚠️ **Important**: Project-specific configs OVERRIDE global configs for the same server name!

## Best Practices

### DO:
✅ Put general-purpose tools in global config (`~/.cursor/mcp.json`)
✅ Put project-specific tools in project config (`<project>/.cursor/mcp.json`)
✅ Store API keys in the appropriate config level
✅ Keep project configs minimal - only what's unique to that project

### DON'T:
❌ Duplicate servers between global and project configs
❌ Put project-specific database connections in global config
❌ Store placeholder API keys that override real ones

## Common MCP Servers by Category

### Global (Put in `~/.cursor/mcp.json`):
- `taskmaster-ai` - Project management
- `context7` - Documentation search
- `playwright` - Browser automation
- `filesystem` - File operations
- `github` - GitHub integration
- `perplexity` - AI research

### Project-Specific (Put in `<project>/.cursor/mcp.json`):
- Database connections for THIS project
- Custom build tools
- Client-specific APIs
- Local development servers

## Troubleshooting

### "FastMCP could not infer client capabilities" Warning
**Cause**: Usually missing or invalid API keys
**Solution**: 
1. Check if server is duplicated in both configs
2. Ensure API keys are valid in the config being used
3. Restart Cursor after fixing

### Server Not Available
**Check**:
1. Is it in the right config file?
2. Is Cursor restarted after adding it?
3. Are there any syntax errors in the JSON?

## For ContentFlow Project
- ✅ `taskmaster-ai` is in global config with valid API keys
- ✅ Project config is now empty (no duplicates)
- ✅ You can access taskmaster-ai from any project

## Claude Desktop vs Cursor
- **Claude Desktop**: Uses its own MCP config (usually `~/claude_mcp.json` or similar)
- **Cursor**: Uses `~/.cursor/mcp.json` (global) and `<project>/.cursor/mcp.json` (project)
- They are separate systems - configs don't mix 