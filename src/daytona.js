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
      // This is a placeholder - actual installation would depend on OS
      // For now, we'll assume it's installed via package manager
      this.spinner.warn('Please install Daytona manually: https://daytona.io/docs');
      return false;
    } catch (error) {
      this.spinner.fail('Failed to install Daytona');
      throw error;
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