import React from 'react';
interface Props {
    loading: boolean;
    authError: string | null;
}
export default function LoginPanel({ loading, authError }: Props): React.JSX.Element;
export {};
