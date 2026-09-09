import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e-catalog',use:{baseURL:process.env.CATALOG_URL || 'http://127.0.0.1:6007',channel:'chrome'},reporter:'list',workers:1});
