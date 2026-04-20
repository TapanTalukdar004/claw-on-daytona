const execa = require('execa');
const ora = require('ora').default;

class DaytonaManager {
  constructor() {
    this.spinner = null;
  }

  /**
   * Check if daytona CLI is installed
   */
  async checkDaytonaInstalled() {
    this.spinner = ora('Checking Daytona installation...').start();
    try {
      await execa('daytona', ['--version']);
      this.spinner.succeed('Daytona is installed');
      return true;
    } catch (error) {
      this.spinner.fail('Daytona is not installed or not in PATH');
      return false;
    }
  }

  /**
   * Install daytona if not present
   */
  async installDaytona() {
    this.spinner = ora('Installing Daytona...').start();
    try {
      const { platform } = process;
      
      if (platform === 'win32') {
        // Windows installation with multiple fallback methods
        return await this.installDaytonaWindows();
      } else if (platform === 'darwin') {
        // macOS installation
        return await this.installDaytonaMacOS();
      } else if (platform === 'linux') {
        // Linux installation
        return await this.installDaytonaLinux();
      } else {
        this.spinner.warn(`Unsupported platform: ${platform}`);
        this.spinner.info('Please install Daytona manually: https://daytona.io/docs');
        return false;
      }
    } catch (error) {
      this.spinner.fail('Failed to install Daytona');
      this.spinner.info('Please install Daytona manually: https://daytona.io/docs');
      throw error;
    }
  }

  /**
   * Install Daytona on Windows
   */
  async installDaytonaWindows() {
    this.spinner.text = 'Installing Daytona on Windows...';
    
    try {
      // Method 1: Try winget first
      this.spinner.text = 'Trying winget installation...';
      try {
        await execa('winget', ['install', '--id', 'Daytona.Daytona', '-e', '--source', 'winget'], { stdio: 'inherit' });
        this.spinner.succeed('Daytona installed successfully via winget!');
        return true;
      } catch (wingetError) {
        this.spinner.text = 'Winget package not found, trying alternative methods...';
      }
      
      // Method 2: Check if WSL is installed (Daytona requires WSL on Windows)
      this.spinner.text = 'Checking WSL installation...';
      try {
        await execa('wsl', ['--status'], { stdio: 'pipe' });
      } catch (wslError) {
        this.spinner.warn('WSL (Windows Subsystem for Linux) is required for Daytona.');
        this.spinner.info('Installing WSL...');
        try {
          await execa('wsl', ['--install'], { stdio: 'inherit' });
          this.spinner.text = 'WSL installed. Please restart your computer and run the command again.';
          this.spinner.info('After restart, run: claw-on-daytona');
          return false;
        } catch (wslInstallError) {
          this.spinner.warn('Failed to install WSL automatically.');
        }
      }
      
      // Method 3: Direct download and install
      this.spinner.text = 'Downloading Daytona installer...';
      this.spinner.warn('Automatic installation is limited on Windows.');
      this.spinner.info('Please install Daytona manually:');
      this.spinner.info('1. Visit: https://daytona.io/docs/installation');
      this.spinner.info('2. Follow Windows installation instructions');
      this.spinner.info('3. Ensure WSL is installed and configured');
      this.spinner.info('4. After installation, run: claw-on-daytona');
      return false;
      
    } catch (error) {
      this.spinner.fail('Failed to install Daytona on Windows');
      this.spinner.info('Please install Daytona manually from: https://daytona.io/docs/installation');
      return false;
    }
  }

  /**
   * Install Daytona on macOS
   */
  async installDaytonaMacOS() {
    this.spinner.text = 'Installing Daytona on macOS...';
    
    try {
      // Method 1: Homebrew (most common)
      this.spinner.text = 'Trying Homebrew installation...';
      try {
        await execa('brew', ['install', 'daytona'], { stdio: 'inherit' });
        this.spinner.succeed('Daytona installed successfully via Homebrew!');
        return true;
      } catch (brewError) {
        this.spinner.text = 'Homebrew not available or failed...';
      }
      
      // Method 2: Manual instructions
      this.spinner.warn('Automatic installation limited on macOS.');
      this.spinner.info('Please install Daytona manually:');
      this.spinner.info('1. Visit: https://daytona.io/docs/installation');
      this.spinner.info('2. Follow macOS installation instructions');
      this.spinner.info('3. After installation, run: claw-on-daytona');
      return false;
      
    } catch (error) {
      this.spinner.fail('Failed to install Daytona on macOS');
      this.spinner.info('Please install Daytona manually from: https://daytona.io/docs/installation');
      return false;
    }
  }

