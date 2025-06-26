import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Alert } from 'react-bootstrap';
import axios from '../../services/axios.customize';

const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState({
    hasToken: false,
    tokenValue: '',
    testResult: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('access_token');
    setAuthStatus(prev => ({
      ...prev,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'No token'
    }));
  }, []);

  const testAuth = async () => {
    setAuthStatus(prev => ({ ...prev, loading: true, error: null, testResult: null }));
    try {
      // Test a simple endpoint that requires authentication
      const response = await axios.get('/api/auth/account');
      setAuthStatus(prev => ({ 
        ...prev, 
        loading: false, 
        testResult: 'Success! Authentication is working.',
        responseData: response.data
      }));
    } catch (error) {
      console.error('Auth test failed:', error);
      setAuthStatus(prev => ({ 
        ...prev, 
        loading: false, 
        testResult: 'Failed! Authentication is not working.',
        error: error.response 
          ? `Error ${error.response.status}: ${error.response.statusText}` 
          : error.message || 'Unknown error'
      }));
    }
  };

  const clearToken = () => {
    localStorage.removeItem('access_token');
    setAuthStatus({
      hasToken: false,
      tokenValue: 'No token',
      testResult: null,
      loading: false,
      error: null
    });
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>Authentication Test</Card.Header>
        <Card.Body>
          <Card.Title>Current Auth Status</Card.Title>
          <Card.Text>
            <strong>Token in localStorage:</strong> {authStatus.hasToken ? 'Yes' : 'No'} <br />
            <strong>Token Value:</strong> {authStatus.tokenValue}
          </Card.Text>

          {authStatus.testResult && (
            <Alert variant={authStatus.error ? 'danger' : 'success'}>
              {authStatus.testResult}
            </Alert>
          )}

          {authStatus.error && (
            <Alert variant="danger">
              {authStatus.error}
            </Alert>
          )}

          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              onClick={testAuth} 
              disabled={authStatus.loading}
            >
              {authStatus.loading ? 'Testing...' : 'Test Authentication'}
            </Button>
            <Button 
              variant="danger" 
              onClick={clearToken} 
              disabled={!authStatus.hasToken}
            >
              Clear Token
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthTest; 