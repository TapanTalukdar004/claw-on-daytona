# Claw-on-Daytona 🦅

**Remote-First AI Agent Gateway** – Deploy OpenClaw on Daytona sandboxes with a single command.

## Overview

Claw-on-Daytona is a Node.js CLI tool that automates the deployment of OpenClaw (an AI agent platform) onto remote Daytona sandboxes. Instead of running resource-intensive AI workloads locally, you provision a dedicated remote sandbox with specified resources, install OpenClaw inside it, and access the web UI via a secure Daytona preview link.

## Why This Exists

- **Local Machine Preservation**: AI workloads can be CPU/RAM heavy. Offload them to a remote sandbox.
- **Isolation**: Each deployment is a fresh, isolated environment.
- **Portability**: The sandbox can be accessed from any device with a browser.
- **Reproducibility**: Same configuration every time.

## Architecture

```
Local Machine (You)
        │
        ├── Daytona CLI (or SDK)
        │       creates/manages
        ▼
Daytona Sandbox (openclaw-server)
        │
        ├── 4 vCPU, 8GB RAM, 10GB disk
        │
        ├── OpenClaw installed via install.sh
        │
        ├── OpenClaw onboard (--install-daemon --yes)
        │
        └── Web UI on port 18789
                │
                └── Daytona Preview URL
```

## Installation

### As a Global CLI Tool

```bash
npm install -g claw-on-daytona
```

### Using `npx` (No Installation Required)

```bash
npx claw-on-daytona
```

## Usage

### Basic Deployment

```bash
claw-on-daytona
```

This will:
1. Check if Daytona is installed (prompt to install if missing)
2. Authenticate with Daytona (`daytona login`)
3. Provision a sandbox named `openclaw-server` with 4 CPU, 8GB RAM, 10GB disk
4. Install OpenClaw inside the sandbox
5. Run OpenClaw onboard with daemon installation
6. Generate and display a signed preview URL for the web UI

### Advanced Options

```bash
claw-on-daytona --name my-sandbox --cpu 8 --mem 16 --disk 20
```

### Command-line Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--name` | Sandbox name | `openclaw-server` |
| `--cpu` | Number of vCPUs | `4` |
| `--mem` | Memory in GB | `8` |
| `--disk` | Disk space in GB | `10` |
| `--port` | OpenClaw web UI port | `18789` |
| `--skip-auth` | Skip Daytona authentication | `false` |
| `--destroy` | Destroy existing sandbox before creating | `false` |

## How It Works Internally

The CLI orchestrates the following steps:

1. **Environment Check**: Verifies `daytona` CLI is installed and in PATH.
2. **Authentication**: Runs `daytona login` to ensure the user is logged in.
3. **Sandbox Provisioning**: Creates a remote sandbox with the specified resources using `daytona create`.
4. **OpenClaw Installation**: Executes `curl -fsSL https://openclaw.ai/install.sh | bash` inside the sandbox.
5. **Headless Onboarding**: Runs `openclaw onboard --install-daemon --yes` to configure OpenClaw.
6. **Tunneling**: Uses `daytona preview-url` to generate a secure, signed URL for port 18789.
7. **Output**: Presents the URL in a cinematic ASCII box.

## Project Structure

```
.
├── bin/
│   └── cli.js              # Entry point for npx
├── src/
│   ├── cli.js              # Main CLI orchestration logic
│   ├── daytona.js          # Daytona sandbox lifecycle management
│   └── openclaw.js         # OpenClaw installation and remote execution
├── package.json
└── README.md
```

## Dependencies

- [`ora`](https://github.com/sindresorhus/ora): Terminal spinners for visual feedback
- [`execa`](https://github.com/sindresorhus/execa): Execute shell commands
- [`chalk`](https://github.com/chalk/chalk): Terminal string styling
- [`boxen`](https://github.com/sindresorhus/boxen): Create boxes in the terminal

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Daytona CLI](https://daytona.io/docs) installed and configured
- Daytona account (for authentication)

## Development

### Setup

```bash
git clone <repository-url>
cd claw-on-daytona
npm install
```

### Link for Local Testing

```bash
npm link
claw-on-daytona
```

### Run Tests

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [Daytona](https://daytona.io) for the sandbox platform
- [OpenClaw](https://openclaw.ai) for the AI agent infrastructure
- All open-source libraries that make this possible

---

**Happy remote AI agent deployment!** 🚀