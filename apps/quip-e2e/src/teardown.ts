module.exports = async function (globalConfig, projectConfig) {
  globalThis.__CMDS__.forEach((proc) => {
    proc.kill();
  });
};
