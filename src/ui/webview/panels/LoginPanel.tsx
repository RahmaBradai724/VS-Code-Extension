import React, { useState, useRef, useEffect } from 'react';
import { postMessage } from '../vscodeApi';
import { LoginCard } from './login/LoginCard';

type Tab = 'login' | 'register';

interface Props {
  loading: boolean;
  authError: string | null;
}

export default function LoginPanel({ loading, authError }: Props) {
  const [tab, setTab]           = useState<Tab>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef                = useRef<HTMLInputElement>(null);

  // Reset submitting when auth resolves (success, error, or required)
  useEffect(() => { setSubmitting(false); }, [loading, authError]);

  useEffect(() => { emailRef.current?.focus(); }, [tab]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (tab === 'login') {
      postMessage('login', { email: email.trim(), password });
    } else {
      postMessage('register', { name: name.trim(), email: email.trim(), password });
    }
  }

  return (
    <LoginCard
      tab={tab} setTab={setTab}
      name={name} setName={setName}
      email={email} setEmail={setEmail}
      emailRef={emailRef}
      password={password} setPassword={setPassword}
      showPwd={showPwd} setShowPwd={setShowPwd}
      authError={authError}
      submitting={submitting}
      submit={submit}
    />
  );
}
