const ora = require('ora');

class OpenClawInstaller {
  constructor(daytonaManager) {
    this.daytona = daytonaManager;
    this.spinner = null;
  }

  /**
   * Check if OpenClaw is already installed in the sandbox
   */
  async isInstalled(sandboxName = 'openclaw-server') {
    try {
      await this.daytona.execInSandbox(sandboxName, 'which openclaw');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install OpenClaw in the sandbox
   */
  async install(sandboxName = 'openclaw-server') {
    // Check if already installed
    const alreadyInstalled = await this.isInstalled(sandboxName);
    if (alreadyInstalled) {
      console.log('✓ OpenClaw is already installed in the sandbox');
      return true;
    }

    this.spinner = ora('Installing OpenClaw...').start();
    try {
      const installCommand = 'curl -fsSL https://openclaw.ai/install.sh | bash';
      await this.daytona.execInSandbox(sandboxName, installCommand);
      this.spinner.succeed('OpenClaw installed successfully');
      return true;
    } catch (error) {
      this.spinner.fail('Failed to install OpenClaw');
      throw error;
    }
  }

  /**
   * Run OpenClaw onboard with daemon installation
   */
  async onboard(sandboxName = 'openclaw-server') {
    this.spinner = ora('Configuring OpenClaw (headless onboard)...').start();
    try {
      const onboardCommand = 'openclaw onboard --install-daemon --yes';
      await this.daytona.execInSandbox(sandboxName, onboardCommand);
      this.spinner.succeed('OpenClaw onboard completed');
      return true;
    } catch (error) {
      this.spinner.fail('Failed to run OpenClaw onboard');
      throw error;
    }
  }

  /**
   * Start OpenClaw web UI (runs on port 18789 by default)
   */
  async startWebUI(sandboxName = 'openclaw-server') {
    this.spinner = ora('Starting OpenClaw Web UI...').start();
    try {
      // OpenClaw likely runs as a service after onboard, but we can ensure it's running
      const startCommand = 'openclaw start';
      await this.daytona.execInSandbox(sandboxName, startCommand);
      this.spinner.succeed('OpenClaw Web UI started');
      return true;
    } catch (error) {
      this.spinner.warn('OpenClaw may already be running or start command failed');
      // Continue anyway - the service might already be running
      return false;
    }
  }

  /**
   * Check if OpenClaw is running in the sandbox
   */
  async checkStatus(sandboxName = 'openclaw-server') {
    this.spinner = ora('Checking OpenClaw status...').start();
    try {
      const statusCommand = 'openclaw status';
      await this.daytona.execInSandbox(sandboxName, statusCommand);
      this.spinner.succeed('OpenClaw is running');
      return true;
    } catch (error) {
      this.spinner.fail('OpenClaw is not running or not installed');
      return false;
    }
  }

  /**
   * Get the web UI URL via Daytona preview
   */
  async getWebUIUrl(sandboxName = 'openclaw-server', port = 18789) {
    try {
      const url = await this.daytona.getPreviewUrl(sandboxName, port);
      return url;
    } catch (error) {
      throw new Error(`Failed to get preview URL: ${error.message}`);
    }
  }

  /**
   * Full deployment workflow
   */
  async deploy(sandboxName = 'openclaw-server') {
    try {
      await this.install(sandboxName);
      await this.onboard(sandboxName);
      await this.startWebUI(sandboxName);
      await this.checkStatus(sandboxName);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OpenClawInstaller;