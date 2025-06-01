import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;