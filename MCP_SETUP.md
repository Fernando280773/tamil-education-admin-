# MCP VS Code Setup Guide

## 🔧 Model Context Protocol (MCP) Setup for VS Code

### Prerequisites
- **VS Code version 1.101 or greater** ✅
- **GitHub Copilot Extension** installed
- **Node.js** installed (for MCP servers)

### 📁 Configuration Files Created

#### 1. `.vscode/settings.json`
```json
{
  "mcp.servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  },
  "mcp.enabled": true
}
```

#### 2. `mcp.json` (Project-level MCP config)
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "filesystem": {
      "command": "node",
      "args": ["-e", "console.log('MCP filesystem server')"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  },
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

---

## 🚀 Setup Steps

### Step 1: Install VS Code CLI (if not already installed)
```bash
# For macOS - Install VS Code CLI
# Open VS Code > Command Palette (Cmd+Shift+P) > "Shell Command: Install 'code' command in PATH"
```

### Step 2: Verify VS Code Version
```bash
code --version
# Should show version 1.101 or greater
```

### Step 3: Install Required Extensions
1. **GitHub Copilot** (should already be installed)
2. **GitHub Copilot Chat** (if available)

### Step 4: Install MCP Server Dependencies
```bash
# Install MCP GitHub server
npm install -g @modelcontextprotocol/server-github

# Or install locally in your project
npm install @modelcontextprotocol/server-github
```

### Step 5: Configure GitHub Token (Optional)
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with appropriate permissions
3. Replace `your_github_token_here` in `mcp.json`

### Step 6: Restart VS Code
1. Close VS Code completely
2. Reopen your project
3. Check if MCP is working in GitHub Copilot Chat

---

## 🔍 Verification

### Check if MCP is Working:
1. Open **GitHub Copilot Chat** in VS Code
2. Try asking questions about your codebase
3. Look for enhanced context awareness
4. Check VS Code Developer Tools for MCP connections

### Debug MCP Issues:
1. Open **Output Panel** in VS Code
2. Select **GitHub Copilot** from dropdown
3. Look for MCP-related logs

---

## 📝 MCP Configuration Options

### Global VS Code Settings
Add to your global `settings.json`:
```json
{
  "mcp.enabled": true,
  "mcp.servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

### User-Level MCP Config
Create `~/.config/mcp/config.json`:
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

---

## 🎯 What MCP Enables

✅ **Enhanced Code Context**: Better understanding of your codebase
✅ **Repository Awareness**: GitHub repository integration
✅ **Cross-file References**: Better code navigation and suggestions
✅ **Project Understanding**: Improved AI assistance for your specific project

---

## 🛠️ Troubleshooting

### Issue: MCP Not Working
- Ensure VS Code version 1.101+
- Check GitHub Copilot extension is updated
- Restart VS Code after configuration changes

### Issue: GitHub Server Not Connecting
- Verify internet connection
- Check GitHub API status
- Validate GitHub token permissions

### Issue: Configuration Not Loading
- Check JSON syntax in config files
- Verify file permissions
- Check VS Code output logs

---

## 📚 Additional Resources

- [MCP Documentation](https://github.com/modelcontextprotocol/specification)
- [VS Code Extensions API](https://code.visualstudio.com/api)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

---

**✨ Your Tamil Education app is now configured with MCP for enhanced AI assistance!**
