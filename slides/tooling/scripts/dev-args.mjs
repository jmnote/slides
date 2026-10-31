export function parseDevArgs(argv, defaultId) {
  const args = [...argv];
  // Only the leading package-manager separator belongs to this wrapper.
  if (args[0] === '--') args.shift();
  const id = args.length && !args[0].startsWith('-') ? args.shift() : defaultId;
  return { id, args };
}
