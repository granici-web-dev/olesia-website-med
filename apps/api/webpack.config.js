const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Nx decides what stays out of the bundle by looking for the package in the
// WORKSPACE ROOT's node_modules. This app declares its own dependencies, so
// none of them are there any more and webpack would try to bundle NestJS,
// sharp's native binaries and the Prisma engines. The app's manifest is the
// list of what the runtime image installs, so it is also the list of what must
// stay external; deriving it here means the two can never drift apart.
const runtimeDependencies = Object.keys(require('./package.json').dependencies);

function isRuntimeDependency(request) {
  return runtimeDependencies.some(
    (name) => request === name || request.startsWith(`${name}/`),
  );
}

module.exports = {
  externals: [
    (context, callback) =>
      isRuntimeDependency(context.request)
        ? callback(null, `commonjs ${context.request}`)
        : callback(),
  ],
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  resolve: {
    alias: {
      // @nestjs/mapped-types does require('class-transformer/storage') inside a
      // try/catch; the subpath has no root entry so webpack's static analysis
      // fails the build. Point it at the real file (same metadata singleton).
      'class-transformer/storage': require.resolve(
        'class-transformer/cjs/storage.js',
      ),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      additionalEntryPoints: [
        { entryName: 'seed', entryPath: './src/seed/seed.ts' },
      ],
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      mergeExternals: true,
      sourceMap: true,
    }),
  ],
};
