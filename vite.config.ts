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
                manualChunks(id: any) {
                    // Split node_modules into separate chunks
                    if (id.includes('node_modules')) {
                        // Split large libraries into their own chunks
                        if (id.includes('@tanstack/react-query')) return 'react-query';
                        if (id.includes('recharts')) return 'recharts';
                        if (id.includes('heroicons')) return 'heroicons';
                        
                        // Generic vendor chunk for other libraries
                        return 'vendor';
                    }

                    // Split telemetry components into separate chunks
                    if (id.includes('src/components/telemetry')) {
                        const componentName = id.split('/').pop()?.replace('.tsx', '');
                        return `telemetry-${componentName}`;
                    }
                }
            },
        },
        // Reduce chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Minify and optimize
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
});