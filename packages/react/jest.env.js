// https://github.com/prisma/prisma/issues/8558#issuecomment-1006100001
global.setImmediate = jest.useRealTimers;
