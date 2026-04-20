const chalk = require('chalk');
const boxen = require('boxen');
const DaytonaManager = require('./daytona');
const OpenClawInstaller = require('./openclaw');

async function main() {
  console.log(chalk.bold.cyan('\n🦅 Claw-on-Daytona - Remote-First AI Agent Gateway\n'));

  const daytona = new DaytonaManager();
  const openclaw = new OpenClawInstaller(daytona);

  const sandboxName = 'openclaw-server';
  const cpu = 4;
  const memory = 8;
  const disk = 10;
  const port = 18789;

  try {
    // Step 1: Check Daytona installation
    const isDaytonaInstalled = await daytona.checkDaytonaInstalled();
    if (!isDaytonaInstalled) {
      console.log(chalk.yellow('\n⚠️  Daytona is required for this tool.'));
      console.log(chalk.yellow('Please install it from: https://daytona.io/docs\n'));
      const shouldInstall = false; // In a real CLI, you'd prompt the user
      if (shouldInstall) {
        await daytona.installDaytona();
      } else {
        console.log(chalk.red('Exiting. Daytona is not installed.'));
        process.exit(1);
      }
    }

    // Step 2: Authenticate
    await daytona.authenticate();

    // Step 3: Check if sandbox already exists
    const sandboxExists = await daytona.sandboxExists(sandboxName);
    if (sandboxExists) {
      console.log(chalk.yellow(`\n⚠️  Sandbox "${sandboxName}" already exists.`));
      console.log(chalk.yellow('Using existing sandbox...'));
    } else {
      // Step 4: Create sandbox
      await daytona.createSandbox(sandboxName, cpu, memory, disk);
    }

    // Step 5: Check if OpenClaw is already installed
    const isOpenClawInstalled = await openclaw.isInstalled(sandboxName);
    
    if (isOpenClawInstalled) {
      console.log(chalk.green('✓ OpenClaw is already installed in the sandbox'));
      // Check if OpenClaw is already running
      await openclaw.checkStatus(sandboxName);
    } else {
      // Step 6: Install OpenClaw
      await openclaw.install(sandboxName);

      // Step 7: Run OpenClaw onboard
      await openclaw.onboard(sandboxName);

      // Step 8: Start OpenClaw Web UI
      await openclaw.startWebUI(sandboxName);
    }

    // Step 9: Get preview URL
    const previewUrl = await openclaw.getWebUIUrl(sandboxName, port);

    // Step 10: Display the URL in a cinematic box
    const message = chalk.bold.green('✅ OpenClaw is ready!');
    const urlDisplay = chalk.bold.cyan(previewUrl);
    const box = boxen(
      `${message}\n\n${urlDisplay}\n\n` +
      chalk.gray('Open this URL in your browser to access the OpenClaw Web UI.\n') +
      chalk.gray('The sandbox will remain running until you manually delete it.'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#000'
      }
    );

    console.log('\n' + box);
    console.log(chalk.gray('\n💡 Tip: To destroy the sandbox later, run:'));
    console.log(chalk.gray(`   daytona delete ${sandboxName}\n`));

  } catch (error) {
    console.error(chalk.red(`\n❌ Deployment failed: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

module.exports = { main };