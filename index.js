import applyDecoratedDescriptor from '@babel/runtime/helpers/esm/applyDecoratedDescriptor'
import initializerDefineProperty from '@babel/runtime/helpers/esm/initializerDefineProperty'

if (global.babelHelpers)
  Object.assign(babelHelpers, {
    applyDecoratedDescriptor,
    initializerDefineProperty,
  });

require('./src');