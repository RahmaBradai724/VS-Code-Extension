import React from 'react';
type Tab = 'login' | 'register';
interface Props {
    tab: Tab;
    setTab: (t: Tab) => void;
    name: string;
    setName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    emailRef: React.RefObject<HTMLInputElement | null>;
    password: string;
    setPassword: (v: string) => void;
    showPwd: boolean;
    setShowPwd: React.Dispatch<React.SetStateAction<boolean>>;
    authError: string | null;
    submitting: boolean;
    submit: (e: React.FormEvent) => void;
}
export declare function LoginCard({ tab, setTab, name, setName, email, setEmail, emailRef, password, setPassword, showPwd, setShowPwd, authError, submitting, submit, }: Props): React.JSX.Element;
export {};
