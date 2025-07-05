import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
            '@components': '/src/components',
            '@hooks': '/src/hooks',
            '@services': '/src/services',
            '@types': '/src/types',
            '@utils': '/src/utils',
            '@pages': '/src/pages',
            '@contexts': '/src/contexts',
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
                    'ui-vendor': ['@headlessui/react', '@heroicons/react', 'framer-motion'],
                },
            },
        },
    },
});