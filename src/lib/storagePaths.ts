import path from 'path';

// Where mutable data lives. By default these sit inside the app folder, which
// is what local development expects. In production set DATA_DIR and POSTS_DIR
// to a persistent location outside the deployed code (on Azure App Service,
// somewhere under /home) so the code folder can be mounted read-only
// (WEBSITE_RUN_FROM_PACKAGE=1) and a compromised process can't write into it.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const POSTS_DIR = process.env.POSTS_DIR || path.join(process.cwd(), 'public', 'posts');
