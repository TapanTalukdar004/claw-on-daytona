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
      // Method 1: Try winget first (most reliable if available)
      this.spinner.text = 'Trying winget installation...';
      await execa('winget', ['install', '--id', 'Daytona.Daytona', '-e', '--source', 'winget'], { stdio: 'inherit' });
      this.spinner.succeed('Daytona installed successfully via winget!');
      return true;
    } catch (wingetError) {
      this.spinner.text = 'Winget failed, trying official installation script...';
      
      try {
        // Method 2: Official Daytona installation command
        this.spinner.text = 'Running official Daytona install command...';
        await execa('powershell', ['-Command', 'irm https://download.daytona.io/daytona.ps1 | iex'], { stdio: 'inherit' });
        this.spinner.succeed('Daytona installed successfully via official script!');
        return true;
      } catch (psError) {
        this.spinner.text = 'Official script failed, trying alternative method...';
        
        try {
          // Method 3: Alternative installation via curl (if available)
          this.spinner.text = 'Trying alternative installation method...';
          await execa('curl', ['-fsSL', 'https://download.daytona.io/install.sh', '-o', 'install-daytona.sh'], { stdio: 'inherit' });
          await execa('bash', ['install-daytona.sh'], { stdio: 'inherit' });
          this.spinner.succeed('Daytona installed successfully via alternative method!');
          return true;
        } catch (curlError) {
          this.spinner.text = 'All automatic methods failed, providing manual instructions...';
          
          // Method 4: Provide manual download instructions
          this.spinner.warn('Automatic installation failed. Please install Daytona manually:');
          this.spinner.info('1. Download Daytona from: https://daytona.io/download');
          this.spinner.info('2. Run the installer');
          this.spinner.info('3. Add Daytona to your PATH if not automatically added');
          this.spinner.info('4. Run "claw-on-daytona" again');
          return false;
        }
      }
    }
  }

  /**
   * Install Daytona on macOS
   */
  async installDaytonaMacOS() {
    this.spinner.text = 'Installing Daytona on macOS...';
    
    try {
      // Method 1: Homebrew
      await execa('brew', ['install', 'daytona'], { stdio: 'inherit' });
      this.spinner.succeed('Daytona installed successfully via Homebrew!');
      return true;
    } catch (brewError) {
      this.spinner.text = 'Homebrew failed, trying curl installation...';
      
      try {
        // Method 2: Direct curl installation
        await execa('sh', ['-c', 'curl -fsSL https://download.daytona.io/install.sh | sh'], { stdio: 'inherit' });
        this.spinner.succeed('Daytona installed successfully via curl!');
        return true;
      } catch (curlError) {
        this.spinner.warn('Automatic installation failed. Please install Daytona manually:');
        this.spinner.info('Visit: https://daytona.io/docs/installation');
        return false;
      }
    }
  }

  /**
   * Install Daytona on Linux
   */
  async installDaytonaLinux() {
    this.spinner.text = 'Installing Daytona on Linux...';
    
    try {
      // Standard installation script
      await execa('sh', ['-c', 'curl -fsSL https://download.daytona.io/install.sh | sh'], { stdio: 'inherit' });
      this.spinner.succeed('Daytona installed successfully!');
      return true;
    } catch (error) {
      this.spinner.warn('Automatic installation failed. Please install Daytona manually:');
      this.spinner.info('Visit: https://daytona.io/docs/installation');
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