import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/venue-builder.umd.js',
      format: 'umd',
      name: 'VenueBuilder',
      sourcemap: true,
    },
    {
      file: 'dist/venue-builder.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
  ],
};