  /**
   * Install Daytona on Linux
   */
  async installDaytonaLinux() {
    this.spinner.text = 'Installing Daytona on Linux...';
    
    try {
      // Try the official installation script
      this.spinner.text = 'Running official installation script...';
      try {
        await execa('sh', ['-c', 'curl -fsSL https://download.daytona.io/install.sh | sh'], { stdio: 'inherit' });
        this.spinner.succeed('Daytona installed successfully!');
        return true;
      } catch (scriptError) {
        this.spinner.text = 'Installation script failed...';
      }
      
      // Method 2: Manual instructions
      this.spinner.warn('Automatic installation may not work on all Linux distributions.');
      this.spinner.info('Please install Daytona manually:');
      this.spinner.info('1. Visit: https://daytona.io/docs/installation');
      this.spinner.info('2. Follow Linux installation instructions for your distribution');
      this.spinner.info('3. After installation, run: claw-on-daytona');
      return false;
      
    } catch (error) {
      this.spinner.fail('Failed to install Daytona on Linux');
      this.spinner.info('Please install Daytona manually from: https://daytona.io/docs/installation');
      return false;
    }
  }

  /**
   * Check if already authenticated with daytona
   */
  async isAuthenticated() {
    try {
      await execa('daytona', ['whoami']);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authenticate with daytona
   */
  async authenticate() {
    // First check if already authenticated
    const isAuthenticated = await this.isAuthenticated();
    if (isAuthenticated) {
      console.log('✓ Already authenticated with Daytona');
      return true;
    }

    this.spinner = ora('Authenticating with Daytona (this may open a browser)...').start();
    try {
      // Use 'inherit' to allow user interaction for login
      await execa('daytona', ['login'], { stdio: 'inherit' });
      this.spinner.succeed('Authenticated with Daytona');
      return true;
    } catch (error) {
      this.spinner.fail('Authentication failed');
      throw error;
    }
  }

  /**
   * Create a sandbox with specified resources
   */
  async createSandbox(name = 'openclaw-server', cpu = 4, memory = 8, disk = 10) {
    this.spinner = ora(`Provisioning sandbox "${name}" (${cpu} CPU, ${memory}GB RAM, ${disk}GB disk)...`).start();
    try {
      await execa('daytona', [
        'create',
        '--cpu', cpu.toString(),
        '--mem', memory.toString(),
        '--disk', disk.toString(),
        '--name', name
      ], { stdio: 'inherit' });
      this.spinner.succeed(`Sandbox "${name}" created successfully`);
      return true;
    } catch (error) {
      this.spinner.fail(`Failed to create sandbox "${name}"`);
      throw error;
    }
  }

  /**
   * Execute a command in the sandbox
   */
  async execInSandbox(sandboxName, command) {
    this.spinner = ora(`Executing command in "${sandboxName}"...`).start();
    try {
      const { stdout, stderr } = await execa('daytona', ['exec', '-s', sandboxName, command]);
      this.spinner.succeed(`Command executed in "${sandboxName}"`);
      return { stdout, stderr };
    } catch (error) {
      this.spinner.fail(`Failed to execute command in "${sandboxName}"`);
      throw error;
    }
  }

  /**
   * Get preview URL for a port in the sandbox
   */
  async getPreviewUrl(sandboxName, port = 18789) {
    this.spinner = ora(`Generating preview URL for port ${port}...`).start();
    try {
      const { stdout } = await execa('daytona', ['preview-url', sandboxName, '--port', port.toString()]);
      const url = stdout.trim();
      this.spinner.succeed(`Preview URL generated`);
      return url;
    } catch (error) {
      this.spinner.fail(`Failed to generate preview URL`);
      throw error;
    }
  }

  /**
   * Check if sandbox exists
   */
  async sandboxExists(sandboxName) {
    try {
      await execa('daytona', ['info', sandboxName]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Destroy sandbox
   */
  async destroySandbox(sandboxName) {
    this.spinner = ora(`Destroying sandbox "${sandboxName}"...`).start();
    try {
      await execa('daytona', ['delete', sandboxName], { stdio: 'inherit' });
      this.spinner.succeed(`Sandbox "${sandboxName}" destroyed`);
      return true;
    } catch (error) {
      this.spinner.fail(`Failed to destroy sandbox "${sandboxName}"`);
      throw error;
    }
  }
}

module.exports = DaytonaManager;