module.exports = {
  DEFAULT_PORT: 4000,
  TECHNOLOGY: {
    ID: 'technology',
    FILENAME: 'technology',
    FILENAME_GLOB: 'technology.{yml,yaml}',
  },
  CONTEXT: {
    ID: 'context',
    FILENAME: 'context',
    FILENAME_GLOB: 'context.{yml,yaml}',
  },
  METADATA: {
    FILENAME: 'metadata',
  },
  ERROR_CODE: {
    INVALID_COMMAND: 1,
    NOT_A_TECHNOLOGY_FOLDER: 2,
    TECHNOLOGY_YAML_IS_EMPTY: 3,
    TECHNOLOGY_YAML_IS_NOT_VALID: 4,
    CONTEXT_FOLDER_NOT_CREATED: 5,
    NODE_VERSION_NOT_SUPPORTED: 6,
  },
  BUILD_FOLDER: './build',
  BUNDLE_FOLDER: './.bundle',
  BUNDLERS: {
    PARCEL: 'parcel',
    ESBUILD: 'esbuild',
  },
};
