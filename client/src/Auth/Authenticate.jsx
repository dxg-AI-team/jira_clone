import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { getStoredAuthToken, storeAuthToken } from 'shared/utils/authToken';

import { Page, Panel, Title, Subtitle, GoogleButtonContainer, Note } from './Styles';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const clientId = process.env.GOOGLE_CLIENT_ID;

const Authenticate = () => {
  const history = useHistory();
  const buttonRef = useRef(null);

  useEffect(() => {
    // If we already have a token, skip the login screen. If it turns out to be
    // invalid, the API layer will clear it and redirect back here.
    if (getStoredAuthToken()) {
      history.replace('/');
      return undefined;
    }

    if (!clientId) {
      return undefined;
    }

    const handleCredential = async response => {
      try {
        const { authToken } = await api.post('/authentication/google', {
          credential: response.credential,
        });
        storeAuthToken(authToken);
        history.push('/');
      } catch (error) {
        toast.error(error);
      }
    };

    const renderGoogleButton = () => {
      if (!window.google || !window.google.accounts || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with',
        locale: 'ja',
      });
    };

    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      renderGoogleButton();
      return undefined;
    }
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.id = 'google-gsi-script';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
    return undefined;
  }, [history]);

  return (
    <Page>
      <Panel>
        <Title>Jira Clone</Title>
        <Subtitle>Google アカウントでログインしてください</Subtitle>
        <GoogleButtonContainer>
          <div ref={buttonRef} />
        </GoogleButtonContainer>
        {!clientId && (
          <Note>Google ログインが未設定です。管理者は GOOGLE_CLIENT_ID を設定してください。</Note>
        )}
      </Panel>
    </Page>
  );
};

export default Authenticate;
