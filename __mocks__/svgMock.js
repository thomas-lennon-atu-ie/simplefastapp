import React from 'react';
const SvgrMock = React.forwardRef((props, ref) => React.createElement('svg', { ...props, ref }));
export const ReactComponent = SvgrMock;
export default SvgrMock;