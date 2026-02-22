import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // TODO: Replace 'repo-name' with your actual GitHub repository name
    // If you are deploying to https://<USERNAME>.github.io/<REPO_NAME>/, set base to '/<REPO_NAME>/'
    // If you are deploying to https://<USERNAME>.github.io/, set base to '/'
    base: '/',
});
