import React from "react";
import { Container, Paper, Typography, Box, Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../../context/AuthContext"; // Updated import path

const GoogleLogin = () => {
  const { login } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Xeno CRM
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Campaign Management Platform
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={login}
            sx={{ py: 1.5, px: 4 }}
          >
            Sign in with Google
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
          Please sign in to access the campaign creation platform
        </Typography>
      </Paper>
    </Container>
  );
};

export default GoogleLogin;
